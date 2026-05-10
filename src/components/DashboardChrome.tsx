import { SidebarLayout } from "@/components/SidebarLayout";

export function DashboardChrome({
  role,
  nama,
  children,
}: {
  role: "admin" | "user";
  nama: string;
  children: React.ReactNode;
}) {
  return (
    <SidebarLayout role={role} nama={nama}>
      {children}
    </SidebarLayout>
  );
}
