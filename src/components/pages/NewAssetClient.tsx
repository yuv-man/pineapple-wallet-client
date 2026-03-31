'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { assetsApi } from '@/lib/api';
import { useCurrencyStore } from '@/store/currency';
import { AssetType, ASSET_TYPE_LABELS } from '@/types';
import {
  ArrowLeft,
  Loader2,
  Home,
  Landmark,
  Bitcoin,
  TrendingUp,
  PiggyBank,
  RefreshCw,
} from 'lucide-react';
import { PageTransition } from '@/components/animations';

const ASSET_ICONS: Record<AssetType, React.ElementType> = {
  [AssetType.BANK_ACCOUNT]: Landmark,
  [AssetType.REAL_ESTATE]: Home,
  [AssetType.CRYPTO]: Bitcoin,
  [AssetType.STOCK]: TrendingUp,
  [AssetType.INVESTMENT]: PiggyBank,
};

const assetSchema = z.object({
  type: z.nativeEnum(AssetType),
  name: z.string().min(1, 'Name is required').max(100),
  value: z.number().min(0, 'Value must be positive'),
  currency: z.string().default('USD'),
  notes: z.string().max(1000).optional(),
  details: z.record(z.any()).optional(),
});

type AssetForm = z.infer<typeof assetSchema>;

const FIAT_CURRENCIES = ['USD', 'EUR', 'GBP', 'ILS', 'JPY', 'CHF', 'CAD', 'AUD'];
const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE'];

