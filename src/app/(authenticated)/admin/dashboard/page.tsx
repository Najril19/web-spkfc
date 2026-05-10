import { getClient, sql } from "@/lib/db";
import { formatDateId } from "@/lib/format";
import Link from "next/link";

type DiagnosaRow = {
  id: number;
  tanggal_diagnosa: string;
  confidence: number | null;
  hasil_penyakit: string | null;
  id_user: string;
};
type UserRow = { id: string; nama_lengkap: string };
type PenyakitRow = { kode_penyakit: string; nama_penyakit: string };

export default async function AdminDashboardPage() {
  let penyakit = 0;
  let gejala = 0;
  let users = 0;
  let diagnosa = 0;
  let recent: DiagnosaRow[] = [];
  let dbError = false;

  try {
    const [rowPenyakit] = (await sql`SELECT COUNT(*)::int AS n FROM penyakit`) as unknown as {
      n: number;
    }[];
    penyakit = rowPenyakit?.n ?? 0;

    const [rowGejala] = (await sql`SELECT COUNT(*)::int AS n FROM gejala`) as unknown as {
      n: number;
    }[];
    gejala = rowGejala?.n ?? 0;

    const [rowUsers] = (await sql`
      SELECT COUNT(*)::int AS n FROM users WHERE role = 'user'
    `) as unknown as { n: number }[];
    users = rowUsers?.n ?? 0;

    const [rowDiagnosa] = (await sql`SELECT COUNT(*)::int AS n FROM diagnosa`) as unknown as {
      n: number;
    }[];
    diagnosa = rowDiagnosa?.n ?? 0;

    recent = (await sql`
      SELECT id, tanggal_diagnosa, confidence, hasil_penyakit, id_user
      FROM diagnosa
      ORDER BY tanggal_diagnosa DESC
      LIMIT 5
    `) as unknown as DiagnosaRow[];
  } catch {
    dbError = true;
  }

  const userIds = [...new Set(recent.map((r) => r.id_user))];
  const namaUser: Record<string, string> = {};
  if (userIds.length) {
    const c = await getClient();
    const profs = (await c`
      SELECT id, nama_lengkap FROM users
      WHERE id IN ${c(userIds)}
    `) as unknown as UserRow[];
    for (const p of profs) namaUser[p.id] = p.nama_lengkap;
  }

  const kodes = [...new Set(recent.map((r) => r.hasil_penyakit).filter(Boolean) as string[])];
  const namaPenyakit: Record<string, string> = {};
  if (kodes.length) {
    const c = await getClient();
    const pRows = (await c`
      SELECT kode_penyakit, nama_penyakit FROM penyakit
      WHERE kode_penyakit IN ${c(kodes)}
    `) as unknown as PenyakitRow[];
    for (const p of pRows) namaPenyakit[p.kode_penyakit] = p.nama_penyakit;
  }

  const stats = [
    { label: "Total Kerusakan", value: penyakit, icon: "bi-tools" },
    { label: "Total Gejala", value: gejala, icon: "bi-clipboard2-pulse-fill" },
    { label: "Pengguna Aktif", value: users, icon: "bi-people-fill" },
    { label: "Total Diagnosa", value: diagnosa, icon: "bi-search-heart-fill" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard Admin</h1>
        <p className="page-sub">Ringkasan sistem diagnosa kendaraan</p>
        {dbError && (
          <p className="mt-2 text-sm text-amber-400">
            Database belum merespons. Coba refresh beberapa saat lagi.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="card flex items-center justify-between border-l-4 border-l-primary p-5"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
              <p className="mt-1 text-3xl font-bold text-slate-50">{s.value}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/15 ring-1 ring-orange-500/25">
              <i className={`bi ${s.icon} text-2xl text-primary`} />
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <i className="bi bi-clock-history text-primary" />
            <h2 className="section-title">Riwayat Diagnosa Terbaru</h2>
          </div>
          <Link href="/admin/riwayat" className="text-xs font-medium text-primary hover:underline">
            Lihat semua →
          </Link>
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
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    <i className="bi bi-inbox text-2xl text-slate-500" />
                    <p className="mt-1 text-sm">Belum ada data diagnosa</p>
                  </td>
                </tr>
              )}
              {recent.map((r, i) => {
                const pct = r.confidence != null ? r.confidence * 100 : null;
                return (
                  <tr key={r.id}>
                    <td className="font-mono text-xs text-slate-500">{i + 1}</td>
                    <td>{formatDateId(String(r.tanggal_diagnosa))}</td>
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
                            <div
                              className={`h-full rounded-full ${pct >= 70 ? "bg-primary" : pct >= 40 ? "bg-orange-600" : "bg-orange-900/90"}`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-400">{pct.toFixed(1)}%</span>
                        </div>
                      ) : "—"}
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
