"use server";

import { db } from "@/lib/db";
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
    db.prepare(
      "INSERT INTO relasi (kode_penyakit, kode_gejala) VALUES (?, ?)",
    ).run(kode_penyakit, kode_gejala);
    redirect("/admin/relasi?success=1");
  } catch (e: unknown) {
    const msg =
      e instanceof Error && e.message.includes("UNIQUE")
        ? "Relasi sudah ada"
        : (e instanceof Error ? e.message : "Gagal menyimpan");
    redirect(`/admin/relasi?error=${encodeURIComponent(msg)}`);
  }
}

export async function deleteRelasi(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));

  db.prepare("DELETE FROM relasi WHERE id = ?").run(id);
  redirect("/admin/relasi?success=1");
}