export default function NewAssetClient() {
  const params = useParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<AssetType | null>(null);

  // Crypto-specific state
  const [cryptoInputMode, setCryptoInputMode] = useState<'crypto' | 'fiat'>('crypto');
  const [cryptoAmount, setCryptoAmount] = useState<string>('');
  const [fiatValue, setFiatValue] = useState<string>('');
  const [selectedCryptoSymbol, setSelectedCryptoSymbol] = useState<string>('BTC');
  const [selectedFiatCurrency, setSelectedFiatCurrency] = useState<string>('USD');

  const { getCryptoPrice, rates, fetchRates, isLoading: ratesLoading } = useCurrencyStore();

  const portfolioId = params.id as string;

  useEffect(() => {
    if (selectedType === AssetType.CRYPTO) {
      fetchRates('USD');
    }
  }, [selectedType, fetchRates]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AssetForm>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      currency: 'USD',
    },
  });

  // Auto-convert between crypto and fiat
  useEffect(() => {
    if (selectedType !== AssetType.CRYPTO || !rates) return;

    const cryptoPrice = getCryptoPrice(selectedCryptoSymbol, selectedFiatCurrency);
    if (cryptoPrice <= 0) return;

    const ticker = selectedCryptoSymbol.toUpperCase();

    if (cryptoInputMode === 'crypto' && cryptoAmount) {
      const amount = parseFloat(cryptoAmount);
      if (!isNaN(amount)) {
        const calculatedFiat = amount * cryptoPrice;
        setFiatValue(calculatedFiat.toFixed(2));
        // Persist coin quantity + ticker (same idea as bank: value is in asset currency)
        setValue('value', amount);
        setValue('currency', ticker);
        setValue('details.quantity', amount);
        setValue('details.symbol', ticker);
        setValue('details.fiatReferenceCurrency', selectedFiatCurrency);
        setValue('details.fiatValueAtSave', calculatedFiat);
      }
    } else if (cryptoInputMode === 'fiat' && fiatValue) {
      const fiat = parseFloat(fiatValue);
      if (!isNaN(fiat)) {
        const calculatedCrypto = fiat / cryptoPrice;
        setCryptoAmount(calculatedCrypto.toFixed(8));
        setValue('value', calculatedCrypto);
        setValue('currency', ticker);
        setValue('details.quantity', calculatedCrypto);
        setValue('details.symbol', ticker);
        setValue('details.fiatReferenceCurrency', selectedFiatCurrency);
        setValue('details.fiatValueAtSave', fiat);
      }
    }
  }, [cryptoInputMode, cryptoAmount, fiatValue, selectedCryptoSymbol, selectedFiatCurrency, rates, getCryptoPrice, setValue, selectedType]);

  const onSubmit = async (data: AssetForm) => {
    setIsLoading(true);
    setError(null);

    try {
      await assetsApi.create(portfolioId, data);
      router.push(`/portfolios/${portfolioId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create asset');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeSelect = (type: AssetType) => {
    setSelectedType(type);
    setValue('type', type);
    if (type === AssetType.CRYPTO) {
      setValue('currency', selectedCryptoSymbol.toUpperCase());
      setCryptoAmount('');
      setFiatValue('');
    } else {
      setValue('currency', 'USD');
    }
  };

  return (
    <PageTransition>
      <div className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href={`/portfolios/${portfolioId}`}
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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
            Add New Asset
          </h1>

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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Asset Type Selection */}
            <div>
              <label className="label mb-3 block">Asset Type</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(AssetType).map((type, index) => {
                  const Icon = ASSET_ICONS[type];
                  const isSelected = selectedType === type;
                  return (
                    <motion.button
                      key={type}
                      type="button"
                      onClick={() => handleTypeSelect(type)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={isSelected ? 'type-card-selected' : 'type-card'}
                    >
                      <motion.div
                        animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon
                          className={`h-6 w-6 mb-2 ${
                            isSelected ? 'text-pineapple' : 'text-gray-500'
                          }`}
                        />
                      </motion.div>
                      <p
                        className={`text-sm font-medium ${
                          isSelected ? 'text-pineapple-dark' : 'text-gray-900'
                        }`}
                      >
                        {ASSET_TYPE_LABELS[type]}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
              )}
            </div>

            {/* Asset Details */}
            <AnimatePresence mode="wait">
              {selectedType && (
                <motion.div
                  key={selectedType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <label htmlFor="name" className="label">
                      Asset Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="input mt-1"
                      placeholder={getNamePlaceholder(selectedType)}
                      {...register('name')}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* For crypto, show special input with conversion */}
                  {selectedType === AssetType.CRYPTO ? (
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="value" className="label">
                          Current Value
                        </label>
                        <input
                          id="value"
                          type="number"
                          step="0.01"
                          className="input mt-1"
                          placeholder="0.00"
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
                        <select
                          id="currency"
                          className="input mt-1"
                          {...register('currency')}
                        >
                          {FIAT_CURRENCIES.map((curr) => (
                            <option key={curr} value={curr}>
                              {curr}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Type-specific fields (excluding crypto which is handled above) */}
                  {selectedType !== AssetType.CRYPTO && (
                    <TypeSpecificFields type={selectedType} register={register} />
                  )}

                  <div>
                    <label htmlFor="notes" className="label">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      className="input mt-1 min-h-[80px]"
                      placeholder="Add any additional notes..."
                      {...register('notes')}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn btn-primary"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Loader2 className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        'Add Asset'
                      )}
                    </motion.button>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href={`/portfolios/${portfolioId}`}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </PageTransition>
  );
}

function getNamePlaceholder(type: AssetType): string {
  switch (type) {
    case AssetType.BANK_ACCOUNT:
      return 'e.g., Chase Savings Account';
    case AssetType.REAL_ESTATE:
      return 'e.g., 123 Main St Property';
    case AssetType.CRYPTO:
      return 'e.g., Bitcoin Holdings';
    case AssetType.STOCK:
      return 'e.g., Apple Inc (AAPL)';
    case AssetType.INVESTMENT:
      return 'e.g., Vanguard 401k';
    default:
      return 'Asset name';
  }
}

function TypeSpecificFields({
  type,
  register,
}: {
  type: AssetType;
  register: any;
}) {
  switch (type) {
    case AssetType.BANK_ACCOUNT:
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Bank Name</label>
            <input
              type="text"
              className="input mt-1"
              placeholder="e.g., Chase"
              {...register('details.bankName')}
            />
          </div>
          <div>
            <label className="label">Account Type</label>
            <select className="input mt-1" {...register('details.accountType')}>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="money_market">Money Market</option>
              <option value="cd">CD</option>
            </select>
          </div>
        </div>
      );

    case AssetType.REAL_ESTATE:
      return (
        <div className="space-y-4">
          <div>
            <label className="label">Property Address</label>
            <input
              type="text"
              className="input mt-1"
              placeholder="123 Main St, City, State"
              {...register('details.address')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Property Type</label>
              <select className="input mt-1" {...register('details.propertyType')}>
                <option value="single_family">Single Family</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="multi_family">Multi-Family</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="label">Purchase Price</label>
              <input
                type="number"
                step="0.01"
                className="input mt-1"
                placeholder="0.00"
                {...register('details.purchasePrice', { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>
      );

    case AssetType.CRYPTO:
      // Crypto fields are handled separately with CryptoValueInput
      return null;

    case AssetType.STOCK:
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Ticker Symbol</label>
            <input
              type="text"
              className="input mt-1"
              placeholder="e.g., AAPL"
              {...register('details.ticker')}
            />
          </div>
          <div>
            <label className="label">Number of Shares</label>
            <input
              type="number"
              step="0.001"
              className="input mt-1"
              placeholder="0"
              {...register('details.shares', { valueAsNumber: true })}
            />
          </div>
        </div>
      );

    case AssetType.INVESTMENT:
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Institution</label>
            <input
              type="text"
              className="input mt-1"
              placeholder="e.g., Fidelity"
              {...register('details.institution')}
            />
          </div>
          <div>
            <label className="label">Investment Type</label>
            <select className="input mt-1" {...register('details.investmentType')}>
              <option value="401k">401(k)</option>
              <option value="ira">IRA</option>
              <option value="roth_ira">Roth IRA</option>
              <option value="mutual_fund">Mutual Fund</option>
              <option value="etf">ETF</option>
              <option value="bonds">Bonds</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      );

    default:
      return null;
  }
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

  const handleCryptoAmountChange = (value: string) => {
    setCryptoAmount(value);
    // Fiat will be calculated via useEffect
  };

  const handleFiatValueChange = (value: string) => {
    setFiatValue(value);
    // Crypto will be calculated via useEffect
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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
              onChange={(e) => handleCryptoAmountChange(e.target.value)}
            />
          ) : (
            <input
              type="number"
              step="0.01"
              className="input mt-1"
              placeholder="0.00"
              value={fiatValue}
              onChange={(e) => handleFiatValueChange(e.target.value)}
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
        transition={{ delay: 0.2 }}
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
