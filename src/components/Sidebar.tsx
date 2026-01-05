'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Wallet,
  Share2,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Portfolios', href: '/portfolios', icon: Wallet },
  { name: 'Shared With Me', href: '/shared', icon: Share2 },
  { name: 'Invitations', href: '/invitations', icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, refreshToken } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout(refreshToken || undefined);
    } catch {
      // Ignore errors, still log out locally
    }
    logout();
    router.push('/login');
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-pineapple rounded-lg flex items-center justify-center">
            <span className="text-lg">🍍</span>
          </div>
          <span className="text-lg font-bold text-gray-900">Pineapple</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-yellow-50 text-pineapple-dark'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-pineapple/20 flex items-center justify-center text-pineapple-dark font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/settings"
              className="flex-1 btn btn-ghost text-sm justify-center"
            >
              <Settings className="h-4 w-4" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 btn btn-ghost text-sm text-red-600 hover:bg-red-50 justify-center"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
