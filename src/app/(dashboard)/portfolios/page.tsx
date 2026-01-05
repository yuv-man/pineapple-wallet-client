'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { portfoliosApi } from '@/lib/api';
import { Portfolio } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Wallet, PlusCircle, Loader2, Users, ArrowRight } from 'lucide-react';

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<{
    owned: Portfolio[];
    shared: Portfolio[];
  }>({ owned: [], shared: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const response = await portfoliosApi.getAll();
        setPortfolios(response.data);
      } catch (error) {
        console.error('Failed to fetch portfolios:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-pineapple" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Portfolios</h1>
          <p className="text-gray-600">Manage your investment portfolios</p>
        </div>
        <Link href="/portfolios/new" className="btn btn-primary">
          <PlusCircle className="h-5 w-5 mr-2" />
          New Portfolio
        </Link>
      </div>

      {portfolios.owned.length === 0 ? (
        <div className="card text-center py-12">
          <Wallet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No portfolios yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first portfolio to start tracking your assets
          </p>
          <Link href="/portfolios/new" className="btn btn-primary inline-flex">
            <PlusCircle className="h-5 w-5 mr-2" />
            Create Portfolio
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {portfolios.owned.map((portfolio) => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} isOwner />
          ))}
        </div>
      )}
    </div>
  );
}

function PortfolioCard({
  portfolio,
  isOwner,
}: {
  portfolio: Portfolio;
  isOwner: boolean;
}) {
  const sharedCount = portfolio.shares?.filter(
    (s) => s.status === 'ACCEPTED'
  ).length;

  return (
    <Link
      href={`/portfolios/${portfolio.id}`}
      className="card hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
            <Wallet className="h-6 w-6 text-pineapple" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {portfolio.name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{portfolio.assets.length} assets</span>
              {sharedCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Shared with {sharedCount}
                </span>
              )}
              <span>Updated {formatDate(portfolio.updatedAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(portfolio.totalValue)}
            </p>
            <p className="text-sm text-gray-500">Total Value</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </Link>
  );
}
