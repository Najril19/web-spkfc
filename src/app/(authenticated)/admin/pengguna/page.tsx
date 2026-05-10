import { adminCreateUser as createPengguna, adminDeleteUser as deletePengguna, adminUpdateUser as updatePengguna } from "@/actions/pengguna";
import { AutoDismissFlash } from "@/components/AutoDismissFlash";
import { ConfirmSubmitForm } from "@/components/ConfirmSubmitForm";
import { flashBanner } from "@/lib/flash-banner";
import { sql } from "@/lib/db";
import { formatDateId } from "@/lib/format";
import Link from "next/link";

type UserRow = { id: string; email: string; nama_lengkap: string; role: string; created_at: string | null };

export default async function AdminPenggunaPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; success?: string; notice?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const flash = flashBanner(sp);
  const users = (await sql`
    SELECT id, email, nama_lengkap, role, created_at FROM users ORDER BY created_at DESC
  `) as unknown as UserRow[];
  const editing = sp.edit ? users.find((u) => u.id === sp.edit) : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Data Pengguna</h1>
        <p className="page-sub">Kelola akun pengguna sistem</p>
      </div>

      <AutoDismissFlash flash={flash} />

      {/* Add form */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <i className="bi bi-person-plus-fill text-primary" />
            <h2 className="section-title">Tambah Pengguna</h2>
          </div>
        </div>
        <div className="p-5">
          <form action={createPengguna} className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <label className="form-label">Nama Lengkap</label>
              <input name="nama_lengkap" required placeholder="Nama pengguna" className="form-input" />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input name="email" type="email" required placeholder="email@bengkel.com" className="form-input" />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input name="password" type="password" required minLength={6} placeholder="Min. 6 karakter" className="form-input" />
            </div>
            <div>
              <label className="form-label">Role</label>
              <select name="role" className="form-select">
                <option value="user">Teknisi</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="sm:col-span-2 md:col-span-4">
              <button type="submit" className="btn-primary">
                <i className="bi bi-person-plus-fill" /> Tambah Pengguna
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
              <h2 className="font-semibold text-amber-100">Edit {editing.nama_lengkap}</h2>
            </div>
          </div>
          <div className="p-5">
            <ConfirmSubmitForm action={updatePengguna} mode="save" className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={editing.id} />
              <div>
                <label className="form-label">Nama Lengkap</label>
                <input name="nama_lengkap" defaultValue={editing.nama_lengkap} required className="form-input" />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input name="email" type="email" defaultValue={editing.email} required className="form-input" />
              </div>
              <div>
                <label className="form-label">Password Baru (kosongkan jika tidak ganti)</label>
                <input name="password" type="password" minLength={6} placeholder="•••••••••" className="form-input" />
              </div>
              <div>
                <label className="form-label">Role</label>
                <select name="role" defaultValue={editing.role} className="form-select">
                  <option value="user">Teknisi</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 sm:col-span-2">
                <button type="submit" className="btn-primary"><i className="bi bi-check2" /> Update</button>
                <Link href="/admin/pengguna" className="btn-secondary">Batal</Link>
              </div>
            </ConfirmSubmitForm>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <i className="bi bi-people-fill text-primary" />
            <h2 className="section-title">Daftar Pengguna</h2>
          </div>
          <span className="badge-blue">{users.length} pengguna</span>
        </div>
        <div className="table-wrapper rounded-none border-0">
          <table className="table">
            <thead>
              <tr><th>No</th><th>Nama</th><th>Email</th><th>Role</th><th>Bergabung</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id}>
                  <td className="font-mono text-xs text-slate-400">{i + 1}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {u.nama_lengkap.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{u.nama_lengkap}</span>
                    </div>
                  </td>
                  <td className="text-slate-400">{u.email}</td>
                  <td>
                    <span className={u.role === "admin" ? "badge-orange" : "badge-blue"}>
                      {u.role === "admin" ? "Admin" : "Teknisi"}
                    </span>
                  </td>
                  <td className="text-slate-400">{formatDateId(u.created_at ?? null)}</td>
                  <td>
                    <div className="flex gap-2">
                      <Link href={`/admin/pengguna?edit=${u.id}`} className="btn btn-sm btn-warning">
                        <i className="bi bi-pencil-fill" /> Edit
                      </Link>
                      <ConfirmSubmitForm
                        action={deletePengguna}
                        mode="delete"
                        className="inline"
                        message={`Hapus pengguna ${u.nama_lengkap} (${u.email})?`}
                      >
                        <input type="hidden" name="id" value={u.id} />
                        <button type="submit" className="btn btn-sm btn-danger">
                          <i className="bi bi-trash3-fill" />
                        </button>
                      </ConfirmSubmitForm>
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
