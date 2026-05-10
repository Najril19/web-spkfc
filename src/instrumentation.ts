export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Jangan sambung DB saat `next build` — bisa hang/timeout (Neon) dan memblokir build.
  // Migrasi tetap jalan saat dev server / `next start` lewat panggilan pertama ke `sql`.
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (process.env.SKIP_DB_MIGRATION === "1") return;

  const { ensureMigrated } = await import("@/lib/db");
  await ensureMigrated();
}
