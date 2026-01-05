'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function EditPortfolioPage() {
  const params = useParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const portfolioId = params.id as string;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PortfolioForm>({
    resolver: zodResolver(portfolioSchema),
  });

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await portfoliosApi.getOne(portfolioId);
        setValue('name', response.data.name);
        setValue('description', response.data.description || '');
      } catch {
        router.push('/portfolios');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, [portfolioId, router, setValue]);

  const onSubmit = async (data: PortfolioForm) => {
    setIsSaving(true);
    setError(null);

    try {
      await portfoliosApi.update(portfolioId, data);
      router.push(`/portfolios/${portfolioId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update portfolio');
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Portfolio</h1>

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
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Save Changes'
              )}
            </button>
            <Link href={`/portfolios/${portfolioId}`} className="btn btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
