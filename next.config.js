/** @type {import('next').NextConfig} */
// Static export cannot serve arbitrary /portfolios/[id] URLs (no RSC index.txt on disk).
// Use default build + `next start` for local prod / dynamic routes. Opt in to export only when needed:
//   CAPACITOR_STATIC_EXPORT=true npm run build
const staticExport =
  process.env.CAPACITOR_STATIC_EXPORT === "true" ||
  process.env.STATIC_EXPORT === "true";

const nextConfig = {
  ...(staticExport
    ? {
        output: "export",
        trailingSlash: true,
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
