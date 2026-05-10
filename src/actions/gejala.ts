"use server";

import { sql } from "@/lib/db";
import { insertErrorMessage } from "@/lib/pg-errors";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  if (session.role !== "admin") redirect("/user/dashboard");
}

export async function createGejala(formData: FormData) {
  await requireAdmin();
  const kode_gejala = String(formData.get("kode_gejala") ?? "").trim();
  const nama_gejala = String(formData.get("nama_gejala") ?? "").trim();

  try {
    await sql`
      INSERT INTO gejala (kode_gejala, nama_gejala)
      VALUES (${kode_gejala}, ${nama_gejala})
    `;
  } catch (e: unknown) {
    const msg = insertErrorMessage(
      e,
      "Kode gejala sudah ada di database. Gunakan kode lain atau edit gejala yang sudah tersimpan.",
    );
    redirect(`/admin/gejala?error=${encodeURIComponent(msg)}`);
  }
  redirect("/admin/gejala?success=1");
}

export async function updateGejala(formData: FormData) {
  await requireAdmin();
  const kode_gejala = String(formData.get("kode_gejala") ?? "").trim();
  const nama_gejala = String(formData.get("nama_gejala") ?? "").trim();

  await sql`
    UPDATE gejala SET nama_gejala = ${nama_gejala} WHERE kode_gejala = ${kode_gejala}
  `;
  redirect("/admin/gejala?success=1");
}

export async function deleteGejala(formData: FormData) {
  await requireAdmin();
  const kode_gejala = String(formData.get("kode_gejala") ?? "").trim();

  await sql`DELETE FROM gejala WHERE kode_gejala = ${kode_gejala}`;
  redirect(
    `/admin/gejala?notice=${encodeURIComponent(
      `Gejala ${kode_gejala} berhasil dihapus dari daftar.`,
    )}`,
  );
}
