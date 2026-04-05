"use client";

import type { ReactNode } from "react";
import { LayoutDashboard, Users } from "lucide-react";
import { AuthGate } from "../../components/AuthGate";
import { DashboardNav, MobileNav } from "../../components/DashboardNav";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "All users", icon: Users }
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate roles={["ADMIN"]}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
        <DashboardNav title="Admin menu" items={nav} />
        <div className="min-w-0 flex-1 space-y-4">
          <MobileNav items={nav} />
          {children}
        </div>
      </div>
    </AuthGate>
  );
}
