'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Input, Switch, Spinner } from '@heroui/react';
import { Save, AlertCircle, Palette } from 'lucide-react';
import { WhiteLabelSettings } from '../WhiteLabelSettings';

interface TenantSettingsTabProps {
  tenantId: string;
}

const defaultFeatureFlags = [
  { name: 'AI Leave Approval', key: 'ai_leave_approval' },
  { name: 'AI Anomaly Detection', key: 'ai_anomaly_detection' },
  { name: 'Payroll Error Detection', key: 'payroll_error_detection' },
  { name: 'API Access', key: 'api_access' },
  { name: 'White Label Branding', key: 'white_label' },
];

export function TenantSettingsTab({ tenantId }: TenantSettingsTabProps) {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    supportEmail: '',
    customDomain: '',
    maxEmployees: 0,
    maxStorageGb: 0,
    maxApiCallsPerMonth: 0,
    featureFlags: {} as Record<string, boolean>,
    // White-label settings
    logoUrl: null as string | null,
    faviconUrl: null as string | null,
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
  });

  useEffect(() => {
    fetchTenant();
  }, [tenantId]);

  const fetchTenant = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/platform/tenants/${tenantId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch tenant');
      }

      const result = await response.json();
      const tenantData = result.tenant;

      setTenant(tenantData);
      setFormData({
        companyName: tenantData.company_name || '',
        supportEmail: tenantData.support_email || '',
        customDomain: tenantData.custom_domain || '',
        maxEmployees: tenantData.max_employees || 0,
        maxStorageGb: tenantData.max_storage_gb || 0,
        maxApiCallsPerMonth: tenantData.max_api_calls_per_month || 0,
        featureFlags: tenantData.feature_flags || {},
        logoUrl: tenantData.logo_url || null,
        faviconUrl: tenantData.favicon_url || null,
        primaryColor: tenantData.primary_color || '#6366f1',
        secondaryColor: tenantData.secondary_color || '#8b5cf6',
      });
    } catch (err) {
      console.error('Error fetching tenant:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`/api/platform/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update tenant');
      }

      setSuccess(true);
      fetchTenant(); // Refresh data

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating tenant:', err);
      setError(err instanceof Error ? err.message : 'Failed to update tenant');
    } finally {
      setSaving(false);
    }
  };

  const handleFeatureFlagChange = (key: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      featureFlags: {
        ...prev.featureFlags,
        [key]: value,
      },
    }));
  };

  const handleWhiteLabelUpdate = (settings: {
    logoUrl?: string | null;
    faviconUrl?: string | null;
    primaryColor?: string;
    secondaryColor?: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      ...settings,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !tenant) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 text-red-500 mb-4">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
        <Button size="sm" variant="flat" onPress={fetchTenant}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400">
            Settings updated successfully!
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* General Settings */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            General Settings
          </h3>

          <div className="space-y-4">
            <Input
              label="Company Name"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              isDisabled={saving}
              classNames={{ label: 'text-sm font-medium' }}
            />

            <Input
              label="Support Email"
              type="email"
              placeholder="support@company.com"
              value={formData.supportEmail}
              onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
              isDisabled={saving}
              classNames={{ label: 'text-sm font-medium' }}
            />

            <Input
              label="Custom Domain"
              placeholder="hr.company.com"
              value={formData.customDomain}
              onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
              description="Leave empty to use default domain"
              isDisabled={saving}
              classNames={{ label: 'text-sm font-medium' }}
            />
          </div>
        </CardBody>
      </Card>

      {/* White-Label Branding */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-2 mb-6">
            <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              White-Label Branding
            </h3>
          </div>

          <WhiteLabelSettings
            tenantId={tenantId}
            currentSettings={{
              logoUrl: formData.logoUrl,
              faviconUrl: formData.faviconUrl,
              primaryColor: formData.primaryColor,
              secondaryColor: formData.secondaryColor,
              customDomain: formData.customDomain,
            }}
            onUpdate={handleWhiteLabelUpdate}
            disabled={saving}
          />
        </CardBody>
      </Card>

      {/* Feature Flags */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Feature Access
          </h3>

          <div className="space-y-4">
            {defaultFeatureFlags.map((feature) => (
              <div key={feature.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {feature.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enable or disable this feature for the tenant
                  </p>
                </div>
                <Switch
                  isSelected={formData.featureFlags[feature.key] || false}
                  onValueChange={(checked) => handleFeatureFlagChange(feature.key, checked)}
                  isDisabled={saving}
                />
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
              value={formData.maxEmployees.toString()}
              onChange={(e) =>
                setFormData({ ...formData, maxEmployees: parseInt(e.target.value) || 0 })
              }
              isDisabled={saving}
              classNames={{ label: 'text-sm font-medium' }}
              min={0}
            />

            <Input
              type="number"
              label="Max Storage (GB)"
              value={formData.maxStorageGb.toString()}
              onChange={(e) =>
                setFormData({ ...formData, maxStorageGb: parseInt(e.target.value) || 0 })
              }
              isDisabled={saving}
              classNames={{ label: 'text-sm font-medium' }}
              min={0}
            />

            <Input
              type="number"
              label="Max API Calls (Monthly)"
              value={formData.maxApiCallsPerMonth.toString()}
              onChange={(e) =>
                setFormData({ ...formData, maxApiCallsPerMonth: parseInt(e.target.value) || 0 })
              }
              isDisabled={saving}
              classNames={{ label: 'text-sm font-medium' }}
              min={0}
            />
          </div>
        </CardBody>
      </Card>

      {/* Usage Information */}
      {tenant && (
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardBody>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Usage
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Employees</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {tenant.current_employee_count || 0} / {formData.maxEmployees}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Storage</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {tenant.current_storage_gb || 0} GB / {formData.maxStorageGb} GB
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">API Calls (This Month)</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {tenant.current_api_calls || 0} / {formData.maxApiCallsPerMonth}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end">
        <Button
          color="primary"
          startContent={<Save className="w-4 h-4" />}
          onPress={handleSave}
          isLoading={saving}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
