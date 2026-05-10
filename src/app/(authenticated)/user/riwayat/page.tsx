import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { formatDateId } from "@/lib/format";
import Link from "next/link";
import { redirect } from "next/navigation";

type DiagnosaRow = { id: number; tanggal_diagnosa: string; confidence: number | null; hasil_penyakit: string | null };
type PenyakitRow = { kode_penyakit: string; nama_penyakit: string };

export default async function UserRiwayatPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const rows = db
    .prepare("SELECT id, tanggal_diagnosa, confidence, hasil_penyakit FROM diagnosa WHERE id_user = ? ORDER BY tanggal_diagnosa DESC")
    .all(session.userId) as DiagnosaRow[];

  const kodes = [...new Set(rows.map((r) => r.hasil_penyakit).filter(Boolean) as string[])];
  const namaByKode: Record<string, string> = {};
  if (kodes.length) {
    const ph = kodes.map(() => "?").join(",");
    const pl = db.prepare(`SELECT kode_penyakit, nama_penyakit FROM penyakit WHERE kode_penyakit IN (${ph})`).all(...kodes) as PenyakitRow[];
    for (const p of pl) namaByKode[p.kode_penyakit] = p.nama_penyakit;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Riwayat Diagnosa</h1>
          <p className="page-sub">Semua riwayat diagnosa kendaraan Anda</p>
        </div>
        <Link href="/user/diagnosa" className="btn-primary btn-sm">
          <i className="bi bi-plus-lg" /> Diagnosa Baru
        </Link>
      </div>

      <div className="card">
        <div className="table-wrapper rounded-xl border-0">
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
                  <td colSpan={5} className="py-12 text-center">
                    <i className="bi bi-clipboard2-x text-4xl text-slate-300" />
                    <p className="mt-2 font-medium text-slate-400">Belum ada riwayat diagnosa</p>
                    <Link href="/user/diagnosa" className="btn-primary btn-sm mt-4 inline-flex">
                      Mulai Diagnosa
                    </Link>
                  </td>
                </tr>
              )}
              {rows.map((r, i) => {
                const pct = r.confidence != null ? r.confidence * 100 : null;
                return (
                  <tr key={r.id}>
                    <td className="font-mono text-xs text-slate-400">{i + 1}</td>
                    <td>{formatDateId(r.tanggal_diagnosa)}</td>
                    <td>
                      {r.hasil_penyakit ? (
                        <span className="badge-orange">{namaByKode[r.hasil_penyakit] ?? r.hasil_penyakit}</span>
                      ) : <span className="text-slate-400">—</span>}
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
