'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useCurrencyStore } from '@/store/currency';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { fetchRates, shouldRefresh } = useCurrencyStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Small delay to allow hydration
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        setIsLoading(false);

        // Fetch exchange rates on app entrance if needed (daily refresh)
        if (shouldRefresh()) {
          fetchRates('USD');
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router, fetchRates, shouldRefresh]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-pineapple" />
      </div>
    );
  }

  return <>{children}</>;
}
