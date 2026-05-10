import { createClient } from "@/lib/supabase/server";
import { formatDateId } from "@/lib/format";
import Link from "next/link";

export default async function AdminRiwayatPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("diagnosa")
    .select("id, tanggal_diagnosa, confidence, hasil_penyakit, id_user")
    .order("tanggal_diagnosa", { ascending: false });

  const userIds = [...new Set((rows ?? []).map((r) => r.id_user))];
  const { data: profs } = userIds.length
    ? await supabase.from("profiles").select("id, nama_lengkap").in("id", userIds)
    : { data: [] as { id: string; nama_lengkap: string }[] };
  const namaUser = Object.fromEntries((profs ?? []).map((p) => [p.id, p.nama_lengkap]));

  const kodes = [...new Set((rows ?? []).map((r) => r.hasil_penyakit).filter(Boolean))] as string[];
  const { data: penyakitRows } = kodes.length
    ? await supabase.from("penyakit").select("kode_penyakit, nama_penyakit").in("kode_penyakit", kodes)
    : { data: [] as { kode_penyakit: string; nama_penyakit: string }[] };
  const namaPenyakit = Object.fromEntries((penyakitRows ?? []).map((p) => [p.kode_penyakit, p.nama_penyakit]));

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
      <div className="bg-primary px-4 py-3 text-white">
        <h5 className="font-bold">Riwayat diagnosa (semua pengguna)</h5>
      </div>
      <div className="overflow-x-auto p-4">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="border-b bg-gray-50">
            <tr className="text-left">
              <th className="p-2">No</th>
              <th className="p-2">Tanggal</th>
              <th className="p-2">User</th>
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
                <td className="p-2">{namaUser[r.id_user] ?? "—"}</td>
                <td className="p-2">
                  {r.hasil_penyakit
                    ? namaPenyakit[r.hasil_penyakit] ?? r.hasil_penyakit
                    : "—"}
                </td>
                <td className="p-2">
                  {r.confidence != null ? `${(r.confidence * 100).toFixed(2)}%` : "—"}
                </td>
                <td className="p-2">
                  <Link
                    href={`/admin/diagnosa/${r.id}`}
                    className="rounded bg-cyan-600 px-2 py-1 text-xs text-white hover:bg-cyan-700"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
