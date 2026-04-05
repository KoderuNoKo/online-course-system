"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GraduationCap, LogOut, User } from "lucide-react";
import { api } from "../lib/api";
import type { MeUser } from "../lib/types";
import { Button } from "./ui";

function dashboardPath(role: string) {
  if (role === "STUDENT") return "/student";
  if (role === "AAO") return "/aao";
  return "/admin";
}

export function SiteHeader() {
  const pathname = usePathname();
  const [me, setMe] = useState<MeUser | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api<{ user: MeUser }>("/api/auth/me");
        if (!cancelled) setMe(data.user);
      } catch {
        if (!cancelled) setMe(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const logout = async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    setMe(null);
    window.location.href = "/";
  };

  const hideAuthChrome = pathname === "/login";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <GraduationCap className="h-5 w-5" aria-hidden />
          </span>
          <span className="hidden sm:inline">Course Registration</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          {me && !hideAuthChrome ? (
            <>
              <Link
                href={dashboardPath(me.role)}
                className="hidden text-sm font-medium text-slate-600 hover:text-indigo-600 sm:inline"
              >
                Dashboard
              </Link>
              <span className="flex max-w-[140px] items-center gap-1.5 truncate rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700 sm:max-w-[200px]">
                <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">{me.fullName}</span>
              </span>
              <Button variant="ghost" className="!px-2 !py-2" onClick={logout} title="Log out">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : !hideAuthChrome ? (
            <Link
              href="/login"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Sign in
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
