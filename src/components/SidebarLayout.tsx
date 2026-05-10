"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import Link from "next/link";

export function SidebarLayout({
  role,
  nama,
  children,
}: {
  role: "admin" | "user";
  nama: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 w-full overflow-hidden bg-[#0b0f18]">
      <AppSidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-l border-slate-800/80 bg-[#0b0f18]">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-800 bg-slate-950/90 px-4 shadow-[inset_0_-1px_0_0_rgba(249,115,22,0.06)] backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-orange-300 lg:hidden"
            aria-label="Buka menu"
          >
            <i className="bi bi-list text-xl" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300 sm:inline-block">
              <i className="bi bi-wrench-adjustable me-1 text-primary" />
              {role === "admin" ? "Admin" : "Teknisi"}
            </span>

            <Link
              href="/profile"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-primary transition hover:border-primary hover:bg-primary hover:text-white"
              title={nama}
            >
              <i className="bi bi-person-fill text-sm" />
            </Link>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {children}
        </main>

        <footer className="border-t border-slate-800 bg-slate-950/90 px-6 py-3 text-center text-xs text-slate-500">
          MJMScan+ &copy; {new Date().getFullYear()} — Sistem Pakar Diagnosa Kerusakan Mobil Toyota Avanza
        </footer>
      </div>
    </div>
  );
}
