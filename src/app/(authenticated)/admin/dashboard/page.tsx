import { createClient } from "@/lib/supabase/server";
import { formatDateId } from "@/lib/format";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { count: penyakit } = await supabase
    .from("penyakit")
    .select("*", { count: "exact", head: true });

  const { count: gejala } = await supabase
    .from("gejala")
    .select("*", { count: "exact", head: true });

  const { count: users } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "user");

  const { count: diagnosa } = await supabase
    .from("diagnosa")
    .select("*", { count: "exact", head: true });

  const { data: recent } = await supabase
    .from("diagnosa")
    .select("id, tanggal_diagnosa, confidence, hasil_penyakit, id_user")
    .order("tanggal_diagnosa", { ascending: false })
    .limit(5);

  const userIds = [...new Set((recent ?? []).map((r) => r.id_user))];
  const { data: profs } = userIds.length
    ? await supabase.from("profiles").select("id, nama_lengkap").in("id", userIds)
    : { data: [] as { id: string; nama_lengkap: string }[] };
  const namaUser = Object.fromEntries((profs ?? []).map((p) => [p.id, p.nama_lengkap]));

  const kodes = [...new Set((recent ?? []).map((r) => r.hasil_penyakit).filter(Boolean))] as string[];
  const { data: penyakitRows } = kodes.length
    ? await supabase.from("penyakit").select("kode_penyakit, nama_penyakit").in("kode_penyakit", kodes)
    : { data: [] as { kode_penyakit: string; nama_penyakit: string }[] };
  const namaPenyakit = Object.fromEntries((penyakitRows ?? []).map((p) => [p.kode_penyakit, p.nama_penyakit]));

  const cards = [
    { label: "Data kerusakan", value: penyakit ?? 0, icon: "bi-tools", border: "border-primary" },
    { label: "Data gejala", value: gejala ?? 0, icon: "bi-virus", border: "border-green-500" },
    { label: "Pengguna", value: users ?? 0, icon: "bi-person-vcard", border: "border-cyan-500" },
    { label: "Diagnosa", value: diagnosa ?? 0, icon: "bi-search-heart-fill", border: "border-amber-500" },
  ];

  return (
    <>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-lg border-l-4 ${c.border} bg-white p-4 shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-gray-500">{c.label}</p>
                <p className="text-2xl font-bold text-gray-800">{c.value}</p>
              </div>
              <i className={`bi ${c.icon} text-3xl text-gray-300`} />
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <div className="border-b px-4 py-3">
          <h6 className="font-bold text-primary">Riwayat diagnosa terakhir</h6>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="border-b bg-gray-50 text-left">
              <tr>
                <th className="p-2">No</th>
                <th className="p-2">Tanggal</th>
                <th className="p-2">User</th>
                <th className="p-2">Kerusakan</th>
                <th className="p-2">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {(recent ?? []).map((r, i) => (
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
                    {r.confidence != null ? `${(r.confidence * 100).toFixed(1)}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
