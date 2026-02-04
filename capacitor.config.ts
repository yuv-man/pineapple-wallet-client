import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.pineapple.wallet',
  appName: 'Pineapple Wallet',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // For development, you can uncomment this to use the Next.js dev server:
    // url: 'http://localhost:3001',
    // cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff',
    },
    Keyboard: {
      resize: KeyboardResize.Native, // iOS-only, but included for completeness
      resizeOnFullScreen: true, // Android-specific
    },
    SocialLogin: {
      // Configure social login providers
      // You'll need to add your OAuth client IDs here
      google: {
        // Add your Google OAuth client ID when ready
        // clientId: 'YOUR_GOOGLE_CLIENT_ID',
      },
      github: {
        // Add your GitHub OAuth client ID when ready
        // clientId: 'YOUR_GITHUB_CLIENT_ID',
      },
    },
  },
};

export default config;
