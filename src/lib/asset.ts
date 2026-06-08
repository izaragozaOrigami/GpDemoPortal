// Prefix a path to a file in `public/` with the configured basePath.
//
// Next.js auto-prefixes /_next/* assets, <Link> and router navigation, but it
// does NOT touch manual string references to public/ assets (e.g. an inline
// `background-image: url(...)`). Those must be prefixed by hand or they 404
// when the app is served under /demoapps.
//
// NEXT_PUBLIC_BASE_PATH is injected at build time from next.config.ts, so this
// resolves to the literal value in both the server and client bundles.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  return `${BASE_PATH}${path}`;
}
