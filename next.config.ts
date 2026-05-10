import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Hindari Next memilih parent folder (mis. C:\Users\VICTUS) karena lockfile ganda
  outputFileTracingRoot: path.join(__dirname),
  serverExternalPackages: ["postgres"],
};

export default nextConfig;
