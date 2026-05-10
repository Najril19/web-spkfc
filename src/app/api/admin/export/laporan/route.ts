import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { formatDateId } from "@/lib/format";
import { NextRequest, NextResponse } from "next/server";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

type DiagnosaRow = {
  id: number;
  tanggal_diagnosa: string;
  confidence: number | null;
  hasil_penyakit: string | null;
  id_user: string;
};

type UserRow = { id: string; nama_lengkap: string };
type PenyakitRow = { kode_penyakit: string; nama_penyakit: string };

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "pdf";
  const start_date = searchParams.get("start_date") ?? "";
  const end_date = searchParams.get("end_date") ?? "";

  const rows = db
    .prepare(
      `SELECT id, tanggal_diagnosa, confidence, hasil_penyakit, id_user
       FROM diagnosa
       WHERE tanggal_diagnosa >= ? AND tanggal_diagnosa <= ?
       ORDER BY tanggal_diagnosa DESC`,
    )
    .all(`${start_date}T00:00:00`, `${end_date}T23:59:59`) as DiagnosaRow[];

  const userIds = [...new Set(rows.map((r) => r.id_user))];
  const namaUser: Record<string, string> = {};
  if (userIds.length) {
    const ph = userIds.map(() => "?").join(",");
    const profs = db
      .prepare(`SELECT id, nama_lengkap FROM users WHERE id IN (${ph})`)
      .all(...userIds) as UserRow[];
    for (const p of profs) namaUser[p.id] = p.nama_lengkap;
  }

  const kodes = [
    ...new Set(rows.map((r) => r.hasil_penyakit).filter(Boolean) as string[]),
  ];
  const namaPenyakit: Record<string, string> = {};
  if (kodes.length) {
    const ph = kodes.map(() => "?").join(",");
    const penyakitRows = db
      .prepare(
        `SELECT kode_penyakit, nama_penyakit FROM penyakit WHERE kode_penyakit IN (${ph})`,
      )
      .all(...kodes) as PenyakitRow[];
    for (const p of penyakitRows) namaPenyakit[p.kode_penyakit] = p.nama_penyakit;
  }

  const tableBody = rows.map((r, i) => [
    String(i + 1),
    formatDateId(r.tanggal_diagnosa),
    namaUser[r.id_user] ?? "—",
    r.hasil_penyakit
      ? namaPenyakit[r.hasil_penyakit] ?? r.hasil_penyakit
      : "—",
    r.confidence != null ? `${(r.confidence * 100).toFixed(2)}%` : "—",
  ]);

  if (format === "xlsx") {
    const sheetData = [
      ["No", "Tanggal", "Nama User", "Hasil Diagnosa", "Kecocokan"],
      ...tableBody,
    ];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buf, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="laporan-diagnosa.xlsx"`,
      },
    });
  }

  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("Laporan Diagnosa Kerusakan Mobil Toyota Avanza", 14, 16);
  doc.setFontSize(10);
  doc.text(`Periode: ${start_date} s/d ${end_date}`, 14, 24);

  autoTable(doc, {
    startY: 30,
    head: [["No", "Tanggal", "User", "Hasil", "Kecocokan"]],
    body: tableBody,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [52, 58, 64] },
  });

  const buf = Buffer.from(doc.output("arraybuffer"));
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="laporan-diagnosa.pdf"`,
    },
  });
}
