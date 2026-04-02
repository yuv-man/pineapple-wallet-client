"use client";

import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { AuthGuard } from "@/components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/30 to-gray-100 relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-pineapple/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <Sidebar />
        <main className="lg:pl-64 pt-4 lg:pt-0 relative">
          <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">{children}</div>
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
