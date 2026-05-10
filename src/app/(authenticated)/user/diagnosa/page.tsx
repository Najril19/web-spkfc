import { runDiagnosa } from "@/actions/diagnosa";
import { createClient } from "@/lib/supabase/server";

export default async function DiagnosaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: gejala } = await supabase.from("gejala").select("*").order("kode_gejala");

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
      <div className="flex items-center justify-between bg-primary px-4 py-3 text-white">
        <h5 className="font-bold">Diagnosa Kerusakan Mobil Toyota Avanza</h5>
      </div>
      <div className="p-6">
        {sp.error && (
          <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            {sp.error}
          </div>
        )}
        <form action={runDiagnosa}>
          <p className="mb-4 font-semibold text-gray-800">
            Pilih gejala yang ditemukan:
          </p>
          <div className="mb-6 grid gap-2 sm:grid-cols-2">
            {(gejala ?? []).map((g) => (
              <label
                key={g.kode_gejala}
                className="flex cursor-pointer items-start gap-2 rounded border border-gray-100 p-2 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  name="gejala"
                  value={g.kode_gejala}
                  className="mt-1"
                />
                <span className="text-sm">
                  <span className="font-mono text-gray-500">[{g.kode_gejala}]</span>{" "}
                  {g.nama_gejala}
                </span>
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-[#3a5bc7]"
          >
            Proses Diagnosa
          </button>
        </form>
      </div>
    </div>
  );
}
