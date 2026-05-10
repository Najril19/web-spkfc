"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; icon: string };

const adminNav: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
  { href: "/admin/penyakit", label: "Data Penyakit", icon: "bi-bug-fill" },
  { href: "/admin/gejala", label: "Data Gejala", icon: "bi-clipboard2-pulse-fill" },
  { href: "/admin/relasi", label: "Data Relasi", icon: "bi-diagram-2-fill" },
  { href: "/admin/pengguna", label: "Data Pengguna", icon: "bi-people-fill" },
  { href: "/admin/riwayat", label: "Riwayat Diagnosa", icon: "bi-book-fill" },
  { href: "/admin/laporan", label: "Laporan", icon: "bi-file-earmark-text-fill" },
];

const userNav: NavItem[] = [
  { href: "/user/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
  { href: "/user/diagnosa", label: "Diagnosa", icon: "bi-search-heart-fill" },
  { href: "/user/riwayat", label: "Riwayat Diagnosa", icon: "bi-clock-history" },
  { href: "/profile", label: "Profile", icon: "bi-person-fill" },
];

export function AppSidebar({
  role,
  nama,
}: {
  role: "admin" | "user";
  nama: string;
}) {
  const pathname = usePathname();
  const items = role === "admin" ? adminNav : userNav;

  return (
    <aside className="flex w-[250px] shrink-0 flex-col bg-white p-4 shadow-md">
      <Link href="/" className="mb-6 flex items-center gap-2 no-underline">
        <Image src="/logo5.png" alt="Logo" width={56} height={56} className="rounded" />
        <span className="text-base font-bold tracking-wide text-gray-800">
          MJMScan+
        </span>
      </Link>
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded px-3 py-2 text-sm no-underline transition-colors ${
                active
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-gray-800 hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <i className={`${item.icon} me-2`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t pt-4 text-xs text-gray-500">
        {nama}
      </div>
    </aside>
  );
}
