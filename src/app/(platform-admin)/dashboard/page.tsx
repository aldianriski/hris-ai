import { PlatformDashboard } from '@/components/platform/PlatformDashboard';

export default function PlatformDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of your multi-tenant SaaS platform
        </p>
      </div>

      <PlatformDashboard />
    </div>
  );
}
