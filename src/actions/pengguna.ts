"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { hashSync } from "bcryptjs";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  if (session.role !== "admin") redirect("/user/dashboard");
  return session;
}

export async function adminCreateUser(formData: FormData) {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nama_lengkap = String(formData.get("nama_lengkap") ?? "").trim();
  const role = (String(formData.get("role") ?? "user")) as "admin" | "user";

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    redirect(`/admin/pengguna?error=${encodeURIComponent("Email sudah digunakan")}`);
  }

  const password_hash = hashSync(password, 10);
  try {
    db.prepare(
      "INSERT INTO users (id, email, password_hash, nama_lengkap, role) VALUES (?, ?, ?, ?, ?)",
    ).run(randomUUID(), email, password_hash, nama_lengkap, role);
    redirect("/admin/pengguna?success=1");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Gagal membuat pengguna";
    redirect(`/admin/pengguna?error=${encodeURIComponent(msg)}`);
  }
}

export async function adminUpdateUser(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const nama_lengkap = String(formData.get("nama_lengkap") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = (String(formData.get("role") ?? "user")) as "admin" | "user";
  const password = String(formData.get("password") ?? "");

  if (id === session.userId && role !== "admin") {
    redirect("/admin/pengguna?error=Tidak bisa menghapus role admin pada diri sendiri");
  }

  if (password.length > 0) {
    const password_hash = hashSync(password, 10);
    db.prepare(
      "UPDATE users SET nama_lengkap = ?, email = ?, role = ?, password_hash = ? WHERE id = ?",
    ).run(nama_lengkap, email, role, password_hash, id);
  } else {
    db.prepare(
      "UPDATE users SET nama_lengkap = ?, email = ?, role = ? WHERE id = ?",
    ).run(nama_lengkap, email, role, id);
  }

  redirect("/admin/pengguna?success=1");
}

export async function adminDeleteUser(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  if (id === session.userId) {
    redirect("/admin/pengguna?error=Tidak bisa menghapus akun sendiri");
  }

  db.prepare("DELETE FROM users WHERE id = ?").run(id);
  redirect("/admin/pengguna?success=1");
}
