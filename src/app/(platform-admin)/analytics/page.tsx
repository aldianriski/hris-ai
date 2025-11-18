import { AnalyticsDashboard } from '@/components/platform/AnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Deep insights into platform performance and usage
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  );
}
