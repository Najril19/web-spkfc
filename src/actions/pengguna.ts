"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: pr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (pr?.role !== "admin") redirect("/user/dashboard");
  return { supabase, user };
}

export async function adminCreateUser(formData: FormData) {
  await requireAdmin();
  const service = createServiceClient();
  if (!service) {
    redirect(
      "/admin/pengguna?error=" +
        encodeURIComponent(
          "SUPABASE_SERVICE_ROLE_KEY belum di-set (.env.local). Diperlukan untuk menambah pengguna.",
        ),
    );
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nama_lengkap = String(formData.get("nama_lengkap") ?? "").trim();
  const role = (String(formData.get("role") ?? "user") as "admin" | "user");

  const { data: created, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nama_lengkap },
  });

  if (error || !created.user) {
    redirect(
      `/admin/pengguna?error=${encodeURIComponent(error?.message ?? "Gagal membuat pengguna")}`,
    );
  }

  await service
    .from("profiles")
    .update({ nama_lengkap, role, email })
    .eq("id", created.user.id);

  redirect("/admin/pengguna?success=1");
}

export async function adminUpdateUser(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const nama_lengkap = String(formData.get("nama_lengkap") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "user") as "admin" | "user";
  const password = String(formData.get("password") ?? "");

  if (id === user.id && role !== "admin") {
    redirect("/admin/pengguna?error=Tidak bisa menghapus role admin pada diri sendiri");
  }

  const service = createServiceClient();

  if (service && (email || password)) {
    const payload: {
      email?: string;
      password?: string;
    } = {};
    if (email) payload.email = email;
    if (password.length > 0) payload.password = password;
    const { error } = await service.auth.admin.updateUserById(id, payload);
    if (error) {
      redirect(`/admin/pengguna?error=${encodeURIComponent(error.message)}`);
    }
  }

  await supabase
    .from("profiles")
    .update({ nama_lengkap, role, email })
    .eq("id", id);

  redirect("/admin/pengguna?success=1");
}

export async function adminDeleteUser(formData: FormData) {
  const { user } = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  if (id === user.id) {
    redirect("/admin/pengguna?error=Tidak bisa menghapus akun sendiri");
  }

  const service = createServiceClient();
  if (!service) {
    redirect(
      "/admin/pengguna?error=" +
        encodeURIComponent("SUPABASE_SERVICE_ROLE_KEY diperlukan untuk menghapus pengguna."),
    );
  }

  const { error } = await service.auth.admin.deleteUser(id);
  if (error) {
    redirect(`/admin/pengguna?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/pengguna?success=1");
}
