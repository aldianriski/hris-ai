'use client';

import { Input, Checkbox } from '@heroui/react';
import type { CreateTenantData } from '@/lib/api/types';

interface AdminUserStepProps {
  data: Partial<CreateTenantData>;
  updateData: (data: Partial<CreateTenantData>) => void;
}

export function AdminUserStep({ data, updateData }: AdminUserStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Primary Administrator
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Set up the company admin account who will manage this tenant
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <Input
          label="First Name"
          placeholder="Budi"
          value={data.adminFirstName}
          onValueChange={(value) => updateData({ adminFirstName: value })}
          isRequired
          classNames={{
            label: 'text-sm font-medium',
          }}
        />

        {/* Last Name */}
        <Input
          label="Last Name"
          placeholder="Santoso"
          value={data.adminLastName}
          onValueChange={(value) => updateData({ adminLastName: value })}
          isRequired
          classNames={{
            label: 'text-sm font-medium',
          }}
        />

        {/* Email */}
        <Input
          type="email"
          label="Email Address"
          placeholder="admin@company.com"
          value={data.adminEmail}
          onValueChange={(value) => updateData({ adminEmail: value })}
          isRequired
          description="This will be used for login"
          classNames={{
            label: 'text-sm font-medium',
          }}
        />

        {/* Phone */}
        <Input
          type="tel"
          label="Phone Number"
          placeholder="+62 812 3456 7890"
          value={data.adminPhone || ''}
          onValueChange={(value) => updateData({ adminPhone: value || null })}
          classNames={{
            label: 'text-sm font-medium',
          }}
        />
      </div>

      {/* Send Welcome Email */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <Checkbox
          isSelected={data.sendWelcomeEmail}
          onValueChange={(checked) => updateData({ sendWelcomeEmail: checked })}
        >
          <div className="ml-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Send welcome email
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              The admin will receive an email with login credentials and onboarding instructions
            </p>
          </div>
        </Checkbox>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Note:</strong> A temporary password will be generated and sent to the admin's email.
          They will be prompted to change it on first login.
        </p>
      </div>
    </div>
  );
}
