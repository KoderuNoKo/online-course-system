"use client";

import Link from "next/link";
import { ArrowRight, BookMarked, ClipboardList } from "lucide-react";
import { Card, CardBody } from "../../components/ui";

export default function AaoHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">AAO dashboard</h1>
        <p className="mt-2 text-slate-600">
          Process student registration forms in submission order and maintain the course catalog for the current
          semester.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/aao/pending" className="group block">
          <Card className="h-full transition group-hover:border-indigo-200 group-hover:shadow-md">
            <CardBody className="flex h-full flex-col">
              <ClipboardList className="mb-4 h-10 w-10 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-900">Pending registration forms</h2>
              <p className="mt-2 flex-1 text-sm text-slate-600">
                Review submissions first-come-first-served. Open a form to see courses and approve or reject.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
                Open queue
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </CardBody>
          </Card>
        </Link>
        <Link href="/aao/courses" className="group block">
          <Card className="h-full transition group-hover:border-indigo-200 group-hover:shadow-md">
            <CardBody className="flex h-full flex-col">
              <BookMarked className="mb-4 h-10 w-10 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">Course management</h2>
              <p className="mt-2 flex-1 text-sm text-slate-600">
                Create and edit offerings, monitor enrollment counts, and retire courses when safe.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
                Manage courses
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  );
}
