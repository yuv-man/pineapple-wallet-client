"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { currencyApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { AssetType, ASSET_TYPE_LABELS } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Wallet,
  TrendingUp,
  PlusCircle,
  Loader2,
  Home,
  Landmark,
  Bitcoin,
  PiggyBank,
  ArrowRight,
  RefreshCw,
  Globe,
  CreditCard,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  PageTransition,
  AnimatedCard,
  AnimatedList,
  AnimatedListItem,
} from "@/components/animations";
import { NetWorthChart } from "@/components/NetWorthChart";

const COLORS = ["#F7B500", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"];

const ASSET_ICONS: Record<AssetType, React.ElementType> = {
  [AssetType.BANK_ACCOUNT]: Landmark,
  [AssetType.REAL_ESTATE]: Home,
  [AssetType.CRYPTO]: Bitcoin,
  [AssetType.STOCK]: TrendingUp,
  [AssetType.INVESTMENT]: PiggyBank,
};

const POPULAR_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "ILS",
  "JPY",
  "CHF",
  "CAD",
  "AUD",
];

interface NetWorthData {
  totalNetWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  liabilityCount: number;
  currency: string;
  portfolioCount: number;
  assetCount: number;
  byType: Record<string, { count: number; totalValue: number }>;
  lastUpdated: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [netWorthData, setNetWorthData] = useState<NetWorthData | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState(
    user?.displayCurrency || "USD",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchNetWorth = async (currency: string, showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);

    try {
      const response = await currencyApi.getNetWorth(currency);
      setNetWorthData(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch net worth:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const currency = user?.displayCurrency || "USD";
    setSelectedCurrency(currency);
    fetchNetWorth(currency);
  }, [user?.displayCurrency]);

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    fetchNetWorth(currency, true);
  };

