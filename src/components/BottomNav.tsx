"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Wallet, Building2 } from "lucide-react";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "gray",
    activeGradient: "from-gray-500/20 to-gray-400/10",
    activeText: "text-gray-700",
    activeIcon: "text-gray-600",
    glowColor: "shadow-[0_0_20px_rgba(107,114,128,0.3)]",
  },
  {
    name: "Portfolios",
    href: "/portfolios",
    icon: Wallet,
    color: "pineapple",
    activeGradient: "from-pineapple/25 to-pineapple/10",
    activeText: "text-pineapple-dark",
    activeIcon: "text-pineapple",
    glowColor: "shadow-glow-pineapple",
  },
  {
    name: "Properties",
    href: "/properties",
    icon: Building2,
    color: "salmon",
    activeGradient: "from-salmon/25 to-salmon/10",
    activeText: "text-salmon-dark",
    activeIcon: "text-salmon",
    glowColor: "shadow-glow-salmon",
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.2 }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
    >
      {/* Gradient fade effect at top */}
      <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />

      {/* Main nav container */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-white/50 shadow-[0_-4px_30px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative flex-1 flex flex-col items-center"
              >
                <motion.div
                  className={cn(
                    "relative flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-300",
                    isActive && `bg-gradient-to-b ${item.activeGradient}`
                  )}
                  whileTap={{ scale: 0.92 }}
                >
                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className={cn(
                        "absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                        item.color === "pineapple" && "bg-pineapple",
                        item.color === "salmon" && "bg-salmon",
                        item.color === "gray" && "bg-gray-500"
                      )}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}

                  {/* Icon with glow effect when active */}
                  <motion.div
                    className={cn(
                      "relative p-1.5 rounded-xl transition-all duration-300",
                      isActive && item.glowColor
                    )}
                    animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-colors duration-300",
                        isActive ? item.activeIcon : "text-gray-400"
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </motion.div>

                  {/* Label */}
                  <motion.span
                    className={cn(
                      "text-[10px] font-semibold mt-0.5 transition-colors duration-300",
                      isActive ? item.activeText : "text-gray-400"
                    )}
                    animate={isActive ? { y: 0, opacity: 1 } : { y: 0, opacity: 0.7 }}
                  >
                    {item.name}
                  </motion.span>

                  {/* Ripple effect on tap */}
                  {isActive && (
                    <motion.div
                      className={cn(
                        "absolute inset-0 rounded-2xl opacity-0",
                        item.color === "pineapple" && "bg-pineapple/20",
                        item.color === "salmon" && "bg-salmon/20",
                        item.color === "gray" && "bg-gray-500/20"
                      )}
                      initial={{ opacity: 0.5, scale: 0.8 }}
                      animate={{ opacity: 0, scale: 1.2 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Safe area padding for devices with home indicator */}
        <div className="h-safe-area-inset-bottom bg-white/80" />
      </div>
    </motion.nav>
  );
}
