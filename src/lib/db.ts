import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import { hashSync } from "bcryptjs";
import fs from "fs";
import path from "path";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = process.env.DATABASE_PATH ?? path.join(DB_DIR, "spkfc.db");

fs.mkdirSync(DB_DIR, { recursive: true });

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

function openDb(): Database.Database {
  const database = new Database(DB_PATH);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  return database;
}

export const db: Database.Database = global.__db ?? openDb();
if (process.env.NODE_ENV !== "production") {
  global.__db = db;
}

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    nama_lengkap TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS penyakit (
    kode_penyakit TEXT PRIMARY KEY,
    nama_penyakit TEXT NOT NULL,
    deskripsi TEXT,
    solusi TEXT,
    pencegahan TEXT
  );

  CREATE TABLE IF NOT EXISTS gejala (
    kode_gejala TEXT PRIMARY KEY,
    nama_gejala TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS relasi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kode_penyakit TEXT NOT NULL REFERENCES penyakit(kode_penyakit) ON DELETE CASCADE,
    kode_gejala TEXT NOT NULL REFERENCES gejala(kode_gejala) ON DELETE CASCADE,
    UNIQUE(kode_penyakit, kode_gejala)
  );

  CREATE TABLE IF NOT EXISTS diagnosa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_user TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tanggal_diagnosa TEXT DEFAULT (datetime('now')),
    hasil_penyakit TEXT REFERENCES penyakit(kode_penyakit),
    confidence REAL
  );

  CREATE TABLE IF NOT EXISTS diagnosa_detail (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_diagnosa INTEGER NOT NULL REFERENCES diagnosa(id) ON DELETE CASCADE,
    kode_gejala TEXT NOT NULL REFERENCES gejala(kode_gejala),
    UNIQUE(id_diagnosa, kode_gejala)
  );
`);

const gejalaCount = (
  db.prepare("SELECT COUNT(*) as n FROM gejala").get() as { n: number }
).n;

if (gejalaCount === 0) {
  const insertG = db.prepare(
    "INSERT OR IGNORE INTO gejala (kode_gejala, nama_gejala) VALUES (?, ?)",
  );
  const insertP = db.prepare(
    "INSERT OR IGNORE INTO penyakit (kode_penyakit, nama_penyakit, deskripsi, solusi, pencegahan) VALUES (?, ?, ?, ?, ?)",
  );
  const insertR = db.prepare(
    "INSERT OR IGNORE INTO relasi (kode_penyakit, kode_gejala) VALUES (?, ?)",
  );

  const seed = db.transaction(() => {
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
    for (const [k, n] of gejalaData) insertG.run(k, n);

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
    for (const row of penyakitData) insertP.run(...row);

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
    for (const [p, g] of relasiData) insertR.run(p, g);
  });

  seed();
}

const adminEmail = process.env.ADMIN_EMAIL ?? "admin@local.id";
const adminExists = db
  .prepare("SELECT id FROM users WHERE email = ?")
  .get(adminEmail);

if (!adminExists) {
  const pw = hashSync(process.env.ADMIN_PASSWORD ?? "admin123", 10);
  db.prepare(
    "INSERT OR IGNORE INTO users (id, email, password_hash, nama_lengkap, role) VALUES (?, ?, ?, ?, ?)",
  ).run(randomUUID(), adminEmail, pw, "Administrator", "admin");
}
