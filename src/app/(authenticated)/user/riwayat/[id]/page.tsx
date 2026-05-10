import { deleteDiagnosaUser } from "@/actions/diagnosa";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { formatDateId } from "@/lib/format";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type DiagnosaRow = { id: number; id_user: string; tanggal_diagnosa: string; hasil_penyakit: string | null; confidence: number | null };
type PenyakitRow = { kode_penyakit: string; nama_penyakit: string; deskripsi: string | null; solusi: string | null };
type DetailRow = { kode_gejala: string };
type GejalaRow = { kode_gejala: string; nama_gejala: string };

export default async function UserRiwayatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const did = Number(id);
  if (!Number.isFinite(did)) notFound();

  const session = await getSession();
  if (!session.userId) redirect("/login");

  const d = db.prepare("SELECT id, id_user, tanggal_diagnosa, hasil_penyakit, confidence FROM diagnosa WHERE id = ?").get(did) as DiagnosaRow | undefined;
  if (!d || d.id_user !== session.userId) notFound();

  const p = d.hasil_penyakit
    ? (db.prepare("SELECT * FROM penyakit WHERE kode_penyakit = ?").get(d.hasil_penyakit) as PenyakitRow | undefined)
    : null;

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
        <Link href="/user/riwayat" className="btn-ghost btn-sm">
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
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Hasil Diagnosa</p>
            <h2 className="text-xl font-bold text-white">{p?.nama_penyakit ?? d.hasil_penyakit ?? "—"}</h2>
            {pct != null && (
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                  <span>Tingkat kecocokan</span>
                  <span className="font-bold text-primary">{pct.toFixed(1)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${pct >= 70 ? "bg-primary" : pct >= 40 ? "bg-orange-600" : "bg-orange-900/90"}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>
            )}
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
                  <i className="bi bi-info-circle text-primary" />
                  <h3 className="section-title">Informasi Kerusakan</h3>
                </div>
              </div>
              <div className="divide-y divide-slate-700/80">
                {p.deskripsi && (
                  <div className="p-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Deskripsi</p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{p.deskripsi}</p>
                  </div>
                )}
                {p.solusi && (
                  <div className="p-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Solusi</p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{p.solusi}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="section-title mb-4">Aksi</h3>
            <div className="flex flex-col gap-2">
              <Link href={`/user/hasil-diagnosa/${d.id}`} className="btn-primary justify-center">
                <i className="bi bi-bar-chart-fill" /> Lihat Ranking
              </Link>
              <Link href="/user/diagnosa" className="btn-secondary justify-center">
                <i className="bi bi-search-heart-fill" /> Diagnosa Baru
              </Link>
              <form action={deleteDiagnosaUser}>
                <input type="hidden" name="id" value={d.id} />
                <button type="submit" className="btn-danger w-full justify-center">
                  <i className="bi bi-trash3-fill" /> Hapus Riwayat
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
