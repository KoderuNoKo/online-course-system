/**
 * Browser: same-origin `/api/*` → Next.js rewrites to Express (see next.config.mjs).
 * Server (if used later): full URL to API.
 */
function apiBase(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  return (
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:4000"
  );
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const base = apiBase();
  const url = path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? "Request failed");
  }
  return res.json();
}
