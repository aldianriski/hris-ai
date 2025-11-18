import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Deep insights into platform performance and usage
        </p>
      </div>

      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Coming Soon
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            Advanced analytics and reporting features will be available in Sprint 16.
          </p>
        </div>
      </div>
    </div>
  );
}
