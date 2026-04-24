import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CapacitorInitializer } from '@/components/CapacitorInitializer';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // required for iOS safe-area-inset-* CSS env vars
};

export const metadata: Metadata = {
  title: 'Pineapple Wallet',
  description: 'Track and share your financial portfolio',
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }],
    apple: [{ url: '/favicon.ico', sizes: '180x180' }],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <CapacitorInitializer />
        {children}
      </body>
    </html>
  );
}
