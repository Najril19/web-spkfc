"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
  const nama_lengkap = String(formData.get("nama_lengkap") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const updates: { email?: string; password?: string } = {};
  if (email && email !== user.email) updates.email = email;
  if (password.length > 0) updates.password = password;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.auth.updateUser(updates);
    if (error) {
      redirect(`/profile?error=${encodeURIComponent(error.message)}`);
    }
  }

  await supabase
    .from("profiles")
    .update({
      nama_lengkap,
      email: email || null,
    })
    .eq("id", user.id);

  redirect("/profile?success=1");
}
