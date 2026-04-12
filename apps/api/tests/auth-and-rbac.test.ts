import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma: any = {
  user: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn(), delete: vi.fn() },
  session: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), deleteMany: vi.fn(), delete: vi.fn() },
  semester: { findFirst: vi.fn() },
  course: { findMany: vi.fn(), count: vi.fn() },
  registrationForm: { findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn(), findMany: vi.fn() },
  registrationFormItem: { create: vi.fn(), findUnique: vi.fn(), delete: vi.fn(), count: vi.fn() },
  enrollment: { count: vi.fn(), createMany: vi.fn() },
  $transaction: vi.fn()
};

vi.mock("../src/prisma.js", () => ({ prisma: mockPrisma }));
const { app } = await import("../src/app.js");

describe("auth and RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid credentials", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const res = await request(app).post("/api/auth/login").send({ email: "unknownuser@test.abc", password: "wrongpass" });
    expect(res.status).toBe(401);
  });

  it("enforces admin role", async () => {
    mockPrisma.session.findUnique.mockResolvedValue({
      id: 1,
      lastActivityAt: new Date(),
      user: { id: 2, role: "STUDENT", status: "ACTIVE" }
    });
    const res = await request(app).get("/api/admin/users").set("Cookie", ["ocrs_session=t1"]);
    expect(res.status).toBe(403);
  });
});
