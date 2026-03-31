'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { propertiesApi } from '@/lib/api';
import { Property } from '@/types';
import { ArrowLeft, Loader2 } from 'lucide-react';

const propertySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  address: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
});

type PropertyForm = z.infer<typeof propertySchema>;

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PropertyForm>({
    resolver: zodResolver(propertySchema),
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await propertiesApi.getOne(propertyId);
        setProperty(response.data);
        reset({
          name: response.data.name,
          address: response.data.address || '',
          description: response.data.description || '',
        });
      } catch (err) {
        console.error('Failed to fetch property:', err);
        router.push('/properties');
      } finally {
        setIsFetching(false);
      }
    };
    fetchProperty();
  }, [propertyId, reset, router]);

  const onSubmit = async (data: PropertyForm) => {
    setIsLoading(true);
    setError(null);

    try {
      await propertiesApi.update(propertyId, data);
      router.push(`/properties/${propertyId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update property');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-pineapple" />
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
          Edit Property
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="label">
              Property Name
            </label>
            <input
              id="name"
              type="text"
              className="input mt-1"
              placeholder="e.g., Beach House, Downtown Apartment"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="address" className="label">
              Address (Optional)
            </label>
            <input
              id="address"
              type="text"
              className="input mt-1"
              placeholder="e.g., 123 Main St, City, Country"
              {...register('address')}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description (Optional)
            </label>
            <textarea
              id="description"
              className="input mt-1 min-h-[100px]"
              placeholder="Additional notes about this property..."
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
                'Save Changes'
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
