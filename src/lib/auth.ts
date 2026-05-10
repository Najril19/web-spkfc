import { getSession } from "@/lib/session";

export type Profile = {
  id: string;
  email: string;
  nama_lengkap: string;
  role: "admin" | "user";
  created_at: string | null;
};

export async function getSessionUser(): Promise<{ id: string; email: string } | null> {
  const session = await getSession();
  if (!session.userId) return null;
  return { id: session.userId, email: session.email };
}

export async function getProfile(): Promise<Profile | null> {
  const session = await getSession();
  if (!session.userId) return null;
  return {
    id: session.userId,
    email: session.email,
    nama_lengkap: session.nama_lengkap,
    role: session.role,
    created_at: null,
  };
}
