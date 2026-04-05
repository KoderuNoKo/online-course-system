"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardList, LineChart } from "lucide-react";
import { Card, CardBody } from "../../components/ui";

const cards = [
  {
    href: "/student/catalog",
    title: "Course catalog",
    desc: "Search and filter courses for the current semester.",
    icon: BookOpen,
    color: "bg-indigo-100 text-indigo-700"
  },
  {
    href: "/student/form",
    title: "My registration form",
    desc: "Add or remove courses and submit for AAO approval.",
    icon: ClipboardList,
    color: "bg-emerald-100 text-emerald-700"
  },
  {
    href: "/student/status",
    title: "Registration status",
    desc: "See whether your form is draft, pending, approved, or rejected.",
    icon: LineChart,
    color: "bg-violet-100 text-violet-700"
  }
];

export default function StudentHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Student dashboard</h1>
        <p className="mt-2 text-slate-600">
          Use the menu to browse courses, manage your registration form, and track your submission.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ href, title, desc, icon: Icon, color }) => (
          <Link key={href} href={href} className="group block">
            <Card className="h-full transition group-hover:border-indigo-200 group-hover:shadow-md">
              <CardBody className="flex h-full flex-col">
                <span className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                <p className="mt-2 flex-1 text-sm text-slate-600">{desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
                  Open
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
