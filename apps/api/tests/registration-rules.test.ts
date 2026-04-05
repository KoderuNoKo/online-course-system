import { describe, expect, it } from "vitest";
import { canEditForm, hasAvailableCapacity, hasDuplicateCourseIds, isSessionExpired } from "../src/domain.js";

describe("registration domain rules", () => {
  it("prevents over-capacity registration", () => {
    expect(hasAvailableCapacity({ id: 1, enrolledCount: 39, maxCapacity: 40 })).toBe(true);
    expect(hasAvailableCapacity({ id: 2, enrolledCount: 40, maxCapacity: 40 })).toBe(false);
  });

  it("rejects duplicate courses in same form", () => {
    expect(hasDuplicateCourseIds([1, 2, 3])).toBe(false);
    expect(hasDuplicateCourseIds([1, 2, 1])).toBe(true);
  });

  it("keeps approved forms read-only", () => {
    expect(canEditForm("DRAFT")).toBe(true);
    expect(canEditForm("REJECTED")).toBe(true);
    expect(canEditForm("PENDING")).toBe(false);
    expect(canEditForm("APPROVED")).toBe(false);
  });

  it("expires inactive sessions in 5 minutes", () => {
    const old = new Date(Date.now() - 6 * 60 * 1000);
    const active = new Date(Date.now() - 2 * 60 * 1000);
    expect(isSessionExpired(old)).toBe(true);
    expect(isSessionExpired(active)).toBe(false);
  });
});
