"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus } from "lucide-react";
import { api } from "../../../../lib/api";
import { Button, Card, CardBody, CardHeader, Input, Label, Select } from "../../../../components/ui";
import toast from "react-hot-toast";

const createUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
    .max(100),
  role: z.enum(["STUDENT", "AAO", "ADMIN"]),
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(191)
});

type UserInput = z.infer<typeof createUserSchema>;

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<UserInput>({ 
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: "STUDENT" } 
  });

  const onSubmit = async (values: UserInput) => {
    try {
      setLoading(true);
      await api("/api/admin/users", { method: "POST", body: JSON.stringify(values) });
      toast.success("User created successfully!");
      router.push("/admin/users");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <Link href="/admin/users" className="text-sm font-medium text-brand-600 hover:text-brand-500 transition-colors">
          ← Back to user directory
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Create new user</h1>
        <p className="mt-1 text-sm text-slate-500">Configure access for a new university account.</p>
      </div>

      <Card>
        <CardHeader title="Account details" subtitle="Specify the email, credentials, and role." />
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1 md:col-span-2">
                <Label>Full name</Label>
                <Input placeholder="e.g. Alice Nguyen" {...register("fullName")} className={errors.fullName ? "border-rose-300 focus:ring-rose-500/20" : ""} />
                {errors.fullName && <p className="text-sm text-rose-600 font-medium mt-1">{errors.fullName.message}</p>}
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Email</Label>
                <Input type="email" placeholder="student@university.edu" {...register("email")} className={errors.email ? "border-rose-300 focus:ring-rose-500/20" : ""} />
                {errors.email && <p className="text-sm text-rose-600 font-medium mt-1">{errors.email.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Password</Label>
                <Input type="password" placeholder="••••••••" {...register("password")} className={errors.password ? "border-rose-300 focus:ring-rose-500/20" : ""} />
                {errors.password && <p className="text-sm text-rose-600 font-medium mt-1">{errors.password.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Role</Label>
                <Select {...register("role")} className={errors.role ? "border-rose-300 focus:ring-rose-500/20" : ""}>
                  <option value="STUDENT">Student</option>
                  <option value="AAO">AAO Officer</option>
                  <option value="ADMIN">Admin</option>
                </Select>
                {errors.role && <p className="text-sm text-rose-600 font-medium mt-1">{errors.role.message}</p>}
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="submit" variant="primary" disabled={loading}>
                <UserPlus className="h-4 w-4" />
                {loading ? "Creating..." : "Create user"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
