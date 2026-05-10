"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: pr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (pr?.role !== "admin") redirect("/user/dashboard");
  return supabase;
}

export async function createRelasi(formData: FormData) {
  const supabase = await requireAdmin();
  const kode_penyakit = String(formData.get("kode_penyakit") ?? "").trim();
  const kode_gejala = String(formData.get("kode_gejala") ?? "").trim();

  const { error } = await supabase.from("relasi").insert({ kode_penyakit, kode_gejala });

  redirect(
    error?.code === "23505"
      ? "/admin/relasi?error=Relasi sudah ada"
      : error
        ? `/admin/relasi?error=${encodeURIComponent(error.message)}`
        : "/admin/relasi?success=1",
  );
}

export async function deleteRelasi(formData: FormData) {
  const supabase = await requireAdmin();
  const id = Number(formData.get("id"));

  const { error } = await supabase.from("relasi").delete().eq("id", id);

  redirect(
    error
      ? `/admin/relasi?error=${encodeURIComponent(error.message)}`
      : "/admin/relasi?success=1",
  );
}
