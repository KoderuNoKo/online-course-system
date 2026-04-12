import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import { Prisma, User } from "@prisma/client";
import { z } from "zod";
import { config } from "./config.js";
import { prisma } from "./prisma.js";
import { badRequest, forbidden, notFound, unauthorized, AppError } from "./errors.js";
import { createSalt, createSessionToken, hashPassword } from "./security.js";
import { courseSchema, createUserSchema, loginSchema } from "./schemas.js";

type AuthedRequest = Request & { user?: User };

const app = express();
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

const sessionCutoff = () =>
  new Date(Date.now() - config.sessionTimeoutMinutes * 60 * 1000);

const requireAuth = async (req: AuthedRequest, _res: Response, next: NextFunction) => {
  try {
    const token = req.cookies[config.cookieName];
    if (!token) throw unauthorized("Please log in");
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    });
    if (!session || session.lastActivityAt < sessionCutoff()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      throw unauthorized("Session expired due to inactivity");
    }
    if (session.user.status !== "ACTIVE") {
      throw forbidden("Account is inactive");
    }
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActivityAt: new Date() }
    });
    req.user = session.user;
    next();
  } catch (error) {
    next(error);
  }
};

const requireRole = (roles: Array<"STUDENT" | "AAO" | "ADMIN">) => (req: AuthedRequest, _res: Response, next: NextFunction) => {
  if (!req.user) return next(unauthorized());
  if (!roles.includes(req.user.role)) return next(forbidden());
  next();
};

const getCurrentSemester = async () => {
  const semester = await prisma.semester.findFirst({ where: { isCurrent: true } });
  if (!semester) throw badRequest("No current semester configured");
  return semester;
};

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) throw unauthorized("Invalid email or password");
    if (hashPassword(payload.password, user.salt) !== user.passwordHash) {
      throw unauthorized("Invalid email or password");
    }
    const token = createSessionToken();
    await prisma.session.create({
      data: { token, userId: user.id, lastActivityAt: new Date() }
    });
    res.cookie(config.cookieName, token, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "lax"
    });
    res.json({ user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName } });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/logout", requireAuth, async (req: Request, res, next) => {
  try {
    const token = req.cookies[config.cookieName];
    await prisma.session.deleteMany({ where: { token } });
    res.clearCookie(config.cookieName);
    res.json({ message: "Logged out" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/me", requireAuth, (req: AuthedRequest, res) => {
  const user = req.user!;
  res.json({ user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName } });
});

