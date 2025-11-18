import Link from 'next/link';
import { Button } from '@heroui/react';
import { ShieldAlert, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">
            You don't have permission to access this page. This area requires platform admin privileges.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            If you believe you should have access, please contact your system administrator.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            as={Link}
            href="/"
            color="primary"
            startContent={<Home className="w-4 h-4" />}
          >
            Go to Homepage
          </Button>
          <Button
            as={Link}
            href="/auth/logout"
            variant="bordered"
          >
            Sign Out
          </Button>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Error Code: 403 - Forbidden
          </p>
        </div>
      </div>
    </div>
  );
}
