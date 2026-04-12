import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
    .max(100),
  role: z.enum(["STUDENT", "AAO", "ADMIN"]),
  fullName: z.string().min(2).max(191)
});

export const courseSchema = z.object({
  courseCode: z.string().min(3).max(20),
  courseName: z.string().min(3).max(191),
  department: z.string().min(2).max(100),
  lecturer: z.string().min(2).max(100),
  classroom: z.string().min(2).max(50),
  schedule: z.string().min(3).max(100),
  maxCapacity: z.number().int().min(1).max(1000),
  semesterId: z.number().int().positive(),
  isActive: z.boolean().optional()
});
