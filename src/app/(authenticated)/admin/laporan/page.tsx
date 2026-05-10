import { createClient } from "@/lib/supabase/server";
import { formatDateId } from "@/lib/format";
import Link from "next/link";

function monthBounds() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
}

export default async function AdminLaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ start_date?: string; end_date?: string }>;
}) {
  const sp = await searchParams;
  const { start: defStart, end: defEnd } = monthBounds();
  const start_date = sp.start_date ?? defStart;
  const end_date = sp.end_date ?? defEnd;

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("diagnosa")
    .select("id, tanggal_diagnosa, confidence, hasil_penyakit, id_user")
    .gte("tanggal_diagnosa", `${start_date}T00:00:00`)
    .lte("tanggal_diagnosa", `${end_date}T23:59:59`)
    .order("tanggal_diagnosa", { ascending: false });

  const userIds = [...new Set((rows ?? []).map((r) => r.id_user))];
  const { data: profs } = userIds.length
    ? await supabase.from("profiles").select("id, nama_lengkap").in("id", userIds)
    : { data: [] as { id: string; nama_lengkap: string }[] };
  const namaUser = Object.fromEntries((profs ?? []).map((p) => [p.id, p.nama_lengkap]));

  const kodes = [...new Set((rows ?? []).map((r) => r.hasil_penyakit).filter(Boolean))] as string[];
  const { data: penyakitRows } = kodes.length
    ? await supabase.from("penyakit").select("kode_penyakit, nama_penyakit").in("kode_penyakit", kodes)
    : { data: [] as { kode_penyakit: string; nama_penyakit: string }[] };
  const namaPenyakit = Object.fromEntries((penyakitRows ?? []).map((p) => [p.kode_penyakit, p.nama_penyakit]));

  const exportPdf = `/api/admin/export/laporan?format=pdf&start_date=${encodeURIComponent(start_date)}&end_date=${encodeURIComponent(end_date)}`;
  const exportXlsx = `/api/admin/export/laporan?format=xlsx&start_date=${encodeURIComponent(start_date)}&end_date=${encodeURIComponent(end_date)}`;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
      <div className="flex flex-col gap-3 bg-primary px-4 py-3 text-white md:flex-row md:items-center md:justify-between">
        <h5 className="font-bold">Laporan diagnosa</h5>
        <div className="flex flex-wrap items-center gap-2">
          <form className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              name="start_date"
              defaultValue={start_date}
              className="rounded border border-gray-200 bg-white px-2 py-1 text-sm text-gray-900"
            />
            <span>s/d</span>
            <input
              type="date"
              name="end_date"
              defaultValue={end_date}
              className="rounded border border-gray-200 bg-white px-2 py-1 text-sm text-gray-900"
            />
            <button type="submit" className="rounded bg-white px-3 py-1 text-sm font-semibold text-primary">
              Filter
            </button>
          </form>
          <a
            href={exportPdf}
            target="_blank"
            rel="noreferrer"
            className="rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
          >
            Export PDF
          </a>
          <a
            href={exportXlsx}
            className="rounded bg-green-600 px-3 py-1 text-sm font-semibold text-white hover:bg-green-700"
          >
            Export Excel
          </a>
        </div>
      </div>
      <div className="p-4">
        <p className="mb-4 rounded-lg bg-sky-50 p-3 text-sm text-sky-900">
          Periode:{" "}
          <strong>
            {new Date(start_date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </strong>{" "}
          —{" "}
          <strong>
            {new Date(end_date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </strong>
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="border-b bg-gray-800 text-white">
              <tr className="text-left">
                <th className="p-2">No</th>
                <th className="p-2">Tanggal</th>
                <th className="p-2">User</th>
                <th className="p-2">Hasil</th>
                <th className="p-2">Kecocokan</th>
                <th className="p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((r, i) => {
                const pct =
                  r.confidence != null ? Math.round(r.confidence * 10000) / 100 : 0;
                const barClass =
                  pct >= 80 ? "bg-green-600" : pct >= 60 ? "bg-amber-500" : "bg-red-600";
                return (
                  <tr key={r.id} className="border-b">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{formatDateId(r.tanggal_diagnosa)}</td>
                    <td className="p-2">{namaUser[r.id_user] ?? "—"}</td>
                    <td className="p-2">
                      {r.hasil_penyakit
                        ? namaPenyakit[r.hasil_penyakit] ?? r.hasil_penyakit
                        : "—"}
                    </td>
                    <td className="p-2">
                      <div className="h-6 w-full max-w-[140px] overflow-hidden rounded bg-gray-200">
                        <div
                          className={`h-full ${barClass} text-center text-xs leading-6 text-white`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        >
                          {pct}%
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <Link
                        href={`/admin/diagnosa/${r.id}`}
                        className="rounded bg-cyan-600 px-2 py-1 text-xs text-white"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {(!rows || rows.length === 0) && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    Tidak ada data pada periode ini
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold">
                <td colSpan={4} className="p-2 text-right">
                  Total diagnosa:
                </td>
                <td colSpan={2} className="p-2">
                  {(rows ?? []).length} kasus
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
