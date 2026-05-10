import { db } from "@/lib/db";
import { formatDateId } from "@/lib/format";
import Link from "next/link";

type DiagnosaRow = { id: number; tanggal_diagnosa: string; confidence: number | null; hasil_penyakit: string | null; id_user: string };
type UserRow = { id: string; nama_lengkap: string };
type PenyakitRow = { kode_penyakit: string; nama_penyakit: string };

export default function AdminRiwayatPage() {
  const rows = db.prepare("SELECT id, tanggal_diagnosa, confidence, hasil_penyakit, id_user FROM diagnosa ORDER BY tanggal_diagnosa DESC").all() as DiagnosaRow[];

  const userIds = [...new Set(rows.map((r) => r.id_user))];
  const namaUser: Record<string, string> = {};
  if (userIds.length) {
    const ph = userIds.map(() => "?").join(",");
    const profs = db.prepare(`SELECT id, nama_lengkap FROM users WHERE id IN (${ph})`).all(...userIds) as UserRow[];
    for (const p of profs) namaUser[p.id] = p.nama_lengkap;
  }

  const kodes = [...new Set(rows.map((r) => r.hasil_penyakit).filter(Boolean) as string[])];
  const namaPenyakit: Record<string, string> = {};
  if (kodes.length) {
    const ph = kodes.map(() => "?").join(",");
    const pr = db.prepare(`SELECT kode_penyakit, nama_penyakit FROM penyakit WHERE kode_penyakit IN (${ph})`).all(...kodes) as PenyakitRow[];
    for (const p of pr) namaPenyakit[p.kode_penyakit] = p.nama_penyakit;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Riwayat Diagnosa</h1>
        <p className="page-sub">Semua riwayat diagnosa dari seluruh pengguna</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <i className="bi bi-clock-history text-primary" />
            <h2 className="section-title">Semua Riwayat</h2>
          </div>
          <span className="badge-orange">{rows.length} data</span>
        </div>
        <div className="table-wrapper rounded-none border-0">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Pengguna</th>
                <th>Kerusakan</th>
                <th>Kecocokan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <i className="bi bi-inbox text-3xl" />
                    <p className="mt-2 text-sm">Belum ada data diagnosa</p>
                  </td>
                </tr>
              )}
              {rows.map((r, i) => {
                const pct = r.confidence != null ? r.confidence * 100 : null;
                return (
                  <tr key={r.id}>
                    <td className="font-mono text-xs text-slate-400">{i + 1}</td>
                    <td>{formatDateId(r.tanggal_diagnosa)}</td>
                    <td className="font-medium">{namaUser[r.id_user] ?? "—"}</td>
                    <td>
                      {r.hasil_penyakit ? (
                        <span className="badge-orange">{namaPenyakit[r.hasil_penyakit] ?? r.hasil_penyakit}</span>
                      ) : "—"}
                    </td>
                    <td>
                      {pct != null ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">
                            <div className={`h-full rounded-full ${pct >= 70 ? "bg-primary" : pct >= 40 ? "bg-orange-600" : "bg-orange-900/90"}`} style={{ width: `${Math.min(100, pct)}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-400">{pct.toFixed(1)}%</span>
                        </div>
                      ) : "—"}
                    </td>
                    <td>
                      <Link href={`/admin/diagnosa/${r.id}`} className="btn-ghost btn-sm">
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