  const handleRefresh = () => {
    fetchNetWorth(selectedCurrency, true);
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

  const pieChartData = netWorthData?.byType
    ? Object.entries(netWorthData.byType).map(([type, data]) => ({
        name: ASSET_TYPE_LABELS[type as AssetType] || type,
        value: data.totalValue,
        type: type as AssetType,
      }))
    : [];

  return (
    <PageTransition>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600">Overview of your financial portfolio</p>
        </div>

        {/* Currency Selector */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 bg-white/50 backdrop-blur-md rounded-xl px-4 py-2
                     border border-white/50 shadow-glass-subtle"
        >
          <Globe className="h-5 w-5 text-gray-500" />
          <select
            value={selectedCurrency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-sm font-medium cursor-pointer"
            disabled={isRefreshing}
          >
            {POPULAR_CURRENCIES.map((curr) => (
              <option key={curr} value={curr}>
                {curr}
              </option>
            ))}
          </select>
          <motion.button
            onClick={handleRefresh}
            disabled={isRefreshing}
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
            title="Refresh rates"
          >
            <RefreshCw
              className={`h-4 w-4 text-gray-500 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Net Worth Card - Highlighted */}
        <AnimatedListItem>
          <motion.div
            whileHover={{ y: -4 }}
            className="stat-card-highlight group"
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="icon-container-primary"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <TrendingUp className="h-6 w-6 text-pineapple-dark" />
              </motion.div>
              <div>
                <p className="text-sm text-gray-600">Net Worth</p>
                <motion.p
                  className="text-2xl font-bold text-gray-900"
                  key={netWorthData?.totalNetWorth}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {isRefreshing ? (
                    <span className="opacity-50">Updating...</span>
                  ) : (
                    formatCurrency(
                      netWorthData?.totalNetWorth || 0,
                      selectedCurrency,
                    )
                  )}
                </motion.p>
                <p className="text-xs text-gray-500">Assets − Liabilities</p>
              </div>
            </div>
          </motion.div>
        </AnimatedListItem>

        {/* Portfolios Card */}
        <AnimatedListItem>
          <motion.div
            whileHover={{ y: -4 }}
            className="stat-card"
            onClick={() => router.push("/portfolios")}
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="icon-container bg-blue-50/80 border-blue-100/50"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Wallet className="h-6 w-6 text-blue-600" />
              </motion.div>
              <div>
                <p className="text-sm text-gray-500">Portfolios</p>
                <p className="text-2xl font-bold text-gray-900">
                  {netWorthData?.portfolioCount || 0}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatedListItem>

        {/* Assets Card */}
        <AnimatedListItem>
          <motion.div whileHover={{ y: -4 }} className="stat-card">
            <div className="flex items-center gap-4">
              <motion.div
                className="icon-container bg-green-50/80 border-green-100/50"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <PiggyBank className="h-6 w-6 text-green-600" />
              </motion.div>
              <div>
                <p className="text-sm text-gray-500">Total Assets</p>
                <p className="text-2xl font-bold text-gray-900">
                  {netWorthData?.assetCount || 0}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatedListItem>

        {/* Liabilities Card */}
        <AnimatedListItem>
          <motion.div
            whileHover={{ y: -4 }}
            className="stat-card cursor-pointer"
            onClick={() => router.push("/liabilities")}
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="icon-container bg-red-50/80 border-red-100/50"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <CreditCard className="h-6 w-6 text-red-500" />
              </motion.div>
              <div>
                <p className="text-sm text-gray-500">Total Liabilities</p>
                <motion.p
                  className="text-2xl font-bold text-gray-900"
                  key={netWorthData?.totalLiabilities}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {isRefreshing ? (
                    <span className="opacity-50">Updating...</span>
                  ) : (
                    formatCurrency(
                      netWorthData?.totalLiabilities || 0,
                      selectedCurrency,
                    )
                  )}
                </motion.p>
                <p className="text-xs text-gray-500">
                  {netWorthData?.liabilityCount || 0} debt(s)
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatedListItem>
      </AnimatedList>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Asset Allocation Chart */}
        <AnimatedCard delay={0.3} className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Asset Allocation ({selectedCurrency})
          </h2>
          {pieChartData.length > 0 ? (
            <motion.div
              className="h-64"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1000}
                  >
                    {pieChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        className="drop-shadow-sm"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      formatCurrency(value, selectedCurrency)
                    }
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.5)",
                      borderRadius: "12px",
                      boxShadow: "0 8px 32px rgba(31, 38, 135, 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="empty-state-icon">
                <PiggyBank className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          )}
          {/* Legend */}
          <motion.div
            className="mt-4 grid grid-cols-2 gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {pieChartData.map((item, index) => (
              <motion.div
                key={item.type}
                className="flex items-center gap-2"
                whileHover={{ x: 4 }}
              >
                <div
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-600">{item.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </AnimatedCard>

        {/* Quick Actions */}
        <AnimatedCard delay={0.4} className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            {[
              {
                href: "/portfolios/new",
                icon: PlusCircle,
                iconBg: "bg-pineapple/10",
                iconColor: "text-pineapple",
                title: "Create Portfolio",
                desc: "Start tracking a new set of assets",
              },
              {
                href: "/portfolios",
                icon: Wallet,
                iconBg: "bg-blue-50/80",
                iconColor: "text-blue-600",
                title: "View Portfolios",
                desc: "Manage your existing portfolios",
              },
              {
                href: "/liabilities/new",
                icon: CreditCard,
                iconBg: "bg-red-50/80",
                iconColor: "text-red-500",
                title: "Add Liability",
                desc: "Track a debt or loan",
              },
              {
                href: "/invitations",
                icon: TrendingUp,
                iconBg: "bg-purple-50/80",
                iconColor: "text-purple-600",
                title: "Check Invitations",
                desc: "See portfolios shared with you",
              },
            ].map((action, index) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Link href={action.href} className="action-link group">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className={`icon-container-sm ${action.iconBg}`}
                      whileHover={{ rotate: 5, scale: 1.05 }}
                    >
                      <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                    </motion.div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {action.title}
                      </p>
                      <p className="text-sm text-gray-500">{action.desc}</p>
                    </div>
                  </div>
                  <motion.div
                    className="text-gray-400 group-hover:text-pineapple transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>
      </div>

      {/* Net Worth History Chart */}
      <NetWorthChart currency={selectedCurrency} />

      {/* Asset Type Summary */}
      {netWorthData?.byType && Object.keys(netWorthData.byType).length > 0 && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Assets by Type ({selectedCurrency})
          </h2>
          <AnimatedList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Object.entries(netWorthData.byType).map(([type, data]) => {
              const Icon = ASSET_ICONS[type as AssetType] || PiggyBank;
              return (
                <AnimatedListItem key={type}>
                  <motion.div className="stat-card" whileHover={{ y: -4 }}>
                    <div className="flex items-center gap-3 mb-2">
                      <motion.div whileHover={{ scale: 1.1 }}>
                        <Icon className="h-5 w-5 text-gray-600" />
                      </motion.div>
                      <span className="text-sm text-gray-600 truncate">
                        {ASSET_TYPE_LABELS[type as AssetType] || type}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 truncate">
                      {formatCurrency(data.totalValue, selectedCurrency)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {data.count} asset(s)
                    </p>
                  </motion.div>
                </AnimatedListItem>
              );
            })}
          </AnimatedList>
        </motion.div>
      )}

      {/* Last Updated */}
      <AnimatePresence>
        {lastUpdated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 text-center text-sm text-gray-400"
          >
            Rates last updated: {lastUpdated.toLocaleTimeString()}
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
