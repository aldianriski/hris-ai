'use client';

import { BottomNavigation } from '@/components/layouts/BottomNavigation';
import { MobileHeader } from '@/components/layouts/MobileHeader';

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MobileHeader
        title="Talixa HRIS"
        showSearch
        notificationCount={3}
      />
      <main className="pb-20 lg:pb-8">{children}</main>
      <BottomNavigation />
    </div>
  );
}
