import { runDiagnosa } from "@/actions/diagnosa";
import { sql } from "@/lib/db";

type GejalaRow = { kode_gejala: string; nama_gejala: string };

export default async function DiagnosaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const gejala = (await sql`
    SELECT kode_gejala, nama_gejala FROM gejala ORDER BY kode_gejala
  `) as unknown as GejalaRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Diagnosa Kendaraan</h1>
        <p className="page-sub">
          Pilih gejala yang ditemukan pada kendaraan Toyota Avanza Anda
        </p>
      </div>

      {sp.error && (
        <div className="alert-warning">
          <i className="bi bi-exclamation-triangle-fill" />
          {sp.error}
        </div>
      )}

      <form action={runDiagnosa}>
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <i className="bi bi-clipboard2-check-fill text-primary" />
              <h2 className="section-title">Daftar Gejala</h2>
            </div>
            <span className="badge-blue">{gejala.length} gejala tersedia</span>
          </div>

          <div className="p-5">
            <div className="mb-5 grid gap-3 sm:grid-cols-2">
              {gejala.map((g) => (
                <label
                  key={g.kode_gejala}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-600 bg-slate-800/40 p-3.5 text-slate-200 transition hover:border-primary/70 hover:bg-orange-950/30 has-[:checked]:border-primary has-[:checked]:bg-orange-950/40"
                >
                  <input
                    type="checkbox"
                    name="gejala"
                    value={g.kode_gejala}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <span className="text-sm">
                    <span className="mr-1.5 rounded bg-slate-950/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 ring-1 ring-slate-600">
                      {g.kode_gejala}
                    </span>
                    <span className="font-medium text-slate-100">{g.nama_gejala}</span>
                  </span>
                </label>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" className="btn-primary px-6 py-2.5">
                <i className="bi bi-search-heart-fill" />
                Proses Diagnosa
              </button>
              <p className="text-xs text-slate-500">
                <i className="bi bi-info-circle me-1" />
                Pilih minimal 1 gejala untuk memulai
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
