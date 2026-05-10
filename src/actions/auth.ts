"use server";

import { db } from "@/lib/db";
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

  const user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email) as UserRow | undefined;

  if (!user || !compareSync(password, user.password_hash)) {
    redirect(`/login?error=${encodeURIComponent("Email atau password salah")}`);
  }

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.role = user.role;
  session.nama_lengkap = user.nama_lengkap;
  await session.save();

  redirect(user.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
}

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nama_lengkap = String(formData.get("nama_lengkap") ?? "").trim();

  if (!email || !password || !nama_lengkap) {
    redirect(`/register?error=${encodeURIComponent("Semua field wajib diisi")}`);
  }

  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email);

  if (existing) {
    redirect(`/register?error=${encodeURIComponent("Email sudah terdaftar")}`);
  }

  const password_hash = hashSync(password, 10);
  try {
    db.prepare(
      "INSERT INTO users (id, email, password_hash, nama_lengkap, role) VALUES (?, ?, ?, ?, ?)",
    ).run(randomUUID(), email, password_hash, nama_lengkap, "user");
  } catch {
    redirect(`/register?error=${encodeURIComponent("Gagal mendaftar, coba lagi")}`);
  }

  redirect("/login?registered=1");
}
