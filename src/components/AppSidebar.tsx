"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type NavItem = { href: string; label: string; icon: string };

const adminNav: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
  { href: "/admin/penyakit", label: "Data Kerusakan", icon: "bi-tools" },
  { href: "/admin/gejala", label: "Data Gejala", icon: "bi-clipboard2-pulse-fill" },
  { href: "/admin/relasi", label: "Data Relasi", icon: "bi-diagram-2-fill" },
  { href: "/admin/pengguna", label: "Pengguna", icon: "bi-people-fill" },
  { href: "/admin/riwayat", label: "Riwayat Diagnosa", icon: "bi-clock-history" },
  { href: "/admin/laporan", label: "Laporan", icon: "bi-file-earmark-bar-graph-fill" },
];

const userNav: NavItem[] = [
  { href: "/user/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
  { href: "/user/diagnosa", label: "Diagnosa Kendaraan", icon: "bi-search-heart-fill" },
  { href: "/user/riwayat", label: "Riwayat Diagnosa", icon: "bi-clock-history" },
  { href: "/profile", label: "Profil Saya", icon: "bi-person-circle" },
];

export function AppSidebar({
  role,
  isOpen,
  onClose,
}: {
  role: "admin" | "user";
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const items = role === "admin" ? adminNav : userNav;
  const [logoutOpen, setLogoutOpen] = useState(false);
  const logoutFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!logoutOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLogoutOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [logoutOpen]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh max-h-dvh w-64 shrink-0 flex-col bg-bengkel-dark transition-transform duration-300 ease-in-out lg:relative lg:z-auto lg:h-full lg:max-h-none lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 border-b border-bengkel-border/50 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg">
            <i className="bi bi-wrench-adjustable text-white text-lg" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">MJMScan+</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-primary">
              Diagnosa Otomotif
            </p>
          </div>
          {/* Close on mobile */}
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-1 text-slate-400 hover:text-white lg:hidden"
          >
            <i className="bi bi-x-lg text-lg" />
          </button>
        </div>

        {/* Nav */}
        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Menu
          </p>
          <div className="flex flex-col gap-0.5">
            {items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-all ${
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-400 hover:bg-bengkel-panel hover:text-white"
                  }`}
                >
                  <i className={`${item.icon} w-4 text-center text-base`} />
                  <span>{item.label}</span>
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/80" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-bengkel-border/50 px-4 py-4">
          <form ref={logoutFormRef} action="/auth/signout" method="post">
            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-red-600/10 hover:text-red-400"
            >
              <i className="bi bi-box-arrow-left text-base" />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {logoutOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            aria-label="Tutup"
            onClick={() => setLogoutOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-slate-600 bg-slate-900 p-6 shadow-2xl shadow-black/50"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/15 ring-1 ring-orange-500/30">
              <i className="bi bi-box-arrow-right text-2xl text-primary" />
            </div>
            <h2 id="logout-dialog-title" className="text-lg font-bold text-white">
              Keluar dari akun?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Apakah Anda yakin ingin keluar? Sesi Anda akan berakhir dan Anda perlu masuk lagi untuk
              mengakses sistem.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setLogoutOpen(false)}
                className="btn-secondary w-full justify-center sm:w-auto"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => logoutFormRef.current?.requestSubmit()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 sm:w-auto"
              >
                <i className="bi bi-box-arrow-left" />
                Ya, keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
