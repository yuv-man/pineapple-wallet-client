'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sharingApi } from '@/lib/api';
import { Permission } from '@/types';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import {
  Loader2,
  Share2,
  Wallet,
  Eye,
  Edit,
  ArrowRight,
} from 'lucide-react';

interface SharedPortfolio {
  id: string;
  portfolioId: string;
  permission: Permission;
  portfolio: {
    id: string;
    name: string;
    description?: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    assets: any[];
  };
}

export default function SharedWithMePage() {
  const [sharedPortfolios, setSharedPortfolios] = useState<SharedPortfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const response = await sharingApi.getSharedWithMe();
        setSharedPortfolios(response.data);
      } catch (error) {
        console.error('Failed to fetch shared portfolios:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShared();
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Shared With Me</h1>
        <p className="text-gray-600">
          Portfolios that others have shared with you
        </p>
      </div>

      {sharedPortfolios.length === 0 ? (
        <div className="card text-center py-12">
          <Share2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No shared portfolios
          </h3>
          <p className="text-gray-500">
            When someone shares a portfolio with you, it will appear here
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sharedPortfolios.map((shared) => (
            <SharedPortfolioCard key={shared.id} shared={shared} />
          ))}
        </div>
      )}
    </div>
  );
}

function SharedPortfolioCard({ shared }: { shared: SharedPortfolio }) {
  const totalValue = shared.portfolio.assets.reduce(
    (sum, asset) => sum + Number(asset.value),
    0
  );

  return (
    <Link
      href={`/portfolios/${shared.portfolio.id}`}
      className="card hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <Wallet className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {shared.portfolio.name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-pineapple/20 flex items-center justify-center text-pineapple-dark text-xs font-medium">
                  {getInitials(shared.portfolio.user.name)}
                </div>
                {shared.portfolio.user.name}
              </span>
              <span>{shared.portfolio.assets.length} assets</span>
              <span className="flex items-center gap-1">
                {shared.permission === Permission.VIEW ? (
                  <>
                    <Eye className="h-4 w-4" />
                    View
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4" />
                    Edit
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalValue)}
            </p>
            <p className="text-sm text-gray-500">Total Value</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </Link>
  );
}
