"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { portfoliosApi, assetsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useCurrencyStore } from "@/store/currency";
import {
  Portfolio,
  Asset,
  AssetType,
  ASSET_TYPE_LABELS,
  Permission,
} from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
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
  Wallet,
} from "lucide-react";
import {
  PageTransition,
  AnimatedList,
  AnimatedListItem,
  Floating,
} from "@/components/animations";

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

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
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
  const {
    convert,
    getCryptoPrice,
    fetchRates,
    rates,
    isLoading: ratesLoading,
  } = useCurrencyStore();
  const displayCurrency = user?.displayCurrency || "USD";

  const portfolioId = typeof params.id === "string" ? params.id : "";

  // Fetch rates on mount if needed
  useEffect(() => {
    if (!rates) {
      fetchRates("USD");
    }
  }, [rates, fetchRates]);

  useEffect(() => {
    if (!portfolioId) {
      router.replace("/portfolios");
      return;
    }

    const fetchPortfolio = async () => {
      try {
        const response = await portfoliosApi.getOne(portfolioId);
        setPortfolio(response.data);
      } catch (error) {
        console.error("Failed to fetch portfolio:", error);
        router.push("/portfolios");
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
      router.push("/portfolios");
    } catch (error) {
      console.error("Failed to delete portfolio:", error);
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
          : null,
      );
    } catch (error) {
      console.error("Failed to delete asset:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 text-pineapple" />
        </motion.div>
      </div>
    );
  }

  if (!portfolio) {
    return null;
  }

  const canEdit = portfolio.isOwner || portfolio.permission === Permission.EDIT;

  // Crypto symbols for detection
  const cryptoSymbols = [
    "BTC",
    "ETH",
    "USDT",
    "BNB",
    "XRP",
    "ADA",
    "SOL",
    "DOGE",
  ];

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
          if (displayCurrency === "USD") {
            return total + valueInUSD;
          }
          return total + convert(valueInUSD, "USD", displayCurrency);
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
    <PageTransition>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/portfolios"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <motion.div
            whileHover={{ x: -4 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
          </motion.div>
          Back to Portfolios
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="card mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <motion.div
              className="icon-container-primary hidden sm:flex"
              whileHover={{ rotate: 5, scale: 1.05 }}
            >
              <Wallet className="h-6 w-6 text-pineapple" />
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                {portfolio.name}
              </h1>
              {portfolio.description && (
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  {portfolio.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm text-gray-500">
                {!portfolio.isOwner && (
                  <motion.span
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="px-2 py-1 bg-blue-50/80 backdrop-blur-sm text-blue-600 rounded-lg border border-blue-100/50"
                  >
                    Shared by {portfolio.user.name}
                  </motion.span>
                )}
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  Created {formatDate(portfolio.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right flex-shrink-0">
            <div className="flex items-center gap-2 sm:justify-end">
              <motion.p
                className="text-2xl sm:text-3xl font-bold text-gray-900"
                key={totalInDisplayCurrency}
                initial={{ scale: 0.95, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {formatCurrency(totalInDisplayCurrency, displayCurrency)}
              </motion.p>
              <motion.button
                onClick={() => fetchRates("USD")}
                disabled={ratesLoading}
                whileHover={{ rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                title="Refresh rates"
              >
                <RefreshCw
                  className={`h-4 w-4 text-gray-400 ${ratesLoading ? "animate-spin" : ""}`}
                />
              </motion.button>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              Total Value in {displayCurrency}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-6 pt-6 border-t border-white/40">
          {canEdit && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={`/portfolios/${portfolioId}/assets/new`}
                className="btn btn-primary text-sm sm:text-base py-2 px-3 sm:px-4"
              >
                <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Add</span> Asset
              </Link>
            </motion.div>
          )}
          {portfolio.isOwner && (
            <>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={`/portfolios/${portfolioId}/share`}
                  className="btn btn-outline text-sm sm:text-base py-2 px-3 sm:px-4"
                >
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Share</span>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={`/portfolios/${portfolioId}/edit`}
                  className="btn btn-outline text-sm sm:text-base py-2 px-3 sm:px-4"
                >
                  <Edit className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Edit</span>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn btn-outline text-red-600 hover:bg-red-50/50 text-sm sm:text-base py-2 px-3 sm:px-4"
                >
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>

      {/* Assets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="card"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assets</h2>
        {portfolio.assets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <Floating>
              <div className="empty-state-icon mx-auto">
                <PiggyBank className="h-10 w-10 text-gray-400" />
              </div>
            </Floating>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No assets yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Add your first asset to start tracking this portfolio
            </p>
            {canEdit && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={`/portfolios/${portfolioId}/assets/new`}
                  className="btn btn-primary inline-flex"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Your First Asset
                </Link>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <AnimatedList className="divide-y divide-white/40">
            {portfolio.assets.map((asset, index) => (
              <AnimatedListItem key={asset.id}>
                <AssetRow
                  asset={asset}
                  canEdit={canEdit}
                  onDelete={() => handleDeleteAsset(asset.id)}
                  displayCurrency={displayCurrency}
                  convert={convert}
                  getCryptoPrice={getCryptoPrice}
                  index={index}
                />
              </AnimatedListItem>
            ))}
          </AnimatedList>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-red-50/80 backdrop-blur-sm border border-red-100/50 flex items-center justify-center">
                <Trash2 className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Delete Portfolio
              </h3>
              <p className="text-gray-600 mb-6 text-center">
                Are you sure you want to delete &quot;{portfolio.name}&quot;?
                This will also delete all assets and shares. This action cannot
                be undone.
              </p>
              <div className="flex gap-3">
                <motion.button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-danger flex-1"
                >
                  {isDeleting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Loader2 className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    "Delete"
                  )}
                </motion.button>
                <motion.button
                  onClick={() => setShowDeleteConfirm(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
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
  index?: number;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = ASSET_ICONS[asset.type];
  const needsUpdate = isOlderThan3Months(asset.updatedAt);

  // Check if this is a crypto asset
  const isCrypto = asset.type === AssetType.CRYPTO;
  const cryptoSymbols = [
    "BTC",
    "ETH",
    "USDT",
    "BNB",
    "XRP",
    "ADA",
    "SOL",
    "DOGE",
  ];
  const isCryptoCurrency = cryptoSymbols.includes(asset.currency);

  // Calculate converted value
  const getConvertedValue = () => {
    const value = Number(asset.value);

    if (isCrypto && isCryptoCurrency) {
      // For crypto: value is the amount of crypto, convert to display currency
      const cryptoPrice = getCryptoPrice(asset.currency);
      if (cryptoPrice) {
        const valueInUSD = value * cryptoPrice;
        if (displayCurrency === "USD") {
          return valueInUSD;
        }
        return convert(valueInUSD, "USD", displayCurrency);
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
    <motion.div
      className={needsUpdate ? "asset-row-warning" : "asset-row"}
      whileHover={{
        backgroundColor: needsUpdate ? undefined : "rgba(255, 255, 255, 0.5)",
      }}
    >
      <div className="flex flex-row sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        {/* Asset Info */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <motion.div
            className={`icon-container-sm ${needsUpdate ? "bg-red-50/80 border-red-100/50" : ""}`}
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Icon
              className={`h-5 w-5 ${needsUpdate ? "text-red-600" : "text-gray-600"}`}
            />
          </motion.div>
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
                  {Number(asset.value).toLocaleString(undefined, {
                    maximumFractionDigits: 8,
                  })}{" "}
                  {asset.currency}
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
            <motion.div
              className={`flex items-center gap-1 text-xs mt-1 ${needsUpdate ? "text-red-600 font-medium" : "text-gray-400"}`}
              initial={needsUpdate ? { scale: 1 } : undefined}
              animate={needsUpdate ? { scale: [1, 1.02, 1] } : undefined}
              transition={
                needsUpdate ? { duration: 2, repeat: Infinity } : undefined
              }
            >
              {needsUpdate ? (
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
              ) : (
                <Clock className="h-3 w-3 flex-shrink-0" />
              )}
              <span className="truncate">
                {needsUpdate ? "Update needed: " : "Updated "}
                {formatRelativeTime(asset.updatedAt)}
              </span>
            </motion.div>
          </div>
          {canEdit && (
            <div className="relative flex-shrink-0">
              <motion.button
                onClick={() => setShowMenu(!showMenu)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </motion.button>
              <AnimatePresence>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 bg-white/90 backdrop-blur-xl rounded-xl shadow-glass-prominent border border-white/50 z-20 py-1 min-w-[120px] overflow-hidden"
                    >
                      <Link
                        href={`/assets/${asset.id}/edit`}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/50 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onDelete();
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50/50 w-full transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Warning banner for outdated assets */}
      {needsUpdate && canEdit && (
        <motion.div
          className="mt-2 pl-[52px] sm:pl-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href={`/assets/${asset.id}/edit`}
            className="inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-800 font-medium group"
          >
            <motion.div whileHover={{ rotate: 15 }}>
              <Edit className="h-3 w-3" />
            </motion.div>
            Click to update value
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}
