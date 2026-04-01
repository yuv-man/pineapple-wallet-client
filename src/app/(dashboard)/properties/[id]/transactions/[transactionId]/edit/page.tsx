'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  propertyTransactionsApi,
  propertyCategoriesApi,
  currencyApi,
} from '@/lib/api';
import {
  PropertyCategory,
  PropertyTransaction,
  TransactionType,
  CategoryType,
} from '@/types';
import {
  ArrowLeft,
  Loader2,
  Plus,
  TrendingUp,
  TrendingDown,
  ChevronDown,
} from 'lucide-react';

const transactionSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  type: z.nativeEnum(TransactionType),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().default('USD'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().max(500).optional(),
});

type TransactionForm = z.infer<typeof transactionSchema>;

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const transactionId = params.transactionId as string;

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [currencies, setCurrencies] = useState<{
    fiat: string[];
    crypto: string[];
  }>({ fiat: [], crypto: [] });
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      currency: 'USD',
    },
  });

  const selectedType = watch('type');
  const selectedCurrency = watch('currency');

  const getCurrencySymbol = (currency: string) => {
    try {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      return formatter.format(0).replace(/\d/g, '').trim();
    } catch {
      return currency;
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [txRes, catRes, curRes] = await Promise.all([
          propertyTransactionsApi.getOne(transactionId),
          propertyCategoriesApi.getAll(),
          currencyApi.getSupportedCurrencies(),
        ]);

        const tx = txRes.data as PropertyTransaction;
        if (tx.propertyId !== propertyId) {
          router.replace(`/properties/${tx.propertyId}`);
          return;
        }

        setCategories(catRes.data);
        setCurrencies(curRes.data);

        reset({
          categoryId: tx.categoryId,
          type: tx.type,
          amount: Number(tx.amount),
          currency: tx.currency || 'USD',
          date: new Date(tx.date).toISOString().split('T')[0],
          description: tx.description || '',
        });
      } catch (err) {
        console.error('Failed to load transaction:', err);
        router.push(`/properties/${propertyId}`);
      } finally {
        setIsFetching(false);
        setIsLoadingCategories(false);
        setIsLoadingCurrencies(false);
      }
    };

    load();
  }, [propertyId, transactionId, reset, router]);

  const filteredCategories = categories.filter(
    (c) =>
      c.type ===
      (selectedType === TransactionType.EXPENSE
        ? CategoryType.EXPENSE
        : CategoryType.PROFIT),
  );

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    setIsCreatingCategory(true);
    try {
      const response = await propertyCategoriesApi.create({
        name: newCategoryName.trim(),
        type:
          selectedType === TransactionType.EXPENSE
            ? CategoryType.EXPENSE
            : CategoryType.PROFIT,
      });
      setCategories([...categories, response.data]);
      setValue('categoryId', response.data.id);
      setNewCategoryName('');
      setShowNewCategory(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const onSubmit = async (data: TransactionForm) => {
    setIsLoading(true);
    setError(null);

    try {
      await propertyTransactionsApi.update(transactionId, {
        categoryId: data.categoryId,
        amount: Number(data.amount),
        currency: data.currency,
        date: data.date,
        description: data.description,
      });
      router.push(`/properties/${propertyId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update transaction');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-salmon" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link
        href={`/properties/${propertyId}`}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Property
      </Link>

      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Edit Transaction
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          Transaction type (expense vs profit) cannot be changed. To switch
          type, delete this entry and add a new one.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input type="hidden" {...register('type')} />

          <div>
            <label className="label mb-2">Transaction Type</label>
            <div className="grid grid-cols-2 gap-3 opacity-80 pointer-events-none">
              <div
                className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 ${
                  selectedType === TransactionType.EXPENSE
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200'
                }`}
              >
                <TrendingDown className="h-5 w-5" />
                <span className="font-medium">Expense</span>
              </div>
              <div
                className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 ${
                  selectedType === TransactionType.PROFIT
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200'
                }`}
              >
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Profit</span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="categoryId" className="label">
              Category
            </label>
            {isLoadingCategories ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading categories...
              </div>
            ) : (
              <>
                <select
                  id="categoryId"
                  className="input mt-1"
                  {...register('categoryId')}
                >
                  <option value="">Select a category</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} {!category.isSystem && '(Custom)'}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.categoryId.message}
                  </p>
                )}

                {!showNewCategory ? (
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(true)}
                    className="mt-2 text-sm text-salmon hover:text-salmon-dark flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add custom category
                  </button>
                ) : (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Category name"
                        className="input flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={
                          isCreatingCategory || !newCategoryName.trim()
                        }
                        className="btn btn-salmon"
                      >
                        {isCreatingCategory ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Add'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategory(false);
                          setNewCategoryName('');
                        }}
                        className="btn btn-outline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div>
            <label htmlFor="amount" className="label">
              Amount
            </label>
            <div className="flex gap-3 mt-1">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {getCurrencySymbol(selectedCurrency || 'USD')}
                </span>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="input pl-8"
                  placeholder="0.00"
                  {...register('amount', { valueAsNumber: true })}
                />
              </div>
              <div className="relative w-32">
                {isLoadingCurrencies ? (
                  <div className="input flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <>
                    <select
                      id="currency"
                      className="input appearance-none pr-8"
                      {...register('currency')}
                    >
                      <optgroup label="Fiat">
                        {currencies.fiat.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Crypto">
                        {currencies.crypto.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </>
                )}
              </div>
            </div>
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="date" className="label">
              Date
            </label>
            <input
              id="date"
              type="date"
              className="input mt-1"
              {...register('date')}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description (Optional)
            </label>
            <textarea
              id="description"
              className="input mt-1 min-h-[80px]"
              placeholder="Add notes about this transaction..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-salmon"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Save Changes'
              )}
            </button>
            <Link
              href={`/properties/${propertyId}`}
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
