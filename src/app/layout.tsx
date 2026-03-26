import type { Metadata } from 'next';
import './globals.css';
import { CapacitorInitializer } from '@/components/CapacitorInitializer';

export const metadata: Metadata = {
  title: 'Pineapple Wallet',
  description: 'Track and share your financial portfolio',
  viewport: 'width=device-width, initial-scale=1',
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
