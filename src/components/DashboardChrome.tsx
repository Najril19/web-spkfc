import Image from "next/image";
import Link from "next/link";
import { AppSidebar } from "@/components/AppSidebar";

export function DashboardChrome({
  role,
  nama,
  children,
}: {
  role: "admin" | "user";
  nama: string;
  children: React.ReactNode;
}) {
  const dash =
    role === "admin" ? "/admin/dashboard" : "/user/dashboard";

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar role={role} nama={nama} />
      <div className="flex min-h-screen flex-1 flex-col bg-[#f8f9fc]">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
          <Link
            href={dash}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary"
          >
            <Image src="/logo5.png" alt="" width={32} height={32} className="rounded-full" />
            <span className="hidden font-medium text-gray-800 sm:inline">
              Beranda
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-gray-600 sm:inline">{nama}</span>
            <Link href="/profile" className="text-sm text-gray-600 hover:text-primary">
              Profile
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm text-gray-600 hover:text-red-600"
              >
                Logout
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
