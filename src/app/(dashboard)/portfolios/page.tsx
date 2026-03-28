'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { portfoliosApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useCurrencyStore } from '@/store/currency';
import { Portfolio, AssetType } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Wallet, PlusCircle, Loader2, Users, ArrowRight } from 'lucide-react';
import {
  PageTransition,
  AnimatedList,
  AnimatedListItem,
  Floating,
} from '@/components/animations';

const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE'];

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<{
    owned: Portfolio[];
    shared: Portfolio[];
  }>({ owned: [], shared: [] });
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuthStore();
  const { convert, getCryptoPrice } = useCurrencyStore();
  const displayCurrency = user?.displayCurrency || 'USD';

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
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            My Portfolios
          </h1>
          <p className="text-gray-600">Manage your investment portfolios</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link href="/portfolios/new" className="btn btn-primary">
            <PlusCircle className="h-5 w-5 mr-2" />
            New Portfolio
          </Link>
        </motion.div>
      </motion.div>

      {portfolios.owned.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center py-16"
        >
          <Floating>
            <div className="empty-state-icon mx-auto">
              <Wallet className="h-10 w-10 text-gray-400" />
            </div>
          </Floating>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No portfolios yet
          </h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Create your first portfolio to start tracking your assets and watch your wealth grow
          </p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/portfolios/new" className="btn btn-primary inline-flex">
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Portfolio
            </Link>
          </motion.div>
        </motion.div>
      ) : (
        <AnimatedList className="grid gap-4">
          {portfolios.owned.map((portfolio, index) => (
            <AnimatedListItem key={portfolio.id}>
              <PortfolioCard
                portfolio={portfolio}
                isOwner
                displayCurrency={displayCurrency}
                convert={convert}
                getCryptoPrice={getCryptoPrice}
                index={index}
              />
            </AnimatedListItem>
          ))}
        </AnimatedList>
      )}
    </PageTransition>
  );
}

function PortfolioCard({
  portfolio,
  displayCurrency,
  convert,
  getCryptoPrice,
}: {
  portfolio: Portfolio;
  isOwner: boolean;
  displayCurrency: string;
  convert: (amount: number, from: string, to: string) => number;
  getCryptoPrice: (symbol: string) => number | null;
  index?: number;
}) {
  const sharedCount = portfolio.shares?.filter(
    (s) => s.status === 'ACCEPTED'
  ).length;

  const calculateTotalInDisplayCurrency = () => {
    if (!portfolio.assets.length) return 0;

    return portfolio.assets.reduce((total, asset) => {
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
        href={`/portfolios/${portfolio.id}`}
        className="card card-hover block"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <motion.div
              className="icon-container-primary"
              whileHover={{ rotate: 5, scale: 1.05 }}
            >
              <Wallet className="h-6 w-6 text-pineapple" />
            </motion.div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {portfolio.name}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pineapple/60" />
                  {portfolio.assets.length} assets
                </span>
                {sharedCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Shared with {sharedCount}
                  </span>
                )}
                <span className="hidden sm:inline text-gray-400">
                  Updated {formatDate(portfolio.updatedAt)}
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
