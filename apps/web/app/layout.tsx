import "./globals.css";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { SiteHeader } from "../components/SiteHeader";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          Online Course Registration · Academic year portal
        </footer>
      </body>
    </html>
  );
}
