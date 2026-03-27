import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { currencyApi } from '@/lib/api';

interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
}

interface CurrencyState {
  rates: ExchangeRates | null;
  isLoading: boolean;
  error: string | null;
  lastFetchDate: string | null;
  fetchRates: (baseCurrency?: string) => Promise<void>;
  convert: (amount: number, from: string, to: string) => number;
  getCryptoPrice: (symbol: string, fiatCurrency?: string) => number;
  shouldRefresh: () => boolean;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      rates: null,
      isLoading: false,
      error: null,
      lastFetchDate: null,

      shouldRefresh: () => {
        const { lastFetchDate } = get();
        if (!lastFetchDate) return true;

        const lastFetch = new Date(lastFetchDate).getTime();
        const now = Date.now();
        return now - lastFetch > ONE_DAY_MS;
      },

      fetchRates: async (baseCurrency = 'USD') => {
        set({ isLoading: true, error: null });

        try {
          const response = await currencyApi.getExchangeRates(baseCurrency);
          set({
            rates: {
              ...response.data,
              lastUpdated: new Date().toISOString(),
            },
            lastFetchDate: new Date().toISOString(),
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch exchange rates',
            isLoading: false,
          });
        }
      },

      convert: (amount: number, from: string, to: string) => {
        const { rates } = get();
        if (!rates || !rates.rates) return amount;

        if (from === to) return amount;

        // If we have rates based on USD
        const fromRate = rates.rates[from];
        const toRate = rates.rates[to];

        if (!fromRate || !toRate) return amount;

        // Convert: amount in 'from' currency to 'to' currency
        // rates are relative to base (USD), so:
        // amount_in_USD = amount / fromRate (if fromRate is how much 1 USD = X from)
        // Actually, the backend returns rates where rate = 1 base / X currency
        // So to convert from A to B: amount * (toRate / fromRate)
        // But we need to understand the rate format first

        // Based on the backend code, rates[X] = how much X you get for 1 base currency
        // So to convert amount from A to B:
        // First convert A to base: amountInBase = amount / rates[A]
        // Then convert base to B: result = amountInBase * rates[B]
        // Combined: result = amount * rates[B] / rates[A]

        // But for crypto, the rate is inverted (1 / price)
        // Let's check if from or to is crypto
        const cryptos = ['BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE'];

        if (cryptos.includes(from)) {
          // Converting from crypto to fiat
          // fromRate is very small (e.g., 0.000023 for BTC meaning 1 USD = 0.000023 BTC)
          // So 1 BTC = 1 / 0.000023 USD
          const cryptoPriceInBase = 1 / fromRate;
          const amountInBase = amount * cryptoPriceInBase;
          return amountInBase * (toRate || 1);
        }

        if (cryptos.includes(to)) {
          // Converting from fiat to crypto
          // First get amount in base currency
          const amountInBase = amount / (fromRate || 1);
          // toRate is small (e.g., 0.000023), so multiply
          return amountInBase * toRate;
        }

        // Both are fiat
        return amount * toRate / fromRate;
      },

      getCryptoPrice: (symbol: string, fiatCurrency = 'USD') => {
        const { rates } = get();
        if (!rates || !rates.rates) return 0;

        const cryptoRate = rates.rates[symbol];
        if (!cryptoRate) return 0;

        // cryptoRate is how much crypto you get for 1 base currency
        // So price of 1 crypto in base = 1 / cryptoRate
        const priceInBase = 1 / cryptoRate;

        if (fiatCurrency === rates.base) {
          return priceInBase;
        }

        // Convert to target fiat
        const fiatRate = rates.rates[fiatCurrency];
        if (!fiatRate) return priceInBase;

        return priceInBase * fiatRate;
      },
    }),
    {
      name: 'pineapple-currency',
      partialize: (state) => ({
        rates: state.rates,
        lastFetchDate: state.lastFetchDate,
      }),
    }
  )
);
