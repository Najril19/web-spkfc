import { deleteDiagnosaUser } from "@/actions/diagnosa";
import { createClient } from "@/lib/supabase/server";
import { formatDateId } from "@/lib/format";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function UserRiwayatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const did = Number(id);
  if (!Number.isFinite(did)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: d } = await supabase
    .from("diagnosa")
    .select("id, id_user, tanggal_diagnosa, hasil_penyakit, confidence")
    .eq("id", did)
    .single();

  if (!d || d.id_user !== user.id) notFound();

  const { data: p } = d.hasil_penyakit
    ? await supabase
        .from("penyakit")
        .select("*")
        .eq("kode_penyakit", d.hasil_penyakit)
        .single()
    : { data: null };

  const { data: details } = await supabase
    .from("diagnosa_detail")
    .select("kode_gejala")
    .eq("id_diagnosa", did);

  const kodeList = (details ?? []).map((x) => x.kode_gejala);
  const { data: gejalaRows } = kodeList.length
    ? await supabase.from("gejala").select("kode_gejala, nama_gejala").in("kode_gejala", kodeList)
    : { data: [] as { kode_gejala: string; nama_gejala: string }[] };
  const namaGejala = Object.fromEntries((gejalaRows ?? []).map((g) => [g.kode_gejala, g.nama_gejala]));

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <div className="bg-primary px-4 py-3 text-white">
          <h5 className="font-bold">Detail diagnosa #{d.id}</h5>
        </div>
        <div className="p-6 text-sm">
          <p>
            <strong>Tanggal:</strong> {formatDateId(d.tanggal_diagnosa)}
          </p>
          <p className="mt-2">
            <strong>Hasil:</strong>{" "}
            {p?.nama_penyakit ?? d.hasil_penyakit ?? "—"}
          </p>
          <p className="mt-2">
            <strong>Kecocokan:</strong>{" "}
            {d.confidence != null ? `${(d.confidence * 100).toFixed(2)}%` : "—"}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <div className="border-b bg-gray-50 px-4 py-2 font-semibold">Gejala yang dipilih</div>
        <ul className="divide-y p-4">
          {(details ?? []).map((row) => (
            <li key={row.kode_gejala} className="py-2 text-sm">
              <span className="font-mono text-gray-500">[{row.kode_gejala}]</span>{" "}
              {namaGejala[row.kode_gejala] ?? row.kode_gejala}
            </li>
          ))}
        </ul>
      </div>

      {p && (
        <div className="rounded-lg bg-gray-50 p-4 text-sm">
          <p className="font-semibold text-gray-800">Deskripsi</p>
          <p className="mt-1 whitespace-pre-wrap">{p.deskripsi}</p>
          <p className="mt-4 font-semibold text-gray-800">Solusi</p>
          <p className="mt-1 whitespace-pre-wrap">{p.solusi}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/user/riwayat"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          Kembali
        </Link>
        <Link
          href={`/user/hasil-diagnosa/${d.id}`}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-[#3a5bc7]"
        >
          Lihat ranking lengkap
        </Link>
        <form action={deleteDiagnosaUser}>
          <input type="hidden" name="id" value={d.id} />
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Hapus riwayat ini
          </button>
        </form>
      </div>
    </div>
  );
}
