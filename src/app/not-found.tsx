'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // For static export with dynamic routes, attempt client-side navigation
    // This handles cases where the page wasn't pre-generated
    const path = window.location.pathname;

    // If we're on a dynamic route that should exist, try navigating to it
    if (path.includes('/portfolios/') || path.includes('/assets/')) {
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
