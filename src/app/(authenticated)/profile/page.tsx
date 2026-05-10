import { updateProfile } from "@/actions/profile";
import { createClient } from "@/lib/supabase/server";
import { formatDateId } from "@/lib/format";
import { redirect } from "next/navigation";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
      <div className="bg-primary px-4 py-3 text-white">
        <h5 className="font-bold">Profil saya</h5>
      </div>
      <div className="p-6">
        {sp.success && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
            Profile berhasil diperbarui.
          </div>
        )}
        {sp.error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{sp.error}</div>
        )}
        <form action={updateProfile} className="mx-auto max-w-2xl space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Email (login)</label>
              <input
                name="email"
                type="email"
                required
                defaultValue={user?.email ?? ""}
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Nama lengkap</label>
              <input
                name="nama_lengkap"
                required
                defaultValue={profile?.nama_lengkap ?? ""}
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Password baru (kosongkan jika tidak diubah)
              </label>
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Terdaftar</label>
              <input
                readOnly
                value={formatDateId(profile?.created_at ?? null)}
                className="w-full rounded border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-600"
              />
            </div>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-[#3a5bc7]"
          >
            Simpan perubahan
          </button>
        </form>
      </div>
    </div>
  );
}
