import { createPenyakit, deletePenyakit, updatePenyakit } from "@/actions/penyakit";
import { db } from "@/lib/db";
import Link from "next/link";

type PenyakitRow = { kode_penyakit: string; nama_penyakit: string; deskripsi: string | null; solusi: string | null; pencegahan: string | null };

export default async function AdminPenyakitPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; success?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const rows = db.prepare("SELECT * FROM penyakit ORDER BY kode_penyakit").all() as PenyakitRow[];
  const editing = sp.edit ? rows.find((r) => r.kode_penyakit === sp.edit) : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Data Kerusakan</h1>
        <p className="page-sub">Kelola jenis kerusakan kendaraan Toyota Avanza</p>
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
            <i className="bi bi-plus-circle-fill text-primary" />
            <h2 className="section-title">Tambah Kerusakan</h2>
          </div>
        </div>
        <div className="p-5">
          <form action={createPenyakit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="form-label">Kode</label>
              <input name="kode_penyakit" placeholder="JK08" required className="form-input" />
            </div>
            <div>
              <label className="form-label">Nama Kerusakan</label>
              <input name="nama_penyakit" placeholder="Nama kerusakan..." required className="form-input" />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Deskripsi</label>
              <textarea name="deskripsi" rows={3} placeholder="Deskripsi kerusakan..." className="form-textarea" />
            </div>
            <div>
              <label className="form-label">Solusi</label>
              <textarea name="solusi" rows={3} placeholder="Solusi perbaikan..." className="form-textarea" />
            </div>
            <div>
              <label className="form-label">Pencegahan</label>
              <textarea name="pencegahan" rows={3} placeholder="Cara pencegahan..." className="form-textarea" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="btn-primary">
                <i className="bi bi-plus-lg" /> Simpan Kerusakan
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="card border border-amber-500/40">
          <div className="card-header border-b border-amber-500/25 bg-amber-950/40">
            <div className="flex items-center gap-2">
              <i className="bi bi-pencil-fill text-amber-400" />
              <h2 className="font-semibold text-amber-100">Edit {editing.kode_penyakit}</h2>
            </div>
          </div>
          <div className="p-5">
            <form action={updatePenyakit} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="kode_penyakit" value={editing.kode_penyakit} />
              <div className="md:col-span-2">
                <label className="form-label">Nama Kerusakan</label>
                <input name="nama_penyakit" defaultValue={editing.nama_penyakit} required className="form-input" />
              </div>
              <div className="md:col-span-2">
                <label className="form-label">Deskripsi</label>
                <textarea name="deskripsi" defaultValue={editing.deskripsi ?? ""} rows={3} className="form-textarea" />
              </div>
              <div>
                <label className="form-label">Solusi</label>
                <textarea name="solusi" defaultValue={editing.solusi ?? ""} rows={3} className="form-textarea" />
              </div>
              <div>
                <label className="form-label">Pencegahan</label>
                <textarea name="pencegahan" defaultValue={editing.pencegahan ?? ""} rows={3} className="form-textarea" />
              </div>
              <div className="flex gap-3 md:col-span-2">
                <button type="submit" className="btn-primary"><i className="bi bi-check2" /> Update</button>
                <Link href="/admin/penyakit" className="btn-secondary">Batal</Link>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <i className="bi bi-tools text-primary" />
            <h2 className="section-title">Daftar Kerusakan</h2>
          </div>
          <span className="badge-orange">{rows.length} data</span>
        </div>
        <div className="table-wrapper rounded-none border-0">
          <table className="table">
            <thead>
              <tr><th>No</th><th>Kode</th><th>Nama Kerusakan</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.kode_penyakit}>
                  <td className="font-mono text-xs text-slate-400">{i + 1}</td>
                  <td><span className="badge-orange">{r.kode_penyakit}</span></td>
                  <td className="font-medium text-slate-200">{r.nama_penyakit}</td>
                  <td>
                    <div className="flex gap-2">
                      <Link href={`/admin/penyakit?edit=${encodeURIComponent(r.kode_penyakit)}`} className="btn btn-sm btn-warning">
                        <i className="bi bi-pencil-fill" /> Edit
                      </Link>
                      <form action={deletePenyakit} className="inline">
                        <input type="hidden" name="kode_penyakit" value={r.kode_penyakit} />
                        <button type="submit" className="btn btn-sm btn-danger">
                          <i className="bi bi-trash3-fill" />
                        </button>
                      </form>
                    </div>
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
