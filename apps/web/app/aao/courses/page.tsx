"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "../../../lib/api";
import type { Course } from "../../../lib/types";
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, Input, Label, Spinner } from "../../../components/ui";

export default function AaoCoursesPage() {
  const [data, setData] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", "20");
      if (q.trim()) params.set("q", q.trim());
      if (includeDeleted) params.set("includeDeleted", "true");
      const res = await api<{ data: Course[]; total: number }>(`/api/aao/courses?${params}`);
      setData(res.data);
      setTotal(res.total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [page, q, includeDeleted]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (courseId: number) => {
    if (!confirm("Retire this course? (Soft delete; blocked if enrollments or form references exist.)")) return;
    try {
      await api(`/api/aao/courses/${courseId}`, { method: "DELETE" });
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
          <p className="mt-1 text-sm text-slate-600">Current semester catalog and live enrollment counts.</p>
        </div>
        <Link
          href="/aao/courses/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          New course
        </Link>
      </div>

      <Card>
        <CardHeader title="Filters" />
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label>Search code or title</Label>
            <Input
              placeholder="Search…"
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="rounded border-slate-300"
              checked={includeDeleted}
              onChange={(e) => {
                setPage(1);
                setIncludeDeleted(e.target.checked);
              }}
            />
            Show retired (soft-deleted)
          </label>
        </CardBody>
      </Card>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : data.length === 0 ? (
        <EmptyState title="No courses found." hint="Create a course or adjust filters." />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Lecturer</th>
                    <th className="px-4 py-3">Enrolled</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono font-medium text-indigo-700">{c.courseCode}</td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-slate-900">{c.courseName}</td>
                      <td className="px-4 py-3 text-slate-600">{c.lecturer}</td>
                      <td className="px-4 py-3">
                        {c.enrolledCount}/{c.maxCapacity}
                        <span className="ml-1 text-slate-400">({c.remainingSlots ?? 0} left)</span>
                      </td>
                      <td className="px-4 py-3">
                        {c.deletedAt ? (
                          <Badge tone="danger">Retired</Badge>
                        ) : c.isActive ? (
                          <Badge tone="success">Active</Badge>
                        ) : (
                          <Badge tone="neutral">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/aao/courses/${c.id}/edit`}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <Button
                            variant="ghost"
                            className="!px-2 !py-2 text-rose-600 hover:bg-rose-50"
                            type="button"
                            title="Retire"
                            disabled={!!c.deletedAt}
                            onClick={() => remove(c.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      <p className="text-center text-sm text-slate-500">{total} course(s) total</p>
    </div>
  );
}
