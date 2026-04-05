"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api } from "../../../../lib/api";
import type { Course, RegistrationForm } from "../../../../lib/types";
import { Badge, Button, Card, CardBody, CardHeader, Spinner } from "../../../../components/ui";

export default function StudentCourseDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [course, setCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<RegistrationForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [c, f] = await Promise.all([
        api<Course>(`/api/student/courses/${id}`),
        api<RegistrationForm>("/api/student/form")
      ]);
      setCourse(c);
      setForm(f);
    } catch {
      setCourse(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const canEdit = form && (form.status === "DRAFT" || form.status === "REJECTED");
  const alreadyOnForm = form?.items.some((i) => i.course.id === course?.id);

  const add = async () => {
    if (!course) return;
    try {
      setMsg(null);
      await api("/api/student/form/items", { method: "POST", body: JSON.stringify({ courseId: course.id }) });
      setMsg({ type: "ok", text: "Course added to your registration form." });
      await load();
    } catch (e: unknown) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Could not add course" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!course) {
    return (
      <Card>
        <CardBody>
          <p className="text-slate-600">Course not found.</p>
          <Link href="/student/catalog" className="mt-4 inline-block text-sm font-medium text-indigo-600">
            ← Back to catalog
          </Link>
        </CardBody>
      </Card>
    );
  }

  const full = (course.remainingSlots ?? 0) <= 0;

  return (
    <div className="space-y-6">
      <Link
        href="/student/catalog"
        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to catalog
      </Link>

      <Card>
        <CardHeader
          title={course.courseName}
          subtitle={`${course.courseCode} · ${course.department}`}
        />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">{course.schedule}</Badge>
            <Badge tone="neutral">{course.classroom}</Badge>
            <Badge tone={full ? "danger" : "success"}>
              {course.remainingSlots ?? 0} seats remaining · cap {course.maxCapacity}
            </Badge>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase text-slate-400">Lecturer</dt>
              <dd className="text-slate-900">{course.lecturer}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-slate-400">Enrolled</dt>
              <dd className="text-slate-900">
                {course.enrolledCount} / {course.maxCapacity}
              </dd>
            </div>
          </dl>

          {msg ? (
            <p
              className={
                msg.type === "ok"
                  ? "rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                  : "rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800"
              }
            >
              {msg.text}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
            <Button
              variant="primary"
              disabled={!canEdit || full || alreadyOnForm}
              onClick={add}
              title={
                !canEdit
                  ? "Form is not editable in current status"
                  : full
                    ? "Course is full"
                    : alreadyOnForm
                      ? "Already on your form"
                      : undefined
              }
            >
              {alreadyOnForm ? "Already on form" : "Add to my registration form"}
            </Button>
            <Link href="/student/form">
              <Button variant="outline" type="button">
                Open registration form
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
