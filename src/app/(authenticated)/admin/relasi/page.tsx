import { createRelasi, deleteRelasi } from "@/actions/relasi";
import { createClient } from "@/lib/supabase/server";

export default async function AdminRelasiPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: relasi } = await supabase
    .from("relasi")
    .select("id, kode_penyakit, kode_gejala")
    .order("id");

  const { data: penyakit } = await supabase
    .from("penyakit")
    .select("kode_penyakit, nama_penyakit")
    .order("kode_penyakit");

  const { data: gejala } = await supabase
    .from("gejala")
    .select("kode_gejala, nama_gejala")
    .order("kode_gejala");

  const pn = Object.fromEntries((penyakit ?? []).map((p) => [p.kode_penyakit, p.nama_penyakit]));
  const gn = Object.fromEntries((gejala ?? []).map((g) => [g.kode_gejala, g.nama_gejala]));

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
        <h6 className="mb-3 font-bold text-primary">Tambah relasi</h6>
        <form action={createRelasi} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-600">Penyakit</label>
            <select
              name="kode_penyakit"
              required
              className="rounded border px-3 py-2 text-sm"
            >
              <option value="">—</option>
              {(penyakit ?? []).map((p) => (
                <option key={p.kode_penyakit} value={p.kode_penyakit}>
                  {p.kode_penyakit} — {p.nama_penyakit}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600">Gejala</label>
            <select
              name="kode_gejala"
              required
              className="rounded border px-3 py-2 text-sm"
            >
              <option value="">—</option>
              {(gejala ?? []).map((g) => (
                <option key={g.kode_gejala} value={g.kode_gejala}>
                  {g.kode_gejala} — {g.nama_gejala}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Tambah
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <div className="bg-primary px-4 py-3 text-white">
          <h5 className="font-bold">Data relasi</h5>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b bg-gray-50">
              <tr className="text-left">
                <th className="p-2">No</th>
                <th className="p-2">Penyakit</th>
                <th className="p-2">Gejala</th>
                <th className="p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(relasi ?? []).map((r, i) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">
                    <span className="font-mono">{r.kode_penyakit}</span>{" "}
                    {pn[r.kode_penyakit] ?? ""}
                  </td>
                  <td className="p-2">
                    <span className="font-mono">{r.kode_gejala}</span>{" "}
                    {gn[r.kode_gejala] ?? ""}
                  </td>
                  <td className="p-2">
                    <form action={deleteRelasi}>
                      <input type="hidden" name="id" value={r.id} />
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
