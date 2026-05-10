"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

const defaults = {
  delete: {
    title: "Hapus data?",
    message:
      "Data yang dihapus tidak dapat dikembalikan. Apakah Anda yakin ingin melanjutkan?",
    confirm: "Ya, hapus",
  },
  save: {
    title: "Simpan perubahan?",
    message:
      "Perubahan yang Anda buat akan disimpan ke database. Lanjutkan?",
    confirm: "Ya, simpan",
  },
} as const;

export function ConfirmSubmitForm({
  action,
  mode,
  title,
  message,
  confirmLabel,
  cancelLabel = "Batal",
  className,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  mode: "delete" | "save";
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  className?: string;
  children: ReactNode;
}) {
  const d = defaults[mode];
  const formRef = useRef<HTMLFormElement>(null);
  const proceedRef = useRef(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    if (proceedRef.current) {
      proceedRef.current = false;
      return;
    }
    e.preventDefault();
    setOpen(true);
  }

  function confirm() {
    proceedRef.current = true;
    setOpen(false);
    formRef.current?.requestSubmit();
  }

  const confirmBtnClass =
    mode === "delete"
      ? "flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 sm:w-auto"
      : "btn-primary flex w-full items-center justify-center gap-2 sm:w-auto";

  return (
    <>
      <form
        ref={formRef}
        action={action}
        onSubmit={handleSubmit}
        className={className}
      >
        {children}
      </form>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            aria-label="Tutup"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-slate-600 bg-slate-900 p-6 shadow-2xl shadow-black/50"
          >
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${
                mode === "delete"
                  ? "bg-red-500/15 ring-red-500/30"
                  : "bg-orange-500/15 ring-orange-500/30"
              }`}
            >
              <i
                className={`bi text-2xl ${
                  mode === "delete"
                    ? "bi-trash3-fill text-red-400"
                    : "bi-check2-circle text-primary"
                }`}
              />
            </div>
            <h2
              id="confirm-dialog-title"
              className="text-lg font-bold text-white"
            >
              {title ?? d.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {message ?? d.message}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-secondary w-full justify-center sm:w-auto"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={confirm}
                className={confirmBtnClass}
              >
                {mode === "delete" ? (
                  <i className="bi bi-trash3-fill" />
                ) : (
                  <i className="bi bi-check2-lg" />
                )}
                {confirmLabel ?? d.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
