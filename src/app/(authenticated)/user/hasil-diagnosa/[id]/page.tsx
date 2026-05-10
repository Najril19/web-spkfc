import { computeDiagnosis } from "@/lib/diagnosis";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type DiagnosaRow = { id: number; id_user: string };
type DetailRow = { kode_gejala: string };
type RelasiRow = { kode_penyakit: string; kode_gejala: string };
type PenyakitRow = { kode_penyakit: string; nama_penyakit: string; deskripsi: string | null; solusi: string | null; pencegahan: string | null };

export default async function HasilDiagnosaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const diagnosaId = Number(id);
  if (!Number.isFinite(diagnosaId)) notFound();

  const session = await getSession();
  if (!session.userId) redirect("/login");

  const rows = await sql`SELECT id, id_user FROM diagnosa WHERE id = ${diagnosaId}`;
  const row = rows[0] as DiagnosaRow | undefined;
  if (!row || row.id_user !== session.userId) notFound();

  const details = (await sql`
    SELECT kode_gejala FROM diagnosa_detail WHERE id_diagnosa = ${diagnosaId}
  `) as unknown as DetailRow[];
  const selectedGejala = details.map((d) => d.kode_gejala);

  const relRows = (await sql`
    SELECT kode_penyakit, kode_gejala FROM relasi
  `) as unknown as RelasiRow[];
  const penyakitRows = (await sql`
    SELECT kode_penyakit, nama_penyakit FROM penyakit
  `) as unknown as { kode_penyakit: string; nama_penyakit: string }[];
  const namaMap = Object.fromEntries(penyakitRows.map((p) => [p.kode_penyakit, p.nama_penyakit]));
  const relasi = relRows.map((r) => ({
    kode_penyakit: r.kode_penyakit,
    kode_gejala: r.kode_gejala,
    nama_penyakit: namaMap[r.kode_penyakit] ?? r.kode_penyakit,
  }));

  const hasil = computeDiagnosis(selectedGejala, relasi);
  const top = hasil[0];
  const pkRows = top
    ? await sql`SELECT * FROM penyakit WHERE kode_penyakit = ${top.kode_penyakit}`
    : [];
  const penyakit = pkRows[0] as PenyakitRow | undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/user/riwayat" className="btn-ghost btn-sm">
          <i className="bi bi-arrow-left" />
        </Link>
        <div>
          <h1 className="page-title">Hasil Diagnosa</h1>
          <p className="text-sm text-slate-400">Diagnosa #{diagnosaId}</p>
        </div>
      </div>

      {top ? (
        <>
          <div className={`card border-l-4 p-5 ${top.confidence > 0.5 ? "border-l-primary" : "border-l-amber-600"}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Kerusakan Terdeteksi</p>
                <h2 className="text-2xl font-bold text-white">{top.nama_penyakit}</h2>
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <i className="bi bi-check2-circle text-primary" />
                    {top.gejala_cocok} dari {top.total_gejala} gejala cocok
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tingkat Kecocokan</p>
                <p className={`text-4xl font-bold ${top.confidence > 0.5 ? "text-primary" : "text-amber-400"}`}>
                  {(top.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full ${top.confidence > 0.5 ? "bg-primary" : "bg-amber-600"}`}
                style={{ width: `${Math.min(100, top.confidence * 100)}%` }}
              />
            </div>
          </div>

          {penyakit && (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-2">
                  <i className="bi bi-info-circle-fill text-primary" />
                  <h3 className="section-title">Informasi Kerusakan</h3>
                </div>
              </div>
              <div className="divide-y divide-slate-700/80">
                {[
                  { label: "Deskripsi", icon: "bi-file-text", value: penyakit.deskripsi },
                  { label: "Solusi", icon: "bi-tools", value: penyakit.solusi },
                  { label: "Pencegahan", icon: "bi-shield-check", value: penyakit.pencegahan },
                ].map(
                  (s) =>
                    s.value && (
                      <div key={s.label} className="p-5">
                        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-200">
                          <i className={`bi ${s.icon} text-primary`} /> {s.label}
                        </p>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{s.value}</p>
                      </div>
                    ),
                )}
              </div>
            </div>
          )}

          {hasil.length > 1 && (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-2">
                  <i className="bi bi-list-check text-primary" />
                  <h3 className="section-title">Kemungkinan Lain</h3>
                </div>
              </div>
              <div className="table-wrapper rounded-none border-0">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Kerusakan</th>
                      <th>Kecocokan</th>
                      <th>Gejala</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hasil.slice(1).map((h, i) => (
                      <tr key={h.kode_penyakit}>
                        <td className="text-slate-500">{i + 1}</td>
                        <td className="font-medium text-slate-100">{h.nama_penyakit}</td>
                        <td>
                          <span className={`badge ${h.confidence > 0.5 ? "badge-orange" : "badge-blue"}`}>
                            {(h.confidence * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-slate-400">
                          {h.gejala_cocok}/{h.total_gejala}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Link href="/user/diagnosa" className="btn-primary">
              <i className="bi bi-search-heart-fill" /> Diagnosa Lagi
            </Link>
            <Link href="/user/riwayat" className="btn-secondary">
              <i className="bi bi-clock-history" /> Lihat Riwayat
            </Link>
          </div>
        </>
      ) : (
        <div className="card p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-950/50 ring-1 ring-red-500/40">
            <i className="bi bi-x-circle-fill text-3xl text-red-400" />
          </div>
          <h3 className="mb-2 font-bold text-white">Tidak Ada Kecocokan</h3>
          <p className="mb-6 text-sm text-slate-400">Gejala tidak cocok dengan basis pengetahuan. Coba pilih gejala yang lebih spesifik.</p>
          <Link href="/user/diagnosa" className="btn-primary inline-flex">
            Coba Lagi
          </Link>
        </div>
      )}
    </div>
  );
}
