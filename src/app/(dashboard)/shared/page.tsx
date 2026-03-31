'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { sharingApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useCurrencyStore } from '@/store/currency';
import { Permission, AssetType } from '@/types';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import {
  Loader2,
  Share2,
  Wallet,
  Eye,
  Edit,
  ArrowRight,
} from 'lucide-react';
import {
  PageTransition,
  AnimatedList,
  AnimatedListItem,
  Floating,
} from '@/components/animations';

const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE'];

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

  const { user } = useAuthStore();
  const { convert, getCryptoPrice } = useCurrencyStore();
  const displayCurrency = user?.displayCurrency || 'USD';

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
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="h-8 w-8 text-pineapple" />
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransition>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Shared With Me
        </h1>
        <p className="text-gray-600">
          Portfolios that others have shared with you
        </p>
      </motion.div>

      {sharedPortfolios.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center py-16"
        >
          <Floating>
            <div className="empty-state-icon mx-auto">
              <Share2 className="h-10 w-10 text-gray-400" />
            </div>
          </Floating>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No shared portfolios
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            When someone shares a portfolio with you, it will appear here
          </p>
        </motion.div>
      ) : (
        <AnimatedList className="grid gap-4">
          {sharedPortfolios.map((shared) => (
            <AnimatedListItem key={shared.id}>
              <SharedPortfolioCard
                shared={shared}
                displayCurrency={displayCurrency}
                convert={convert}
                getCryptoPrice={getCryptoPrice}
              />
            </AnimatedListItem>
          ))}
        </AnimatedList>
      )}
    </PageTransition>
  );
}

function SharedPortfolioCard({
  shared,
  displayCurrency,
  convert,
  getCryptoPrice,
}: {
  shared: SharedPortfolio;
  displayCurrency: string;
  convert: (amount: number, from: string, to: string) => number;
  getCryptoPrice: (symbol: string) => number | null;
}) {
  const calculateTotalInDisplayCurrency = () => {
    if (!shared.portfolio.assets.length) return 0;

    return shared.portfolio.assets.reduce((total, asset) => {
      const value = Number(asset.value);
      const isCrypto = asset.type === AssetType.CRYPTO;
      const isCryptoCurrency = CRYPTO_SYMBOLS.includes(asset.currency);

      if (isCrypto && isCryptoCurrency) {
        const cryptoPrice = getCryptoPrice(asset.currency);
        if (cryptoPrice) {
          const valueInUSD = value * cryptoPrice;
          if (displayCurrency === 'USD') {
            return total + valueInUSD;
          }
          return total + convert(valueInUSD, 'USD', displayCurrency);
        }
        return total;
      }

      if (asset.currency === displayCurrency) {
        return total + value;
      }
      return total + convert(value, asset.currency, displayCurrency);
    }, 0);
  };

  const totalInDisplayCurrency = calculateTotalInDisplayCurrency();

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link
        href={`/portfolios/${shared.portfolio.id}`}
        className="card card-hover block"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <motion.div
              className="icon-container bg-blue-50/80 border-blue-100/50"
              whileHover={{ rotate: 5, scale: 1.05 }}
            >
              <Wallet className="h-6 w-6 text-blue-600" />
            </motion.div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {shared.portfolio.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-pineapple/20 flex items-center justify-center text-pineapple-dark text-xs font-medium">
                    {getInitials(shared.portfolio.user.name)}
                  </div>
                  <span className="hidden sm:inline">{shared.portfolio.user.name}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  {shared.portfolio.assets.length} assets
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/50 border border-white/60">
                  {shared.permission === Permission.VIEW ? (
                    <>
                      <Eye className="h-3 w-3" />
                      <span className="hidden xs:inline text-xs">View</span>
                    </>
                  ) : (
                    <>
                      <Edit className="h-3 w-3" />
                      <span className="hidden xs:inline text-xs">Edit</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4 pl-[64px] sm:pl-0">
            <div className="text-left sm:text-right">
              <motion.p
                className="text-2xl font-bold text-gray-900"
                key={totalInDisplayCurrency}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
              >
                {formatCurrency(totalInDisplayCurrency, displayCurrency)}
              </motion.p>
              <p className="text-sm text-gray-500">Total in {displayCurrency}</p>
            </div>
            <motion.div
              className="text-gray-400"
              whileHover={{ x: 4 }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
