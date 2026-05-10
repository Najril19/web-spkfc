export async function register() {
  // DB migration runs lazily on first `sql()` / `getSql()` — see `src/lib/db.ts`.
  // Do not import `@/lib/db` here: Next bundles instrumentation with Webpack; pulling in
  // `postgres` breaks `next build` (net/tls/stream + `node:` scheme resolution).
}
