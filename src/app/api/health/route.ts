import { NextResponse } from "next/server";

/** Plain 200 for Railway / proxy health checks (avoid redirect from `/`). */
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
