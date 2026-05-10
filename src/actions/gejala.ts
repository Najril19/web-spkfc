"use server";

import { db } from "@/lib/db";
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
    db.prepare(
      "INSERT INTO gejala (kode_gejala, nama_gejala) VALUES (?, ?)",
    ).run(kode_gejala, nama_gejala);
    redirect("/admin/gejala?success=1");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Gagal menyimpan";
    redirect(`/admin/gejala?error=${encodeURIComponent(msg)}`);
  }
}

export async function updateGejala(formData: FormData) {
  await requireAdmin();
  const kode_gejala = String(formData.get("kode_gejala") ?? "").trim();
  const nama_gejala = String(formData.get("nama_gejala") ?? "").trim();

  db.prepare("UPDATE gejala SET nama_gejala = ? WHERE kode_gejala = ?").run(
    nama_gejala,
    kode_gejala,
  );
  redirect("/admin/gejala?success=1");
}

export async function deleteGejala(formData: FormData) {
  await requireAdmin();
  const kode_gejala = String(formData.get("kode_gejala") ?? "").trim();

  db.prepare("DELETE FROM gejala WHERE kode_gejala = ?").run(kode_gejala);
  redirect("/admin/gejala?success=1");
}
