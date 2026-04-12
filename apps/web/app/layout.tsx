import "./globals.css";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { SiteHeader } from "../components/SiteHeader";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <Toaster position="top-right" />
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
        <footer className="border-t border-slate-200 bg-white/50 py-6 text-center text-xs text-slate-500 backdrop-blur-sm">
          Online Course Registration · Academic year portal
        </footer>
      </body>
    </html>
  );
}
