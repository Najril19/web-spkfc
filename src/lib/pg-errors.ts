/** Postgres unique_violation — duplicate primary key / unique index */
export function isUniqueViolation(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const code =
    "code" in e && typeof (e as { code?: unknown }).code === "string"
      ? (e as { code: string }).code
      : "";
  const m = e.message.toLowerCase();
  return (
    code === "23505" ||
    m.includes("duplicate key") ||
    m.includes("unique constraint")
  );
}

/** Pesan untuk UI; kalau duplikat pakai hint yang mudah dipahami user */
export function insertErrorMessage(e: unknown, duplicateHint: string): string {
  if (isUniqueViolation(e)) return duplicateHint;
  return e instanceof Error ? e.message : "Gagal menyimpan";
}
