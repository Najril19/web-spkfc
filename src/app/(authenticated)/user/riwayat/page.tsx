import { createClient } from "@/lib/supabase/server";
import { formatDateId } from "@/lib/format";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function UserRiwayatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rows } = await supabase
    .from("diagnosa")
    .select("id, tanggal_diagnosa, confidence, hasil_penyakit")
    .eq("id_user", user.id)
    .order("tanggal_diagnosa", { ascending: false });

  const kodes = [...new Set((rows ?? []).map((r) => r.hasil_penyakit).filter(Boolean))] as string[];
  const { data: penyakitList } = kodes.length
    ? await supabase.from("penyakit").select("kode_penyakit, nama_penyakit").in("kode_penyakit", kodes)
    : { data: [] as { kode_penyakit: string; nama_penyakit: string }[] };
  const namaByKode = Object.fromEntries((penyakitList ?? []).map((p) => [p.kode_penyakit, p.nama_penyakit]));

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
      <div className="bg-primary px-4 py-3 text-white">
        <h5 className="font-bold">Riwayat Diagnosa</h5>
      </div>
      <div className="overflow-x-auto p-4">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="p-2">No</th>
              <th className="p-2">Tanggal</th>
              <th className="p-2">Hasil</th>
              <th className="p-2">Kecocokan</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r, i) => (
              <tr key={r.id} className="border-b">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{formatDateId(r.tanggal_diagnosa)}</td>
                <td className="p-2">
                  {r.hasil_penyakit
                    ? namaByKode[r.hasil_penyakit] ?? r.hasil_penyakit
                    : "—"}
                </td>
                <td className="p-2">
                  {r.confidence != null ? `${(r.confidence * 100).toFixed(2)}%` : "—"}
                </td>
                <td className="p-2">
                  <Link
                    href={`/user/riwayat/${r.id}`}
                    className="mr-2 inline-flex rounded bg-cyan-600 px-2 py-1 text-xs text-white hover:bg-cyan-700"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
            {(!rows || rows.length === 0) && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  Belum ada riwayat
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
