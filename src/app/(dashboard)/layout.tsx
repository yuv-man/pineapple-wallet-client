'use client';

import { Sidebar } from '@/components/Sidebar';
import { AuthGuard } from '@/components/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <main className="pl-64">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
