import { getProfile, getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) {
    const p = await getProfile();
    redirect(p?.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
  }

  redirect("/login");
}
