import { computeDiagnosis } from "@/lib/diagnosis";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function HasilDiagnosaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const diagnosaId = Number(id);
  if (!Number.isFinite(diagnosaId)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: row } = await supabase
    .from("diagnosa")
    .select("id, id_user")
    .eq("id", diagnosaId)
    .single();

  if (!row || row.id_user !== user.id) notFound();

  const { data: details } = await supabase
    .from("diagnosa_detail")
    .select("kode_gejala")
    .eq("id_diagnosa", diagnosaId);

  const selectedGejala = (details ?? []).map((d) => d.kode_gejala);

  const { data: relRows } = await supabase.from("relasi").select("kode_penyakit, kode_gejala");
  const { data: penyakitRows } = await supabase
    .from("penyakit")
    .select("kode_penyakit, nama_penyakit");

  const namaMap = Object.fromEntries(
    (penyakitRows ?? []).map((p) => [p.kode_penyakit, p.nama_penyakit]),
  );

  const relasi = (relRows ?? []).map((r) => ({
    kode_penyakit: r.kode_penyakit,
    kode_gejala: r.kode_gejala,
    nama_penyakit: namaMap[r.kode_penyakit] ?? r.kode_penyakit,
  }));

  const hasil_diagnosa = computeDiagnosis(selectedGejala, relasi);
  const penyakit_teratas = hasil_diagnosa[0];

  const { data: penyakit } = penyakit_teratas
    ? await supabase
        .from("penyakit")
        .select("*")
        .eq("kode_penyakit", penyakit_teratas.kode_penyakit)
        .single()
    : { data: null };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
      <div className="p-6">
        {penyakit_teratas ? (
          <>
            <div
              className={`mb-6 rounded-lg border p-4 ${
                penyakit_teratas.confidence > 0.5
                  ? "border-green-200 bg-green-50 text-green-900"
                  : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
            >
              <h4 className="mb-2 font-bold">Hasil Diagnosa</h4>
              <p>
                <strong>Penyakit:</strong> {penyakit_teratas.nama_penyakit}
                <br />
                <strong>Tingkat kecocokan:</strong>{" "}
                {(penyakit_teratas.confidence * 100).toFixed(2)}%
                <br />
                <strong>Gejala cocok:</strong> {penyakit_teratas.gejala_cocok} dari{" "}
                {penyakit_teratas.total_gejala} gejala
              </p>
            </div>

            {penyakit && (
              <div className="mb-6 rounded-lg bg-gray-50 p-4">
                <h4 className="mb-3 font-bold text-gray-800">Informasi penyakit</h4>
                <p className="mb-2 text-sm font-medium text-gray-700">Deskripsi</p>
                <p className="mb-4 whitespace-pre-wrap text-sm text-gray-600">
                  {penyakit.deskripsi}
                </p>
                <p className="mb-2 text-sm font-medium text-gray-700">Solusi</p>
                <p className="mb-4 whitespace-pre-wrap text-sm text-gray-600">
                  {penyakit.solusi}
                </p>
                <p className="mb-2 text-sm font-medium text-gray-700">Pencegahan</p>
                <p className="whitespace-pre-wrap text-sm text-gray-600">
                  {penyakit.pencegahan}
                </p>
              </div>
            )}

            <h4 className="mb-3 font-bold">Kemungkinan penyakit lain</h4>
            <div className="mb-6 overflow-x-auto">
              <table className="w-full min-w-[400px] border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2 text-left">No</th>
                    <th className="border p-2 text-left">Penyakit</th>
                    <th className="border p-2 text-left">Kecocokan</th>
                    <th className="border p-2 text-left">Gejala cocok</th>
                  </tr>
                </thead>
                <tbody>
                  {hasil_diagnosa.slice(1).map((h, idx) => (
                    <tr key={h.kode_penyakit}>
                      <td className="border p-2">{idx + 1}</td>
                      <td className="border p-2">{h.nama_penyakit}</td>
                      <td className="border p-2">{(h.confidence * 100).toFixed(2)}%</td>
                      <td className="border p-2">
                        {h.gejala_cocok} dari {h.total_gejala}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/user/diagnosa"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-[#3a5bc7]"
              >
                Diagnosa lagi
              </Link>
              <Link
                href="/user/riwayat"
                className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
              >
                Lihat riwayat
              </Link>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <h4 className="font-bold">Tidak ditemukan penyakit yang cocok</h4>
            <p className="mt-2 text-sm">
              Gejala yang Anda pilih tidak cocok dengan basis pengetahuan saat ini.
            </p>
            <Link
              href="/user/diagnosa"
              className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm text-white"
            >
              Coba lagi
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
