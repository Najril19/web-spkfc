import { loginAction } from "@/actions/auth";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-primary px-8 py-8 text-center text-white">
          <h2 className="text-2xl font-bold">Selamat Datang Kembali</h2>
          <p className="mt-2 text-sm opacity-90">Masuk dengan email dan password</p>
        </div>
        <div className="px-8 py-8">
          {sp.registered && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
              Registrasi berhasil. Silakan cek email jika konfirmasi diaktifkan, lalu masuk.
            </div>
          )}
          {sp.error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {sp.error}
            </div>
          )}
          <form action={loginAction} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-full border border-gray-200 px-4 py-3 outline-none ring-primary focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-full border border-gray-200 px-4 py-3 outline-none ring-primary focus:ring-2"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-primary py-3 font-semibold text-white shadow transition hover:bg-primary-dark"
            >
              Masuk
            </button>
          </form>
          <p className="mt-6 border-t pt-6 text-center text-sm text-gray-600">
            Belum punya akun?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
