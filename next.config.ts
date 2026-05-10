import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  serverExternalPackages: ["postgres", "bcryptjs"],
  webpack(config, { isServer }) {
    if (isServer) {
      // Tangani skema `node:` — Webpack tidak mengenalinya secara default
      // tetapi Node.js built-ins seperti `node:crypto` valid di sisi server.
      const prev = config.externals as unknown[];
      config.externals = [
        ...(Array.isArray(prev) ? prev : prev ? [prev] : []),
        ({ request }: { request?: string }, callback: (err?: null, result?: string) => void) => {
          if (request && request.startsWith("node:")) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        },
      ];
    }
    return config;
  },
};

export default nextConfig;
