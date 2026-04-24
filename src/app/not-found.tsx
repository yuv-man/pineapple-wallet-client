'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const DYNAMIC_ROUTE_PATTERNS = [
  '/portfolios/',
  '/assets/',
  '/properties/',
  '/liabilities/',
  '/invitations/',
  '/shared/',
];

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // For static export with dynamic routes, attempt client-side navigation.
    // Capacitor serves index.html for unknown paths; Next.js router then takes
    // over and renders the correct page component using useParams().
    const path = window.location.pathname;

    const isDynamic = DYNAMIC_ROUTE_PATTERNS.some((pattern) =>
      path.includes(pattern)
    );

    if (isDynamic) {
      router.replace(path);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-pineapple mb-4" />
      <p className="text-gray-600">Loading...</p>
    </div>
  );
}
