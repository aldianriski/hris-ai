import Link from 'next/link';
import { Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import { TenantListTable } from '@/components/platform/TenantListTable';

export default function TenantsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tenants</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage all customer companies on your platform
          </p>
        </div>

        <Link href="/(platform-admin)/tenants/new">
          <Button color="primary" startContent={<Plus className="w-4 h-4" />}>
            Create Tenant
          </Button>
        </Link>
      </div>

      <TenantListTable />
    </div>
  );
}
