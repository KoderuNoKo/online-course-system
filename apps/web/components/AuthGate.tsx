"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import type { MeUser, Role } from "../lib/types";
import { Spinner } from "./ui";

export function AuthGate({
  roles,
  children
}: {
  roles: Role[];
  children: ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api<{ user: MeUser }>("/api/auth/me");
        if (cancelled) return;
        if (!roles.includes(data.user.role)) {
          setUser(null);
          router.replace("/login");
          return;
        }
        setUser(data.user);
      } catch {
        if (!cancelled) router.replace("/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, roles]);

  if (user === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (user === null) return null;

  return <>{children}</>;
}
