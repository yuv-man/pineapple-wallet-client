"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wallet,
  Building2,
  Share2,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { authApi, sharingApi, propertySharingApi } from "@/lib/api";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Portfolios", href: "/portfolios", icon: Wallet },
  { name: "Properties", href: "/properties", icon: Building2 },
  { name: "Liabilities", href: "/liabilities", icon: CreditCard },
  { name: "Shared With Me", href: "/shared", icon: Share2 },
  { name: "Invitations", href: "/invitations", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, refreshToken } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0);

  // Fetch pending invitations count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const [portfolioRes, propertyRes] = await Promise.all([
          sharingApi.getInvitations().catch(() => ({ data: [] })),
          propertySharingApi
            .getPropertyInvitations()
            .catch(() => ({ data: [] })),
        ]);
        const total =
          (portfolioRes.data?.length || 0) + (propertyRes.data?.length || 0);
        setPendingInvitationsCount(total);
      } catch (error) {
        console.error("Failed to fetch invitations count:", error);
      }
    };

    fetchPendingCount();
    // Refetch every 30 seconds to keep badge updated
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout(refreshToken || undefined);
    } catch {
      // Ignore errors, still log out locally
    }
    logout();
    router.push("/login");
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-white/30">
        <motion.img
          src="/favicon.ico"
          alt="Pineapple Wallet"
          className="w-8 h-8 object-contain"
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        />
        <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Pineapple
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item, index) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-r from-pineapple/20 to-pineapple/10 text-pineapple-dark shadow-sm"
                    : "text-gray-600 hover:bg-white/50 hover:text-gray-900",
                )}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="relative"
                >
                  <item.icon className="h-5 w-5" />
                  {/* Notification badge for Invitations */}
                  {item.name === "Invitations" &&
                    pendingInvitationsCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1
                                 bg-red-500 text-white text-[10px] font-bold
                                 rounded-full flex items-center justify-center
                                 shadow-sm"
                      >
                        {pendingInvitationsCount > 9
                          ? "9+"
                          : pendingInvitationsCount}
                      </motion.span>
                    )}
                </motion.div>
                {item.name}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-pineapple to-pineapple-dark rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/30 p-4 mb-20">
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-pineapple/30 to-pineapple/10
                       backdrop-blur-sm border border-pineapple/20
                       flex items-center justify-center text-pineapple-dark font-semibold
                       shadow-sm"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1"
          >
            <Link
              href="/settings"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl
                         bg-white/40 backdrop-blur-sm border border-white/50
                         text-gray-600 hover:bg-white/60 hover:text-gray-900
                         transition-all duration-300 text-sm"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1"
          >
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl
                         bg-red-50/50 backdrop-blur-sm border border-red-100/50
                         text-red-600 hover:bg-red-100/50
                         transition-all duration-300 text-sm"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <motion.button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-[max(1rem,env(safe-area-inset-top))] right-4 z-50 p-2.5 rounded-xl
                   bg-white/70 backdrop-blur-xl border border-white/50
                   shadow-glass hover:shadow-glass-prominent
                   transition-all duration-300"
        aria-label="Toggle menu"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Notification badge on hamburger menu */}
        {pendingInvitationsCount > 0 && !isMobileMenuOpen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
                       bg-red-500 text-white text-[10px] font-bold
                       rounded-full flex items-center justify-center
                       shadow-sm"
          >
            {pendingInvitationsCount > 9 ? "9+" : pendingInvitationsCount}
          </motion.span>
        )}
        <AnimatePresence mode="wait">
          {isMobileMenuOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6 text-gray-700" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-64
                        bg-white/70 backdrop-blur-xl border-r border-white/30 shadow-glass"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="lg:hidden fixed left-0 top-0 z-40 h-screen w-64
                       bg-white/80 backdrop-blur-xl border-r border-white/30 shadow-glass-prominent"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
