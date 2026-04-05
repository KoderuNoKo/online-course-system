"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { api } from "../../../lib/api";
import type { Course } from "../../../lib/types";
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, Input, Label, Spinner } from "../../../components/ui";

export default function StudentCatalogPage() {
  const [data, setData] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [q, setQ] = useState("");
  const [department, setDepartment] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [schedule, setSchedule] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (q.trim()) params.set("q", q.trim());
      if (department.trim()) params.set("department", department.trim());
      if (lecturer.trim()) params.set("lecturer", lecturer.trim());
      if (schedule.trim()) params.set("schedule", schedule.trim());
      const res = await api<{ data: Course[]; total: number }>(`/api/student/courses?${params}`);
      setData(res.data);
      setTotal(res.total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, q, department, lecturer, schedule]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Course catalog</h1>
        <p className="mt-1 text-sm text-slate-600">Current semester offerings. Open a course for full details.</p>
      </div>

      <Card>
        <CardHeader title="Search & filters" subtitle="Filter by code, title, department, lecturer, or schedule." />
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <Label>Keyword (code or title)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-9"
                  placeholder="e.g. CS101"
                  value={q}
                  onChange={(e) => {
                    setPage(1);
                    setQ(e.target.value);
                  }}
                />
              </div>
            </div>
            <div>
              <Label>Department</Label>
              <Input
                placeholder="Department"
                value={department}
                onChange={(e) => {
                  setPage(1);
                  setDepartment(e.target.value);
                }}
              />
            </div>
            <div>
              <Label>Lecturer</Label>
              <Input
                placeholder="Lecturer name"
                value={lecturer}
                onChange={(e) => {
                  setPage(1);
                  setLecturer(e.target.value);
                }}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Schedule</Label>
              <Input
                placeholder="e.g. Mon"
                value={schedule}
                onChange={(e) => {
                  setPage(1);
                  setSchedule(e.target.value);
                }}
              />
            </div>
          </div>
          <Button variant="secondary" type="button" onClick={() => load()}>
            Refresh
          </Button>
        </CardBody>
      </Card>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : data.length === 0 ? (
        <EmptyState title="No courses match your filters." hint="Try clearing filters or using a shorter keyword." />
      ) : (
        <div className="space-y-3">
          {data.map((c) => (
            <Card key={c.id}>
              <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-indigo-700">{c.courseCode}</span>
                    <Badge tone={c.remainingSlots && c.remainingSlots > 0 ? "success" : "danger"}>
                      {c.remainingSlots ?? 0} / {c.maxCapacity} seats left
                    </Badge>
                  </div>
                  <h3 className="mt-1 font-medium text-slate-900">{c.courseName}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {c.department} · {c.lecturer}
                  </p>
                  <p className="text-sm text-slate-500">
                    {c.schedule} · {c.classroom}
                  </p>
                </div>
                <Link
                  href={`/student/courses/${c.id}`}
                  className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-indigo-700"
                >
                  View details
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-sm text-slate-600">
            Page {page} of {totalPages} · {total} courses
          </p>
          <div className="flex gap-2">
            <Button variant="outline" type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
