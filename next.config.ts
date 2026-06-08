import type { NextConfig } from "next";

// Single source of truth for the sub-path. The site is hosted as a virtual
// application under https://gpfleetdemosite.azurewebsites.net/demoapps, not at
// the domain root, so every asset/route must be prefixed with this value.
const basePath = "/demoapps";

const nextConfig: NextConfig = {
  output: "export",
  // basePath auto-prefixes /_next/* assets, <Link href> and router pushes.
  basePath,
  // Emit apps/checklist/index.html (instead of apps/checklist.html) so IIS /
  // Azure App Service serves deep routes directly without rewrite rules.
  trailingSlash: true,
  // Required by `output: export` when using next/image (no optimization server).
  images: { unoptimized: true },
  // Expose the prefix to the client bundle so manual references to public/
  // assets can be prefixed too — basePath does NOT cover those automatically.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
