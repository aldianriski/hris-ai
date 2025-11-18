'use client';

import { Checkbox, Input, CheckboxGroup } from '@heroui/react';
import type { CreateTenantData } from '@/lib/api/types';

interface InitialSetupStepProps {
  data: Partial<CreateTenantData>;
  updateData: (data: Partial<CreateTenantData>) => void;
}

const availableModules = [
  { id: 'employee_management', name: 'Employee Management', description: 'Core employee data and profiles' },
  { id: 'attendance', name: 'Attendance Tracking', description: 'Clock in/out and attendance records' },
  { id: 'leave', name: 'Leave Management', description: 'Leave requests and approvals' },
  { id: 'payroll', name: 'Payroll Processing', description: 'Salary calculation and payslips' },
  { id: 'performance', name: 'Performance Reviews', description: 'Performance management and goals' },
  { id: 'documents', name: 'Document Management', description: 'Employee documents and files' },
];

export function InitialSetupStep({ data, updateData }: InitialSetupStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Initial Setup
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure the initial settings for the tenant
        </p>
      </div>

      {/* Enabled Modules */}
      <div>
        <label className="text-sm font-medium text-gray-900 dark:text-white mb-3 block">
          Enabled Modules
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableModules.map((module) => (
            <div
              key={module.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Checkbox
                isSelected={data.enabledModules?.includes(module.id)}
                onValueChange={(checked) => {
                  const currentModules = data.enabledModules || [];
                  const newModules = checked
                    ? [...currentModules, module.id]
                    : currentModules.filter((m) => m !== module.id);
                  updateData({ enabledModules: newModules });
                }}
              >
                <div className="ml-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {module.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {module.description}
                  </p>
                </div>
              </Checkbox>
            </div>
          ))}
        </div>
      </div>

      {/* Load Sample Data */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <Checkbox
          isSelected={data.loadSampleData}
          onValueChange={(checked) => updateData({ loadSampleData: checked })}
        >
          <div className="ml-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Load sample data
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Populate the tenant with demo employees, departments, and sample records for testing
            </p>
          </div>
        </Checkbox>
      </div>

      {/* Custom Domain (Optional) */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <Input
          label="Custom Domain (Optional)"
          placeholder="hr.company.com"
          value={data.customDomain}
          onValueChange={(value) => updateData({ customDomain: value })}
          description="For white-label branding. Leave empty to use default domain."
          classNames={{
            label: 'text-sm font-medium',
          }}
        />
      </div>

      {/* Primary Color (Optional) */}
      <div>
        <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
          Primary Brand Color
        </label>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={data.primaryColor}
            onChange={(e) => updateData({ primaryColor: e.target.value })}
            className="w-20 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
          />
          <Input
            value={data.primaryColor}
            onValueChange={(value) => updateData({ primaryColor: value })}
            placeholder="#6366f1"
            className="flex-1"
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          This will be used for buttons, links, and other UI elements
        </p>
      </div>

      {/* Review Summary */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Ready to Create Tenant
        </h4>
        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
          Please review all information before submitting:
        </p>
        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>• Company: <strong>{data.companyName || 'Not set'}</strong></li>
          <li>• Admin: <strong>{data.adminFirstName} {data.adminLastName}</strong> ({data.adminEmail})</li>
          <li>• Plan: <strong>{data.subscriptionPlan}</strong> {data.subscriptionPlan !== 'trial' && `(${data.billingCycle})`}</li>
          <li>• Modules: <strong>{data.enabledModules?.length || 0}</strong> enabled</li>
        </ul>
      </div>
    </div>
  );
}
