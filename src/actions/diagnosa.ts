"use server";

import { begin, sql } from "@/lib/db";
import { formatDateId } from "@/lib/format";
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

  const relRows = (await sql`
    SELECT kode_penyakit, kode_gejala FROM relasi
  `) as unknown as RelasiRow[];
  const penyakitRows = (await sql`
    SELECT kode_penyakit, nama_penyakit FROM penyakit
  `) as unknown as PenyakitRow[];

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

  const diagnosaId = await begin(async (tx) => {
    const inserted = await tx`
      INSERT INTO diagnosa (id_user, hasil_penyakit, confidence)
      VALUES (${session.userId}, ${hasil_penyakit}, ${confidence})
      RETURNING id
    `;
    const id = Number(inserted[0]?.id);
    for (const k of selectedGejala) {
      await tx`
        INSERT INTO diagnosa_detail (id_diagnosa, kode_gejala)
        VALUES (${id}, ${k})
        ON CONFLICT (id_diagnosa, kode_gejala) DO NOTHING
      `;
    }
    return id;
  });

  redirect(`/user/hasil-diagnosa/${diagnosaId}`);
}

export async function deleteDiagnosaUser(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;

  const session = await getSession();
  if (!session.userId) redirect("/login");

  const before = await sql`
    SELECT tanggal_diagnosa FROM diagnosa WHERE id = ${id} AND id_user = ${session.userId}
  `;
  const t = before[0] as { tanggal_diagnosa: string } | undefined;

  await sql`DELETE FROM diagnosa WHERE id = ${id} AND id_user = ${session.userId}`;

  const when = t ? formatDateId(String(t.tanggal_diagnosa)) : `#${id}`;
  redirect(
    `/user/riwayat?notice=${encodeURIComponent(
      `Riwayat diagnosa tanggal ${when} berhasil dihapus.`,
    )}`,
  );
}

export async function deleteDiagnosaAdmin(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;

  const session = await getSession();
  if (!session.userId) redirect("/login");
  if (session.role !== "admin") redirect("/user/dashboard");

  const before = await sql`
    SELECT tanggal_diagnosa FROM diagnosa WHERE id = ${id}
  `;
  const t = before[0] as { tanggal_diagnosa: string } | undefined;

  await sql`DELETE FROM diagnosa WHERE id = ${id}`;

  const when = t ? formatDateId(String(t.tanggal_diagnosa)) : `#${id}`;
  redirect(
    `/admin/riwayat?notice=${encodeURIComponent(
      `Diagnosa #${id} (${when}) berhasil dihapus dari riwayat.`,
    )}`,
  );
}
