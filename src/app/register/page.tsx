import { registerAction } from "@/actions/auth";
import Link from "next/link";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-primary px-8 py-8 text-center text-white">
          <h2 className="text-2xl font-bold">Buat Akun</h2>
          <p className="mt-2 text-sm opacity-90">Daftar untuk mulai diagnosa</p>
        </div>
        <div className="px-8 py-8">
          {sp.error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {sp.error}
            </div>
          )}
          <form action={registerAction} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nama lengkap
              </label>
              <input
                name="nama_lengkap"
                required
                className="w-full rounded-full border border-gray-200 px-4 py-3 outline-none ring-primary focus:ring-2"
              />
            </div>
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
                minLength={6}
                autoComplete="new-password"
                className="w-full rounded-full border border-gray-200 px-4 py-3 outline-none ring-primary focus:ring-2"
              />
            </div>
            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-primary py-3 font-semibold text-white shadow transition hover:bg-primary-dark"
            >
              Daftar
            </button>
          </form>
          <p className="mt-6 border-t pt-6 text-center text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
