'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { assetsApi } from '@/lib/api';
import { Asset, AssetType, ASSET_TYPE_LABELS } from '@/types';
import { ArrowLeft, Loader2 } from 'lucide-react';

const assetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  value: z.number().min(0, 'Value must be positive'),
  currency: z.string(),
  notes: z.string().max(1000).optional(),
  details: z.record(z.any()).optional(),
});

type AssetForm = z.infer<typeof assetSchema>;

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'BTC', 'ETH'];

export default function EditAssetPage() {
  const params = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
      } catch {
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    fetchAsset();
  }, [assetId, router, setValue]);

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
        <Loader2 className="h-8 w-8 animate-spin text-pineapple" />
      </div>
    );
  }

  if (!asset) {
    return null;
  }

  return (
    <div className="max-w-2xl">
      <Link
        href={`/portfolios/${asset.portfolioId}`}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Portfolio
      </Link>

      <div className="card">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Asset</h1>
          <p className="text-gray-500 mt-1">
            {ASSET_TYPE_LABELS[asset.type as AssetType]}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
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
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="label">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              className="input mt-1 min-h-[80px]"
              {...register('notes')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Save Changes'
              )}
            </button>
            <Link
              href={`/portfolios/${asset.portfolioId}`}
              className="btn btn-outline"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
