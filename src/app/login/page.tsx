import { loginAction } from "@/actions/auth";
import { AuthAmbient } from "@/components/auth/AuthAmbient";
import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] text-slate-200">
      <AuthAmbient />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-10 xl:px-16">
        {/* Branding — desktop (sedikit geser ke kanan) */}
        <div className="hidden shrink-0 lg:block lg:max-w-[28rem] xl:max-w-xl lg:pl-8 xl:pl-12">
          <div className="mb-10 inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 shadow-xl shadow-orange-900/40 ring-4 ring-orange-500/25">
              <i className="bi bi-wrench-adjustable text-2xl text-white" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-white">MJMScan+</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-400">
                Diagnosa Otomotif
              </p>
            </div>
          </div>

          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/35 bg-orange-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-orange-300 ring-1 ring-orange-500/20">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
            </span>
            Sistem pakar · Forward chaining
          </p>

          <h1 className="mb-5 text-4xl font-bold leading-[1.1] tracking-tight text-white xl:text-5xl xl:leading-[1.08]">
            Diagnosa kerusakan{" "}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              Toyota Avanza
            </span>
          </h1>
          <p className="max-w-md text-base leading-relaxed text-slate-400">
            Panel diagnosa modern untuk bengkel — cepat, terstruktur, dan siap dipakai tiap hari.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            {[
              { icon: "bi-lightning-charge-fill", text: "Realtime" },
              { icon: "bi-shield-check-fill", text: "Lokal & aman" },
              { icon: "bi-layout-text-window-reverse", text: "Riwayat lengkap" },
            ].map((item) => (
              <span
                key={item.text}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur-sm"
              >
                <i className={`${item.icon} text-orange-400`} />
                {item.text}
              </span>
            ))}
          </div>

          <p className="mt-14 text-xs text-slate-600">
            © {new Date().getFullYear()} MJMScan+ · Sistem Pakar Otomotif
          </p>
        </div>

        {/* Form column */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:py-16">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 shadow-lg shadow-orange-900/40">
              <i className="bi bi-wrench-adjustable text-xl text-white" />
            </div>
            <div>
              <p className="font-bold text-white">MJMScan+</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-orange-400/90">
                Diagnosa Otomotif
              </p>
            </div>
          </div>

          <div className="w-full max-w-[420px]">
            <div className="rounded-3xl border border-slate-700/60 bg-slate-900/50 p-8 shadow-2xl shadow-black/50 backdrop-blur-2xl ring-1 ring-white/[0.07] sm:p-10">
              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Masuk</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Gunakan email dan password akun bengkel Anda
                </p>
              </div>

              {sp.registered && (
                <div className="alert-success mb-6">
                  <i className="bi bi-check-circle-fill shrink-0 text-emerald-400" />
                  Registrasi berhasil. Silakan masuk.
                </div>
              )}
              {sp.error && (
                <div className="alert-error mb-6">
                  <i className="bi bi-exclamation-triangle-fill shrink-0 text-red-400" />
                  {sp.error}
                </div>
              )}

              <LoginForm action={loginAction} />

              <p className="mt-8 text-center text-sm text-slate-500">
                Belum punya akun?{" "}
                <Link href="/register" className="font-semibold text-orange-400 transition hover:text-orange-300">
                  Daftar
                </Link>
              </p>
            </div>

            <p className="mt-6 text-center text-[11px] text-slate-600">
              Dengan masuk, Anda menyetujui penggunaan sesi yang aman di perangkat ini.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
