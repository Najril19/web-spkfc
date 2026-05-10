"use server";

import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  if (session.role !== "admin") redirect("/user/dashboard");
}

export async function createRelasi(formData: FormData) {
  await requireAdmin();
  const kode_penyakit = String(formData.get("kode_penyakit") ?? "").trim();
  const kode_gejala = String(formData.get("kode_gejala") ?? "").trim();

  try {
    await sql`
      INSERT INTO relasi (kode_penyakit, kode_gejala)
      VALUES (${kode_penyakit}, ${kode_gejala})
    `;
  } catch (e: unknown) {
    const msg =
      e instanceof Error &&
      (e.message.includes("UNIQUE") || e.message.includes("duplicate key"))
        ? "Relasi sudah ada"
        : e instanceof Error
          ? e.message
          : "Gagal menyimpan";
    redirect(`/admin/relasi?error=${encodeURIComponent(msg)}`);
  }
  redirect("/admin/relasi?success=1");
}

export async function deleteRelasi(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));

  const rows = await sql`
    SELECT r.kode_penyakit, r.kode_gejala, p.nama_penyakit, g.nama_gejala
    FROM relasi r
    LEFT JOIN penyakit p ON p.kode_penyakit = r.kode_penyakit
    LEFT JOIN gejala g ON g.kode_gejala = r.kode_gejala
    WHERE r.id = ${id}
  `;
  const r = rows[0] as
    | {
        kode_penyakit: string;
        kode_gejala: string;
        nama_penyakit: string | null;
        nama_gejala: string | null;
      }
    | undefined;

  await sql`DELETE FROM relasi WHERE id = ${id}`;

  const detail =
    r != null
      ? `Relasi ${r.kode_penyakit}${r.nama_penyakit ? ` (${r.nama_penyakit})` : ""} dengan gejala ${r.kode_gejala}${r.nama_gejala ? ` (${r.nama_gejala})` : ""} berhasil dihapus.`
      : "Relasi berhasil dihapus.";
  redirect(`/admin/relasi?notice=${encodeURIComponent(detail)}`);
}
