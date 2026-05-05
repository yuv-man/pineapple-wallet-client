/** @type {import('next').NextConfig} */
// Static export for Capacitor mobile builds. Opt in via:
//   CAPACITOR_STATIC_EXPORT=true npm run build   (or npm run build:static)
//
// trailingSlash is intentionally NOT set: with trailingSlash:true the RSC
// payload for /portfolios is fetched as /portfolios/index.txt, which the
// App Router matches as portfolios/[id] (id="index.txt") causing API 404s.
// Without it, RSC payloads use /portfolios.txt — no route conflict.
const staticExport =
  process.env.CAPACITOR_STATIC_EXPORT === "true" ||
  process.env.STATIC_EXPORT === "true";

const nextConfig = {
  ...(staticExport
    ? {
        output: "export",
      }
    : {}),
  images: {
    unoptimized: staticExport,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
};

module.exports = nextConfig;
