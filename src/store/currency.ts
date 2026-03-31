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

        const fromU = from?.toUpperCase?.() ?? from;
        const toU = to?.toUpperCase?.() ?? to;

        if (fromU === toU) return amount;

        const cryptos = ['BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE'];
        const fromRate = rates.rates[fromU];
        const toRate = rates.rates[toU];

        if (cryptos.includes(fromU)) {
          if (!fromRate || !toRate) return amount;
          const cryptoPriceInBase = 1 / fromRate;
          const amountInBase = amount * cryptoPriceInBase;
          return amountInBase * toRate;
        }

        if (cryptos.includes(toU)) {
          if (!fromRate || !toRate) return amount;
          const amountInBase = amount / fromRate;
          return amountInBase * toRate;
        }

        if (!fromRate || !toRate) return amount;
        return (amount * toRate) / fromRate;
      },

      getCryptoPrice: (symbol: string, fiatCurrency = 'USD') => {
        const { rates } = get();
        if (!rates || !rates.rates) return 0;

        const key = symbol?.toUpperCase?.() ?? symbol;
        const cryptoRate = rates.rates[key];
        if (!cryptoRate) return 0;

        // cryptoRate is how much crypto you get for 1 base currency
        // So price of 1 crypto in base = 1 / cryptoRate
        const priceInBase = 1 / cryptoRate;

        const fiatU = fiatCurrency?.toUpperCase?.() ?? fiatCurrency;
        const baseU = rates.base?.toUpperCase?.() ?? rates.base;
        if (fiatU === baseU) {
          return priceInBase;
        }

        const fiatRate = rates.rates[fiatU];
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
