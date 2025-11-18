import { TenantCreationWizard } from '@/components/platform/TenantCreationWizard';

export default function NewTenantPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Tenant</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Set up a new customer company on the platform
        </p>
      </div>

      <TenantCreationWizard />
    </div>
  );
}
