import "server-only";

import { randomUUID } from "crypto";
import { hashSync } from "bcryptjs";
import postgres from "postgres";

declare global {
  // eslint-disable-next-line no-var
  var __mjm_sql: postgres.Sql | undefined;
}

type Tx = postgres.TransactionSql;

/** Trim + hapus kutip yang sering ikut saat copy-paste dari Neon/Railway dashboard. */
function normalizeDatabaseUrl(raw: string | undefined): string {
  if (!raw) return "";
  let u = raw.trim();
  if (
    u.length >= 2 &&
    ((u.startsWith('"') && u.endsWith('"')) ||
      (u.startsWith("'") && u.endsWith("'")))
  ) {
    u = u.slice(1, -1).trim();
  }
  return u;
}

function createSql(): postgres.Sql {
  const connectionString = normalizeDatabaseUrl(process.env.DATABASE_URL);
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon Postgres connection string (e.g. postgresql://user:pass@host/db?sslmode=require).",
    );
  }

  let useSsl = true;
  try {
    const parsed = new URL(connectionString);
    const host = parsed.hostname.toLowerCase();
    const sslMode = parsed.searchParams.get("sslmode")?.toLowerCase();
    if (sslMode === "disable") {
      useSsl = false;
    } else if (host === "localhost" || host === "127.0.0.1") {
      useSsl = false;
    }
  } catch {
    // Keep SSL enabled as safer default for hosted DBs.
    useSsl = true;
  }

  return postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    // Hosted Postgres often sits behind poolers/proxies; prepared statements can break there.
    prepare: false,
    ssl: useSsl ? "require" : false,
  });
}

export function getSql(): postgres.Sql {
  if (!globalThis.__mjm_sql) {
    globalThis.__mjm_sql = createSql();
  }
  return globalThis.__mjm_sql;
}

/**
 * Diagnosa deploy: koneksi + migrasi schema (sama seperti jalur `sql` / login).
 * `connectOk` saja bisa true walau login gagal — migrasi/seed bisa beda.
 */
export async function pingDatabase(): Promise<{
  ok: boolean;
  configured: boolean;
  connectOk: boolean;
  migrationOk: boolean;
  migrationError?: string;
  postgresCode?: string;
  hint?: string;
}> {
  const configured = Boolean(normalizeDatabaseUrl(process.env.DATABASE_URL));
  if (!configured) {
    return {
      ok: false,
      configured: false,
      connectOk: false,
      migrationOk: false,
      hint: "DATABASE_URL belum di-set di environment server. File .env di laptop tidak ikut deploy — set di Railway/Vercel → Variables.",
    };
  }
  try {
    await getSql()`SELECT 1`;
  } catch (e) {
    const err = e as Error & { code?: string };
    const postgresCode =
      typeof err.code === "string" ? err.code : undefined;
    let hint =
      "Periksa connection string di Neon/Railway: host, user, password, nama DB, dan ?sslmode=require.";
    if (postgresCode === "28P01") {
      hint = "Autentikasi Postgres gagal — user/password di DATABASE_URL salah.";
    }
    if (postgresCode === "3D000") {
      hint = "Database tidak ada — cek nama DB di URL.";
    }
    if (postgresCode === "ENOTFOUND") {
      hint = "Host tidak ketemu — hostname di DATABASE_URL salah.";
    }
    if (postgresCode === "ETIMEDOUT" || postgresCode === "ECONNREFUSED") {
      hint =
        "Tidak bisa menyambung ke server DB — cek host/port, Neon aktif, dan IP allowlist jika dipakai.";
    }
    return {
      ok: false,
      configured: true,
      connectOk: false,
      migrationOk: false,
      postgresCode,
      hint,
    };
  }

  try {
    await ensureMigrated();
    return {
      ok: true,
      configured: true,
      connectOk: true,
      migrationOk: true,
    };
  } catch (e) {
    const err = e as Error;
    const msg = err.message ?? String(e);
    console.error("pingDatabase: migration failed", err);
    return {
      ok: false,
      configured: true,
      connectOk: true,
      migrationOk: false,
      migrationError: msg,
      hint: "Koneksi OK tapi migrasi/schema gagal — lihat migrationError di response atau log server.",
    };
  }
}

let migratePromise: Promise<void> | null = null;

/** Tagged template — awaits schema migration on first use. */
export function sql(strings: TemplateStringsArray, ...params: unknown[]) {
  return (async () => {
    await ensureMigrated();
    // forwarded to postgres tagged template
    return getSql()(strings, ...(params as []));
  })();
}

