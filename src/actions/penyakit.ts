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

export async function createPenyakit(formData: FormData) {
  await requireAdmin();
  const kode_penyakit = String(formData.get("kode_penyakit") ?? "").trim();
  const nama_penyakit = String(formData.get("nama_penyakit") ?? "").trim();
  const deskripsi = String(formData.get("deskripsi") ?? "");
  const solusi = String(formData.get("solusi") ?? "");
  const pencegahan = String(formData.get("pencegahan") ?? "");

  try {
    await sql`
      INSERT INTO penyakit (kode_penyakit, nama_penyakit, deskripsi, solusi, pencegahan)
      VALUES (${kode_penyakit}, ${nama_penyakit}, ${deskripsi}, ${solusi}, ${pencegahan})
    `;
  } catch (e: unknown) {
    const msg = insertErrorMessage(
      e,
      "Kode kerusakan sudah ada. Gunakan kode lain atau edit data yang sudah tersimpan.",
    );
    redirect(`/admin/penyakit?error=${encodeURIComponent(msg)}`);
  }
  redirect("/admin/penyakit?success=1");
}

export async function updatePenyakit(formData: FormData) {
  await requireAdmin();
  const kode_penyakit = String(formData.get("kode_penyakit") ?? "").trim();
  const nama_penyakit = String(formData.get("nama_penyakit") ?? "").trim();
  const deskripsi = String(formData.get("deskripsi") ?? "");
  const solusi = String(formData.get("solusi") ?? "");
  const pencegahan = String(formData.get("pencegahan") ?? "");

  await sql`
    UPDATE penyakit SET nama_penyakit = ${nama_penyakit}, deskripsi = ${deskripsi}, solusi = ${solusi}, pencegahan = ${pencegahan}
    WHERE kode_penyakit = ${kode_penyakit}
  `;
  redirect("/admin/penyakit?success=1");
}

export async function deletePenyakit(formData: FormData) {
  await requireAdmin();
  const kode_penyakit = String(formData.get("kode_penyakit") ?? "").trim();

  await sql`DELETE FROM penyakit WHERE kode_penyakit = ${kode_penyakit}`;
  redirect(
    `/admin/penyakit?notice=${encodeURIComponent(
      `Data kerusakan ${kode_penyakit} berhasil dihapus.`,
    )}`,
  );
}
