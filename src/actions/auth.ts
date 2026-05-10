"use server";

import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { compareSync, hashSync } from "bcryptjs";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  nama_lengkap: string;
  role: "admin" | "user";
  created_at: string;
};

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  let user: UserRow | undefined;
  try {
    const rows = await sql`SELECT * FROM users WHERE email = ${email}`;
    user = rows[0] as UserRow | undefined;
  } catch (error) {
    console.error("loginAction: failed to query user", error);
    redirect(`/login?error=${encodeURIComponent("Server/database bermasalah, coba lagi")}`);
  }

  if (!user || !compareSync(password, user.password_hash)) {
    redirect(`/login?error=${encodeURIComponent("Email atau password salah")}`);
  }

  try {
    const session = await getSession();
    session.userId = user.id;
    session.email = user.email;
    session.role = user.role;
    session.nama_lengkap = user.nama_lengkap;
    await session.save();
  } catch (error) {
    console.error("loginAction: failed to save session", error);
    redirect(`/login?error=${encodeURIComponent("Gagal membuat sesi login, coba lagi")}`);
  }

  redirect(user.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
}

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nama_lengkap = String(formData.get("nama_lengkap") ?? "").trim();

  if (!email || !password || !nama_lengkap) {
    redirect(`/register?error=${encodeURIComponent("Semua field wajib diisi")}`);
  }

  let existing: unknown[] = [];
  try {
    existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  } catch (error) {
    console.error("registerAction: failed to query existing user", error);
    redirect(`/register?error=${encodeURIComponent("Server/database bermasalah, coba lagi")}`);
  }
  if (existing.length > 0) {
    redirect(`/register?error=${encodeURIComponent("Email sudah terdaftar")}`);
  }

  const password_hash = hashSync(password, 10);
  try {
    await sql`
      INSERT INTO users (id, email, password_hash, nama_lengkap, role)
      VALUES (${randomUUID()}, ${email}, ${password_hash}, ${nama_lengkap}, ${"user"})
    `;
  } catch {
    redirect(`/register?error=${encodeURIComponent("Gagal mendaftar, coba lagi")}`);
  }

  redirect("/login?registered=1");
}
