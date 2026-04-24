"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { netWorthHistoryApi } from "@/lib/api";
import { NetWorthDataPoint } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { AnimatedCard, GlassSkeleton } from "@/components/animations";

const TIME_RANGES = [
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "180D", days: 180 },
  { label: "1Y", days: 365 },
];

interface Props {
  currency: string;
}

function formatXAxisDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function NetWorthChart({ currency }: Props) {
  const [days, setDays] = useState<30 | 90 | 180 | 365>(30);
  const [data, setData] = useState<NetWorthDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    netWorthHistoryApi
      .getHistory(days, currency)
      .then((res) => {
        if (!cancelled) {
          setData(res.data.data || []);
        }
      })
      .catch(() => {
        if (!cancelled) setData([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days, currency]);

  return (
    <AnimatedCard delay={0.5} className="card mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Net Worth Over Time
        </h2>
        <div className="flex gap-1">
          {TIME_RANGES.map((range) => (
            <motion.button
              key={range.days}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDays(range.days as 30 | 90 | 180 | 365)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                days === range.days
                  ? "bg-pineapple text-white shadow-sm"
                  : "bg-white/40 text-gray-600 hover:bg-white/60"
              }`}
            >
              {range.label}
            </motion.button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <GlassSkeleton className="h-64 rounded-2xl" />
      ) : data.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 text-gray-400">
          <TrendingUp className="h-10 w-10 opacity-40" />
          <p className="text-sm">
            No history yet — data appears after midnight
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F7B500" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#F7B500" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="colorLiabilities"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#FF8A65" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#FF8A65" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxisDate}
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatCurrency(v, currency)}
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(31, 38, 135, 0.1)",
              }}
              formatter={(value: number, name: string) => [
                formatCurrency(value, currency),
                name === "netWorth"
                  ? "Net Worth"
                  : name === "totalAssets"
                    ? "Total Assets"
                    : "Total Liabilities",
              ]}
              labelFormatter={formatXAxisDate}
            />
            <Area
              type="monotone"
              dataKey="totalAssets"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#colorAssets)"
              fillOpacity={1}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="totalLiabilities"
              stroke="#FF8A65"
              strokeWidth={2}
              fill="url(#colorLiabilities)"
              fillOpacity={1}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="netWorth"
              stroke="#F7B500"
              strokeWidth={2}
              fill="url(#colorNetWorth)"
              fillOpacity={1}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      {!isLoading && data.length > 0 && (
        <div className="flex gap-4 mt-3 justify-center">
          {[
            { color: "#F7B500", label: "Net Worth" },
            { color: "#10B981", label: "Assets" },
            { color: "#FF8A65", label: "Liabilities" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-gray-500">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </AnimatedCard>
  );
}
