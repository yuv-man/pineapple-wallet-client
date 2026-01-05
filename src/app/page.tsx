'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import {
  Wallet,
  Share2,
  PieChart,
  Shield,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 sm:py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pineapple rounded-xl flex items-center justify-center">
              <span className="text-xl sm:text-2xl">🍍</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              Pineapple Wallet
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="text-sm sm:text-base text-gray-600 hover:text-gray-900 font-medium px-2 sm:px-0"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="btn btn-primary text-sm sm:text-base px-3 sm:px-4 py-2"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-12 sm:py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Track Your Wealth,{' '}
            <span className="text-pineapple">Share With Partners</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 px-2">
            Pineapple Wallet helps you manage all your assets in one place —
            bank accounts, real estate, crypto, stocks, and investments. Share
            your portfolio with your partner for collaborative financial
            planning.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <Link href="/register" className="btn btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 w-full sm:w-auto">
              Start Free <ArrowRight className="ml-2 h-5 w-5 inline" />
            </Link>
            <Link
              href="/login"
              className="btn btn-outline text-base sm:text-lg px-6 sm:px-8 py-3 w-full sm:w-auto"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-16 sm:mt-24">
          <FeatureCard
            icon={<Wallet className="h-8 w-8 text-pineapple" />}
            title="All Assets in One Place"
            description="Track bank accounts, real estate, crypto, stocks, and investments in a unified dashboard."
          />
          <FeatureCard
            icon={<Share2 className="h-8 w-8 text-pineapple" />}
            title="Share With Partners"
            description="Invite your partner to view or edit your portfolio. Perfect for couples managing finances together."
          />
          <FeatureCard
            icon={<PieChart className="h-8 w-8 text-pineapple" />}
            title="Visual Analytics"
            description="See your net worth, asset allocation, and value history with beautiful charts."
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-pineapple" />}
            title="Secure & Private"
            description="Your financial data is encrypted and only accessible to you and people you trust."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-6 sm:py-8 mt-12 sm:mt-20 border-t">
        <div className="text-center text-gray-500 text-sm sm:text-base">
          <p>© 2024 Pineapple Wallet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-50 rounded-2xl mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
