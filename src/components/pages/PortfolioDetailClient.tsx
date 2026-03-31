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
import { cn, formatCurrency, formatDate } from "@/lib/utils";
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
  AlertCircle,
  RefreshCw,
  Wallet,
  Eye,
  X,
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

function formatLongDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

/** Rates + UI use uppercase tickers; asset.currency from API may be lowercase. */
const CRYPTO_TICKERS = [
  "BTC",
  "ETH",
  "USDT",
  "BNB",
  "XRP",
  "ADA",
  "SOL",
  "DOGE",
] as const;

function cryptoTickerUpper(currency: string | undefined): string {
  return (currency ?? "").toUpperCase();
}

function isKnownCryptoTicker(currency: string | undefined): boolean {
  const c = cryptoTickerUpper(currency);
  return (CRYPTO_TICKERS as readonly string[]).includes(c);
}

const ASSET_ICONS: Record<AssetType, React.ElementType> = {
  [AssetType.BANK_ACCOUNT]: Landmark,
  [AssetType.REAL_ESTATE]: Home,
  [AssetType.CRYPTO]: Bitcoin,
  [AssetType.STOCK]: TrendingUp,
  [AssetType.INVESTMENT]: PiggyBank,
};

// Pastel colors for each asset type
const ASSET_TYPE_COLORS: Record<
  AssetType,
  { bg: string; border: string; text: string; icon: string }
