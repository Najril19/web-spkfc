"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Notifikasi dari query `success` / `notice` / `error` hilang otomatis setelah beberapa detik. */
const DISMISS_MS = 6000;

export type FlashPayload = {
  variant: "success" | "error";
  text: string;
} | null;

export function AutoDismissFlash({
  flash,
  className,
}: {
  flash: FlashPayload;
  className?: string;
}) {
  const [visible, setVisible] = useState(Boolean(flash));
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!flash) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      const params = new URLSearchParams(window.location.search);
      params.delete("success");
      params.delete("notice");
      params.delete("error");
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    }, DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [flash?.text, flash?.variant, pathname, router]);

  if (!flash || !visible) return null;

  const box =
    flash.variant === "success" ? "alert-success" : "alert-error";
  const icon =
    flash.variant === "success"
      ? "bi-check-circle-fill text-green-600"
      : "bi-exclamation-triangle-fill text-red-500";

  return (
    <div className={[box, className].filter(Boolean).join(" ")}>
      <i className={`bi shrink-0 ${icon}`} />
      {flash.text}
    </div>
  );
}
