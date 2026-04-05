export type CourseLite = { id: number; enrolledCount: number; maxCapacity: number };

export const hasAvailableCapacity = (course: CourseLite) =>
  course.enrolledCount < course.maxCapacity;

export const canEditForm = (status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED") =>
  status === "DRAFT" || status === "REJECTED";

export const hasDuplicateCourseIds = (courseIds: number[]) =>
  new Set(courseIds).size !== courseIds.length;

export const isSessionExpired = (lastActivityAt: Date, timeoutMinutes = 5) =>
  Date.now() - lastActivityAt.getTime() > timeoutMinutes * 60 * 1000;
