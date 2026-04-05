"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api } from "../../../../lib/api";
import type { Course } from "../../../../lib/types";
import { Badge, Button, Card, CardBody, CardHeader, Spinner } from "../../../../components/ui";

type FormDetail = {
  id: number;
  status: string;
  submittedAt: string | null;
  decidedAt: string | null;
  student: { fullName: string; username: string; email: string | null };
  semester: { code: string; name: string };
  items: { id: number; course: Course }[];
};

export default function AaoFormDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [form, setForm] = useState<FormDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api<FormDetail>(`/api/aao/registration-forms/${id}`);
      setForm(data);
    } catch {
      setForm(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (action: "approve" | "reject") => {
    const ok =
      action === "reject"
        ? confirm("Reject this registration form? The student can edit and resubmit.")
        : confirm("Approve this form? Enrollments will be created and seats updated.");
    if (!ok) return;
    try {
      setBusy(true);
      setMsg("");
      await api(`/api/aao/registration-forms/${id}/${action}`, { method: "POST" });
      await load();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!form) {
    return (
      <Card>
        <CardBody>
          <p>Form not found.</p>
          <Link href="/aao/pending" className="mt-2 text-indigo-600">
            ← Back to pending
          </Link>
        </CardBody>
      </Card>
    );
  }

  const pending = form.status === "PENDING";

  return (
    <div className="space-y-6">
      <Link href="/aao/pending" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
        <ArrowLeft className="h-4 w-4" />
        Back to pending list
      </Link>

      <Card>
        <CardHeader title={`Registration form #${form.id}`} subtitle={`${form.semester.code} · ${form.semester.name}`} />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone="neutral">Student</Badge>
            <span className="text-slate-900">
              {form.student.fullName} ({form.student.username})
            </span>
            {form.student.email ? <span className="text-sm text-slate-500">{form.student.email}</span> : null}
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-slate-600">
            <span>Status:</span>
            <Badge
              tone={
                form.status === "APPROVED"
                  ? "success"
                  : form.status === "REJECTED"
                    ? "danger"
                    : form.status === "PENDING"
                      ? "warning"
                      : "neutral"
              }
            >
              {form.status}
            </Badge>
            {form.submittedAt ? <span>Submitted: {new Date(form.submittedAt).toLocaleString()}</span> : null}
            {form.decidedAt ? <span>Decided: {new Date(form.decidedAt).toLocaleString()}</span> : null}
          </div>

          {msg ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{msg}</p> : null}

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Selected courses</h3>
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              {form.items.map((it) => (
                <li key={it.id} className="px-4 py-3">
                  <span className="font-mono text-sm font-semibold text-indigo-700">{it.course.courseCode}</span>{" "}
                  {it.course.courseName}
                  <p className="text-sm text-slate-500">
                    {it.course.lecturer} · {it.course.schedule} · Cap {it.course.maxCapacity} · Enrolled{" "}
                    {it.course.enrolledCount}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {pending ? (
            <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
              <Button variant="primary" disabled={busy} onClick={() => act("approve")}>
                Approve
              </Button>
              <Button variant="danger" disabled={busy} onClick={() => act("reject")}>
                Reject
              </Button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">This form is no longer pending.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
