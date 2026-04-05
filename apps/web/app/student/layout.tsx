"use client";

import type { ReactNode } from "react";
import { BookOpen, ClipboardList, LayoutDashboard, LineChart } from "lucide-react";
import { AuthGate } from "../../components/AuthGate";
import { DashboardNav, MobileNav } from "../../components/DashboardNav";

const nav = [
  { href: "/student", label: "Overview", icon: LayoutDashboard },
  { href: "/student/catalog", label: "Catalog", icon: BookOpen },
  { href: "/student/form", label: "My form", icon: ClipboardList },
  { href: "/student/status", label: "Status", icon: LineChart }
];

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate roles={["STUDENT"]}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
        <DashboardNav title="Student menu" items={nav} />
        <div className="min-w-0 flex-1 space-y-4">
          <MobileNav items={nav} />
          {children}
        </div>
      </div>
    </AuthGate>
  );
}
