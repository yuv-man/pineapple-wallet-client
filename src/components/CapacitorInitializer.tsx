'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';

export function CapacitorInitializer() {
  useEffect(() => {
    const initCapacitor = async () => {
      // Only run on native platforms
      if (!Capacitor.isNativePlatform()) {
        return;
      }

      try {
        // Initialize Status Bar
        if (Capacitor.isPluginAvailable('StatusBar')) {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
        }

        // Initialize Keyboard
        if (Capacitor.isPluginAvailable('Keyboard')) {
          Keyboard.setAccessoryBarVisible({ isVisible: true });
        }

        // Hide splash screen after a short delay
        if (Capacitor.isPluginAvailable('SplashScreen')) {
          setTimeout(async () => {
            await SplashScreen.hide();
          }, 2000);
        }

        // Handle app state changes
        if (Capacitor.isPluginAvailable('App')) {
          App.addListener('appStateChange', ({ isActive }) => {
            console.log('App state changed. Is active?', isActive);
          });

          App.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) {
              App.exitApp();
            } else {
              window.history.back();
            }
          });
        }
      } catch (error) {
        console.error('Error initializing Capacitor plugins:', error);
      }
    };

    initCapacitor();
  }, []);

  return null;
}
