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

export async function createPenyakit(formData: FormData) {
  const supabase = await requireAdmin();
  const kode_penyakit = String(formData.get("kode_penyakit") ?? "").trim();
  const nama_penyakit = String(formData.get("nama_penyakit") ?? "").trim();
  const deskripsi = String(formData.get("deskripsi") ?? "");
  const solusi = String(formData.get("solusi") ?? "");
  const pencegahan = String(formData.get("pencegahan") ?? "");

  const { error } = await supabase.from("penyakit").insert({
    kode_penyakit,
    nama_penyakit,
    deskripsi,
    solusi,
    pencegahan,
  });

  redirect(
    error
      ? `/admin/penyakit?error=${encodeURIComponent(error.message)}`
      : "/admin/penyakit?success=1",
  );
}

export async function updatePenyakit(formData: FormData) {
  const supabase = await requireAdmin();
  const kode_penyakit = String(formData.get("kode_penyakit") ?? "").trim();
  const nama_penyakit = String(formData.get("nama_penyakit") ?? "").trim();
  const deskripsi = String(formData.get("deskripsi") ?? "");
  const solusi = String(formData.get("solusi") ?? "");
  const pencegahan = String(formData.get("pencegahan") ?? "");

  const { error } = await supabase
    .from("penyakit")
    .update({ nama_penyakit, deskripsi, solusi, pencegahan })
    .eq("kode_penyakit", kode_penyakit);

  redirect(
    error
      ? `/admin/penyakit?error=${encodeURIComponent(error.message)}`
      : "/admin/penyakit?success=1",
  );
}

export async function deletePenyakit(formData: FormData) {
  const supabase = await requireAdmin();
  const kode_penyakit = String(formData.get("kode_penyakit") ?? "").trim();

  await supabase.from("relasi").delete().eq("kode_penyakit", kode_penyakit);
  const { error } = await supabase.from("penyakit").delete().eq("kode_penyakit", kode_penyakit);

  redirect(
    error
      ? `/admin/penyakit?error=${encodeURIComponent(error.message)}`
      : "/admin/penyakit?success=1",
  );
}
