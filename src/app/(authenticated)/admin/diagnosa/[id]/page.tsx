import { deleteDiagnosaAdmin } from "@/actions/diagnosa";
import { db } from "@/lib/db";
import { formatDateId } from "@/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";

type DiagnosaRow = { id: number; id_user: string; tanggal_diagnosa: string; hasil_penyakit: string | null; confidence: number | null };
type UserRow = { nama_lengkap: string; email: string };
type PenyakitRow = { nama_penyakit: string; deskripsi: string | null; solusi: string | null };
type DetailRow = { kode_gejala: string };
type GejalaRow = { kode_gejala: string; nama_gejala: string };

export default async function AdminDiagnosaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const did = Number(id);
  if (!Number.isFinite(did)) notFound();

  const d = db.prepare("SELECT * FROM diagnosa WHERE id = ?").get(did) as DiagnosaRow | undefined;
  if (!d) notFound();

  const userProf = db.prepare("SELECT nama_lengkap, email FROM users WHERE id = ?").get(d.id_user) as UserRow | undefined;
  const p = d.hasil_penyakit ? (db.prepare("SELECT * FROM penyakit WHERE kode_penyakit = ?").get(d.hasil_penyakit) as PenyakitRow | undefined) : null;
  const details = db.prepare("SELECT kode_gejala FROM diagnosa_detail WHERE id_diagnosa = ?").all(did) as DetailRow[];

  const kodeList = details.map((x) => x.kode_gejala);
  const namaGejala: Record<string, string> = {};
  if (kodeList.length) {
    const ph = kodeList.map(() => "?").join(",");
    const gr = db.prepare(`SELECT kode_gejala, nama_gejala FROM gejala WHERE kode_gejala IN (${ph})`).all(...kodeList) as GejalaRow[];
    for (const g of gr) namaGejala[g.kode_gejala] = g.nama_gejala;
  }

  const pct = d.confidence != null ? d.confidence * 100 : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/riwayat" className="btn-ghost btn-sm">
          <i className="bi bi-arrow-left" />
        </Link>
        <div>
          <h1 className="page-title">Detail Diagnosa #{d.id}</h1>
          <p className="text-sm text-slate-400">{formatDateId(d.tanggal_diagnosa)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className={`card border-l-4 p-5 ${pct != null && pct >= 50 ? "border-l-primary" : "border-l-amber-600"}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Pengguna</p>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 ring-1 ring-primary/30">
                    <i className="bi bi-person-fill text-sm text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">{userProf?.nama_lengkap ?? "—"}</p>
                    <p className="text-xs text-slate-400">{userProf?.email ?? "—"}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kerusakan</p>
                <p className="mt-1 font-bold text-white">{p?.nama_penyakit ?? d.hasil_penyakit ?? "—"}</p>
                {pct != null && (
                  <span className={`badge ${pct >= 70 ? "badge-orange" : "badge-blue"}`}>
                    {pct.toFixed(1)}% kecocokan
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <i className="bi bi-clipboard2-check text-primary" />
                <h3 className="section-title">Gejala yang Dipilih</h3>
              </div>
              <span className="badge-blue">{details.length} gejala</span>
            </div>
            <div className="p-5">
              <div className="grid gap-2 sm:grid-cols-2">
                {details.map((row) => (
                  <div
                    key={row.kode_gejala}
                    className="flex items-center gap-2.5 rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2.5 text-sm text-slate-200"
                  >
                    <i className="bi bi-check2-circle text-primary" />
                    <span>
                      <span className="mr-1 font-mono text-[10px] text-slate-500">[{row.kode_gejala}]</span>
                      {namaGejala[row.kode_gejala] ?? row.kode_gejala}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {p && (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-2">
                  <i className="bi bi-tools text-primary" />
                  <h3 className="section-title">Informasi Kerusakan</h3>
                </div>
              </div>
              <div className="divide-y divide-slate-700/80">
                {p.deskripsi && (
                  <div className="p-5">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Deskripsi</p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{p.deskripsi}</p>
                  </div>
                )}
                {p.solusi && (
                  <div className="p-5">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Solusi</p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{p.solusi}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="card p-5">
            <h3 className="section-title mb-4">Aksi</h3>
            <div className="flex flex-col gap-2">
              <Link href="/admin/riwayat" className="btn-secondary justify-center">
                <i className="bi bi-arrow-left" /> Kembali
              </Link>
              <form action={deleteDiagnosaAdmin}>
                <input type="hidden" name="id" value={d.id} />
                <button type="submit" className="btn-danger w-full justify-center">
                  <i className="bi bi-trash3-fill" /> Hapus Diagnosa
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
