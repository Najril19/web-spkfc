"use client";

import { DatePickerField } from "@/components/ui/DatePickerField";
import { useState } from "react";

function today() {
  return new Date().toISOString().slice(0, 10);
}
function firstOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export default function LaporanPage() {
  const [loading, setLoading] = useState<"pdf" | "excel" | null>(null);
  const [startDate, setStartDate] = useState(firstOfMonth());
  const [endDate, setEndDate] = useState(today());
  const [error, setError] = useState<string | null>(null);

  async function handleExport(format: "pdf" | "excel") {
    if (!startDate || !endDate) {
      setError("Pilih rentang tanggal terlebih dahulu.");
      return;
    }
    if (startDate > endDate) {
      setError("Tanggal mulai tidak boleh lebih besar dari tanggal akhir.");
      return;
    }
    setError(null);
    setLoading(format);
    try {
      const params = new URLSearchParams({ format, start_date: startDate, end_date: endDate });
      const res = await fetch(`/api/admin/export/laporan?${params}`);
      if (!res.ok) throw new Error("Gagal mengunduh laporan");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = format === "pdf"
        ? `laporan-diagnosa-${startDate}-${endDate}.pdf`
        : `laporan-diagnosa-${startDate}-${endDate}.xlsx`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      setError("Gagal mengunduh laporan. Coba lagi.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Laporan Diagnosa</h1>
        <p className="page-sub">Unduh laporan data diagnosa sistem berdasarkan periode</p>
      </div>

      {/* Date filter card */}
      <div className="card p-6">
        <div className="mb-4 flex items-center gap-2">
          <i className="bi bi-calendar-range text-primary" />
          <h2 className="section-title">Periode Laporan</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DatePickerField
            label="Dari Tanggal"
            value={startDate}
            onChange={setStartDate}
            disabled={loading !== null}
          />
          <DatePickerField
            label="Sampai Tanggal"
            value={endDate}
            onChange={setEndDate}
            disabled={loading !== null}
          />
        </div>
        {error && (
          <div className="alert-error mt-4">
            <i className="bi bi-exclamation-triangle-fill shrink-0 text-red-400" />
            {error}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-6">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-950/50 ring-1 ring-red-500/35">
            <i className="bi bi-file-earmark-pdf-fill text-3xl text-red-400" />
          </div>
          <h3 className="section-title mb-1 text-lg">Laporan PDF</h3>
          <p className="mb-5 text-sm text-slate-400">
            Unduh laporan diagnosa dalam format PDF siap cetak.
          </p>
          <button
            onClick={() => handleExport("pdf")}
            disabled={loading !== null}
            className="btn-danger w-full justify-center"
          >
            {loading === "pdf" ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Memproses...
              </>
            ) : (
              <>
                <i className="bi bi-file-earmark-pdf-fill" /> Unduh PDF
              </>
            )}
          </button>
        </div>

        <div className="card p-6">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-950/50 ring-1 ring-emerald-500/35">
            <i className="bi bi-file-earmark-excel-fill text-3xl text-emerald-400" />
          </div>
          <h3 className="section-title mb-1 text-lg">Laporan Excel</h3>
          <p className="mb-5 text-sm text-slate-400">
            Unduh laporan diagnosa dalam format Excel untuk analisis lebih lanjut.
          </p>
          <button
            onClick={() => handleExport("excel")}
            disabled={loading !== null}
            className="btn w-full justify-center border-0 bg-emerald-700 text-white hover:bg-emerald-600 focus:ring-emerald-500/50"
          >
            {loading === "excel" ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Memproses...
              </>
            ) : (
              <>
                <i className="bi bi-file-earmark-excel-fill" /> Unduh Excel
              </>
            )}
          </button>
        </div>

        <div className="card border-l-4 border-l-primary p-6">
          <div className="mb-3 flex items-center gap-2">
            <i className="bi bi-info-circle-fill text-primary" />
            <h3 className="section-title">Informasi</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <i className="bi bi-check2 mt-0.5 shrink-0 text-primary" />
              Data mencakup semua riwayat diagnosa pengguna pada periode terpilih
            </li>
            <li className="flex items-start gap-2">
              <i className="bi bi-check2 mt-0.5 shrink-0 text-primary" />
              Termasuk nama pengguna, kerusakan terdeteksi, dan tingkat kecocokan
            </li>
            <li className="flex items-start gap-2">
              <i className="bi bi-check2 mt-0.5 shrink-0 text-primary" />
              Laporan dihasilkan secara real-time
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
