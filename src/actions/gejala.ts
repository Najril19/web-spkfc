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

export async function createGejala(formData: FormData) {
  const supabase = await requireAdmin();
  const kode_gejala = String(formData.get("kode_gejala") ?? "").trim();
  const nama_gejala = String(formData.get("nama_gejala") ?? "").trim();

  const { error } = await supabase.from("gejala").insert({ kode_gejala, nama_gejala });

  redirect(
    error
      ? `/admin/gejala?error=${encodeURIComponent(error.message)}`
      : "/admin/gejala?success=1",
  );
}

export async function updateGejala(formData: FormData) {
  const supabase = await requireAdmin();
  const kode_gejala = String(formData.get("kode_gejala") ?? "").trim();
  const nama_gejala = String(formData.get("nama_gejala") ?? "").trim();

  const { error } = await supabase
    .from("gejala")
    .update({ nama_gejala })
    .eq("kode_gejala", kode_gejala);

  redirect(
    error
      ? `/admin/gejala?error=${encodeURIComponent(error.message)}`
      : "/admin/gejala?success=1",
  );
}

export async function deleteGejala(formData: FormData) {
  const supabase = await requireAdmin();
  const kode_gejala = String(formData.get("kode_gejala") ?? "").trim();

  await supabase.from("relasi").delete().eq("kode_gejala", kode_gejala);
  const { error } = await supabase.from("gejala").delete().eq("kode_gejala", kode_gejala);

  redirect(
    error
      ? `/admin/gejala?error=${encodeURIComponent(error.message)}`
      : "/admin/gejala?success=1",
  );
}
