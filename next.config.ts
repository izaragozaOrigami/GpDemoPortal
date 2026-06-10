import type { NextConfig } from "next";

// Single source of truth for the sub-path. The site is hosted as a virtual
// application under https://gpfleetdemosite.azurewebsites.net/demoapps, not at
// the domain root, so every asset/route must be prefixed with this value.
const basePath = "/demoapps";

const nextConfig: NextConfig = {
  // NOTE: we no longer use `output: "export"`. The Buzón module needs a server
  // runtime (route handlers under /api that read Microsoft Graph with a secret),
  // which a static export cannot host. This app must now run as a Node server
  // (Azure App Service Node, not static IIS). The marketing pages still render
  // fine; they're just served by the Node server instead of as flat HTML.
  basePath,
  // Build autocontenido para desplegar como app Node (genera .next/standalone).
  output: "standalone",
  // Oculta el botón flotante de herramientas de desarrollo de Next ("N").
  // (De todos modos no aparece en producción.)
  devIndicators: false,
  // Required for next/image when there is no image-optimization server set up
  // (we keep external iframe/app images unoptimized).
  images: { unoptimized: true },
  // Expose the prefix to the client bundle so manual references to public/
  // assets and to /api routes can be prefixed too — basePath does NOT cover
  // fetch() calls or inline url() references automatically.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
