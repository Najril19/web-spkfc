import { createRelasi, deleteRelasi } from "@/actions/relasi";
import { db } from "@/lib/db";

type RelasiRow = { id: number; kode_penyakit: string; kode_gejala: string };
type PenyakitRow = { kode_penyakit: string; nama_penyakit: string };
type GejalaRow = { kode_gejala: string; nama_gejala: string };

export default async function AdminRelasiPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const relasi = db.prepare("SELECT id, kode_penyakit, kode_gejala FROM relasi ORDER BY id").all() as RelasiRow[];
  const penyakit = db.prepare("SELECT kode_penyakit, nama_penyakit FROM penyakit ORDER BY kode_penyakit").all() as PenyakitRow[];
  const gejala = db.prepare("SELECT kode_gejala, nama_gejala FROM gejala ORDER BY kode_gejala").all() as GejalaRow[];
  const pn = Object.fromEntries(penyakit.map((p) => [p.kode_penyakit, p.nama_penyakit]));
  const gn = Object.fromEntries(gejala.map((g) => [g.kode_gejala, g.nama_gejala]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Data Relasi</h1>
        <p className="page-sub">Hubungan antara kerusakan dan gejala</p>
      </div>

      {(sp.success || sp.error) && (
        <div className={sp.success ? "alert-success" : "alert-error"}>
          <i className={`bi ${sp.success ? "bi-check-circle-fill text-green-600" : "bi-exclamation-triangle-fill text-red-500"}`} />
          {sp.success ? "Data berhasil disimpan." : sp.error}
        </div>
      )}

      {/* Add form */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <i className="bi bi-diagram-2-fill text-primary" />
            <h2 className="section-title">Tambah Relasi</h2>
          </div>
        </div>
        <div className="p-5">
          <form action={createRelasi} className="flex flex-wrap items-end gap-4">
            <div>
              <label className="form-label">Kerusakan</label>
              <select name="kode_penyakit" required className="form-select w-auto pr-8">
                <option value="">— Pilih Kerusakan —</option>
                {penyakit.map((p) => (
                  <option key={p.kode_penyakit} value={p.kode_penyakit}>
                    {p.kode_penyakit} — {p.nama_penyakit}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Gejala</label>
              <select name="kode_gejala" required className="form-select w-auto pr-8">
                <option value="">— Pilih Gejala —</option>
                {gejala.map((g) => (
                  <option key={g.kode_gejala} value={g.kode_gejala}>
                    {g.kode_gejala} — {g.nama_gejala}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary">
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
                  <td>
                    <span className="badge-orange mr-1.5">{r.kode_penyakit}</span>
                    <span className="text-slate-400">{pn[r.kode_penyakit] ?? ""}</span>
                  </td>
                  <td>
                    <span className="badge-blue mr-1.5">{r.kode_gejala}</span>
                    <span className="text-slate-400">{gn[r.kode_gejala] ?? ""}</span>
                  </td>
                  <td>
                    <form action={deleteRelasi}>
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" className="btn btn-sm btn-danger">
                        <i className="bi bi-trash3-fill" />
                      </button>
                    </form>
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
