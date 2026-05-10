import { getProfile, getSessionUser } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) {
    const p = await getProfile();
    redirect(p?.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2]">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-16 text-center text-white">
        <h1 className="mb-4 text-3xl font-bold drop-shadow md:text-4xl">
          MJMScan+
        </h1>
        <p className="mb-2 max-w-xl text-lg opacity-95">
          Sistem Diagnosa Kerusakan Mobil Toyota Avanza
        </p>
        <p className="mb-10 max-w-lg text-sm opacity-90">
          Forward chaining — same rules as the original PHP app. Powered by Next.js &
          Supabase.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/login"
            className="rounded-full bg-white px-8 py-3 font-semibold text-[#667eea] shadow-lg transition hover:scale-[1.02]"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="rounded-full border-2 border-white px-8 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Daftar
          </Link>
        </div>
      </div>
    </div>
  );
}
