import { getClient, sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { formatDateId } from "@/lib/format";
import Link from "next/link";
import { redirect } from "next/navigation";

type DiagnosaRow = { id: number; tanggal_diagnosa: string; confidence: number | null; hasil_penyakit: string | null };
type PenyakitRow = { kode_penyakit: string; nama_penyakit: string };

export default async function UserDashboardPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  let count = 0;
  let rows: DiagnosaRow[] = [];
  let dbError = false;
  try {
    const [countRow] = (await sql`
      SELECT COUNT(*)::int AS n FROM diagnosa WHERE id_user = ${session.userId}
    `) as unknown as { n: number }[];
    count = countRow?.n ?? 0;

    rows = (await sql`
      SELECT id, tanggal_diagnosa, confidence, hasil_penyakit
      FROM diagnosa
      WHERE id_user = ${session.userId}
      ORDER BY tanggal_diagnosa DESC
      LIMIT 5
    `) as unknown as DiagnosaRow[];
  } catch {
    dbError = true;
  }

  const kodes = [...new Set(rows.map((r) => r.hasil_penyakit).filter(Boolean) as string[])];
  const namaByKode: Record<string, string> = {};
  if (kodes.length) {
    const c = await getClient();
    const pl = (await c`
      SELECT kode_penyakit, nama_penyakit FROM penyakit
      WHERE kode_penyakit IN ${c(kodes)}
    `) as unknown as PenyakitRow[];
    for (const p of pl) namaByKode[p.kode_penyakit] = p.nama_penyakit;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Selamat datang, {session.nama_lengkap}!</h1>
        <p className="page-sub">Diagnosa kerusakan kendaraan Toyota Avanza Anda</p>
        {dbError && (
          <p className="mt-2 text-sm text-amber-400">
            Database belum merespons. Coba refresh beberapa saat lagi.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/user/diagnosa"
          className="card group flex flex-col items-center gap-3 border-l-4 border-l-primary p-6 text-center transition hover:border-primary hover:shadow-card-hover"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/15 ring-1 ring-orange-500/25 transition group-hover:bg-primary group-hover:ring-primary">
            <i className="bi bi-search-heart-fill text-2xl text-primary transition group-hover:text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-100">Mulai Diagnosa</p>
            <p className="mt-0.5 text-xs text-slate-500">Periksa kerusakan kendaraan</p>
          </div>
        </Link>

        <Link
          href="/user/riwayat"
          className="card group flex flex-col items-center gap-3 border-l-4 border-l-amber-600/80 p-6 text-center transition hover:border-amber-500 hover:shadow-card-hover"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 ring-1 ring-amber-500/25 transition group-hover:bg-amber-600 group-hover:ring-amber-500">
            <i className="bi bi-clock-history text-2xl text-amber-400 transition group-hover:text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-100">Riwayat Diagnosa</p>
            <p className="mt-0.5 text-xs text-slate-500">Lihat hasil diagnosa lalu</p>
          </div>
        </Link>

        <div className="card flex flex-col items-center justify-center gap-2 border-l-4 border-l-orange-900/80 p-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-950/60 ring-1 ring-orange-900/50">
            <i className="bi bi-graph-up text-2xl text-orange-300" />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-50">{count}</p>
            <p className="text-xs text-slate-500">Total diagnosa dilakukan</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <i className="bi bi-clock-history text-primary" />
            <h2 className="section-title">Riwayat Terbaru</h2>
          </div>
          <Link href="/user/riwayat" className="text-xs font-medium text-primary hover:underline">
            Lihat semua →
          </Link>
        </div>
        <div className="table-wrapper rounded-none border-0">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Kerusakan Terdeteksi</th>
                <th>Kecocokan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    <i className="bi bi-search text-3xl text-slate-500" />
                    <p className="mt-2 text-sm">Belum ada diagnosa. Mulai sekarang!</p>
                    <Link href="/user/diagnosa" className="btn-primary btn-sm mt-3 inline-flex">
                      <i className="bi bi-search-heart-fill" /> Diagnosa Sekarang
                    </Link>
                  </td>
                </tr>
              )}
              {rows.map((r, i) => {
                const nama = r.hasil_penyakit != null ? namaByKode[r.hasil_penyakit] ?? "Tidak diketahui" : "—";
                const pct = r.confidence != null ? r.confidence * 100 : null;
                return (
                  <tr key={r.id}>
                    <td className="font-mono text-xs text-slate-500">{i + 1}</td>
                    <td>{formatDateId(String(r.tanggal_diagnosa))}</td>
                    <td>
                      <span className="badge-orange">{nama}</span>
                    </td>
                    <td>
                      {pct != null ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className={`h-full rounded-full ${pct >= 70 ? "bg-primary" : pct >= 40 ? "bg-orange-600" : "bg-orange-900/90"}`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-400">{pct.toFixed(1)}%</span>
                        </div>
                      ) : "—"}
                    </td>
                    <td>
                      <Link href={`/user/riwayat/${r.id}`} className="btn-ghost btn-sm">
                        <i className="bi bi-eye" /> Detail
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
