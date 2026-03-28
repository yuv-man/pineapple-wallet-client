'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { portfoliosApi, assetsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useCurrencyStore } from '@/store/currency';
import { Portfolio, Asset, AssetType, ASSET_TYPE_LABELS, Permission } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  PlusCircle,
  Loader2,
  Share2,
  Edit,
  Trash2,
  Home,
  Landmark,
  Bitcoin,
  TrendingUp,
  PiggyBank,
  MoreVertical,
  AlertCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';

// Check if date is older than 3 months
function isOlderThan3Months(dateString: string): boolean {
  const date = new Date(dateString);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return date < threeMonthsAgo;
}

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

const ASSET_ICONS: Record<AssetType, React.ElementType> = {
  [AssetType.BANK_ACCOUNT]: Landmark,
  [AssetType.REAL_ESTATE]: Home,
  [AssetType.CRYPTO]: Bitcoin,
  [AssetType.STOCK]: TrendingUp,
  [AssetType.INVESTMENT]: PiggyBank,
};

export default function PortfolioDetailClient() {
  const params = useParams();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { user } = useAuthStore();
  const { convert, getCryptoPrice, fetchRates, rates, isLoading: ratesLoading } = useCurrencyStore();
  const displayCurrency = user?.displayCurrency || 'USD';

  const portfolioId = typeof params.id === 'string' ? params.id : '';

  // Fetch rates on mount if needed
  useEffect(() => {
    if (!rates) {
      fetchRates('USD');
    }
  }, [rates, fetchRates]);

  useEffect(() => {
    if (!portfolioId) {
      router.replace('/portfolios');
      return;
    }

    const fetchPortfolio = async () => {
      try {
        const response = await portfoliosApi.getOne(portfolioId);
        setPortfolio(response.data);
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
        router.push('/portfolios');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, [portfolioId, router]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await portfoliosApi.delete(portfolioId);
      router.push('/portfolios');
    } catch (error) {
      console.error('Failed to delete portfolio:', error);
      setIsDeleting(false);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await assetsApi.delete(assetId);
      setPortfolio((prev) =>
        prev
          ? {
              ...prev,
              assets: prev.assets.filter((a) => a.id !== assetId),
              totalValue:
                prev.totalValue -
                (prev.assets.find((a) => a.id === assetId)?.value || 0),
            }
          : null
      );
    } catch (error) {
      console.error('Failed to delete asset:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-pineapple" />
      </div>
    );
  }

  if (!portfolio) {
    return null;
  }

  const canEdit = portfolio.isOwner || portfolio.permission === Permission.EDIT;

  // Crypto symbols for detection
  const cryptoSymbols = ['BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE'];

  // Calculate total in user's display currency
  const calculateTotalInDisplayCurrency = () => {
    if (!portfolio.assets.length) return 0;

    return portfolio.assets.reduce((total, asset) => {
      const value = Number(asset.value);
      const isCrypto = asset.type === AssetType.CRYPTO;
      const isCryptoCurrency = cryptoSymbols.includes(asset.currency);

      if (isCrypto && isCryptoCurrency) {
        // For crypto: value is amount of crypto, multiply by price
        const cryptoPrice = getCryptoPrice(asset.currency);
        if (cryptoPrice) {
          const valueInUSD = value * cryptoPrice;
          if (displayCurrency === 'USD') {
            return total + valueInUSD;
          }
          return total + convert(valueInUSD, 'USD', displayCurrency);
        }
        return total; // Can't convert without price
      }

      // For fiat currencies
      if (asset.currency === displayCurrency) {
        return total + value;
      }
      // Convert to display currency
      const converted = convert(value, asset.currency, displayCurrency);
      return total + converted;
    }, 0);
  };

  const totalInDisplayCurrency = calculateTotalInDisplayCurrency();

  return (
    <div>
      <Link
        href="/portfolios"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Portfolios
      </Link>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{portfolio.name}</h1>
            {portfolio.description && (
              <p className="text-gray-600 mt-1 text-sm sm:text-base">{portfolio.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm text-gray-500">
              {!portfolio.isOwner && (
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md">
                  Shared by {portfolio.user.name}
                </span>
              )}
              <span>Created {formatDate(portfolio.createdAt)}</span>
            </div>
          </div>
          <div className="text-left sm:text-right flex-shrink-0">
            <div className="flex items-center gap-2 sm:justify-end">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {formatCurrency(totalInDisplayCurrency, displayCurrency)}
              </p>
              <button
                onClick={() => fetchRates('USD')}
                disabled={ratesLoading}
                className="p-1 hover:bg-gray-100 rounded"
                title="Refresh rates"
              >
                <RefreshCw className={`h-4 w-4 text-gray-400 ${ratesLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">Total Value in {displayCurrency}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-6 pt-6 border-t">
          {canEdit && (
            <Link
              href={`/portfolios/${portfolioId}/assets/new`}
              className="btn btn-primary text-sm sm:text-base py-2 px-3 sm:px-4"
            >
              <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Add</span> Asset
            </Link>
          )}
          {portfolio.isOwner && (
            <>
              <Link
                href={`/portfolios/${portfolioId}/share`}
                className="btn btn-outline text-sm sm:text-base py-2 px-3 sm:px-4"
              >
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                <span className="hidden sm:inline">Share</span>
              </Link>
              <Link
                href={`/portfolios/${portfolioId}/edit`}
                className="btn btn-outline text-sm sm:text-base py-2 px-3 sm:px-4"
              >
                <Edit className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn btn-outline text-red-600 hover:bg-red-50 text-sm sm:text-base py-2 px-3 sm:px-4"
              >
                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Assets */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assets</h2>
        {portfolio.assets.length === 0 ? (
          <div className="text-center py-12">
            <PiggyBank className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No assets in this portfolio</p>
            {canEdit && (
              <Link
                href={`/portfolios/${portfolioId}/assets/new`}
                className="btn btn-primary"
              >
                Add Your First Asset
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {portfolio.assets.map((asset) => (
              <AssetRow
                key={asset.id}
                asset={asset}
                canEdit={canEdit}
                onDelete={() => handleDeleteAsset(asset.id)}
                displayCurrency={displayCurrency}
                convert={convert}
                getCryptoPrice={getCryptoPrice}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Portfolio
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{portfolio.name}&quot;? This will
              also delete all assets and shares. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn btn-danger flex-1"
              >
                {isDeleting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AssetRow({
  asset,
  canEdit,
  onDelete,
  displayCurrency,
  convert,
  getCryptoPrice,
}: {
  asset: Asset;
  canEdit: boolean;
  onDelete: () => void;
  displayCurrency: string;
  convert: (amount: number, from: string, to: string) => number;
  getCryptoPrice: (symbol: string) => number | null;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = ASSET_ICONS[asset.type];
  const needsUpdate = isOlderThan3Months(asset.updatedAt);

  // Check if this is a crypto asset
  const isCrypto = asset.type === AssetType.CRYPTO;
  const cryptoSymbols = ['BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE'];
  const isCryptoCurrency = cryptoSymbols.includes(asset.currency);

  // Calculate converted value
  const getConvertedValue = () => {
    const value = Number(asset.value);

    if (isCrypto && isCryptoCurrency) {
      // For crypto: value is the amount of crypto, convert to display currency
      const cryptoPrice = getCryptoPrice(asset.currency);
      if (cryptoPrice) {
        const valueInUSD = value * cryptoPrice;
        if (displayCurrency === 'USD') {
          return valueInUSD;
        }
        return convert(valueInUSD, 'USD', displayCurrency);
      }
      return null;
    }

    // For fiat currencies
    if (asset.currency === displayCurrency) {
      return null; // No conversion needed
    }
    return convert(value, asset.currency, displayCurrency);
  };

  const convertedValue = getConvertedValue();

  return (
    <div className={`py-4 ${needsUpdate ? 'bg-red-50 -mx-4 sm:-mx-6 px-4 sm:px-6 rounded-lg' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        {/* Asset Info */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-gray-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 truncate">{asset.name}</p>
            <p className="text-xs sm:text-sm text-gray-500">
              {ASSET_TYPE_LABELS[asset.type]}
            </p>
          </div>
        </div>

        {/* Value and Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-[52px] sm:pl-0">
          <div className="text-left sm:text-right min-w-0">
            {isCrypto && isCryptoCurrency ? (
              // Crypto display: "1 BTC ($70,000 USD)"
              <div>
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  {Number(asset.value).toLocaleString(undefined, { maximumFractionDigits: 8 })} {asset.currency}
                </p>
                {convertedValue !== null && (
                  <p className="text-xs sm:text-sm text-gray-500">
                    ≈ {formatCurrency(convertedValue, displayCurrency)}
                  </p>
                )}
              </div>
            ) : (
              // Fiat display: "100 ILS ($32 USD)"
              <div>
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  {formatCurrency(Number(asset.value), asset.currency)}
                </p>
                {convertedValue !== null && (
                  <p className="text-xs sm:text-sm text-gray-500">
                    ≈ {formatCurrency(convertedValue, displayCurrency)}
                  </p>
                )}
              </div>
            )}
            {/* Last Updated */}
            <div className={`flex items-center gap-1 text-xs mt-1 ${needsUpdate ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
              {needsUpdate ? (
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
              ) : (
                <Clock className="h-3 w-3 flex-shrink-0" />
              )}
              <span className="truncate">
                {needsUpdate ? 'Update needed: ' : 'Updated '}
                {formatRelativeTime(asset.updatedAt)}
              </span>
            </div>
          </div>
          {canEdit && (
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border z-20 py-1 min-w-[120px]">
                    <Link
                      href={`/assets/${asset.id}/edit`}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete();
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Warning banner for outdated assets */}
      {needsUpdate && canEdit && (
        <div className="mt-2 pl-[52px] sm:pl-14">
          <Link
            href={`/assets/${asset.id}/edit`}
            className="inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-800 font-medium"
          >
            <Edit className="h-3 w-3" />
            Click to update value
          </Link>
        </div>
      )}
    </div>
  );
}
