import {
  createPenyakit,
  deletePenyakit,
  updatePenyakit,
} from "@/actions/penyakit";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminPenyakitPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; success?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("penyakit")
    .select("*")
    .order("kode_penyakit");

  const editing = sp.edit
    ? (rows ?? []).find((r) => r.kode_penyakit === sp.edit)
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
        <h6 className="mb-3 font-bold text-primary">Tambah penyakit</h6>
        <form action={createPenyakit} className="grid gap-3 md:grid-cols-2">
          <input
            name="kode_penyakit"
            placeholder="Kode (mis. JK08)"
            required
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            name="nama_penyakit"
            placeholder="Nama penyakit"
            required
            className="rounded border px-3 py-2 text-sm md:col-span-2"
          />
          <textarea
            name="deskripsi"
            placeholder="Deskripsi"
            rows={3}
            className="rounded border px-3 py-2 text-sm md:col-span-2"
          />
          <textarea
            name="solusi"
            placeholder="Solusi"
            rows={3}
            className="rounded border px-3 py-2 text-sm md:col-span-2"
          />
          <textarea
            name="pencegahan"
            placeholder="Pencegahan"
            rows={2}
            className="rounded border px-3 py-2 text-sm md:col-span-2"
          />
          <button
            type="submit"
            className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white md:col-span-2"
          >
            Simpan
          </button>
        </form>
      </div>

      {editing && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h6 className="mb-3 font-bold">Edit {editing.kode_penyakit}</h6>
          <form action={updatePenyakit} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="kode_penyakit" value={editing.kode_penyakit} />
            <input
              name="nama_penyakit"
              defaultValue={editing.nama_penyakit}
              required
              className="rounded border px-3 py-2 text-sm md:col-span-2"
            />
            <textarea
              name="deskripsi"
              defaultValue={editing.deskripsi ?? ""}
              rows={3}
              className="rounded border px-3 py-2 text-sm md:col-span-2"
            />
            <textarea
              name="solusi"
              defaultValue={editing.solusi ?? ""}
              rows={3}
              className="rounded border px-3 py-2 text-sm md:col-span-2"
            />
            <textarea
              name="pencegahan"
              defaultValue={editing.pencegahan ?? ""}
              rows={2}
              className="rounded border px-3 py-2 text-sm md:col-span-2"
            />
            <div className="flex gap-2 md:col-span-2">
              <button
                type="submit"
                className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white"
              >
                Update
              </button>
              <Link href="/admin/penyakit" className="rounded border px-4 py-2 text-sm">
                Batal
              </Link>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <div className="bg-primary px-4 py-3 text-white">
          <h5 className="font-bold">Data penyakit</h5>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full min-w-[640px] text-sm">
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
                <tr key={r.kode_penyakit} className="border-b">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2 font-mono">{r.kode_penyakit}</td>
                  <td className="p-2">{r.nama_penyakit}</td>
                  <td className="p-2">
                    <Link
                      href={`/admin/penyakit?edit=${encodeURIComponent(r.kode_penyakit)}`}
                      className="mr-2 inline-block rounded bg-amber-500 px-2 py-1 text-xs text-white"
                    >
                      Edit
                    </Link>
                    <form action={deletePenyakit} className="inline">
                      <input type="hidden" name="kode_penyakit" value={r.kode_penyakit} />
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
