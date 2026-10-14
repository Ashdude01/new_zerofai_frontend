import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

const ONE_YEAR = 60 * 60 * 24 * 365;

const nextConfig: NextConfig = {
  experimental: {
    globalNotFound: true,
    // Tree-shake barrel-file imports so a single icon does not drag in the
    // whole library. lucide-react alone was pulling in hundreds of modules.
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "@radix-ui/react-dialog",
      "@radix-ui/react-accordion",
      "@radix-ui/react-navigation-menu",
      "recharts",
    ],
  },
  reactStrictMode: false,
  poweredByHeader: false,
  compress: true,
  images: {
    // AVIF first, WebP fallback — typically 30-50% smaller than the WebP-only
    // default for the photographic hero and card imagery.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: ONE_YEAR,
    // Next 16 rejects optimizer requests whose `q` is not listed here.
    qualities: [65, 72, 75, 80],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "s7d1.scene7.com" },
      { protocol: "https", hostname: "www.kyndryl.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "agqugimammzwbqtyqwry.supabase.co" },
    ],
    localPatterns: [
      { pathname: "/api/media/file/**" },
      { pathname: "/assets/**" },
    ],
  },
  async headers() {
    return [
      {
        // Fonts are served straight from public/ again (next/font is not used),
        // so they need an explicit long-lived cache header.
        source: "/twk-everett/:path*",
        headers: [
          { key: "Cache-Control", value: `public, max-age=${ONE_YEAR}, immutable` },
        ],
      },
      {
        // Static art is content-addressed by filename and never mutates in place.
        source: "/assets/:path*",
        headers: [
          { key: "Cache-Control", value: `public, max-age=${ONE_YEAR}, immutable` },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };

    return webpackConfig;
  },
  turbopack: {
    root: path.resolve(dirname),
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
