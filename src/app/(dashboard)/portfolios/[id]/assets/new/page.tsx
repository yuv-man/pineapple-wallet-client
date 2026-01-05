'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { assetsApi } from '@/lib/api';
import { AssetType, ASSET_TYPE_LABELS } from '@/types';
import {
  ArrowLeft,
  Loader2,
  Home,
  Landmark,
  Bitcoin,
  TrendingUp,
  PiggyBank,
} from 'lucide-react';

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

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'BTC', 'ETH'];

export default function NewAssetPage() {
  const params = useParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<AssetType | null>(null);

  const portfolioId = params.id as string;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssetForm>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      currency: 'USD',
    },
  });

  const watchType = watch('type');

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
  };

  return (
    <div className="max-w-2xl">
      <Link
        href={`/portfolios/${portfolioId}`}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Portfolio
      </Link>

      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Asset</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Asset Type Selection */}
          <div>
            <label className="label mb-3 block">Asset Type</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.values(AssetType).map((type) => {
                const Icon = ASSET_ICONS[type];
                const isSelected = selectedType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeSelect(type)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      isSelected
                        ? 'border-pineapple bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 mb-2 ${
                        isSelected ? 'text-pineapple' : 'text-gray-500'
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        isSelected ? 'text-pineapple-dark' : 'text-gray-900'
                      }`}
                    >
                      {ASSET_TYPE_LABELS[type]}
                    </p>
                  </button>
                );
              })}
            </div>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>

          {/* Asset Details */}
          {selectedType && (
            <>
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
                    {CURRENCIES.map((curr) => (
                      <option key={curr} value={curr}>
                        {curr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Type-specific fields */}
              <TypeSpecificFields type={selectedType} register={register} />

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
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Add Asset'
                  )}
                </button>
                <Link
                  href={`/portfolios/${portfolioId}`}
                  className="btn btn-outline"
                >
                  Cancel
                </Link>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
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
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Symbol</label>
            <input
              type="text"
              className="input mt-1"
              placeholder="e.g., BTC"
              {...register('details.symbol')}
            />
          </div>
          <div>
            <label className="label">Quantity</label>
            <input
              type="number"
              step="0.00000001"
              className="input mt-1"
              placeholder="0.00"
              {...register('details.quantity', { valueAsNumber: true })}
            />
          </div>
        </div>
      );

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
