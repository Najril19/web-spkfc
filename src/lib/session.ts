import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId: string;
  email: string;
  role: "admin" | "user";
  nama_lengkap: string;
}

/** iron-session requires password length ≥ 32 or it throws at runtime (breaks every page using cookies). */
const FALLBACK_SESSION_SECRET =
  "spkfc_default_secret_change_in_production_32chars!!";

function resolveIronSessionPassword(): string {
  const raw = process.env.IRON_SESSION_SECRET?.trim();
  if (raw && raw.length >= 32) return raw;
  return FALLBACK_SESSION_SECRET;
}

export const sessionOptions = {
  password: resolveIronSessionPassword(),
  cookieName: "spkfc_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
