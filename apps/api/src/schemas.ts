import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3).max(100),
  password: z.string().min(6).max(100)
});

export const createUserSchema = z.object({
  username: z.string().min(3).max(100),
  password: z.string().min(6).max(100),
  role: z.enum(["STUDENT", "AAO", "ADMIN"]),
  fullName: z.string().min(2).max(191),
  email: z.string().email().optional()
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
