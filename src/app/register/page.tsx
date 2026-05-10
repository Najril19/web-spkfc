import { registerAction } from "@/actions/auth";
import { AuthAmbient } from "@/components/auth/AuthAmbient";
import Link from "next/link";

const inputClass =
  "w-full rounded-xl border border-slate-600/70 bg-slate-950/50 py-3.5 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 shadow-inner shadow-black/20 outline-none transition focus:border-orange-500/70 focus:bg-slate-950/80 focus:shadow-[0_0_0_3px_rgba(249,115,22,0.18)]";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] text-slate-200">
      <AuthAmbient />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-10 xl:px-16">
        <div className="hidden shrink-0 lg:block lg:max-w-[28rem] xl:max-w-xl">
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
            <i className="bi bi-person-plus-fill" /> Akun teknisi / bengkel
          </p>

          <h1 className="mb-5 text-4xl font-bold leading-[1.1] tracking-tight text-white xl:text-5xl">
            Mulai{" "}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              diagnosa digital
            </span>
          </h1>
          <p className="max-w-md text-base leading-relaxed text-slate-400">
            Satu akun untuk mencatat riwayat dan menjalankan sistem pakar — tanpa ribet.
          </p>

          <ul className="mt-10 space-y-4 text-sm text-slate-400">
            <li className="flex items-start gap-3">
              <i className="bi bi-check-circle-fill mt-0.5 shrink-0 text-orange-500" />
              Akses diagnosa & riwayat di satu tempat
            </li>
            <li className="flex items-start gap-3">
              <i className="bi bi-check-circle-fill mt-0.5 shrink-0 text-orange-500" />
              Data disimpan lokal — Anda mengontrol servernya
            </li>
          </ul>

          <p className="mt-14 text-xs text-slate-600">
            © {new Date().getFullYear()} MJMScan+ · Sistem Pakar Otomotif
          </p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:py-16">
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
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Buat akun</h2>
                <p className="mt-2 text-sm text-slate-400">Isi data di bawah untuk bergabung</p>
              </div>

              {sp.error && (
                <div className="alert-error mb-6">
                  <i className="bi bi-exclamation-triangle-fill shrink-0 text-red-400" />
                  {sp.error}
                </div>
              )}

              <form action={registerAction} className="space-y-4">
                <div>
                  <label htmlFor="reg-name" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Nama lengkap
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500">
                      <i className="bi bi-person-fill text-[15px]" />
                    </span>
                    <input
                      id="reg-name"
                      name="nama_lengkap"
                      required
                      placeholder="Nama Anda"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="reg-email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Email
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500">
                      <i className="bi bi-envelope-fill text-[15px]" />
                    </span>
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="nama@bengkel.com"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="reg-password" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500">
                      <i className="bi bi-lock-fill text-[15px]" />
                    </span>
                    <input
                      id="reg-password"
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Minimal 6 karakter"
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="group relative mt-2 w-full overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-950/40 transition hover:from-orange-400 hover:to-orange-500 hover:shadow-orange-900/50 active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <i className="bi bi-person-plus-fill text-lg" />
                    Daftar & lanjutkan
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition group-hover:opacity-100" />
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-slate-500">
                Sudah punya akun?{" "}
                <Link href="/login" className="font-semibold text-orange-400 transition hover:text-orange-300">
                  Masuk
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
