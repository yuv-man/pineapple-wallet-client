'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { portfoliosApi } from '@/lib/api';
import { ArrowLeft, Loader2 } from 'lucide-react';

const portfolioSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
});

type PortfolioForm = z.infer<typeof portfolioSchema>;

export default function NewPortfolioPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PortfolioForm>({
    resolver: zodResolver(portfolioSchema),
  });

  const onSubmit = async (data: PortfolioForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await portfoliosApi.create(data);
      router.push(`/portfolios/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create portfolio');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link
        href="/portfolios"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Portfolios
      </Link>

      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Create New Portfolio
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="label">
              Portfolio Name
            </label>
            <input
              id="name"
              type="text"
              className="input mt-1"
              placeholder="e.g., Personal Investments"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description (Optional)
            </label>
            <textarea
              id="description"
              className="input mt-1 min-h-[100px]"
              placeholder="Describe what this portfolio is for..."
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
                'Create Portfolio'
              )}
            </button>
            <Link href="/portfolios" className="btn btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
