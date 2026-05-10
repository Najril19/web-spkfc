import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MJMScan+ | Diagnosa Mobil Toyota Avanza",
  description: "Sistem pakar diagnosa kerusakan mobil Toyota Avanza",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
