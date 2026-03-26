import type { CapacitorConfig } from '@capacitor/cli';

// Build modes:
// - Development (default): loads from localhost:3001
// - Production (CAPACITOR_BUILD=true): loads from deployed Vercel URL
const isProd = process.env.CAPACITOR_BUILD === 'true';

const config: CapacitorConfig = {
  appId: 'com.pineapplewallet.app',
  appName: 'PineappleWallet',
  webDir: 'out', // Fallback for static assets (not used when server.url is set)
  plugins: {
    App: {
      // Deep link configuration for OAuth callback
      // This allows pineapplewallet:// scheme to open the app
    },
  },
  server: isProd
    ? {
        // Production: load from deployed Vercel URL (handles dynamic routing)
        url: 'https://pineapple-wallet.vercel.app',
        allowNavigation: ['*.google.com', '*.googleapis.com', '*.onrender.com', '*.vercel.app'],
      }
    : {
        // Development: load from local dev server
        url: 'http://localhost:3001',
        cleartext: true,
        allowNavigation: ['*.google.com', '*.googleapis.com', '*.onrender.com'],
      },
};

export default config;
