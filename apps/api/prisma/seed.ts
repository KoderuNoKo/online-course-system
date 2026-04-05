import { PrismaClient, Role } from "@prisma/client";
import { createSalt, hashPassword } from "../src/security.js";

const prisma = new PrismaClient();

const createUser = async (username: string, password: string, role: Role, fullName: string) => {
  const salt = createSalt();
  return prisma.user.upsert({
    where: { username },
    update: {},
    create: {
      username,
      passwordHash: hashPassword(password, salt),
      salt,
      role,
      fullName,
      email: `${username}@university.edu`
    }
  });
};

async function main() {
  const semester = await prisma.semester.upsert({
    where: { code: "2026-1" },
    update: { isCurrent: true },
    create: {
      code: "2026-1",
      name: "Spring 2026",
      startDate: new Date("2026-01-15"),
      endDate: new Date("2026-05-30"),
      isCurrent: true
    }
  });

  const admin = await createUser("admin", "Admin@123", Role.ADMIN, "System Administrator");
  const aao = await createUser("aao1", "Aao@12345", Role.AAO, "AAO Officer");
  const s1 = await createUser("student1", "Student@123", Role.STUDENT, "Alice Nguyen");
  const s2 = await createUser("student2", "Student@123", Role.STUDENT, "Bob Tran");
  await createUser("student3", "Student@123", Role.STUDENT, "Charlie Pham");

  const courses = [
    { courseCode: "CS101", courseName: "Intro to Programming", department: "Computer Science", lecturer: "Dr. Linh", classroom: "A101", schedule: "Mon 08:00-10:00", maxCapacity: 40 },
    { courseCode: "CS205", courseName: "Data Structures", department: "Computer Science", lecturer: "Dr. Khoa", classroom: "A201", schedule: "Tue 09:00-11:00", maxCapacity: 30 },
    { courseCode: "MATH210", courseName: "Discrete Mathematics", department: "Mathematics", lecturer: "Dr. Hoa", classroom: "B102", schedule: "Wed 13:00-15:00", maxCapacity: 35 },
    { courseCode: "BUS150", courseName: "Business Fundamentals", department: "Business", lecturer: "Dr. Nam", classroom: "C303", schedule: "Thu 10:00-12:00", maxCapacity: 45 }
  ];

  for (const c of courses) {
    await prisma.course.upsert({
      where: { courseCode_semesterId: { courseCode: c.courseCode, semesterId: semester.id } },
      update: {},
      create: { ...c, semesterId: semester.id }
    });
  }

  const courseList = await prisma.course.findMany({ where: { semesterId: semester.id }, take: 2 });
  const form = await prisma.registrationForm.upsert({
    where: { studentId_semesterId: { studentId: s1.id, semesterId: semester.id } },
    update: {},
    create: { studentId: s1.id, semesterId: semester.id, status: "PENDING", submittedAt: new Date() }
  });
  for (const course of courseList) {
    await prisma.registrationFormItem.upsert({
      where: { registrationFormId_courseId: { registrationFormId: form.id, courseId: course.id } },
      update: {},
      create: { registrationFormId: form.id, courseId: course.id }
    });
  }

  await prisma.registrationForm.upsert({
    where: { studentId_semesterId: { studentId: s2.id, semesterId: semester.id } },
    update: {},
    create: { studentId: s2.id, semesterId: semester.id, status: "DRAFT" }
  });

  console.log({ admin: admin.username, aao: aao.username, semester: semester.code });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
