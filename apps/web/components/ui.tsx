"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes
} from "react";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  children: ReactNode;
}) {
  const v =
    variant === "primary"
      ? "bg-brand-600 text-white shadow-soft hover:bg-brand-700 hover:shadow-float focus-visible:outline-brand-600"
      : variant === "secondary"
        ? "bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:outline-slate-400"
        : variant === "danger"
          ? "bg-rose-500 text-white shadow-soft hover:bg-rose-600 hover:shadow-float focus-visible:outline-rose-500"
          : variant === "outline"
            ? "border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-300"
            : "text-brand-700 hover:bg-brand-50";
  return (
    <button type="button" className={`${btnBase} px-4 py-2.5 text-sm ${v} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/60 bg-white shadow-soft ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-slate-100 px-6 py-4">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
    </div>
  );
}

export function CardBody({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input(props, ref) {
    return (
      <input
        ref={ref}
        className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 hover:bg-white focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 ${props.className || ""}`}
        {...props}
      />
    );
  }
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select(props, ref) {
    return (
      <select
        ref={ref}
        className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 transition-colors hover:bg-white focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 ${props.className || ""}`}
        {...props}
      />
    );
  }
);

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

export function Badge({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const t =
    tone === "success"
      ? "bg-emerald-50 text-emerald-800 ring-emerald-600/20"
      : tone === "warning"
        ? "bg-amber-50 text-amber-900 ring-amber-600/20"
        : tone === "danger"
          ? "bg-rose-50 text-rose-800 ring-rose-600/20"
          : tone === "info"
            ? "bg-sky-50 text-sky-800 ring-sky-600/20"
            : "bg-slate-100 text-slate-700 ring-slate-500/10";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${t}`}>
      {children}
    </span>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
      <p className="font-medium text-slate-700">{title}</p>
      {hint ? <p className="mt-2 text-sm text-slate-500">{hint}</p> : null}
    </div>
  );
}
