'use client';

import { Card, CardBody, Button, Input, Switch } from '@heroui/react';
import { Save } from 'lucide-react';

interface TenantSettingsTabProps {
  tenant: any;
}

export function TenantSettingsTab({ tenant }: TenantSettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            General Settings
          </h3>

          <div className="space-y-4">
            <Input
              label="Company Name"
              defaultValue={tenant.companyName}
              classNames={{ label: 'text-sm font-medium' }}
            />

            <Input
              label="Support Email"
              type="email"
              placeholder="support@company.com"
              classNames={{ label: 'text-sm font-medium' }}
            />

            <Input
              label="Custom Domain"
              placeholder="hr.company.com"
              defaultValue={tenant.customDomain || ''}
              description="Leave empty to use default domain"
              classNames={{ label: 'text-sm font-medium' }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Feature Flags */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Feature Access
          </h3>

          <div className="space-y-4">
            {[
              { name: 'AI Leave Approval', key: 'ai_leave_approval', enabled: true },
              { name: 'AI Anomaly Detection', key: 'ai_anomaly_detection', enabled: true },
              { name: 'Payroll Error Detection', key: 'payroll_error_detection', enabled: true },
              { name: 'API Access', key: 'api_access', enabled: false },
              { name: 'White Label Branding', key: 'white_label', enabled: false },
            ].map((feature) => (
              <div key={feature.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {feature.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enable or disable this feature for the tenant
                  </p>
                </div>
                <Switch defaultSelected={feature.enabled} />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Limits */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Resource Limits
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              label="Max Employees"
              defaultValue={tenant.maxEmployees.toString()}
              classNames={{ label: 'text-sm font-medium' }}
            />

            <Input
              type="number"
              label="Max Storage (GB)"
              defaultValue="50"
              classNames={{ label: 'text-sm font-medium' }}
            />

            <Input
              type="number"
              label="Max API Calls (Monthly)"
              defaultValue="50000"
              classNames={{ label: 'text-sm font-medium' }}
            />

            <Input
              type="number"
              label="Max Admins"
              defaultValue="5"
              classNames={{ label: 'text-sm font-medium' }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button
          color="primary"
          startContent={<Save className="w-4 h-4" />}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
