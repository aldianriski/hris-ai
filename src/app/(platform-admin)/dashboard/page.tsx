import { PlatformDashboard } from '@/components/platform/PlatformDashboard';
import { Activity } from 'lucide-react';

export default function PlatformDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
          <Activity className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Platform Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Real-time overview of your multi-tenant SaaS platform performance
          </p>
        </div>
      </div>

      <PlatformDashboard />
    </div>
  );
}
