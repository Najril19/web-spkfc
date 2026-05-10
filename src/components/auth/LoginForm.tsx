"use client";

import { useFormStatus } from "react-dom";

const inputClass =
  "w-full rounded-xl border border-slate-600/70 bg-slate-950/50 py-3.5 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 shadow-inner shadow-black/20 outline-none transition focus:border-orange-500/70 focus:bg-slate-950/80 focus:shadow-[0_0_0_3px_rgba(249,115,22,0.18)] disabled:opacity-60";

function LoginFields() {
  const { pending } = useFormStatus();

  return (
    <>
      <div>
        <label htmlFor="login-email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Email
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500">
            <i className="bi bi-envelope-fill text-[15px]" />
          </span>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="nama@bengkel.com"
            disabled={pending}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label htmlFor="login-password" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Password
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500">
            <i className="bi bi-lock-fill text-[15px]" />
          </span>
          <input
            id="login-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={pending}
            className={inputClass}
          />
        </div>
      </div>
    </>
  );
}

function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`group relative mt-2 flex min-h-[3.25rem] w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-sm font-semibold text-white shadow-lg shadow-orange-950/40 transition enabled:hover:from-orange-400 enabled:hover:to-orange-500 enabled:hover:shadow-orange-900/50 enabled:active:scale-[0.98] disabled:cursor-wait disabled:opacity-100 ${pending ? "py-3" : "py-3.5"}`}
    >
      {pending ? (
        <span
          className="relative z-10 flex w-full items-center justify-center px-3"
          role="status"
          aria-live="polite"
        >
          {/* Pill progress: outline + inner track + filling bar (orange, seperti tombol) */}
          <div className="w-full max-w-[17rem] rounded-full border-2 border-orange-100/95 bg-black/20 p-[3px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.35)]">
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-black/40">
              <div
                className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-gradient-to-r from-orange-200 via-amber-100 to-orange-50 shadow-[0_0_10px_rgba(255,237,213,0.55)] animate-login-pill-fill"
                aria-hidden
              />
            </div>
          </div>
        </span>
      ) : (
        <span className="relative z-10 flex items-center justify-center gap-2">
          <i className="bi bi-box-arrow-in-right text-lg" />
          Masuk
        </span>
      )}
      {!pending && (
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition group-hover:opacity-100" />
      )}
    </button>
  );
}

export function LoginForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="space-y-5">
      <LoginFields />

      <LoginSubmitButton />
    </form>
  );
}
