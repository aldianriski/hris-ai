import { PlatformUsersTable } from '@/components/platform/PlatformUsersTable';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Users</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage platform administrators and staff
          </p>
        </div>
      </div>

      <PlatformUsersTable />
    </div>
  );
}
