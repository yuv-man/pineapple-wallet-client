'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usersApi, authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Loader2, User, Trash2 } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser, logout, refreshToken } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      {/* Profile Section */}
      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-pineapple/20 flex items-center justify-center text-pineapple-dark text-2xl font-semibold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>

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
              className="input mt-1 bg-gray-50"
              value={user?.email}
              disabled
            />
            <p className="text-gray-500 text-xs mt-1">
              Email cannot be changed
            </p>
          </div>

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
        </form>
      </div>

      {/* Session Section */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Session</h2>
        <button onClick={handleLogout} className="btn btn-outline">
          Sign Out
        </button>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-gray-600 mb-4">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="btn btn-danger"
        >
          <Trash2 className="h-5 w-5 mr-2" />
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Account
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? All your portfolios,
              assets, and shares will be permanently deleted. This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="btn btn-danger flex-1"
              >
                {isDeleting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Delete Account'
                )}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
