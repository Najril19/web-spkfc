"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ParsedOption = {
  value: number;
  label: React.ReactNode;
  disabled?: boolean;
};

const ROW_REM = 2.5;
const VISIBLE_ROWS = 3;

function parseOptions(children: React.ReactNode): ParsedOption[] {
  const mapped = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return null;
    const p = child.props as {
      value: number;
      disabled?: boolean;
      children?: React.ReactNode;
    };
    return {
      value: p.value,
      label: p.children,
      disabled: p.disabled,
    };
  });
  return (mapped?.filter(Boolean) as ParsedOption[]) ?? [];
}

/** Dropdown tahun/bulan DayPicker: ~3 baris terlihat + scroll; portal ke body supaya tidak terpotong. */
export function ScrollableDayPickerSelect({
  children,
  className,
  value,
  onChange,
  disabled,
  style,
  "aria-label": ariaLabel,
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const items = parseOptions(children);
  const numericValue = Number(value);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !rootRef.current || typeof window === "undefined") {
      setMenuPos(null);
      return;
    }
    const r = rootRef.current.getBoundingClientRect();
    const width = Math.max(r.width, 176);
    const maxListHeight =
      typeof window !== "undefined"
        ? parseFloat(getComputedStyle(document.documentElement).fontSize) * ROW_REM * VISIBLE_ROWS
        : 120;
    let top = r.bottom + 6;
    const spaceBelow = window.innerHeight - r.bottom - 12;
    if (spaceBelow < maxListHeight && r.top > maxListHeight + 12) {
      top = r.top - maxListHeight - 6;
    }
    let left = r.left;
    left = Math.min(Math.max(8, left), window.innerWidth - width - 8);

    setMenuPos({ top, left, width });
  }, [open, items.length]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest?.("[data-rdp-scrollable-list]")) return;
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function emitChange(next: number) {
    onChange?.({
      target: { value: String(next) },
      currentTarget: { value: String(next) },
      preventDefault: () => {},
      stopPropagation: () => {},
    } as unknown as React.ChangeEvent<HTMLSelectElement>);
    setOpen(false);
  }

  const maxHeightStyle = `calc(${ROW_REM}rem * ${VISIBLE_ROWS})`;

  const dropdown =
    mounted &&
    open &&
    !disabled &&
    menuPos &&
    createPortal(
      <ul
        role="listbox"
        data-rdp-scrollable-list
        className="fixed z-[300] overflow-y-auto overscroll-contain rounded-lg border border-slate-600 bg-slate-950 py-1 shadow-2xl ring-1 ring-orange-500/25"
        style={{
          top: menuPos.top,
          left: menuPos.left,
          width: menuPos.width,
          maxHeight: maxHeightStyle,
        }}
      >
        {items.map((item) => (
          <li key={item.value} role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={item.value === numericValue}
              disabled={item.disabled}
              className={`w-full px-3 py-2 text-left text-sm leading-snug ${
                item.value === numericValue
                  ? "bg-orange-500/25 font-semibold text-white"
                  : "text-slate-200 hover:bg-slate-800"
              } disabled:opacity-40`}
              onClick={() => !item.disabled && emitChange(item.value)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>,
      document.body,
    );

  return (
    <div
      ref={rootRef}
      className={[className, "relative"].filter(Boolean).join(" ")}
      style={style}
    >
      <button
        type="button"
        tabIndex={disabled ? -1 : 0}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="absolute inset-0 z-[3] cursor-pointer opacity-0 disabled:cursor-not-allowed"
        onClick={() => !disabled && setOpen((o) => !o)}
      />
      {dropdown}
    </div>
  );
}
