import type { CapacitorConfig } from "@capacitor/cli";

// Build modes:
// - Development (default): loads from localhost:3003
// - Production (CAPACITOR_BUILD=true): loads from deployed Vercel URL
const isProd = process.env.CAPACITOR_BUILD === "true";

const config: CapacitorConfig = {
  appId: "com.pineapplewallet.app",
  appName: "PineappleWallet",
  // Default Next build outputs to .next/; use `public/` for native shell assets.
  // When using CAPACITOR_STATIC_EXPORT=true, copy/sync can still target `out/` via build:static if needed.
  webDir: "public",
  plugins: {
    App: {
      // Deep link configuration for OAuth callback
      // This allows pineapplewallet:// scheme to open the app
    },
  },
  server: isProd
    ? {
        // Production: load from deployed Vercel URL (handles dynamic routing)
        url: "https://pineapple-wallet.vercel.app",
        allowNavigation: [
          "*.google.com",
          "*.googleapis.com",
          "*.onrender.com",
          "*.vercel.app",
        ],
      }
    : {
        // Development: load from local dev server
        url: "http://localhost:3003",
        cleartext: true,
        allowNavigation: ["*.google.com", "*.googleapis.com", "*.onrender.com"],
      },
};

export default config;
