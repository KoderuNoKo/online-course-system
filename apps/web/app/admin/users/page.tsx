"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, UserPlus, Mail } from "lucide-react";
import { api } from "../../../lib/api";
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, Spinner } from "../../../components/ui";
import toast from "react-hot-toast";

type User = { id: number; email: string; role: string; fullName: string; status?: string };

function roleTone(r: string) {
  if (r === "ADMIN") return "danger";
  if (r === "AAO") return "info";
  return "neutral";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setUsers(await api<User[]>("/api/admin/users"));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const removeUser = async (id: number) => {
    if (!confirm("Permanently delete this user?")) return;
    try {
      await api(`/api/admin/users/${id}`, { method: "DELETE" });
      toast.success("User deleted successfully");
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm font-medium text-brand-600 hover:text-brand-500 transition-colors">
            ← Admin home
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">User directory</h1>
          <p className="mt-1 text-sm text-slate-500">View and manage all university accounts.</p>
        </div>
        <Link href="/admin/users/create">
          <Button variant="primary">
            <UserPlus className="h-4 w-4" />
            Create new user
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader title="All users" subtitle={`${users.length} account(s) registered`} />
        <CardBody className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : users.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No users found." hint="Add a new user to get started." />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-slate-50/50"
                >
                  <div className="flex items-start gap-4">
                    <span className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                      <Mail className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {u.fullName}
                      </p>
                      <p className="text-sm text-slate-500">{u.email}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge tone={roleTone(u.role)}>{u.role}</Badge>
                        {u.status ? <span className="text-xs text-slate-400 capitalize">{u.status.toLowerCase()}</span> : null}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="sm:w-auto text-rose-600 hover:bg-rose-50 border-transparent hover:border-rose-200"
                    onClick={() => removeUser(u.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
