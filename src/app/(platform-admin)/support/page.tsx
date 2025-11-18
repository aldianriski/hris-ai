import { SupportDashboard } from '@/components/platform/SupportDashboard';

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Support & Tickets</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage customer support tickets and requests
        </p>
      </div>

      <SupportDashboard />
    </div>
  );
}
