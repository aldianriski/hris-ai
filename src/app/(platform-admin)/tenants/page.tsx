import Link from 'next/link';
import { Button } from '@heroui/react';
import { Plus, Building2 } from 'lucide-react';
import { TenantListTable } from '@/components/platform/TenantListTable';

export default function TenantsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Tenants
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage all customer companies and their subscriptions
            </p>
          </div>
        </div>

        <Link href="/(platform-admin)/tenants/new">
          <Button
            color="primary"
            variant="shadow"
            size="lg"
            startContent={<Plus className="w-5 h-5" />}
            className="font-semibold"
          >
            Create Tenant
          </Button>
        </Link>
      </div>

      <TenantListTable />
    </div>
  );
}
