export type Role = "STUDENT" | "AAO" | "ADMIN";

export type MeUser = {
  id: number;
  username: string;
  role: Role;
  fullName: string;
};

export type Course = {
  id: number;
  courseCode: string;
  courseName: string;
  department: string;
  lecturer: string;
  schedule: string;
  classroom: string;
  enrolledCount: number;
  maxCapacity: number;
  remainingSlots?: number;
  isActive?: boolean;
  deletedAt?: string | null;
  semesterId?: number;
};

export type RegistrationForm = {
  id: number;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string | null;
  decidedAt: string | null;
  items: { id: number; courseId?: number; course: Course }[];
};

export type Semester = {
  id: number;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};
