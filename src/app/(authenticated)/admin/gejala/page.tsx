import {
  createGejala,
  deleteGejala,
  updateGejala,
} from "@/actions/gejala";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminGejalaPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; success?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("gejala")
    .select("*")
    .order("kode_gejala");

  const editing = sp.edit
    ? (rows ?? []).find((r) => r.kode_gejala === sp.edit)
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
        <h6 className="mb-3 font-bold text-primary">Tambah gejala</h6>
        <form action={createGejala} className="flex flex-wrap gap-2">
          <input
            name="kode_gejala"
            placeholder="Kode"
            required
            className="min-w-[120px] flex-1 rounded border px-3 py-2 text-sm"
          />
          <input
            name="nama_gejala"
            placeholder="Nama gejala"
            required
            className="min-w-[200px] flex-[2] rounded border px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Tambah
          </button>
        </form>
      </div>

      {editing && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h6 className="mb-3 font-bold">Edit {editing.kode_gejala}</h6>
          <form action={updateGejala} className="flex flex-wrap gap-2">
            <input type="hidden" name="kode_gejala" value={editing.kode_gejala} />
            <input
              name="nama_gejala"
              defaultValue={editing.nama_gejala}
              required
              className="min-w-[240px] flex-1 rounded border px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded bg-primary px-4 py-2 text-sm text-white">
              Update
            </button>
            <Link href="/admin/gejala" className="rounded border px-4 py-2 text-sm">
              Batal
            </Link>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <div className="bg-primary px-4 py-3 text-white">
          <h5 className="font-bold">Data gejala</h5>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr className="text-left">
                <th className="p-2">No</th>
                <th className="p-2">Kode</th>
                <th className="p-2">Nama</th>
                <th className="p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((r, i) => (
                <tr key={r.kode_gejala} className="border-b">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2 font-mono">{r.kode_gejala}</td>
                  <td className="p-2">{r.nama_gejala}</td>
                  <td className="p-2">
                    <Link
                      href={`/admin/gejala?edit=${encodeURIComponent(r.kode_gejala)}`}
                      className="mr-2 inline-block rounded bg-amber-500 px-2 py-1 text-xs text-white"
                    >
                      Edit
                    </Link>
                    <form action={deleteGejala} className="inline">
                      <input type="hidden" name="kode_gejala" value={r.kode_gejala} />
                      <button
                        type="submit"
                        className="rounded bg-red-600 px-2 py-1 text-xs text-white"
                      >
                        Hapus
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
