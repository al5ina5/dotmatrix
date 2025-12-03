'use client';

import { useEffect } from 'react';

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

/**
 * PWA Installation and Service Worker Registration
 * Handles PWA install prompt and service worker lifecycle
 */
export function PWAInstall() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker registered:', registration.scope);
          })
          .catch((error) => {
            console.error('❌ Service Worker registration failed:', error);
          });
      });
    }

    // Handle PWA install prompt
    let deferredPrompt: any;

    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;

      console.log('💡 PWA install available');

      // You could show a custom install button here
      // For now, we'll let the browser handle it naturally
    });

    window.addEventListener('appinstalled', () => {
      console.log('✨ PWA installed successfully!');
      deferredPrompt = null;
    });

    // Request fullscreen on iOS when added to home screen
    if (window.navigator.standalone) {
      console.log('📱 Running in standalone mode (PWA)');
    }
  }, []);

  return null; // This component doesn't render anything
}






