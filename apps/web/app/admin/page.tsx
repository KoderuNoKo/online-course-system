"use client";

import Link from "next/link";
import { ArrowRight, Shield, Users } from "lucide-react";
import { Card, CardBody } from "../../components/ui";

export default function AdminHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Administration</h1>
        <p className="mt-2 text-slate-600">
          Manage university accounts: create users, assign roles (Student, AAO, Admin), and remove accounts when
          needed.
        </p>
      </div>
      <Link href="/admin/users" className="group block max-w-lg">
        <Card className="transition group-hover:border-indigo-200 group-hover:shadow-md">
          <CardBody className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">User directory</h2>
              <p className="mt-1 text-sm text-slate-600">
                View every account, create new users with passwords, and delete users (you cannot delete your own
                account from the API).
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
                Open user management
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </CardBody>
        </Card>
      </Link>
      <Card className="border-amber-200 bg-amber-50/50">
        <CardBody className="flex gap-3">
          <Shield className="h-5 w-5 shrink-0 text-amber-700" />
          <p className="text-sm text-amber-900">
            Only grant <strong>Admin</strong> to trusted staff. <strong>AAO</strong> can approve registrations and
            edit courses; <strong>Student</strong> can only access the catalog and their own form.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
