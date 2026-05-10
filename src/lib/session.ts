import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId: string;
  email: string;
  role: "admin" | "user";
  nama_lengkap: string;
}

const SESSION_SECRET =
  process.env.IRON_SESSION_SECRET ??
  "spkfc_default_secret_change_in_production_32chars!!";

export const sessionOptions = {
  password: SESSION_SECRET,
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