> = {
  [AssetType.BANK_ACCOUNT]: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    icon: "text-purple-500",
  },
  [AssetType.REAL_ESTATE]: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    icon: "text-rose-500",
  },
  [AssetType.CRYPTO]: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: "text-amber-500",
  },
  [AssetType.STOCK]: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    icon: "text-orange-500",
  },
  [AssetType.INVESTMENT]: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    icon: "text-violet-500",
  },
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

  // Calculate total in user's display currency
  const calculateTotalInDisplayCurrency = () => {
    if (!portfolio.assets.length) return 0;

    return portfolio.assets.reduce((total, asset) => {
      const value = Number(asset.value);
      const isCrypto = asset.type === AssetType.CRYPTO;
      const ticker = cryptoTickerUpper(asset.currency);
      const isCryptoCurrency = isKnownCryptoTicker(asset.currency);

      if (isCrypto && isCryptoCurrency) {
        // For crypto: value is amount of crypto, multiply by price
        const cryptoPrice = getCryptoPrice(ticker);
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
        className="mb-2"
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
          <AnimatedList className="flex flex-col gap-3">
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
  const [showActionModal, setShowActionModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const Icon = ASSET_ICONS[asset.type];
  const colors = ASSET_TYPE_COLORS[asset.type];
  const needsUpdate = isOlderThan3Months(asset.updatedAt);

  const isCrypto = asset.type === AssetType.CRYPTO;
  const ticker = cryptoTickerUpper(asset.currency);
  const isCryptoCurrency = isKnownCryptoTicker(asset.currency);

  // Calculate converted value
  const getConvertedValue = () => {
    const value = Number(asset.value);

    if (isCrypto && isCryptoCurrency) {
      const cryptoPrice = getCryptoPrice(ticker);
      if (cryptoPrice) {
        const valueInUSD = value * cryptoPrice;
        if (displayCurrency === "USD") {
          return valueInUSD;
        }
        return convert(valueInUSD, "USD", displayCurrency);
      }
      return null;
    }

    if (asset.currency === displayCurrency) {
      return null;
    }
    return convert(value, asset.currency, displayCurrency);
  };

  const convertedValue = getConvertedValue();

  return (
    <>
      {/* Clickable Asset Row */}
      <motion.div
        onClick={() => setShowActionModal(true)}
        className={cn(
          "flex items-center gap-4 rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200",
          needsUpdate
            ? "border-red-300 bg-red-50"
            : `${colors.bg} ${colors.border}`,
          "hover:shadow-md",
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Icon */}
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-1",
            needsUpdate
              ? "bg-red-100 border-red-200"
              : "bg-white border-gray-200",
          )}
        >
          <Icon
            className={cn(
              "h-6 w-6",
              needsUpdate ? "text-red-500" : colors.icon,
            )}
          />
        </div>

        {/* Asset Details (Left) */}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 truncate">{asset.name}</p>
          <p
            className={cn(
              "text-sm",
              needsUpdate ? "text-red-600" : colors.text,
            )}
          >
            {ASSET_TYPE_LABELS[asset.type]}
          </p>
          <p
            className={cn(
              "text-xs mt-1",
              needsUpdate ? "text-red-500 font-medium" : "text-gray-400",
            )}
          >
            {needsUpdate && (
              <AlertCircle className="inline-block h-3 w-3 mr-1" />
            )}
            Updated {formatLongDate(asset.updatedAt)}
          </p>
        </div>

        {/* Amount (Right) */}
        <div className="shrink-0 text-right">
          {isCrypto && isCryptoCurrency ? (
            <>
              <p className="text-lg font-bold tabular-nums text-gray-900">
                {Number(asset.value).toLocaleString(undefined, {
                  maximumFractionDigits: 8,
                })}{" "}
                {ticker}
              </p>
              {convertedValue !== null && (
                <p className="text-sm text-gray-500 tabular-nums">
                  ≈ {formatCurrency(convertedValue, displayCurrency)}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-lg font-bold tabular-nums text-gray-900">
                {formatCurrency(Number(asset.value), asset.currency)}
              </p>
              {convertedValue !== null && (
                <p className="text-sm text-gray-500 tabular-nums">
                  ≈ {formatCurrency(convertedValue, displayCurrency)}
                </p>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Action Modal */}
      <AnimatePresence>
        {showActionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={() => setShowActionModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Asset Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={cn("p-3 rounded-xl", colors.bg)}>
                  <Icon className={cn("h-6 w-6", colors.icon)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {asset.name}
                  </p>
                  <p className={cn("text-sm", colors.text)}>
                    {ASSET_TYPE_LABELS[asset.type]}
                  </p>
                </div>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setShowInfoModal(true);
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">View Details</p>
                    <p className="text-sm text-gray-500">
                      See all asset information
                    </p>
                  </div>
                </button>

                {canEdit && (
                  <>
                    <Link
                      href={`/assets/${asset.id}/edit`}
                      onClick={() => setShowActionModal(false)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Edit className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Edit Asset</p>
                        <p className="text-sm text-gray-500">
                          Update value or details
                        </p>
                      </div>
                    </Link>

                    <button
                      onClick={() => {
                        setShowActionModal(false);
                        onDelete();
                      }}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-red-50 hover:bg-red-100 transition-colors text-left"
                    >
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-red-600">Delete Asset</p>
                        <p className="text-sm text-red-400">
                          Remove from portfolio
                        </p>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={() => setShowInfoModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Asset Details
                </h3>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Asset Info */}
              <div className={cn("p-4 rounded-2xl mb-4", colors.bg)}>
                <div className="flex items-center gap-3">
                  <div className={cn("p-3 rounded-xl bg-white/60")}>
                    <Icon className={cn("h-6 w-6", colors.icon)} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{asset.name}</p>
                    <p className={cn("text-sm", colors.text)}>
                      {ASSET_TYPE_LABELS[asset.type]}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Value</span>
                  <span className="font-semibold text-gray-900">
                    {isCrypto && isCryptoCurrency
                      ? `${Number(asset.value).toLocaleString(undefined, { maximumFractionDigits: 8 })} ${ticker}`
                      : formatCurrency(Number(asset.value), asset.currency)}
                  </span>
                </div>
                {convertedValue !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Converted</span>
                    <span className="font-medium text-gray-700">
                      ≈ {formatCurrency(convertedValue, displayCurrency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Currency</span>
                  <span className="font-medium text-gray-700">
                    {asset.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated</span>
                  <span
                    className={cn(
                      "font-medium",
                      needsUpdate ? "text-red-600" : "text-gray-700",
                    )}
                  >
                    {formatLongDate(asset.updatedAt)}
                  </span>
                </div>
                {asset.notes && (
                  <div>
                    <span className="text-gray-500 block mb-1">Notes</span>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-xl text-sm">
                      {asset.notes}
                    </p>
                  </div>
                )}
              </div>

              {needsUpdate && (
                <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">
                      This asset needs an update
                    </span>
                  </div>
                  <p className="text-red-500 text-xs mt-1">
                    Last updated more than 3 months ago
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
