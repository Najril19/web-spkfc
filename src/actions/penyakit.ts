"use server";

import { db } from "@/lib/db";
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
    db.prepare(
      "INSERT INTO penyakit (kode_penyakit, nama_penyakit, deskripsi, solusi, pencegahan) VALUES (?, ?, ?, ?, ?)",
    ).run(kode_penyakit, nama_penyakit, deskripsi, solusi, pencegahan);
    redirect("/admin/penyakit?success=1");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Gagal menyimpan";
    redirect(`/admin/penyakit?error=${encodeURIComponent(msg)}`);
  }
}

export async function updatePenyakit(formData: FormData) {
  await requireAdmin();
  const kode_penyakit = String(formData.get("kode_penyakit") ?? "").trim();
  const nama_penyakit = String(formData.get("nama_penyakit") ?? "").trim();
  const deskripsi = String(formData.get("deskripsi") ?? "");
  const solusi = String(formData.get("solusi") ?? "");
  const pencegahan = String(formData.get("pencegahan") ?? "");

  db.prepare(
    "UPDATE penyakit SET nama_penyakit = ?, deskripsi = ?, solusi = ?, pencegahan = ? WHERE kode_penyakit = ?",
  ).run(nama_penyakit, deskripsi, solusi, pencegahan, kode_penyakit);
  redirect("/admin/penyakit?success=1");
}

export async function deletePenyakit(formData: FormData) {
  await requireAdmin();
  const kode_penyakit = String(formData.get("kode_penyakit") ?? "").trim();

  db.prepare("DELETE FROM penyakit WHERE kode_penyakit = ?").run(kode_penyakit);
  redirect("/admin/penyakit?success=1");
}
