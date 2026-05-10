import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Hindari Next memilih parent folder (mis. C:\Users\VICTUS) karena lockfile ganda
  outputFileTracingRoot: path.join(__dirname),
  /** Jangan bundle paket Node-native — penting untuk instrumentation → db → postgres */
  serverExternalPackages: ["postgres", "bcryptjs"],
};

export default nextConfig;
