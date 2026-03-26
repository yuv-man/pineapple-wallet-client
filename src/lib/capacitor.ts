import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const getPlatform = (): string => {
  return Capacitor.getPlatform();
};

// Deep link scheme for OAuth callback
export const APP_SCHEME = 'pineapplewallet';
export const AUTH_CALLBACK_PATH = 'auth/callback';

// Build the OAuth redirect URI for mobile
export const getMobileRedirectUri = (): string => {
  return `${APP_SCHEME}://${AUTH_CALLBACK_PATH}`;
};

// Open OAuth URL in browser (for native platforms)
export const openOAuthUrl = async (url: string): Promise<void> => {
  await Browser.open({ url, windowName: '_self' });
};

// Close the browser after OAuth completes
export const closeBrowser = async (): Promise<void> => {
  await Browser.close();
};

// Set up listener for deep link callback
export const setupDeepLinkListener = (
  callback: (url: string) => void
): (() => void) => {
  // Listen for app URL open events
  const listener = App.addListener('appUrlOpen', (event) => {
    callback(event.url);
  });

  // Return cleanup function
  return () => {
    listener.then((l) => l.remove());
  };
};

// Parse tokens from callback URL
export const parseAuthCallbackUrl = (
  url: string
): { accessToken: string | null; refreshToken: string | null } => {
  try {
    // Handle custom scheme URLs (pineapplewallet://auth/callback?accessToken=...&refreshToken=...)
    const urlObj = new URL(url);
    const searchParams = urlObj.searchParams;

    return {
      accessToken: searchParams.get('accessToken'),
      refreshToken: searchParams.get('refreshToken'),
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
};
