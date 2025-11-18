import { BillingDashboard } from '@/components/platform/BillingDashboard';

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Revenue</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor revenue, subscriptions, and payment processing
        </p>
      </div>

      <BillingDashboard />
    </div>
  );
}
