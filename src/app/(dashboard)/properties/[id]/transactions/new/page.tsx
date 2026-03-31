'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { propertyTransactionsApi, propertyCategoriesApi } from '@/lib/api';
import { PropertyCategory, TransactionType, CategoryType } from '@/types';
import { ArrowLeft, Loader2, Plus, TrendingUp, TrendingDown } from 'lucide-react';

const transactionSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  type: z.nativeEnum(TransactionType),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().default('USD'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().max(500).optional(),
});

type TransactionForm = z.infer<typeof transactionSchema>;

export default function NewTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: TransactionType.EXPENSE,
      currency: 'USD',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const selectedType = watch('type');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await propertyCategoriesApi.getAll();
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(
    (c) => c.type === (selectedType === TransactionType.EXPENSE ? CategoryType.EXPENSE : CategoryType.PROFIT)
  );

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    setIsCreatingCategory(true);
    try {
      const response = await propertyCategoriesApi.create({
        name: newCategoryName.trim(),
        type: selectedType === TransactionType.EXPENSE ? CategoryType.EXPENSE : CategoryType.PROFIT,
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
      await propertyTransactionsApi.create(propertyId, {
        ...data,
        amount: Number(data.amount),
      });
      router.push(`/properties/${propertyId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create transaction');
    } finally {
      setIsLoading(false);
    }
  };

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
          Add Transaction
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Transaction Type */}
          <div>
            <label className="label mb-2">Transaction Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setValue('type', TransactionType.EXPENSE);
                  setValue('categoryId', '');
                }}
                className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                  selectedType === TransactionType.EXPENSE
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <TrendingDown className="h-5 w-5" />
                <span className="font-medium">Expense</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('type', TransactionType.PROFIT);
                  setValue('categoryId', '');
                }}
                className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                  selectedType === TransactionType.PROFIT
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Profit</span>
              </button>
            </div>
          </div>

          {/* Category */}
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
                  <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
                )}

                {!showNewCategory ? (
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(true)}
                    className="mt-2 text-sm text-pineapple hover:text-pineapple-dark flex items-center gap-1"
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
                        disabled={isCreatingCategory || !newCategoryName.trim()}
                        className="btn btn-primary"
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

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="label">
              Amount
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
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
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* Date */}
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

          {/* Description */}
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
              className="btn btn-primary"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Add Transaction'
              )}
            </button>
            <Link href={`/properties/${propertyId}`} className="btn btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
