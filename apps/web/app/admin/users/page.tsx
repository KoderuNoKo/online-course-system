"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Trash2, UserPlus } from "lucide-react";
import { api } from "../../../lib/api";
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, Input, Label, Select, Spinner } from "../../../components/ui";

type User = { id: number; username: string; role: string; fullName: string; email?: string | null; status?: string };
type UserInput = {
  username: string;
  password: string;
  role: "STUDENT" | "AAO" | "ADMIN";
  fullName: string;
  email?: string;
};

function roleTone(r: string) {
  if (r === "ADMIN") return "danger";
  if (r === "AAO") return "info";
  return "neutral";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset } = useForm<UserInput>({ defaultValues: { role: "STUDENT" } });

  const load = async () => {
    try {
      setError("");
      setUsers(await api<User[]>("/api/admin/users"));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createUser = async (values: UserInput) => {
    try {
      setError("");
      const body: Record<string, string> = {
        username: values.username,
        password: values.password,
        role: values.role,
        fullName: values.fullName
      };
      if (values.email?.trim()) body.email = values.email.trim();
      await api("/api/admin/users", { method: "POST", body: JSON.stringify(body) });
      reset({ role: "STUDENT" });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Create failed");
    }
  };

  const removeUser = async (id: number) => {
    if (!confirm("Permanently delete this user?")) return;
    try {
      await api(`/api/admin/users/${id}`, { method: "DELETE" });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          ← Admin home
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">User management</h1>
        <p className="mt-1 text-sm text-slate-600">Create accounts and control access roles.</p>
      </div>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-200">{error}</p>
      ) : null}

      <Card>
        <CardHeader title="Create user" subtitle="New users can sign in immediately with the password you set." />
        <CardBody>
          <form onSubmit={handleSubmit(createUser)} className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Username</Label>
              <Input {...register("username", { required: true })} />
            </div>
            <div>
              <Label>Full name</Label>
              <Input {...register("fullName", { required: true })} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" {...register("password", { required: true })} />
            </div>
            <div>
              <Label>Email (optional)</Label>
              <Input type="email" {...register("email")} />
            </div>
            <div>
              <Label>Role</Label>
              <Select {...register("role")}>
                <option value="STUDENT">Student</option>
                <option value="AAO">AAO Officer</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="primary" className="w-full md:w-auto">
                <UserPlus className="h-4 w-4" />
                Create user
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="All users" subtitle={`${users.length} account(s)`} />
        <CardBody className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : users.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No users returned." />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {u.fullName}{" "}
                      <span className="font-normal text-slate-500">@{u.username}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge tone={roleTone(u.role)}>{u.role}</Badge>
                      {u.status ? <span className="text-xs text-slate-500">{u.status}</span> : null}
                      {u.email ? <span className="text-sm text-slate-500">{u.email}</span> : null}
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    className="sm:w-auto"
                    type="button"
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
