import { updateProfile } from "@/actions/profile";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { formatDateId } from "@/lib/format";
import { redirect } from "next/navigation";

type UserRow = { id: string; email: string; nama_lengkap: string; role: string; created_at: string | null };

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const profile = db.prepare("SELECT id, email, nama_lengkap, role, created_at FROM users WHERE id = ?").get(session.userId) as UserRow | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Profil Saya</h1>
        <p className="page-sub">Kelola informasi akun Anda</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Avatar / info card */}
        <div className="card p-6 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 ring-1 ring-primary/30">
            <i className="bi bi-person-fill text-4xl text-primary" />
          </div>
          <h3 className="font-bold text-white">{profile?.nama_lengkap ?? "—"}</h3>
          <p className="mt-0.5 text-sm text-slate-400">{profile?.email}</p>
          <div className="mt-3">
            <span className={`badge ${profile?.role === "admin" ? "badge-orange" : "badge-blue"}`}>
              <i className={`bi ${profile?.role === "admin" ? "bi-shield-fill" : "bi-person-fill"} me-1`} />
              {profile?.role === "admin" ? "Administrator" : "Teknisi"}
            </span>
          </div>
          <div className="mt-4 border-t border-slate-700 pt-4 text-xs text-slate-500">
            <i className="bi bi-calendar3 me-1" />
            Bergabung {formatDateId(profile?.created_at ?? null)}
          </div>
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <i className="bi bi-pencil-square text-primary" />
                <h2 className="section-title">Edit Profil</h2>
              </div>
            </div>
            <div className="p-5">
              {sp.success && (
                <div className="alert-success mb-4">
                  <i className="bi bi-check-circle-fill text-green-600" />
                  Profil berhasil diperbarui.
                </div>
              )}
              {sp.error && (
                <div className="alert-error mb-4">
                  <i className="bi bi-exclamation-triangle-fill text-red-500" />
                  {sp.error}
                </div>
              )}

              <form action={updateProfile} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="form-label">Email (login)</label>
                    <input name="email" type="email" required defaultValue={profile?.email ?? ""} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Nama Lengkap</label>
                    <input name="nama_lengkap" required defaultValue={profile?.nama_lengkap ?? ""} className="form-input" />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-600 bg-slate-950/50 p-4">
                  <p className="mb-3 text-sm font-semibold text-slate-200">
                    <i className="bi bi-shield-lock me-2 text-primary" />
                    Ganti Password
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="form-label">Password Lama</label>
                      <input name="current_password" type="password" autoComplete="current-password" placeholder="Kosongkan jika tidak ganti" className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">Password Baru</label>
                      <input name="password" type="password" autoComplete="new-password" placeholder="Min. 6 karakter" className="form-input" />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-primary">
                  <i className="bi bi-check2-circle" /> Simpan Perubahan
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
