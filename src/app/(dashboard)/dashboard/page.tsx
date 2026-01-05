'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { currencyApi } from '@/lib/api';
import { AssetType, ASSET_TYPE_LABELS } from '@/types';
import { formatCurrency } from '@/lib/utils';
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
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const COLORS = ['#F7B500', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

const ASSET_ICONS: Record<AssetType, React.ElementType> = {
  [AssetType.BANK_ACCOUNT]: Landmark,
  [AssetType.REAL_ESTATE]: Home,
  [AssetType.CRYPTO]: Bitcoin,
  [AssetType.STOCK]: TrendingUp,
  [AssetType.INVESTMENT]: PiggyBank,
};

const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'BTC', 'ETH'];

interface NetWorthData {
  totalNetWorth: number;
  currency: string;
  portfolioCount: number;
  assetCount: number;
  byType: Record<string, { count: number; totalValue: number }>;
  lastUpdated: string;
}

export default function DashboardPage() {
  const [netWorthData, setNetWorthData] = useState<NetWorthData | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
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
      console.error('Failed to fetch net worth:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNetWorth(selectedCurrency);
  }, []);

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
        <Loader2 className="h-8 w-8 animate-spin text-pineapple" />
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your financial portfolio</p>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-gray-500" />
            <select
              value={selectedCurrency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="input py-2 pr-8 min-w-[100px]"
              disabled={isRefreshing}
            >
              {POPULAR_CURRENCIES.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn btn-outline p-2"
            title="Refresh rates"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pineapple/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-pineapple-dark" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Net Worth</p>
              <p className="text-2xl font-bold text-gray-900">
                {isRefreshing ? (
                  <span className="opacity-50">Updating...</span>
                ) : (
                  formatCurrency(netWorthData?.totalNetWorth || 0, selectedCurrency)
                )}
              </p>
              <p className="text-xs text-gray-500">
                in {selectedCurrency}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Portfolios</p>
              <p className="text-2xl font-bold text-gray-900">
                {netWorthData?.portfolioCount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <PiggyBank className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">
                {netWorthData?.assetCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Asset Allocation Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Asset Allocation ({selectedCurrency})
          </h2>
          {pieChartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, selectedCurrency)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No assets yet
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {pieChartData.map((item, index) => (
              <div key={item.type} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>
          </div>
          <div className="space-y-3">
            <Link
              href="/portfolios/new"
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-pineapple hover:bg-yellow-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <PlusCircle className="h-5 w-5 text-pineapple" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Create Portfolio</p>
                  <p className="text-sm text-gray-500">
                    Start tracking a new set of assets
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>

            <Link
              href="/portfolios"
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-pineapple hover:bg-yellow-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Portfolios</p>
                  <p className="text-sm text-gray-500">
                    Manage your existing portfolios
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>

            <Link
              href="/invitations"
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-pineapple hover:bg-yellow-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Check Invitations</p>
                  <p className="text-sm text-gray-500">
                    See portfolios shared with you
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Asset Type Summary */}
      {netWorthData?.byType && Object.keys(netWorthData.byType).length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Assets by Type ({selectedCurrency})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(netWorthData.byType).map(([type, data]) => {
              const Icon = ASSET_ICONS[type as AssetType] || PiggyBank;
              return (
                <div key={type} className="card">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {ASSET_TYPE_LABELS[type as AssetType] || type}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(data.totalValue, selectedCurrency)}
                  </p>
                  <p className="text-xs text-gray-500">{data.count} asset(s)</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <div className="mt-6 text-center text-sm text-gray-400">
          Rates last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
