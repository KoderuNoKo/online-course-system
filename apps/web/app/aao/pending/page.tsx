"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import { api } from "../../../lib/api";
import { Badge, Card, CardBody, CardHeader, EmptyState, Spinner } from "../../../components/ui";

type PendingForm = {
  id: number;
  submittedAt: string | null;
  status: string;
  student: { fullName: string; username: string };
  items: { id: number }[];
};

export default function AaoPendingPage() {
  const [forms, setForms] = useState<PendingForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const data = await api<PendingForm[]>("/api/aao/registration-forms?status=pending");
      setForms(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load forms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pending registration forms</h1>
        <p className="mt-1 text-sm text-slate-600">
          Sorted by submission time (earliest first). Open a form for full detail and actions.
        </p>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : forms.length === 0 ? (
        <EmptyState title="No pending forms." hint="New submissions will appear here after students submit." />
      ) : (
        <Card>
          <CardHeader title="Queue" subtitle={`${forms.length} pending`} />
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-100">
              {forms.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/aao/forms/${f.id}`}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">
                        {f.student.fullName}{" "}
                        <span className="font-normal text-slate-500">({f.student.username})</span>
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                        <Badge tone="warning">PENDING</Badge>
                        <span>{f.items.length} course(s)</span>
                        {f.submittedAt ? (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(f.submittedAt).toLocaleString()}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