export async function begin<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  await ensureMigrated();
  return (await getSql().begin(fn)) as T;
}

/** For `WHERE col IN ${list}` — use as: `await raw\`... IN ${raw(list)}\`` after `const raw = await getClient()`. */
export async function getClient(): Promise<postgres.Sql> {
  await ensureMigrated();
  return getSql();
}

export async function ensureMigrated(): Promise<void> {
  if (!migratePromise) {
    migratePromise = runMigrate().catch((err) => {
      migratePromise = null;
      throw err;
    });
  }
  await migratePromise;
}

async function runMigrate(): Promise<void> {
  const raw = getSql();

  await raw`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      nama_lengkap TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await raw`
    CREATE TABLE IF NOT EXISTS penyakit (
      kode_penyakit TEXT PRIMARY KEY,
      nama_penyakit TEXT NOT NULL,
      deskripsi TEXT,
      solusi TEXT,
      pencegahan TEXT
    )
  `;

  await raw`
    CREATE TABLE IF NOT EXISTS gejala (
      kode_gejala TEXT PRIMARY KEY,
      nama_gejala TEXT NOT NULL
    )
  `;

  await raw`
    CREATE TABLE IF NOT EXISTS relasi (
      id SERIAL PRIMARY KEY,
      kode_penyakit TEXT NOT NULL REFERENCES penyakit(kode_penyakit) ON DELETE CASCADE,
      kode_gejala TEXT NOT NULL REFERENCES gejala(kode_gejala) ON DELETE CASCADE,
      UNIQUE (kode_penyakit, kode_gejala)
    )
  `;

  await raw`
    CREATE TABLE IF NOT EXISTS diagnosa (
      id SERIAL PRIMARY KEY,
      id_user TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tanggal_diagnosa TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      hasil_penyakit TEXT REFERENCES penyakit(kode_penyakit),
      confidence DOUBLE PRECISION
    )
  `;

  await raw`
    CREATE TABLE IF NOT EXISTS diagnosa_detail (
      id SERIAL PRIMARY KEY,
      id_diagnosa INTEGER NOT NULL REFERENCES diagnosa(id) ON DELETE CASCADE,
      kode_gejala TEXT NOT NULL REFERENCES gejala(kode_gejala),
      UNIQUE (id_diagnosa, kode_gejala)
    )
  `;

  const [{ n }] = await raw`SELECT COUNT(*)::int AS n FROM gejala`;

  if (Number(n) === 0) {
    try {
    const gejalaData: [string, string][] = [
      ["GK001", "Mobil Kehilangan Tenaga"],
      ["GK002", "Mobil Sulit Dinyalakan / Distarter"],
      ["GK003", "Mesin Mati Sesaat"],
      ["GK004", "Terjadi Gejala Surging Dada Mesin"],
      ["GK005", "Akselerasi Mobil Tidak Optimal"],
      ["GK006", "Suara Mesin Kasar Dan Terasa Getaran"],
      ["GK007", "Mesin Mobil Mati Mendadak"],
      ["GK008", "Konsumsi Bahan Bakar Boros"],
      ["GK009", "Asap Hitam Keluar Dari Knalpot"],
      ["GK010", "Terdengar Letupan (Nembak-Nembak) Dari Knalpot"],
      ["GK011", "Mesin Mbrebet Saat Akselerasi"],
      ["GK012", "Asap Putih Keluar Dari Knalpot"],
      ["GK013", "Oli Mesin Cepat Berkurang"],
    ];
    for (const [k, nama] of gejalaData) {
      await raw`
        INSERT INTO gejala (kode_gejala, nama_gejala)
        VALUES (${k}, ${nama})
        ON CONFLICT (kode_gejala) DO NOTHING
      `;
    }

    const penyakitData: [string, string, string, string, string][] = [
      [
        "JK01",
        "Busi Bermasalah",
        "Busi bermasalah dapat menyebabkan kinerja mesin menjadi tidak optimal, seperti sulitnya mesin menyala, mesin tersendat-sendat, atau konsumsi bahan bakar yang boros.",
        "Mengecek jalur pengapian dan lihatlah apakah ada kabel yang terbakar atau terlihat krosleting, pastikan posisi busi pas, setting ulang setelan bahan bakar.",
        "Pemeriksaan rutin, Penggantian busi secara berkala, Menggunakan bahan bakar berkualitas, Menghindari penggunaan mesin yang berlebihan",
      ],
      [
        "JK02",
        "Masalah Pada Sistem Transmisi (CVT)",
        "Masalah pada sistem transmisi CVT dapat menyebabkan kinerja mobil menjadi tidak optimal.",
        "Ganti komponen CVT yang rusak dengan suku cadang berkualitas baik.",
        "Perawatan rutin, Pemeriksaan sistem transmisi, Menggunakan oli transmisi yang sesuai",
      ],
      [
        "JK03",
        "Filter Udara Tersumbat",
        "Filter udara tersumbat dapat menyebabkan kinerja mesin menjadi tidak optimal.",
        "Bersihkan filter udara dan karburator agar aliran udara kembali lancar.",
        "Perawatan rutin, Pemeriksaan filter udara, Menggunakan filter udara berkualitas",
      ],
      [
        "JK04",
        "Pengaturan Knalpot Tidak Tepat",
        "Pengaturan knalpot yang tidak tepat dapat menyebabkan kinerja mesin menjadi tidak optimal.",
        "Ganti knalpot jika diperlukan dan lakukan penyetelan ulang sistem bahan bakar atau ECU.",
        "Pemasangan knalpot yang benar, Perawatan rutin",
      ],
      [
        "JK05",
        "Pengaturan Jarum Skep Tidak Sesuai",
        "Pengaturan jarum skep yang tidak sesuai dapat menyebabkan kinerja karburator menjadi tidak optimal.",
        "Pastikan jarum skep terpasang dengan lurus dan presisi. Lakukan penyetelan ulang karburator.",
        "Pengaturan jarum skep yang benar, Perawatan rutin",
      ],
      [
        "JK06",
        "Piston Haus atau Tergores",
        "Piston haus atau tergores dapat menyebabkan kinerja mesin menjadi tidak optimal.",
        "Lakukan penggantian piston dan perawatan berkala.",
        "Perawatan rutin, Menggunakan oli berkualitas",
      ],
      [
        "JK07",
        "Aki Soak atau Lemah",
        "Aki soak atau lemah dapat menyebabkan kinerja mobil menjadi tidak optimal.",
        "Lakukan pengisian ulang daya (cas aki), periksa voltase. Jika perlu, ganti aki dengan yang baru.",
        "Perawatan rutin, Menggunakan aki yang sesuai",
      ],
    ];
    for (const row of penyakitData) {
      const [kode, nama, desk, sol, pen] = row;
      await raw`
        INSERT INTO penyakit (kode_penyakit, nama_penyakit, deskripsi, solusi, pencegahan)
        VALUES (${kode}, ${nama}, ${desk}, ${sol}, ${pen})
        ON CONFLICT (kode_penyakit) DO NOTHING
      `;
    }

    const relasiData: [string, string][] = [
      ["JK01", "GK001"],
      ["JK01", "GK002"],
      ["JK01", "GK003"],
      ["JK01", "GK004"],
      ["JK01", "GK005"],
      ["JK01", "GK006"],
      ["JK02", "GK001"],
      ["JK02", "GK005"],
      ["JK02", "GK006"],
      ["JK02", "GK007"],
      ["JK03", "GK001"],
      ["JK03", "GK002"],
      ["JK03", "GK006"],
      ["JK03", "GK008"],
      ["JK03", "GK009"],
      ["JK04", "GK001"],
      ["JK04", "GK010"],
      ["JK05", "GK001"],
      ["JK05", "GK011"],
      ["JK06", "GK001"],
      ["JK06", "GK002"],
      ["JK06", "GK006"],
      ["JK06", "GK012"],
      ["JK06", "GK013"],
      ["JK07", "GK001"],
      ["JK07", "GK002"],
    ];
    for (const [pk, gk] of relasiData) {
      await raw`
        INSERT INTO relasi (kode_penyakit, kode_gejala)
        VALUES (${pk}, ${gk})
        ON CONFLICT (kode_penyakit, kode_gejala) DO NOTHING
      `;
    }
    } catch (seedErr) {
      console.error("runMigrate: seed data failed (non-fatal for login)", seedErr);
    }
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL ?? "admin@local.id";
    const existing = await raw`SELECT id FROM users WHERE email = ${adminEmail}`;
    if (existing.length === 0) {
      const pw = hashSync(process.env.ADMIN_PASSWORD ?? "admin123", 10);
      await raw`
        INSERT INTO users (id, email, password_hash, nama_lengkap, role)
        VALUES (${randomUUID()}, ${adminEmail}, ${pw}, ${"Administrator"}, ${"admin"})
      `;
    }
  } catch (adminErr) {
    console.error("runMigrate: admin seed failed (non-fatal)", adminErr);
  }
}
