'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sharingApi, portfoliosApi, usersApi } from '@/lib/api';
import { PortfolioShare, Permission } from '@/types';
import { getInitials } from '@/lib/utils';
import {
  ArrowLeft,
  Loader2,
  UserPlus,
  Trash2,
  Eye,
  Edit,
} from 'lucide-react';

const shareSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  permission: z.nativeEnum(Permission),
});

type ShareForm = z.infer<typeof shareSchema>;

export default function SharePortfolioPage() {
  const params = useParams();
  const router = useRouter();
  const [portfolioName, setPortfolioName] = useState('');
  const [shares, setShares] = useState<PortfolioShare[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const portfolioId = params.id as string;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ShareForm>({
    resolver: zodResolver(shareSchema),
    defaultValues: {
      permission: Permission.VIEW,
    },
  });

  const emailValue = watch('email');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portfolioRes, sharesRes] = await Promise.all([
          portfoliosApi.getOne(portfolioId),
          sharingApi.getShares(portfolioId),
        ]);
        setPortfolioName(portfolioRes.data.name);
        setShares(sharesRes.data);
      } catch {
        router.push('/portfolios');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [portfolioId, router]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!emailValue || emailValue.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await usersApi.searchUsers(emailValue);
        setSearchResults(response.data);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [emailValue]);

  const onSubmit = async (data: ShareForm) => {
    setIsSharing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await sharingApi.sharePortfolio(portfolioId, data);
      setShares([response.data, ...shares]);
      setSuccess(`Invitation sent to ${data.email}`);
      reset();
      setSearchResults([]);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to share portfolio'
      );
    } finally {
      setIsSharing(false);
    }
  };

  const handleRevokeShare = async (shareId: string) => {
    try {
      await sharingApi.revokeShare(shareId);
      setShares(shares.filter((s) => s.id !== shareId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to revoke share');
    }
  };

  const handleUpdatePermission = async (shareId: string, permission: Permission) => {
    try {
      await sharingApi.updateShare(shareId, permission);
      setShares(
        shares.map((s) =>
          s.id === shareId ? { ...s, permission } : s
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update permission');
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

      <div className="card mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Share Portfolio
        </h1>
        <p className="text-gray-500">
          Share &quot;{portfolioName}&quot; with your partner or collaborators
        </p>
      </div>

      {/* Share Form */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Invite Someone
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <label htmlFor="email" className="label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="input mt-1"
              placeholder="partner@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border max-h-48 overflow-y-auto">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setValue('email', user.email);
                      setSearchResults([]);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-pineapple/20 flex items-center justify-center text-pineapple-dark text-sm font-medium">
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="permission" className="label">
              Permission Level
            </label>
            <select
              id="permission"
              className="input mt-1"
              {...register('permission')}
            >
              <option value={Permission.VIEW}>
                View Only - Can see but not edit
              </option>
              <option value={Permission.EDIT}>
                Edit - Can view and modify assets
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSharing}
            className="btn btn-primary"
          >
            {isSharing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <UserPlus className="h-5 w-5 mr-2" />
                Send Invitation
              </>
            )}
          </button>
        </form>
      </div>

      {/* Current Shares */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          People with Access
        </h2>

        {shares.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            This portfolio is not shared with anyone yet
          </p>
        ) : (
          <div className="divide-y">
            {shares.map((share) => (
              <ShareRow
                key={share.id}
                share={share}
                onRevoke={() => handleRevokeShare(share.id)}
                onUpdatePermission={(permission) =>
                  handleUpdatePermission(share.id, permission)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ShareRow({
  share,
  onRevoke,
  onUpdatePermission,
}: {
  share: PortfolioShare;
  onRevoke: () => void;
  onUpdatePermission: (permission: Permission) => void;
}) {
  const statusColors = {
    PENDING: 'bg-yellow-50 text-yellow-600',
    ACCEPTED: 'bg-green-50 text-green-600',
    DECLINED: 'bg-red-50 text-red-600',
  };

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-pineapple/20 flex items-center justify-center text-pineapple-dark font-medium">
          {getInitials(share.sharedWithUser.name)}
        </div>
        <div>
          <p className="font-medium text-gray-900">{share.sharedWithUser.name}</p>
          <p className="text-sm text-gray-500">{share.sharedWithUser.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`px-2 py-1 text-xs rounded-md ${
            statusColors[share.status]
          }`}
        >
          {share.status}
        </span>
        {share.status === 'ACCEPTED' && (
          <select
            value={share.permission}
            onChange={(e) => onUpdatePermission(e.target.value as Permission)}
            className="text-sm border rounded-lg px-2 py-1"
          >
            <option value={Permission.VIEW}>View</option>
            <option value={Permission.EDIT}>Edit</option>
          </select>
        )}
        <button
          onClick={onRevoke}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          title="Revoke access"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
