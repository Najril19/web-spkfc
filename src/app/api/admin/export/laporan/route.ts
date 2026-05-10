import { createClient } from "@/lib/supabase/server";
import { formatDateId } from "@/lib/format";
import { NextRequest, NextResponse } from "next/server";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: pr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (pr?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "pdf";
  const start_date = searchParams.get("start_date") ?? "";
  const end_date = searchParams.get("end_date") ?? "";

  const { data: rows } = await supabase
    .from("diagnosa")
    .select("id, tanggal_diagnosa, confidence, hasil_penyakit, id_user")
    .gte("tanggal_diagnosa", `${start_date}T00:00:00`)
    .lte("tanggal_diagnosa", `${end_date}T23:59:59`)
    .order("tanggal_diagnosa", { ascending: false });

  const userIds = [...new Set((rows ?? []).map((r) => r.id_user))];
  const { data: profs } = userIds.length
    ? await supabase.from("profiles").select("id, nama_lengkap").in("id", userIds)
    : { data: [] as { id: string; nama_lengkap: string }[] };
  const namaUser = Object.fromEntries((profs ?? []).map((p) => [p.id, p.nama_lengkap]));

  const kodes = [...new Set((rows ?? []).map((r) => r.hasil_penyakit).filter(Boolean))] as string[];
  const { data: penyakitRows } = kodes.length
    ? await supabase.from("penyakit").select("kode_penyakit, nama_penyakit").in("kode_penyakit", kodes)
    : { data: [] as { kode_penyakit: string; nama_penyakit: string }[] };
  const namaPenyakit = Object.fromEntries((penyakitRows ?? []).map((p) => [p.kode_penyakit, p.nama_penyakit]));

  const tableBody = (rows ?? []).map((r, i) => [
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
      ...tableBody.map((row) => row),
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
