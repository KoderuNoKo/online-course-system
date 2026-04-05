"use client";

import type { ReactNode } from "react";
import { BookMarked, ClipboardList, LayoutDashboard } from "lucide-react";
import { AuthGate } from "../../components/AuthGate";
import { DashboardNav, MobileNav } from "../../components/DashboardNav";

const nav = [
  { href: "/aao", label: "Overview", icon: LayoutDashboard },
  { href: "/aao/pending", label: "Pending forms", icon: ClipboardList },
  { href: "/aao/courses", label: "Courses", icon: BookMarked }
];

export default function AaoLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate roles={["AAO"]}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
        <DashboardNav title="AAO menu" items={nav} />
        <div className="min-w-0 flex-1 space-y-4">
          <MobileNav items={nav} />
          {children}
        </div>
      </div>
    </AuthGate>
  );
}
