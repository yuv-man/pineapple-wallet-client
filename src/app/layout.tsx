import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CapacitorInitializer } from '@/components/CapacitorInitializer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pineapple Wallet',
  description: 'Track and share your financial portfolio',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/pineapple-wallet-icon.webp', type: 'image/webp' },
    ],
    apple: '/pineapple-wallet-icon.webp',
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
      <body className={inter.className}>
        <CapacitorInitializer />
        {children}
      </body>
    </html>
  );
}
