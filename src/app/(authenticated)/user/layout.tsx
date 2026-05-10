import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function UserOnlyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const p = await getProfile();
  if (!p || p.role !== "user") redirect("/admin/dashboard");
  return <>{children}</>;
}
