"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { api } from "../../lib/api";
import { Button, Card, CardBody, Input, Label } from "../../components/ui";

type Inputs = { email: string; password: string };

export default function LoginPage() {
  const { register, handleSubmit } = useForm<Inputs>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (values: Inputs) => {
    try {
      setLoading(true);
      setError("");
      const data = await api<{ user: { role: string } }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(values)
      });
      if (data.user.role === "STUDENT") router.push("/student");
      else if (data.user.role === "AAO") router.push("/aao");
      else router.push("/admin");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card className="overflow-hidden shadow-lg shadow-slate-900/10">
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-8 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <LogIn className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold">Welcome back</h1>
              <p className="text-sm text-brand-100">Sign in with your university email</p>
            </div>
          </div>
        </div>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="student@university.edu"
                autoComplete="email"
                {...register("email", { required: true })}
              />
            </div>
            <div>
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password", { required: true })}
              />
            </div>
            {error ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 ring-1 ring-rose-200">{error}</p>
            ) : null}
            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href="/" className="font-medium text-brand-600 hover:text-brand-500 transition-colors">
              ← Back to home
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
