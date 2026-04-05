"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, Plus } from "lucide-react";
import { api } from "../../../lib/api";
import type { RegistrationForm } from "../../../lib/types";
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, Spinner } from "../../../components/ui";

function statusTone(s: RegistrationForm["status"]) {
  if (s === "APPROVED") return "success";
  if (s === "REJECTED") return "danger";
  if (s === "PENDING") return "warning";
  return "neutral";
}

export default function StudentFormPage() {
  const [form, setForm] = useState<RegistrationForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setError("");
      const f = await api<RegistrationForm>("/api/student/form");
      setForm(f);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load form");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const canEdit = form && (form.status === "DRAFT" || form.status === "REJECTED");

  const removeItem = async (itemId: number) => {
    try {
      setBusy(true);
      await api(`/api/student/form/items/${itemId}`, { method: "DELETE" });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Remove failed");
    } finally {
      setBusy(false);
    }
  };

  const submitForm = async () => {
    try {
      setBusy(true);
      setError("");
      await api("/api/student/form/submit", { method: "POST" });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Submit failed");
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My registration form</h1>
          <p className="mt-1 text-sm text-slate-600">
            One form per semester. Pending and approved forms cannot be edited.
          </p>
        </div>
        <Link
          href="/student/catalog"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" />
          Add courses from catalog
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
      ) : null}

      <Card>
        <CardHeader
          title="Current form"
          subtitle="Courses you plan to register for this semester."
        />
        <CardBody className="space-y-4">
          {form ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-slate-600">Status:</span>
              <Badge tone={statusTone(form.status)}>{form.status}</Badge>
              {form.submittedAt ? (
                <span className="text-sm text-slate-500">
                  Submitted {new Date(form.submittedAt).toLocaleString()}
                </span>
              ) : null}
            </div>
          ) : null}

          {!form?.items?.length ? (
            <EmptyState
              title="No courses on your form yet."
              hint="Browse the catalog and add sections, or open a course and use “Add to my registration form”."
            />
          ) : (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              {form.items.map((item) => (
                <li key={item.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="font-mono text-sm font-semibold text-indigo-700">
                      {item.course.courseCode}
                    </span>
                    <span className="ml-2 font-medium text-slate-900">{item.course.courseName}</span>
                    <p className="text-sm text-slate-500">
                      {item.course.schedule} · {item.course.lecturer}
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    className="sm:w-auto"
                    disabled={!canEdit || busy}
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
            <Button
              variant="primary"
              disabled={
                !form || form.items.length === 0 || !canEdit || busy || form.status === "PENDING"
              }
              onClick={submitForm}
            >
              <ClipboardCheck className="h-4 w-4" />
              Submit for AAO approval
            </Button>
            <Link
              href="/student/status"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              View status page
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
