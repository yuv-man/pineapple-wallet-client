'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { propertiesApi } from '@/lib/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PropertyType, SizeUnit, PROPERTY_TYPE_LABELS, SIZE_UNIT_LABELS, Country } from '@/types';

const propertySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  address: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  size: z.coerce.number().min(0).optional(),
  sizeUnit: z.nativeEnum(SizeUnit).optional(),
  country: z.string().max(2).optional(),
  city: z.string().max(100).optional(),
});

type PropertyForm = z.infer<typeof propertySchema>;

export default function NewPropertyPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PropertyForm>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      sizeUnit: SizeUnit.SQM,
    },
  });

  const selectedSize = watch('size');

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await propertiesApi.getAvailableCountries();
        setCountries(response.data);
      } catch (err) {
        console.error('Failed to fetch countries:', err);
      }
    };
    fetchCountries();
  }, []);

  const onSubmit = async (data: PropertyForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        ...data,
        size: data.size && data.size > 0 ? data.size : undefined,
        sizeUnit: data.size && data.size > 0 ? data.sizeUnit : undefined,
      };
      const response = await propertiesApi.create(payload);
      router.push(`/properties/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create property');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link
        href="/properties"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Properties
      </Link>

      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Add New Property
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
            <label htmlFor="propertyType" className="label">
              Property Type
            </label>
            <select
              id="propertyType"
              className="input mt-1"
              {...register('propertyType')}
            >
              <option value="">Select type...</option>
              {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.propertyType && (
              <p className="text-red-500 text-sm mt-1">{errors.propertyType.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="size" className="label">
                Size
              </label>
              <input
                id="size"
                type="number"
                step="0.01"
                min="0"
                className="input mt-1"
                placeholder="e.g., 120"
                {...register('size')}
              />
              {errors.size && (
                <p className="text-red-500 text-sm mt-1">{errors.size.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="sizeUnit" className="label">
                Unit
              </label>
              <select
                id="sizeUnit"
                className="input mt-1"
                disabled={!selectedSize || selectedSize <= 0}
                {...register('sizeUnit')}
              >
                {Object.entries(SIZE_UNIT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="country" className="label">
                Country
              </label>
              <select
                id="country"
                className="input mt-1"
                {...register('country')}
              >
                <option value="">Select country...</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="city" className="label">
                City
              </label>
              <input
                id="city"
                type="text"
                className="input mt-1"
                placeholder="e.g., New York"
                {...register('city')}
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="address" className="label">
              Full Address (Optional)
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

          <p className="text-sm text-gray-500 bg-gray-50/80 rounded-lg p-3 border border-gray-200/50">
            Adding property type, size, country, and city will enable automatic property valuation estimates.
          </p>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-salmon"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Add Property'
              )}
            </button>
            <Link href="/properties" className="btn btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
