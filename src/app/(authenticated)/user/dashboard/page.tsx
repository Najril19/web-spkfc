import { createClient } from "@/lib/supabase/server";
import { formatDateId } from "@/lib/format";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function UserDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { count } = await supabase
    .from("diagnosa")
    .select("*", { count: "exact", head: true })
    .eq("id_user", user.id);

  const { data: rows } = await supabase
    .from("diagnosa")
    .select("id, tanggal_diagnosa, confidence, hasil_penyakit")
    .eq("id_user", user.id)
    .order("tanggal_diagnosa", { ascending: false })
    .limit(5);

  const kodes = [...new Set((rows ?? []).map((r) => r.hasil_penyakit).filter(Boolean))] as string[];
  const { data: penyakitList } = kodes.length
    ? await supabase.from("penyakit").select("kode_penyakit, nama_penyakit").in("kode_penyakit", kodes)
    : { data: [] as { kode_penyakit: string; nama_penyakit: string }[] };
  const namaByKode = Object.fromEntries((penyakitList ?? []).map((p) => [p.kode_penyakit, p.nama_penyakit]));

  return (
    <>
      <div className="mb-8 rounded-lg border border-primary/20 bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-primary">Total Diagnosa</p>
            <p className="text-3xl font-bold text-gray-800">{count ?? 0}</p>
          </div>
          <i className="bi bi-search-heart-fill text-4xl text-gray-300" />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <div className="bg-primary px-4 py-3 text-white">
          <h5 className="font-bold">Riwayat Diagnosa Terakhir</h5>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="p-2">No</th>
                <th className="p-2">Tanggal</th>
                <th className="p-2">Kerusakan</th>
                <th className="p-2">Kecocokan</th>
                <th className="p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((r, i) => {
                const nama =
                  r.hasil_penyakit != null
                    ? namaByKode[r.hasil_penyakit] ?? "Tidak diketahui"
                    : "Tidak diketahui";
                return (
                  <tr key={r.id} className="border-b">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{formatDateId(r.tanggal_diagnosa)}</td>
                    <td className="p-2">{nama}</td>
                    <td className="p-2">
                      {r.confidence != null
                        ? `${(r.confidence * 100).toFixed(2)}%`
                        : "—"}
                    </td>
                    <td className="p-2">
                      <Link
                        href={`/user/riwayat/${r.id}`}
                        className="inline-flex items-center gap-1 rounded bg-cyan-600 px-2 py-1 text-xs text-white hover:bg-cyan-700"
                      >
                        <i className="bi bi-eye" /> Detail
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {(!rows || rows.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    Belum ada diagnosa
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
