import {
  adminCreateUser,
  adminDeleteUser,
  adminUpdateUser,
} from "@/actions/pengguna";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminPenggunaPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; success?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const editing = sp.edit
    ? (rows ?? []).find((r) => r.id === sp.edit)
    : undefined;

  return (
    <div className="space-y-6">
      {(sp.success || sp.error) && (
        <div
          className={`rounded-lg p-3 text-sm ${sp.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}
        >
          {sp.success ? "Berhasil disimpan." : sp.error}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
        <h6 className="mb-3 font-bold text-primary">Tambah pengguna</h6>
        <p className="mb-3 text-xs text-gray-600">
          Membutuhkan{" "}
          <code className="rounded bg-gray-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code> di
          .env.local (server-only).
        </p>
        <form action={adminCreateUser} className="grid gap-3 md:grid-cols-2">
          <input
            name="nama_lengkap"
            placeholder="Nama lengkap"
            required
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            name="password"
            type="password"
            placeholder="Password awal"
            required
            minLength={6}
            className="rounded border px-3 py-2 text-sm"
          />
          <div>
            <label className="mb-1 block text-xs text-gray-600">Role</label>
            <select name="role" className="w-full rounded border px-3 py-2 text-sm">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white md:col-span-2"
          >
            Simpan pengguna
          </button>
        </form>
      </div>

      {editing && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h6 className="mb-3 font-bold">Edit pengguna</h6>
          <form action={adminUpdateUser} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="id" value={editing.id} />
            <input
              name="nama_lengkap"
              defaultValue={editing.nama_lengkap}
              required
              className="rounded border px-3 py-2 text-sm md:col-span-2"
            />
            <input
              name="email"
              type="email"
              defaultValue={editing.email ?? ""}
              required
              className="rounded border px-3 py-2 text-sm md:col-span-2"
            />
            <input
              name="password"
              type="password"
              placeholder="Password baru (opsional)"
              className="rounded border px-3 py-2 text-sm md:col-span-2"
            />
            <div>
              <label className="mb-1 block text-xs text-gray-600">Role</label>
              <select
                name="role"
                defaultValue={editing.role}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <button
                type="submit"
                className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white"
              >
                Update
              </button>
              <Link href="/admin/pengguna" className="rounded border px-4 py-2 text-sm">
                Batal
              </Link>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <div className="bg-primary px-4 py-3 text-white">
          <h5 className="font-bold">Data pengguna</h5>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b bg-gray-50">
              <tr className="text-left">
                <th className="p-2">No</th>
                <th className="p-2">Nama</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((r, i) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{r.nama_lengkap}</td>
                  <td className="p-2">{r.email ?? "—"}</td>
                  <td className="p-2">{r.role}</td>
                  <td className="p-2">
                    <Link
                      href={`/admin/pengguna?edit=${r.id}`}
                      className="mr-2 inline-block rounded bg-amber-500 px-2 py-1 text-xs text-white"
                    >
                      Edit
                    </Link>
                    {r.id !== user?.id && (
                      <form action={adminDeleteUser} className="inline">
                        <input type="hidden" name="id" value={r.id} />
                        <button
                          type="submit"
                          className="rounded bg-red-600 px-2 py-1 text-xs text-white"
                        >
                          Hapus
                        </button>
                      </form>
                    )}
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
