import Link from "next/link";
import { BookOpen, Shield, UserCog } from "lucide-react";
import { Card, CardBody } from "../components/ui";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 px-6 py-14 text-white shadow-xl sm:px-10">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-200">University portal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Register for courses online
          </h1>
          <p className="mt-4 text-lg text-indigo-100">
            Browse the catalog, build your registration form, and track AAO approval — all in one place.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
          >
            Sign in to continue
          </Link>
        </div>
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
      </section>

      <section>
        <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-slate-500">
          Who uses this system
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardBody className="flex flex-col items-center text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                <BookOpen className="h-6 w-6" />
              </span>
              <h3 className="font-semibold text-slate-900">Students</h3>
              <p className="mt-2 text-sm text-slate-600">
                Search courses, add sections to your form, submit for approval, and view status.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex flex-col items-center text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Shield className="h-6 w-6" />
              </span>
              <h3 className="font-semibold text-slate-900">AAO officers</h3>
              <p className="mt-2 text-sm text-slate-600">
                Review pending forms first-come-first-served and manage the course catalog.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex flex-col items-center text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                <UserCog className="h-6 w-6" />
              </span>
              <h3 className="font-semibold text-slate-900">Administrators</h3>
              <p className="mt-2 text-sm text-slate-600">
                Create accounts, assign roles, and keep access under control.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
}
