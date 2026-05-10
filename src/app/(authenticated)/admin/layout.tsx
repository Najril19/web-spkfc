import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminOnlyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const p = await getProfile();
  if (!p || p.role !== "admin") redirect("/user/dashboard");
  return <>{children}</>;
}
