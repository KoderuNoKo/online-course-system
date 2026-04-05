"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { api } from "../../../../../lib/api";
import type { Course } from "../../../../../lib/types";
import { Button, Card, CardBody, CardHeader, Input, Label, Select, Spinner } from "../../../../../components/ui";

type FormValues = {
  courseCode: string;
  courseName: string;
  department: string;
  lecturer: string;
  classroom: string;
  schedule: string;
  maxCapacity: number;
  isActive: string;
};

export default function AaoCourseEditPage() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const c = await api<Course>(`/api/aao/courses/${id}`);
      reset({
        courseCode: c.courseCode,
        courseName: c.courseName,
        department: c.department,
        lecturer: c.lecturer,
        classroom: c.classroom,
        schedule: c.schedule,
        maxCapacity: c.maxCapacity,
        isActive: c.isActive ? "true" : "false"
      });
    } catch {
      setError("Course not found");
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (values: FormValues) => {
    try {
      setSaving(true);
      setError("");
      await api(`/api/aao/courses/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          courseCode: values.courseCode,
          courseName: values.courseName,
          department: values.department,
          lecturer: values.lecturer,
          classroom: values.classroom,
          schedule: values.schedule,
          maxCapacity: Number(values.maxCapacity),
          isActive: String(values.isActive) === "true"
        })
      });
      router.push("/aao/courses");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
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
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/aao/courses" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>

      <Card>
        <CardHeader title="Edit course" />
        <CardBody>
          {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Course code</Label>
                <Input {...register("courseCode", { required: true })} />
              </div>
              <div>
                <Label>Max capacity</Label>
                <Input type="number" min={1} {...register("maxCapacity", { valueAsNumber: true })} />
              </div>
            </div>
            <div>
              <Label>Course name</Label>
              <Input {...register("courseName", { required: true })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Department</Label>
                <Input {...register("department", { required: true })} />
              </div>
              <div>
                <Label>Lecturer</Label>
                <Input {...register("lecturer", { required: true })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Classroom</Label>
                <Input {...register("classroom", { required: true })} />
              </div>
              <div>
                <Label>Schedule</Label>
                <Input {...register("schedule", { required: true })} />
              </div>
            </div>
            <div>
              <Label>Active</Label>
              <Select {...register("isActive")}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <Link
                href="/aao/courses"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
