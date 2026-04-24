import type { CapacitorConfig } from "@capacitor/cli";

// Use CAPACITOR_LIVE_RELOAD=true when you want the native app to load
// from the local Next.js dev server (hot reload during development).
// By default (production builds), the app loads from the bundled `out/` directory.
const isLiveReload = process.env.CAPACITOR_LIVE_RELOAD === "true";

const config: CapacitorConfig = {
  appId: "com.pineapplewallet.app",
  appName: "PineappleWallet",
  webDir: "out",
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
    },
    StatusBar: {
      backgroundColor: "#ffffff",
      style: "DARK",
      overlaysWebView: false,
    },
    App: {
      // Deep link configuration for OAuth callback
    },
  },
  ...(isLiveReload && {
    server: {
      url: "http://localhost:3003",
      cleartext: true,
      allowNavigation: [
        "*.google.com",
        "*.googleapis.com",
        "*.onrender.com",
      ],
    },
  }),
};

export default config;
