import { pingDatabase } from "@/lib/db";
import { NextResponse } from "next/server";

/** Koneksi + migrasi (sama seperti saat login). 503 jika URL salah atau migrasi gagal. */
export async function GET() {
  const result = await pingDatabase();
  const status = result.ok ? 200 : 503;
  return NextResponse.json(result, { status });
}
