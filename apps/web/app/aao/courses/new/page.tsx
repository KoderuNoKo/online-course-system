"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { api } from "../../../../lib/api";
import type { Semester } from "../../../../lib/types";
import { Button, Card, CardBody, CardHeader, Input, Label, Select, Spinner } from "../../../../components/ui";

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

export default function AaoCourseNewPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: { maxCapacity: 40, isActive: "true" }
  });
  const [semester, setSemester] = useState<Semester | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await api<Semester>("/api/aao/semester");
        setSemester(s);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Could not load semester");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSubmit = async (values: FormValues) => {
    if (!semester) return;
    try {
      setSaving(true);
      setError("");
      await api("/api/aao/courses", {
        method: "POST",
        body: JSON.stringify({
          courseCode: values.courseCode,
          courseName: values.courseName,
          department: values.department,
          lecturer: values.lecturer,
          classroom: values.classroom,
          schedule: values.schedule,
          maxCapacity: Number(values.maxCapacity),
          semesterId: semester.id,
          isActive: String(values.isActive) === "true"
        })
      });
      router.push("/aao/courses");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Create failed");
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
        <CardHeader
          title="New course"
          subtitle={semester ? `Semester: ${semester.code} — ${semester.name}` : undefined}
        />
        <CardBody>
          {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Course code</Label>
                <Input {...register("courseCode", { required: true })} placeholder="CS101" />
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
                <Input {...register("schedule", { required: true })} placeholder="Mon 08:00-10:00" />
              </div>
            </div>
            <div>
              <Label>Active</Label>
              <Select {...register("isActive")} defaultValue="true">
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" disabled={saving || !semester}>
                {saving ? "Saving…" : "Create course"}
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
