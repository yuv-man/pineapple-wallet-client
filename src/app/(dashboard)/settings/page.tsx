'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usersApi, authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Loader2, Trash2, Globe, LogOut, User, AlertTriangle } from 'lucide-react';
import { PageTransition, AnimatedList, AnimatedListItem } from '@/components/animations';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

type ProfileForm = z.infer<typeof profileSchema>;

const DISPLAY_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser, logout, refreshToken } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState(user?.displayCurrency || 'USD');
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await usersApi.updateMe(data);
      setUser(response.data);
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await usersApi.deleteMe();
      logout();
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout(refreshToken || undefined);
    } catch {
      // Ignore errors
    }
    logout();
    router.push('/login');
  };

  const handleCurrencyChange = async (currency: string) => {
    setDisplayCurrency(currency);
    setIsSavingCurrency(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await usersApi.updateMe({ displayCurrency: currency });
      setUser(response.data);
      setSuccess('Display currency updated');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update currency');
      setDisplayCurrency(user?.displayCurrency || 'USD'); // Revert on error
    } finally {
      setIsSavingCurrency(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-600">Manage your account settings</p>
        </motion.div>

        <AnimatedList className="space-y-6">
          {/* Profile Section */}
          <AnimatedListItem>
            <div className="card">
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pineapple/30 to-pineapple/10
                             backdrop-blur-sm border border-pineapple/20
                             flex items-center justify-center text-pineapple-dark text-2xl font-bold
                             shadow-glow-pineapple"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
                  </div>
                  <p className="text-gray-500">{user?.email}</p>
                </div>
              </div>

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
                <div>
                  <label htmlFor="name" className="label">
                    Full Name
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
                  <label htmlFor="email" className="label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="input mt-1 bg-white/30"
                    value={user?.email}
                    disabled
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSaving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-primary"
                >
                  {isSaving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    'Save Changes'
                  )}
                </motion.button>
              </form>
            </div>
          </AnimatedListItem>

          {/* Preferences Section */}
          <AnimatedListItem>
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="icon-container-sm bg-pineapple/10 border-pineapple/20"
                  whileHover={{ rotate: 10, scale: 1.05 }}
                >
                  <Globe className="h-5 w-5 text-pineapple" />
                </motion.div>
                <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
              </div>

              <div>
                <label htmlFor="displayCurrency" className="label">
                  Display Currency
                </label>
                <p className="text-gray-500 text-sm mb-2">
                  Choose the currency used to display your total asset values
                </p>
                <div className="relative">
                  <select
                    id="displayCurrency"
                    className="input mt-1 pr-10"
                    value={displayCurrency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    disabled={isSavingCurrency}
                  >
                    {DISPLAY_CURRENCIES.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name} ({currency.symbol})
                      </option>
                    ))}
                  </select>
                  {isSavingCurrency && (
                    <motion.div
                      className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="h-4 w-4 text-pineapple" />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </AnimatedListItem>

          {/* Session Section */}
          <AnimatedListItem>
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="icon-container-sm bg-blue-50/80 border-blue-100/50"
                  whileHover={{ rotate: -10, scale: 1.05 }}
                >
                  <LogOut className="h-5 w-5 text-blue-600" />
                </motion.div>
                <h2 className="text-lg font-semibold text-gray-900">Session</h2>
              </div>
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-secondary"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </motion.button>
            </div>
          </AnimatedListItem>

          {/* Danger Zone */}
          <AnimatedListItem>
            <motion.div
              className="card bg-gradient-to-br from-red-50/80 to-red-50/40 backdrop-blur-xl border-red-200/50"
              whileHover={{ scale: 1.005 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="icon-container-sm bg-red-100/80 border-red-200/50"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </motion.div>
                <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Permanently delete your account and all associated data. This action
                cannot be undone.
              </p>
              <motion.button
                onClick={() => setShowDeleteConfirm(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-danger"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Delete Account
              </motion.button>
            </motion.div>
          </AnimatedListItem>
        </AnimatedList>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-red-50/80 backdrop-blur-sm border border-red-100/50 flex items-center justify-center">
                  <Trash2 className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                  Delete Account
                </h3>
                <p className="text-gray-600 mb-6 text-center">
                  Are you sure you want to delete your account? All your portfolios,
                  assets, and shares will be permanently deleted. This action cannot
                  be undone.
                </p>
                <div className="flex gap-3">
                  <motion.button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-danger flex-1"
                  >
                    {isDeleting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Loader2 className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      'Delete Account'
                    )}
                  </motion.button>
                  <motion.button
                    onClick={() => setShowDeleteConfirm(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
