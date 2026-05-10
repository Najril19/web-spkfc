"use server";

import { sql } from "@/lib/db";
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
  const role = String(formData.get("role") ?? "user") as "admin" | "user";

  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length > 0) {
    redirect(`/admin/pengguna?error=${encodeURIComponent("Email sudah digunakan")}`);
  }

  const password_hash = hashSync(password, 10);
  try {
    await sql`
      INSERT INTO users (id, email, password_hash, nama_lengkap, role)
      VALUES (${randomUUID()}, ${email}, ${password_hash}, ${nama_lengkap}, ${role})
    `;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Gagal membuat pengguna";
    redirect(`/admin/pengguna?error=${encodeURIComponent(msg)}`);
  }
  redirect("/admin/pengguna?success=1");
}

export async function adminUpdateUser(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const nama_lengkap = String(formData.get("nama_lengkap") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "user") as "admin" | "user";
  const password = String(formData.get("password") ?? "");

  if (id === session.userId && role !== "admin") {
    redirect("/admin/pengguna?error=Tidak bisa menghapus role admin pada diri sendiri");
  }

  if (password.length > 0) {
    const password_hash = hashSync(password, 10);
    await sql`
      UPDATE users SET nama_lengkap = ${nama_lengkap}, email = ${email}, role = ${role}, password_hash = ${password_hash}
      WHERE id = ${id}
    `;
  } else {
    await sql`
      UPDATE users SET nama_lengkap = ${nama_lengkap}, email = ${email}, role = ${role}
      WHERE id = ${id}
    `;
  }

  redirect("/admin/pengguna?success=1");
}

export async function adminDeleteUser(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  if (id === session.userId) {
    redirect("/admin/pengguna?error=Tidak bisa menghapus akun sendiri");
  }

  const prof = await sql`
    SELECT nama_lengkap, email FROM users WHERE id = ${id}
  `;
  const row = prof[0] as { nama_lengkap: string; email: string } | undefined;
  const label = row ? `${row.nama_lengkap} (${row.email})` : id;

  await sql`DELETE FROM users WHERE id = ${id}`;
  redirect(
    `/admin/pengguna?notice=${encodeURIComponent(
      `Pengguna ${label} berhasil dihapus dari sistem.`,
    )}`,
  );
}
