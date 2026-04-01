'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { propertySharingApi, propertiesApi, usersApi } from '@/lib/api';
import { PropertyShare, Permission } from '@/types';
import { getInitials } from '@/lib/utils';
import {
  ArrowLeft,
  Loader2,
  UserPlus,
  Trash2,
  Building2,
} from 'lucide-react';
import { PageTransition, AnimatedList, AnimatedListItem } from '@/components/animations';

const shareSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  permission: z.nativeEnum(Permission),
});

type ShareForm = z.infer<typeof shareSchema>;

export default function SharePropertyClient() {
  const params = useParams();
  const router = useRouter();
  const [propertyName, setPropertyName] = useState('');
  const [shares, setShares] = useState<PropertyShare[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const propertyId = params.id as string;

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
        const [propertyRes, sharesRes] = await Promise.all([
          propertiesApi.getOne(propertyId),
          propertySharingApi.getShares(propertyId),
        ]);
        setPropertyName(propertyRes.data.name);
        setShares(sharesRes.data);
      } catch {
        router.push('/properties');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [propertyId, router]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!emailValue || emailValue.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await usersApi.searchUsers(emailValue);
        setSearchResults(response.data);
      } catch {
        setSearchResults([]);
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
      const response = await propertySharingApi.shareProperty(propertyId, data);
      setShares([response.data, ...shares]);
      setSuccess(`Invitation sent to ${data.email}`);
      reset();
      setSearchResults([]);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to share property'
      );
    } finally {
      setIsSharing(false);
    }
  };

  const handleRevokeShare = async (shareId: string) => {
    try {
      await propertySharingApi.revokePropertyShare(shareId);
      setShares(shares.filter((s) => s.id !== shareId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to revoke share');
    }
  };

  const handleUpdatePermission = async (shareId: string, permission: Permission) => {
    try {
      await propertySharingApi.updatePropertyShare(shareId, permission);
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
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="h-8 w-8 text-salmon" />
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href={`/properties/${propertyId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 group"
          >
            <motion.div whileHover={{ x: -4 }} transition={{ type: 'spring', stiffness: 400 }}>
              <ArrowLeft className="h-4 w-4 mr-2" />
            </motion.div>
            Back to Property
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="card mb-6"
        >
          <div className="flex items-center gap-4 mb-2">
            <motion.div
              className="icon-container-salmon hidden sm:flex"
              whileHover={{ rotate: 5, scale: 1.05 }}
            >
              <Building2 className="h-6 w-6 text-salmon" />
            </motion.div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Share Property
              </h1>
              <p className="text-gray-500 text-sm sm:text-base">
                Share &quot;{propertyName}&quot; with your partner or collaborators
              </p>
            </div>
          </div>
        </motion.div>

        {/* Share Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="card mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Invite Someone
          </h2>

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

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-xl text-green-600 text-sm"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

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
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 w-full mt-1 bg-white/90 backdrop-blur-xl rounded-xl shadow-glass-prominent border border-white/50 max-h-48 overflow-y-auto"
                  >
                    {searchResults.map((user) => (
                      <motion.button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setValue('email', user.email);
                          setSearchResults([]);
                        }}
                        whileHover={{ backgroundColor: 'rgba(255, 138, 101, 0.1)' }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        <div className="w-8 h-8 rounded-full bg-salmon/20 flex items-center justify-center text-salmon-dark text-sm font-medium">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
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
                  Edit - Can view and add transactions
                </option>
              </select>
            </div>

            <motion.button
              type="submit"
              disabled={isSharing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-salmon text-sm sm:text-base py-2 px-3 sm:px-4"
            >
              {isSharing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.div>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Send Invitation</span>
                  <span className="sm:hidden">Invite</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Current Shares */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            People with Access
          </h2>

          {shares.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              This property is not shared with anyone yet
            </p>
          ) : (
            <AnimatedList className="divide-y divide-white/40">
              {shares.map((share) => (
                <AnimatedListItem key={share.id}>
                  <ShareRow
                    share={share}
                    onRevoke={() => handleRevokeShare(share.id)}
                    onUpdatePermission={(permission) =>
                      handleUpdatePermission(share.id, permission)
                    }
                  />
                </AnimatedListItem>
              ))}
            </AnimatedList>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}

function ShareRow({
  share,
  onRevoke,
  onUpdatePermission,
}: {
  share: PropertyShare;
  onRevoke: () => void;
  onUpdatePermission: (permission: Permission) => void;
}) {
  const statusColors = {
    PENDING: 'bg-yellow-50/80 text-yellow-600 border-yellow-200/50',
    ACCEPTED: 'bg-green-50/80 text-green-600 border-green-200/50',
    DECLINED: 'bg-red-50/80 text-red-600 border-red-200/50',
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
      <div className="flex items-center gap-3 min-w-0">
        <motion.div
          className="w-10 h-10 rounded-full bg-gradient-to-br from-salmon/30 to-salmon/10
                     backdrop-blur-sm border border-salmon/20
                     flex items-center justify-center text-salmon-dark font-medium shrink-0"
          whileHover={{ scale: 1.05 }}
        >
          {getInitials(share.sharedWithUser.name)}
        </motion.div>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate">{share.sharedWithUser.name}</p>
          <p className="text-sm text-gray-500 truncate">{share.sharedWithUser.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 pl-[52px] sm:pl-0">
        <span
          className={`px-2 py-1 text-xs rounded-lg border backdrop-blur-sm ${
            statusColors[share.status]
          }`}
        >
          {share.status}
        </span>
        {share.status === 'ACCEPTED' && (
          <select
            value={share.permission}
            onChange={(e) => onUpdatePermission(e.target.value as Permission)}
            className="text-xs sm:text-sm bg-white/50 backdrop-blur-sm border border-white/40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-salmon/50"
          >
            <option value={Permission.VIEW}>View</option>
            <option value={Permission.EDIT}>Edit</option>
          </select>
        )}
        <motion.button
          onClick={onRevoke}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 text-red-600 hover:bg-red-50/50 rounded-lg transition-colors"
          title="Revoke access"
        >
          <Trash2 className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );
}
