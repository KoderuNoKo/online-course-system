"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";
import type { RegistrationForm } from "../../../lib/types";
import { Badge, Card, CardBody, CardHeader, Spinner } from "../../../components/ui";

export default function StudentStatusPage() {
  const [form, setForm] = useState<RegistrationForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const f = await api<RegistrationForm>("/api/student/form");
        setForm(f);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load status");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const steps = [
    { key: "DRAFT", label: "Draft", desc: "You can edit your course list." },
    { key: "PENDING", label: "Pending", desc: "Waiting for an AAO officer to review." },
    { key: "APPROVED", label: "Approved", desc: "You are enrolled in the selected courses." },
    { key: "REJECTED", label: "Rejected", desc: "You may edit and resubmit your form." }
  ] as const;

  const idx = form ? steps.findIndex((s) => s.key === form.status) : -1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Registration status</h1>
        <p className="mt-1 text-sm text-slate-600">Track where your form is in the approval workflow.</p>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <Card>
        <CardHeader title="Workflow" />
        <CardBody>
          <ol className="relative space-y-6 border-l border-slate-200 pl-6">
            {steps.map((s, i) => {
              const done = idx >= i;
              const current = form?.status === s.key;
              return (
                <li key={s.key} className="relative">
                  <span
                    className={`absolute -left-[1.36rem] mt-1 flex h-3 w-3 rounded-full ring-4 ring-white ${
                      current
                        ? "bg-indigo-600"
                        : done
                          ? "bg-emerald-500"
                          : "bg-slate-200"
                    }`}
                  />
                  <p className="font-medium text-slate-900">{s.label}</p>
                  <p className="text-sm text-slate-600">{s.desc}</p>
                </li>
              );
            })}
          </ol>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Summary" />
        <CardBody className="space-y-3">
          {form ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-600">Current status:</span>
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
              </div>
              {form.submittedAt ? (
                <p className="text-sm text-slate-600">
                  Submitted: <strong>{new Date(form.submittedAt).toLocaleString()}</strong>
                </p>
              ) : (
                <p className="text-sm text-slate-600">Not submitted yet.</p>
              )}
              {form.decidedAt ? (
                <p className="text-sm text-slate-600">
                  Decision at: <strong>{new Date(form.decidedAt).toLocaleString()}</strong>
                </p>
              ) : null}
              <p className="text-sm text-slate-600">
                Courses on form: <strong>{form.items.length}</strong>
              </p>
            </>
          ) : null}
          <Link href="/student/form" className="inline-block text-sm font-medium text-indigo-600">
            Go to registration form →
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
