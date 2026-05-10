import { redirect } from "next/navigation";
import { getProfile, getSessionUser } from "@/lib/auth";
import { DashboardChrome } from "@/components/DashboardChrome";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <DashboardChrome role={profile.role} nama={profile.nama_lengkap}>
      {children}
    </DashboardChrome>
  );
}
