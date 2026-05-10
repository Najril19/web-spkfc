"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { computeDiagnosis } from "@/lib/diagnosis";
import { redirect } from "next/navigation";

type RelasiRow = { kode_penyakit: string; kode_gejala: string };
type PenyakitRow = { kode_penyakit: string; nama_penyakit: string };

export async function runDiagnosa(formData: FormData) {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const raw = formData.getAll("gejala") as string[];
  const selectedGejala = raw.filter(Boolean);
  if (selectedGejala.length === 0) {
    redirect("/user/diagnosa?error=Pilih minimal satu gejala.");
  }

  const relRows = db
    .prepare("SELECT kode_penyakit, kode_gejala FROM relasi")
    .all() as RelasiRow[];
  const penyakitRows = db
    .prepare("SELECT kode_penyakit, nama_penyakit FROM penyakit")
    .all() as PenyakitRow[];

  const namaMap = Object.fromEntries(
    penyakitRows.map((p) => [p.kode_penyakit, p.nama_penyakit]),
  );

  const relasi = relRows.map((r) => ({
    kode_penyakit: r.kode_penyakit,
    kode_gejala: r.kode_gejala,
    nama_penyakit: namaMap[r.kode_penyakit] ?? r.kode_penyakit,
  }));

  const hasil = computeDiagnosis(selectedGejala, relasi);
  const top = hasil[0];
  const hasil_penyakit = top?.kode_penyakit ?? null;
  const confidence = top?.confidence ?? 0;

  const inserted = db
    .prepare(
      "INSERT INTO diagnosa (id_user, hasil_penyakit, confidence) VALUES (?, ?, ?)",
    )
    .run(session.userId, hasil_penyakit, confidence);

  const diagnosaId = inserted.lastInsertRowid as number;

  const insertDetail = db.prepare(
    "INSERT OR IGNORE INTO diagnosa_detail (id_diagnosa, kode_gejala) VALUES (?, ?)",
  );
  const insertMany = db.transaction((kodes: string[]) => {
    for (const k of kodes) insertDetail.run(diagnosaId, k);
  });
  insertMany(selectedGejala);

  redirect(`/user/hasil-diagnosa/${diagnosaId}`);
}

export async function deleteDiagnosaUser(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;

  const session = await getSession();
  if (!session.userId) redirect("/login");

  db.prepare(
    "DELETE FROM diagnosa WHERE id = ? AND id_user = ?",
  ).run(id, session.userId);

  redirect("/user/riwayat");
}

export async function deleteDiagnosaAdmin(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;

  const session = await getSession();
  if (!session.userId) redirect("/login");
  if (session.role !== "admin") redirect("/user/dashboard");

  db.prepare("DELETE FROM diagnosa WHERE id = ?").run(id);

  redirect("/admin/riwayat");
}
