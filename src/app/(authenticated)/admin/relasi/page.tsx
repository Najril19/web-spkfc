import { createRelasi, deleteRelasi } from "@/actions/relasi";
import { AutoDismissFlash } from "@/components/AutoDismissFlash";
import { ConfirmSubmitForm } from "@/components/ConfirmSubmitForm";
import { flashBanner } from "@/lib/flash-banner";
import { sql } from "@/lib/db";

type RelasiRow = { id: number; kode_penyakit: string; kode_gejala: string };
type PenyakitRow = { kode_penyakit: string; nama_penyakit: string };
type GejalaRow = { kode_gejala: string; nama_gejala: string };

export default async function AdminRelasiPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; notice?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const flash = flashBanner(sp);
  const relasi = (await sql`
    SELECT id, kode_penyakit, kode_gejala FROM relasi ORDER BY id
  `) as unknown as RelasiRow[];
  const penyakit = (await sql`
    SELECT kode_penyakit, nama_penyakit FROM penyakit ORDER BY kode_penyakit
  `) as unknown as PenyakitRow[];
  const gejala = (await sql`
    SELECT kode_gejala, nama_gejala FROM gejala ORDER BY kode_gejala
  `) as unknown as GejalaRow[];
  const pn = Object.fromEntries(penyakit.map((p) => [p.kode_penyakit, p.nama_penyakit]));
  const gn = Object.fromEntries(gejala.map((g) => [g.kode_gejala, g.nama_gejala]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Data Relasi</h1>
        <p className="page-sub">Hubungan antara kerusakan dan gejala</p>
      </div>

      <AutoDismissFlash flash={flash} />

      {/* Add form */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <i className="bi bi-diagram-2-fill text-primary" />
            <h2 className="section-title">Tambah Relasi</h2>
          </div>
        </div>
        <div className="p-5">
          <form action={createRelasi} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="flex flex-col gap-1">
              <label className="form-label">Kerusakan</label>
              <select name="kode_penyakit" required className="form-select w-full">
                <option value="">— Pilih Kerusakan —</option>
                {penyakit.map((p) => (
                  <option key={p.kode_penyakit} value={p.kode_penyakit}>
                    {p.kode_penyakit} — {p.nama_penyakit}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="form-label">Gejala</label>
              <select name="kode_gejala" required className="form-select w-full">
                <option value="">— Pilih Gejala —</option>
                {gejala.map((g) => (
                  <option key={g.kode_gejala} value={g.kode_gejala}>
                    {g.kode_gejala} — {g.nama_gejala}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full sm:w-auto">
              <i className="bi bi-plus-lg" /> Tambah Relasi
            </button>
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <i className="bi bi-table text-primary" />
            <h2 className="section-title">Daftar Relasi</h2>
          </div>
          <span className="badge-blue">{relasi.length} relasi</span>
        </div>
        <div className="table-wrapper rounded-none border-0">
          <table className="table">
            <thead>
              <tr><th>No</th><th>Kerusakan</th><th>Gejala</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {relasi.map((r, i) => (
                <tr key={r.id}>
                  <td className="font-mono text-xs text-slate-400">{i + 1}</td>
                  <td className="min-w-[140px]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="badge-orange shrink-0">{r.kode_penyakit}</span>
                      <span className="text-slate-400 text-xs">{pn[r.kode_penyakit] ?? ""}</span>
                    </div>
                  </td>
                  <td className="min-w-[140px]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="badge-blue shrink-0">{r.kode_gejala}</span>
                      <span className="text-slate-400 text-xs">{gn[r.kode_gejala] ?? ""}</span>
                    </div>
                  </td>
                  <td>
                    <ConfirmSubmitForm
                      action={deleteRelasi}
                      mode="delete"
                      message={`Hapus relasi ${r.kode_penyakit} ↔ ${r.kode_gejala}?`}
                    >
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" className="btn btn-sm btn-danger">
                        <i className="bi bi-trash3-fill" />
                      </button>
                    </ConfirmSubmitForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
