"use server";

import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { compareSync, hashSync } from "bcryptjs";
import { redirect } from "next/navigation";

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  nama_lengkap: string;
  role: "admin" | "user";
};

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const nama_lengkap = String(formData.get("nama_lengkap") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const current_password = String(formData.get("current_password") ?? "");

  const users = await sql`SELECT * FROM users WHERE id = ${session.userId}`;
  const user = users[0] as UserRow | undefined;
  if (!user) redirect("/login");

  if (password.length > 0) {
    if (!current_password || !compareSync(current_password, user.password_hash)) {
      redirect(`/profile?error=${encodeURIComponent("Password lama salah")}`);
    }
    const password_hash = hashSync(password, 10);
    await sql`
      UPDATE users SET nama_lengkap = ${nama_lengkap}, email = ${email}, password_hash = ${password_hash}
      WHERE id = ${session.userId}
    `;
  } else {
    await sql`
      UPDATE users SET nama_lengkap = ${nama_lengkap}, email = ${email}
      WHERE id = ${session.userId}
    `;
  }

  session.nama_lengkap = nama_lengkap;
  session.email = email;
  await session.save();

  redirect("/profile?success=1");
}
