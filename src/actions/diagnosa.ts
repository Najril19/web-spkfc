"use server";

import { createClient } from "@/lib/supabase/server";
import { computeDiagnosis } from "@/lib/diagnosis";
import { redirect } from "next/navigation";

export async function runDiagnosa(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const raw = formData.getAll("gejala") as string[];
  const selectedGejala = raw.filter(Boolean);
  if (selectedGejala.length === 0) {
    redirect("/user/diagnosa?error=Pilih minimal satu gejala.");
  }

  const { data: relRows } = await supabase.from("relasi").select("kode_penyakit, kode_gejala");
  const { data: penyakitRows } = await supabase
    .from("penyakit")
    .select("kode_penyakit, nama_penyakit");

  const namaMap = Object.fromEntries(
    (penyakitRows ?? []).map((p) => [p.kode_penyakit, p.nama_penyakit]),
  );

  const relasi = (relRows ?? []).map((r) => ({
    kode_penyakit: r.kode_penyakit,
    kode_gejala: r.kode_gejala,
    nama_penyakit: namaMap[r.kode_penyakit] ?? r.kode_penyakit,
  }));

  const hasil = computeDiagnosis(selectedGejala, relasi);
  const top = hasil[0];
  const hasil_penyakit = top?.kode_penyakit ?? null;
  const confidence = top?.confidence ?? 0;

  const { data: inserted, error: e1 } = await supabase
    .from("diagnosa")
    .insert({
      id_user: user.id,
      hasil_penyakit,
      confidence,
    })
    .select("id")
    .single();

  if (e1 || !inserted) {
    redirect(`/user/diagnosa?error=${encodeURIComponent(e1?.message ?? "Gagal menyimpan diagnosa")}`);
  }

  const diagnosaId = inserted.id;

  for (const kode of selectedGejala) {
    await supabase.from("diagnosa_detail").insert({
      id_diagnosa: diagnosaId,
      kode_gejala: kode,
    });
  }

  redirect(`/user/hasil-diagnosa/${diagnosaId}`);
}

export async function deleteDiagnosaUser(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("diagnosa_detail").delete().eq("id_diagnosa", id);
  await supabase.from("diagnosa").delete().eq("id", id).eq("id_user", user.id);

  redirect("/user/riwayat");
}

export async function deleteDiagnosaAdmin(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;

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

  await supabase.from("diagnosa_detail").delete().eq("id_diagnosa", id);
  await supabase.from("diagnosa").delete().eq("id", id);

  redirect("/admin/riwayat");
}
