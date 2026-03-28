'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { assetsApi } from '@/lib/api';
import { useCurrencyStore } from '@/store/currency';
import { Asset, AssetType, ASSET_TYPE_LABELS } from '@/types';
import { ArrowLeft, Loader2, RefreshCw, Home, Landmark, Bitcoin, TrendingUp, PiggyBank } from 'lucide-react';
import { PageTransition } from '@/components/animations';

const ASSET_ICONS: Record<AssetType, React.ElementType> = {
  [AssetType.BANK_ACCOUNT]: Landmark,
  [AssetType.REAL_ESTATE]: Home,
  [AssetType.CRYPTO]: Bitcoin,
  [AssetType.STOCK]: TrendingUp,
  [AssetType.INVESTMENT]: PiggyBank,
};

const assetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  value: z.number().min(0, 'Value must be positive'),
  currency: z.string(),
  notes: z.string().max(1000).optional(),
  details: z.record(z.any()).optional(),
});

type AssetForm = z.infer<typeof assetSchema>;

const FIAT_CURRENCIES = ['USD', 'EUR', 'GBP', 'ILS', 'JPY', 'CHF', 'CAD', 'AUD'];
const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE'];

export default function EditAssetClient() {
  const params = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Crypto-specific state
  const [cryptoInputMode, setCryptoInputMode] = useState<'crypto' | 'fiat'>('crypto');
  const [cryptoAmount, setCryptoAmount] = useState<string>('');
  const [fiatValue, setFiatValue] = useState<string>('');
  const [selectedCryptoSymbol, setSelectedCryptoSymbol] = useState<string>('BTC');
  const [selectedFiatCurrency, setSelectedFiatCurrency] = useState<string>('USD');

  const { getCryptoPrice, rates, fetchRates, isLoading: ratesLoading } = useCurrencyStore();

  const assetId = params.id as string;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AssetForm>({
    resolver: zodResolver(assetSchema),
  });

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const response = await assetsApi.getOne(assetId);
        const assetData = response.data;
        setAsset(assetData);
        setValue('name', assetData.name);
        setValue('value', Number(assetData.value));
        setValue('currency', assetData.currency);
        setValue('notes', assetData.notes || '');
        setValue('details', assetData.details || {});

        // Initialize crypto fields if this is a crypto asset
        if (assetData.type === AssetType.CRYPTO) {
          const details = assetData.details || {};
          setSelectedCryptoSymbol(details.symbol || 'BTC');
          setCryptoAmount(String(details.quantity || ''));
          setFiatValue(String(Number(assetData.value) || ''));
          setSelectedFiatCurrency(assetData.currency || 'USD');
        }
      } catch {
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    fetchAsset();
  }, [assetId, router, setValue]);

  // Auto-convert between crypto and fiat for crypto assets
  useEffect(() => {
    if (!asset || asset.type !== AssetType.CRYPTO || !rates) return;

    const cryptoPrice = getCryptoPrice(selectedCryptoSymbol, selectedFiatCurrency);
    if (cryptoPrice <= 0) return;

    if (cryptoInputMode === 'crypto' && cryptoAmount) {
      const amount = parseFloat(cryptoAmount);
      if (!isNaN(amount)) {
        const calculatedFiat = amount * cryptoPrice;
        setFiatValue(calculatedFiat.toFixed(2));
        setValue('value', calculatedFiat);
        setValue('currency', selectedFiatCurrency);
        setValue('details.quantity', amount);
        setValue('details.symbol', selectedCryptoSymbol);
      }
    } else if (cryptoInputMode === 'fiat' && fiatValue) {
      const fiat = parseFloat(fiatValue);
      if (!isNaN(fiat)) {
        const calculatedCrypto = fiat / cryptoPrice;
        setCryptoAmount(calculatedCrypto.toFixed(8));
        setValue('value', fiat);
        setValue('currency', selectedFiatCurrency);
        setValue('details.quantity', calculatedCrypto);
        setValue('details.symbol', selectedCryptoSymbol);
      }
    }
  }, [cryptoInputMode, cryptoAmount, fiatValue, selectedCryptoSymbol, selectedFiatCurrency, rates, getCryptoPrice, setValue, asset]);

  const onSubmit = async (data: AssetForm) => {
    setIsSaving(true);
    setError(null);

    try {
      await assetsApi.update(assetId, data);
      router.push(`/portfolios/${asset?.portfolioId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update asset');
    } finally {
      setIsSaving(false);
    }
  };

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

  if (!asset) {
    return null;
  }

  const AssetIcon = ASSET_ICONS[asset.type as AssetType] || PiggyBank;

  return (
    <PageTransition>
      <div className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href={`/portfolios/${asset.portfolioId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 group"
          >
            <motion.div whileHover={{ x: -4 }} transition={{ type: 'spring', stiffness: 400 }}>
              <ArrowLeft className="h-4 w-4 mr-2" />
            </motion.div>
            Back to Portfolio
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="card"
        >
          <div className="mb-6 flex items-center gap-4">
            <motion.div
              className="icon-container-primary"
              whileHover={{ rotate: 5, scale: 1.05 }}
            >
              <AssetIcon className="h-6 w-6 text-pineapple" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Edit Asset
              </h1>
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-block mt-1 px-2 py-0.5 bg-pineapple/10 text-pineapple-dark rounded-lg text-sm font-medium"
              >
                {ASSET_TYPE_LABELS[asset.type as AssetType]}
              </motion.span>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label htmlFor="name" className="label">
                Asset Name
              </label>
              <input
                id="name"
                type="text"
                className="input mt-1"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </motion.div>

            {/* Crypto-specific value input */}
            {asset.type === AssetType.CRYPTO ? (
              <CryptoValueInput
                cryptoInputMode={cryptoInputMode}
                setCryptoInputMode={setCryptoInputMode}
                cryptoAmount={cryptoAmount}
                setCryptoAmount={setCryptoAmount}
                fiatValue={fiatValue}
                setFiatValue={setFiatValue}
                selectedCryptoSymbol={selectedCryptoSymbol}
                setSelectedCryptoSymbol={setSelectedCryptoSymbol}
                selectedFiatCurrency={selectedFiatCurrency}
                setSelectedFiatCurrency={setSelectedFiatCurrency}
                getCryptoPrice={getCryptoPrice}
                fetchRates={fetchRates}
                ratesLoading={ratesLoading}
                errors={errors}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <label htmlFor="value" className="label">
                    Current Value
                  </label>
                  <input
                    id="value"
                    type="number"
                    step="0.01"
                    className="input mt-1"
                    {...register('value', { valueAsNumber: true })}
                  />
                  {errors.value && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.value.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="currency" className="label">
                    Currency
                  </label>
                  <select id="currency" className="input mt-1" {...register('currency')}>
                    {FIAT_CURRENCIES.map((curr) => (
                      <option key={curr} value={curr}>
                        {curr}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor="notes" className="label">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                className="input mt-1 min-h-[80px]"
                {...register('notes')}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-3 pt-4"
            >
              <motion.button
                type="submit"
                disabled={isSaving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-primary"
              >
                {isSaving ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 className="h-5 w-5" />
                  </motion.div>
                ) : (
                  'Save Changes'
                )}
              </motion.button>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href={`/portfolios/${asset.portfolioId}`}
                  className="btn btn-secondary"
                >
                  Cancel
                </Link>
              </motion.div>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </PageTransition>
  );
}

interface CryptoValueInputProps {
  cryptoInputMode: 'crypto' | 'fiat';
  setCryptoInputMode: (mode: 'crypto' | 'fiat') => void;
  cryptoAmount: string;
  setCryptoAmount: (value: string) => void;
  fiatValue: string;
  setFiatValue: (value: string) => void;
  selectedCryptoSymbol: string;
  setSelectedCryptoSymbol: (symbol: string) => void;
  selectedFiatCurrency: string;
  setSelectedFiatCurrency: (currency: string) => void;
  getCryptoPrice: (symbol: string, fiat: string) => number;
  fetchRates: (base?: string) => Promise<void>;
  ratesLoading: boolean;
  errors: any;
}

function CryptoValueInput({
  cryptoInputMode,
  setCryptoInputMode,
  cryptoAmount,
  setCryptoAmount,
  fiatValue,
  setFiatValue,
  selectedCryptoSymbol,
  setSelectedCryptoSymbol,
  selectedFiatCurrency,
  setSelectedFiatCurrency,
  getCryptoPrice,
  fetchRates,
  ratesLoading,
  errors,
}: CryptoValueInputProps) {
  const cryptoPrice = getCryptoPrice(selectedCryptoSymbol, selectedFiatCurrency);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      {/* Input Mode Toggle */}
      <div>
        <label className="label mb-2 block">Enter value as</label>
        <div className="flex rounded-xl border border-white/40 overflow-hidden bg-white/30 backdrop-blur-sm">
          <motion.button
            type="button"
            onClick={() => setCryptoInputMode('crypto')}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
              cryptoInputMode === 'crypto'
                ? 'bg-gradient-to-r from-pineapple-light via-pineapple to-pineapple-dark text-white shadow-sm'
                : 'bg-transparent text-gray-700 hover:bg-white/50'
            }`}
          >
            Crypto Amount
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setCryptoInputMode('fiat')}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
              cryptoInputMode === 'fiat'
                ? 'bg-gradient-to-r from-pineapple-light via-pineapple to-pineapple-dark text-white shadow-sm'
                : 'bg-transparent text-gray-700 hover:bg-white/50'
            }`}
          >
            Fiat Value
          </motion.button>
        </div>
      </div>

      {/* Crypto Symbol Selection */}
      <div>
        <label className="label">Cryptocurrency</label>
        <select
          className="input mt-1"
          value={selectedCryptoSymbol}
          onChange={(e) => setSelectedCryptoSymbol(e.target.value)}
        >
          {CRYPTO_SYMBOLS.map((symbol) => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))}
        </select>
      </div>

      {/* Value Input */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">
            {cryptoInputMode === 'crypto' ? 'Amount' : 'Value'}
            {cryptoInputMode === 'crypto' && (
              <span className="text-gray-500 ml-1">({selectedCryptoSymbol})</span>
            )}
          </label>
          {cryptoInputMode === 'crypto' ? (
            <input
              type="number"
              step="0.00000001"
              className="input mt-1"
              placeholder="0.00000000"
              value={cryptoAmount}
              onChange={(e) => setCryptoAmount(e.target.value)}
            />
          ) : (
            <input
              type="number"
              step="0.01"
              className="input mt-1"
              placeholder="0.00"
              value={fiatValue}
              onChange={(e) => setFiatValue(e.target.value)}
            />
          )}
          {errors.value && (
            <p className="text-red-500 text-sm mt-1">{errors.value.message}</p>
          )}
        </div>

        <div>
          <label className="label">Display Currency</label>
          <select
            className="input mt-1"
            value={selectedFiatCurrency}
            onChange={(e) => setSelectedFiatCurrency(e.target.value)}
          >
            {FIAT_CURRENCIES.map((curr) => (
              <option key={curr} value={curr}>
                {curr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conversion Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-pineapple/10 to-pineapple/5 backdrop-blur-sm rounded-xl p-4 border border-pineapple/20"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Live Conversion</span>
          <motion.button
            type="button"
            onClick={() => fetchRates('USD')}
            disabled={ratesLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-pineapple hover:text-pineapple-dark text-sm flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-pineapple/10 transition-colors"
          >
            <motion.div
              animate={ratesLoading ? { rotate: 360 } : {}}
              transition={ratesLoading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
            >
              <RefreshCw className="h-3 w-3" />
            </motion.div>
            Refresh rates
          </motion.button>
        </div>

        {cryptoPrice > 0 ? (
          <motion.div
            key={`${cryptoAmount}-${fiatValue}`}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Crypto Amount:</span>
              <span className="font-semibold text-gray-900">
                {cryptoAmount || '0'} {selectedCryptoSymbol}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Fiat Value:</span>
              <span className="font-semibold text-gray-900">
                {selectedFiatCurrency} {fiatValue || '0.00'}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-pineapple/20 mt-2">
              <span>Rate:</span>
              <span>
                1 {selectedCryptoSymbol} = {selectedFiatCurrency}{' '}
                {cryptoPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-amber-600 bg-amber-50/50 rounded-lg p-2"
          >
            Exchange rates unavailable. Please refresh rates.
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}