app.get("/api/student/courses", requireAuth, requireRole(["STUDENT"]), async (req, res, next) => {
  try {
    const semester = await getCurrentSemester();
    const query = z.object({
      q: z.string().optional(),
      department: z.string().optional(),
      lecturer: z.string().optional(),
      schedule: z.string().optional(),
      page: z.coerce.number().int().min(1).default(1),
      pageSize: z.coerce.number().int().min(1).max(50).default(10)
    }).parse(req.query);
    const where = {
      semesterId: semester.id,
      isActive: true,
      deletedAt: null as null,
      ...(query.department ? { department: { contains: query.department } } : {}),
      ...(query.lecturer ? { lecturer: { contains: query.lecturer } } : {}),
      ...(query.schedule ? { schedule: { contains: query.schedule } } : {}),
      ...(query.q
        ? {
            OR: [
              { courseCode: { contains: query.q } },
              { courseName: { contains: query.q } }
            ]
          }
        : {})
    };
    const [total, rows] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        orderBy: { courseCode: "asc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      })
    ]);
    res.json({
      total,
      page: query.page,
      pageSize: query.pageSize,
      data: rows.map((c) => ({ ...c, remainingSlots: c.maxCapacity - c.enrolledCount }))
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/student/courses/:id", requireAuth, requireRole(["STUDENT"]), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course || course.deletedAt) throw notFound("Course not found");
    res.json({ ...course, remainingSlots: course.maxCapacity - course.enrolledCount });
  } catch (error) {
    next(error);
  }
});

app.get("/api/student/form", requireAuth, requireRole(["STUDENT"]), async (req: AuthedRequest, res, next) => {
  try {
    const semester = await getCurrentSemester();
    const form = await prisma.registrationForm.upsert({
      where: { studentId_semesterId: { studentId: req.user!.id, semesterId: semester.id } },
      update: {},
      create: { studentId: req.user!.id, semesterId: semester.id },
      include: { items: { include: { course: true } } }
    });
    res.json(form);
  } catch (error) {
    next(error);
  }
});

app.post("/api/student/form/items", requireAuth, requireRole(["STUDENT"]), async (req: AuthedRequest, res, next) => {
  try {
    const semester = await getCurrentSemester();
    const courseId = z.object({ courseId: z.number().int().positive() }).parse(req.body).courseId;
    const course = await prisma.course.findFirst({
      where: { id: courseId, semesterId: semester.id, deletedAt: null, isActive: true }
    });
    if (!course) throw notFound("Course not found");
    if (course.enrolledCount >= course.maxCapacity) throw badRequest("Course is full");
    const form = await prisma.registrationForm.upsert({
      where: { studentId_semesterId: { studentId: req.user!.id, semesterId: semester.id } },
      update: {},
      create: { studentId: req.user!.id, semesterId: semester.id }
    });
    if (form.status === "APPROVED") throw forbidden("Approved form is read-only");
    if (form.status === "PENDING") throw forbidden("Pending form cannot be edited");
    const item = await prisma.registrationFormItem.create({
      data: { registrationFormId: form.id, courseId }
    });
    res.status(201).json(item);
  } catch (error: any) {
    if (error.code === "P2002") return next(badRequest("Duplicate course in registration form"));
    next(error);
  }
});

app.delete("/api/student/form/items/:itemId", requireAuth, requireRole(["STUDENT"]), async (req: AuthedRequest, res, next) => {
  try {
    const itemId = Number(req.params.itemId);
    const item = await prisma.registrationFormItem.findUnique({
      where: { id: itemId },
      include: { form: true }
    });
    if (!item || item.form.studentId !== req.user!.id) throw notFound("Form item not found");
    if (item.form.status === "APPROVED") throw forbidden("Approved form is read-only");
    if (item.form.status === "PENDING") throw forbidden("Pending form cannot be edited");
    await prisma.registrationFormItem.delete({ where: { id: itemId } });
    res.json({ message: "Removed" });
  } catch (error) {
    next(error);
  }
});

app.post("/api/student/form/submit", requireAuth, requireRole(["STUDENT"]), async (req: AuthedRequest, res, next) => {
  try {
    const semester = await getCurrentSemester();
    const form = await prisma.registrationForm.findUnique({
      where: { studentId_semesterId: { studentId: req.user!.id, semesterId: semester.id } },
      include: { items: { include: { course: true } } }
    });
    if (!form) throw badRequest("No existing registration form");
    if (form.status === "PENDING") throw badRequest("Already submitted");
    if (form.status === "APPROVED") throw forbidden("Approved form is read-only");
    if (form.items.length === 0) throw badRequest("Form must have at least one course");
    const full = form.items.find((i) => i.course.enrolledCount >= i.course.maxCapacity);
    if (full) throw badRequest(`Course ${full.course.courseCode} is full`);
    const updated = await prisma.registrationForm.update({
      where: { id: form.id },
      data: { status: "PENDING", submittedAt: new Date(), decidedAt: null, decidedBy: null }
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

app.get("/api/student/form/status", requireAuth, requireRole(["STUDENT"]), async (req: AuthedRequest, res, next) => {
  try {
    const semester = await getCurrentSemester();
    const form = await prisma.registrationForm.findUnique({
      where: { studentId_semesterId: { studentId: req.user!.id, semesterId: semester.id } }
    });
    if (!form) throw badRequest("No existing registration form");
    res.json({ status: form.status, submittedAt: form.submittedAt, decidedAt: form.decidedAt });
  } catch (error) {
    next(error);
  }
});

app.get("/api/aao/registration-forms", requireAuth, requireRole(["AAO"]), async (req, res, next) => {
  try {
    const status = String(req.query.status ?? "pending").toUpperCase();
    const forms = await prisma.registrationForm.findMany({
      where: { status: status === "PENDING" ? "PENDING" : undefined },
      orderBy: { submittedAt: "asc" },
      include: { student: true, semester: true, items: true }
    });
    res.json(forms);
  } catch (error) {
    next(error);
  }
});

app.get("/api/aao/registration-forms/:id", requireAuth, requireRole(["AAO"]), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const form = await prisma.registrationForm.findUnique({
      where: { id },
      include: {
        student: true,
        semester: true,
        items: { include: { course: true } }
      }
    });
    if (!form) throw notFound("Registration form not found");
    res.json(form);
  } catch (error) {
    next(error);
  }
});

app.post("/api/aao/registration-forms/:id/approve", requireAuth, requireRole(["AAO"]), async (req: AuthedRequest, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await prisma.$transaction(async (tx) => {
      const form = await tx.registrationForm.findUnique({
        where: { id },
        include: { items: true }
      });
      if (!form) throw notFound("Registration form not found");
      if (form.status !== "PENDING") throw badRequest("Only pending forms can be approved");
      for (const item of form.items) {
        const course = await tx.course.findUnique({ where: { id: item.courseId } });
        if (!course || course.deletedAt || course.enrolledCount >= course.maxCapacity) {
          throw badRequest("Approval conflict: one or more courses are full");
        }
        const updated = await tx.course.updateMany({
          where: { id: item.courseId, enrolledCount: course.enrolledCount },
          data: { enrolledCount: { increment: 1 } }
        });
        if (updated.count !== 1) {
          throw badRequest("Approval conflict: concurrent enrollment change detected");
        }
      }
      await tx.enrollment.createMany({
        data: form.items.map((it) => ({
          studentId: form.studentId,
          courseId: it.courseId,
          semesterId: form.semesterId,
          registrationFormId: form.id
        }))
      });
      return tx.registrationForm.update({
        where: { id },
        data: { status: "APPROVED", decidedAt: new Date(), decidedBy: req.user!.id }
      });
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/api/aao/registration-forms/:id/reject", requireAuth, requireRole(["AAO"]), async (req: AuthedRequest, res, next) => {
  try {
    const id = Number(req.params.id);
    const form = await prisma.registrationForm.findUnique({ where: { id } });
    if (!form) throw notFound("Registration form not found");
    if (form.status !== "PENDING") throw badRequest("Only pending forms can be rejected");
    const updated = await prisma.registrationForm.update({
      where: { id },
      data: { status: "REJECTED", decidedAt: new Date(), decidedBy: req.user!.id }
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

app.get("/api/aao/semester", requireAuth, requireRole(["AAO"]), async (_req, res, next) => {
  try {
    const semester = await getCurrentSemester();
    res.json(semester);
  } catch (error) {
    next(error);
  }
});

app.get("/api/aao/courses", requireAuth, requireRole(["AAO"]), async (req, res, next) => {
  try {
    const semester = await getCurrentSemester();
    const query = z
      .object({
        q: z.string().optional(),
        department: z.string().optional(),
        lecturer: z.string().optional(),
        page: z.coerce.number().int().min(1).default(1),
        pageSize: z.coerce.number().int().min(1).max(100).default(20),
        includeDeleted: z.enum(["0", "1", "true", "false"]).optional()
      })
      .parse(req.query);
    const showDeleted =
      query.includeDeleted === "1" || query.includeDeleted === "true";
    const where: Prisma.CourseWhereInput = {
      semesterId: semester.id,
      ...(showDeleted ? {} : { deletedAt: null })
    };
    if (query.department) {
      where.department = { contains: query.department };
    }
    if (query.lecturer) {
      where.lecturer = { contains: query.lecturer };
    }
    if (query.q) {
      where.OR = [
        { courseCode: { contains: query.q } },
        { courseName: { contains: query.q } }
      ];
    }
    const [total, rows] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        orderBy: { courseCode: "asc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      })
    ]);
    res.json({
      total,
      page: query.page,
      pageSize: query.pageSize,
      data: rows.map((c) => ({
        ...c,
        remainingSlots: c.maxCapacity - c.enrolledCount
      }))
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/aao/courses/:id", requireAuth, requireRole(["AAO"]), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw notFound("Course not found");
    res.json({ ...course, remainingSlots: course.maxCapacity - course.enrolledCount });
  } catch (error) {
    next(error);
  }
});

app.post("/api/aao/courses", requireAuth, requireRole(["AAO"]), async (req, res, next) => {
  try {
    const payload = courseSchema.parse(req.body);
    const course = await prisma.course.create({ data: payload });
    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
});

app.patch("/api/aao/courses/:id", requireAuth, requireRole(["AAO"]), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const payload = courseSchema.partial().parse(req.body);
    const updated = await prisma.course.update({ where: { id }, data: payload });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/aao/courses/:id", requireAuth, requireRole(["AAO"]), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const hasEnrollment = await prisma.enrollment.count({ where: { courseId: id } });
    if (hasEnrollment > 0) throw badRequest("Cannot delete course with enrollments");
    const hasItems = await prisma.registrationFormItem.count({ where: { courseId: id } });
    if (hasItems > 0) throw badRequest("Cannot delete course referenced by registration forms");
    await prisma.course.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    res.json({ message: "Deleted" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/users", requireAuth, requireRole(["ADMIN"]), async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, fullName: true, status: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/users", requireAuth, requireRole(["ADMIN"]), async (req, res, next) => {
  try {
    const payload = createUserSchema.parse(req.body);
    const salt = createSalt();
    const user = await prisma.user.create({
      data: {
        email: payload.email,
        passwordHash: hashPassword(payload.password, salt),
        salt,
        role: payload.role,
        fullName: payload.fullName
      }
    });
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (error: any) {
    if (error.code === "P2002") return next(badRequest("Email already exists"));
    next(error);
  }
});

app.delete("/api/admin/users/:id", requireAuth, requireRole(["ADMIN"]), async (req: AuthedRequest, res, next) => {
  try {
    const id = Number(req.params.id);
    if (req.user!.id === id) throw badRequest("Admin cannot delete own account");
    await prisma.user.delete({ where: { id } });
    res.json({ message: "Deleted" });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.status).json({ error: { code: error.code, message: error.message } });
  }
  if (error instanceof z.ZodError) {
    return res.status(422).json({
      error: { code: "VALIDATION_ERROR", message: "Validation failed", details: error.flatten() }
    });
  }
  return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Unexpected server error" } });
});

export { app };
