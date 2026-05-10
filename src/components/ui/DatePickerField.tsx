"use client";

import { id as localeId } from "date-fns/locale";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

import { ScrollableDayPickerSelect } from "@/components/ui/ScrollableDayPickerSelect";

function parseYmd(s: string): Date | undefined {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? undefined : dt;
}

function toYmd(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/** Rentang tahun dibatasi supaya daftar tidak panjang; diperluas jika tanggal terpilih di luar rentang. */
function calendarBounds(selected: Date | undefined) {
  const y = new Date().getFullYear();
  let startY = y - 8;
  let endY = y + 2;
  if (selected) {
    const sy = selected.getFullYear();
    if (sy < startY) startY = sy;
    if (sy > endY) endY = sy;
  }
  return {
    startMonth: new Date(startY, 0),
    endMonth: new Date(endY, 11),
  };
}

export function DatePickerField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (ymd: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = parseYmd(value);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest?.("[data-rdp-scrollable-list]")) return;
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const display =
    selected != null
      ? format(selected, "d MMMM yyyy", { locale: localeId })
      : "Pilih tanggal";

  const { startMonth, endMonth } = calendarBounds(selected);

  return (
    <div ref={rootRef} className="relative">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex w-full items-center gap-3 rounded-xl border border-slate-600/70 bg-slate-950/50 px-4 py-2.5 text-left text-sm text-slate-100 outline-none transition hover:border-slate-500 focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="min-w-0 flex-1 truncate font-medium">{display}</span>
        <i
          className="bi bi-calendar-event shrink-0 text-2xl leading-none text-white drop-shadow-sm"
          aria-hidden
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-[2px] sm:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            className="datepicker-popover fixed left-1/2 top-1/2 z-[60] w-[min(calc(100vw-1rem),20rem)] max-h-[min(85dvh,26rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-2xl border border-slate-600/90 bg-slate-900 p-3 shadow-2xl shadow-black/60 ring-1 ring-orange-500/25 sm:absolute sm:inset-auto sm:left-0 sm:top-full sm:mt-2 sm:max-h-[min(90dvh,28rem)] sm:w-max sm:min-w-[17.5rem] sm:translate-x-0 sm:translate-y-0 touch-pan-y"
            role="dialog"
            aria-label={label}
          >
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={(d) => {
                if (d) onChange(toYmd(d));
                setOpen(false);
              }}
              locale={localeId}
              defaultMonth={selected ?? new Date()}
              captionLayout="dropdown"
              reverseYears
              navLayout="around"
              startMonth={startMonth}
              endMonth={endMonth}
              className="rdp-dark-laporan"
              components={{ Select: ScrollableDayPickerSelect }}
            />
          </div>
        </>
      )}
    </div>
  );
}
