import { createGejala, deleteGejala, updateGejala } from "@/actions/gejala";
import { db } from "@/lib/db";
import Link from "next/link";

type GejalaRow = { kode_gejala: string; nama_gejala: string };

export default async function AdminGejalaPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; success?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const rows = db.prepare("SELECT kode_gejala, nama_gejala FROM gejala ORDER BY kode_gejala").all() as GejalaRow[];
  const editing = sp.edit ? rows.find((r) => r.kode_gejala === sp.edit) : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Data Gejala</h1>
        <p className="page-sub">Kelola daftar gejala untuk sistem diagnosa</p>
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
            <h2 className="section-title">Tambah Gejala</h2>
          </div>
        </div>
        <div className="p-5">
          <form action={createGejala} className="flex flex-wrap gap-3">
            <div className="flex-shrink-0">
              <label className="form-label">Kode</label>
              <input name="kode_gejala" placeholder="GK014" required className="form-input w-32" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="form-label">Nama Gejala</label>
              <input name="nama_gejala" placeholder="Nama gejala..." required className="form-input" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn-primary">
                <i className="bi bi-plus-lg" /> Tambah
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
              <h2 className="font-semibold text-amber-100">Edit {editing.kode_gejala}</h2>
            </div>
          </div>
          <div className="p-5">
            <form action={updateGejala} className="flex flex-wrap gap-3">
              <input type="hidden" name="kode_gejala" value={editing.kode_gejala} />
              <div className="flex-1 min-w-[200px]">
                <label className="form-label">Nama Gejala</label>
                <input name="nama_gejala" defaultValue={editing.nama_gejala} required className="form-input" />
              </div>
              <div className="flex items-end gap-2">
                <button type="submit" className="btn-primary"><i className="bi bi-check2" /> Update</button>
                <Link href="/admin/gejala" className="btn-secondary">Batal</Link>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <i className="bi bi-table text-primary" />
            <h2 className="section-title">Daftar Gejala</h2>
          </div>
          <span className="badge-blue">{rows.length} data</span>
        </div>
        <div className="table-wrapper rounded-none border-0">
          <table className="table">
            <thead>
              <tr><th>No</th><th>Kode</th><th>Nama Gejala</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.kode_gejala}>
                  <td className="font-mono text-xs text-slate-400">{i + 1}</td>
                  <td><span className="badge-blue">{r.kode_gejala}</span></td>
                  <td className="font-medium text-slate-200">{r.nama_gejala}</td>
                  <td>
                    <div className="flex gap-2">
                      <Link href={`/admin/gejala?edit=${encodeURIComponent(r.kode_gejala)}`} className="btn btn-sm btn-warning">
                        <i className="bi bi-pencil-fill" /> Edit
                      </Link>
                      <form action={deleteGejala} className="inline">
                        <input type="hidden" name="kode_gejala" value={r.kode_gejala} />
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
