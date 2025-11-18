'use client';

import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Switch,
  Tabs,
  Tab,
  Chip,
} from '@heroui/react';
import { CreditCard, Package, Zap, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';

interface CreateSubscriptionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AVAILABLE_MODULES = [
  'employee_management',
  'attendance',
  'leave',
  'payroll',
  'performance',
  'documents',
  'compliance',
  'workflows',
];

export function CreateSubscriptionPlanModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateSubscriptionPlanModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    description: '',
    pricing_monthly: 0,
    pricing_annual: 0,
    currency: 'IDR',
    per_employee: false,
    max_employees: null as number | null,
    max_admins: 5,
    max_storage_gb: 10,
    max_api_calls_per_month: null as number | null,
    features: [] as string[],
    enabled_modules: [] as string[],
    ai_features_enabled: false,
    ai_leave_approval: false,
    ai_anomaly_detection: false,
    ai_payroll_error_detection: false,
    custom_reports: false,
    api_access: false,
    sso_enabled: false,
    white_label_enabled: false,
    dedicated_support: false,
    sla_uptime: '',
    trial_days: 0,
    is_active: true,
    is_public: true,
    is_featured: false,
    sort_order: 0,
  });

  const [featureInput, setFeatureInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9_-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must be lowercase alphanumeric with hyphens/underscores only';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.pricing_monthly < 0) {
      newErrors.pricing_monthly = 'Monthly price cannot be negative';
    }

    if (formData.pricing_annual < 0) {
      newErrors.pricing_annual = 'Annual price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/platform/subscription-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription plan');
      }

      toast.success('Subscription plan created successfully');
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create subscription plan');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      name: '',
      description: '',
      pricing_monthly: 0,
      pricing_annual: 0,
      currency: 'IDR',
      per_employee: false,
      max_employees: null,
      max_admins: 5,
      max_storage_gb: 10,
      max_api_calls_per_month: null,
      features: [],
      enabled_modules: [],
      ai_features_enabled: false,
      ai_leave_approval: false,
      ai_anomaly_detection: false,
      ai_payroll_error_detection: false,
      custom_reports: false,
      api_access: false,
      sso_enabled: false,
      white_label_enabled: false,
      dedicated_support: false,
      sla_uptime: '',
      trial_days: 0,
      is_active: true,
      is_public: true,
      is_featured: false,
      sort_order: 0,
    });
    setFeatureInput('');
    setErrors({});
    setActiveTab('basic');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      });
      setFeatureInput('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData({
      ...formData,
      features: formData.features.filter(f => f !== feature),
    });
  };

  const toggleModule = (module: string) => {
    if (formData.enabled_modules.includes(module)) {
      setFormData({
        ...formData,
        enabled_modules: formData.enabled_modules.filter(m => m !== module),
      });
    } else {
      setFormData({
        ...formData,
        enabled_modules: [...formData.enabled_modules, module],
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          <span>Create Subscription Plan</span>
        </ModalHeader>
        <ModalBody>
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            aria-label="Plan configuration tabs"
            color="primary"
          >
            {/* Basic Info Tab */}
            <Tab
              key="basic"
              title={
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>Basic Info</span>
                </div>
              }
            >
              <div className="space-y-4 py-4">
                <Input
                  label="Plan Slug"
                  placeholder="e.g., professional"
                  description="Unique identifier (lowercase, alphanumeric, hyphens/underscores only)"
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData({ ...formData, slug: e.target.value });
                    setErrors({ ...errors, slug: '' });
                  }}
                  isInvalid={!!errors.slug}
                  errorMessage={errors.slug}
                  isRequired
                />

                <Input
                  label="Plan Name"
                  placeholder="e.g., Professional"
                  description="Display name for this plan"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setErrors({ ...errors, name: '' });
                  }}
                  isInvalid={!!errors.name}
                  errorMessage={errors.name}
                  isRequired
                />

                <Textarea
                  label="Description"
                  placeholder="Describe this subscription plan..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  minRows={2}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="Monthly Price"
                    placeholder="0"
                    value={formData.pricing_monthly.toString()}
                    onChange={(e) => setFormData({ ...formData, pricing_monthly: parseFloat(e.target.value) || 0 })}
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">{formData.currency}</span>
                      </div>
                    }
                    isInvalid={!!errors.pricing_monthly}
                    errorMessage={errors.pricing_monthly}
                  />

                  <Input
                    type="number"
                    label="Annual Price"
                    placeholder="0"
                    value={formData.pricing_annual.toString()}
                    onChange={(e) => setFormData({ ...formData, pricing_annual: parseFloat(e.target.value) || 0 })}
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">{formData.currency}</span>
                      </div>
                    }
                    description="Typically 20% discount"
                    isInvalid={!!errors.pricing_annual}
                    errorMessage={errors.pricing_annual}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div>
                    <p className="text-sm font-medium">Per Employee Pricing</p>
                    <p className="text-xs text-gray-500">Multiply price by employee count</p>
                  </div>
                  <Switch
                    isSelected={formData.per_employee}
                    onValueChange={(per_employee) => setFormData({ ...formData, per_employee })}
                  />
                </div>

                <Input
                  type="number"
                  label="Trial Days"
                  placeholder="14"
                  value={formData.trial_days.toString()}
                  onChange={(e) => setFormData({ ...formData, trial_days: parseInt(e.target.value) || 0 })}
                  description="Number of trial days (0 for no trial)"
                />
              </div>
            </Tab>

            {/* Limits Tab */}
            <Tab
              key="limits"
              title={
                <div className="flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4" />
                  <span>Limits</span>
                </div>
              }
            >
              <div className="space-y-4 py-4">
                <Input
                  type="number"
                  label="Max Employees"
                  placeholder="Leave empty for unlimited"
                  value={formData.max_employees?.toString() || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    max_employees: e.target.value ? parseInt(e.target.value) : null
                  })}
                  description="Maximum number of employees (empty for unlimited)"
                />

                <Input
                  type="number"
                  label="Max Admins"
                  placeholder="5"
                  value={formData.max_admins.toString()}
                  onChange={(e) => setFormData({ ...formData, max_admins: parseInt(e.target.value) || 5 })}
                />

                <Input
                  type="number"
                  label="Max Storage (GB)"
                  placeholder="10"
                  value={formData.max_storage_gb.toString()}
                  onChange={(e) => setFormData({ ...formData, max_storage_gb: parseInt(e.target.value) || 10 })}
                />

                <Input
                  type="number"
                  label="Max API Calls/Month"
                  placeholder="Leave empty for unlimited"
                  value={formData.max_api_calls_per_month?.toString() || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    max_api_calls_per_month: e.target.value ? parseInt(e.target.value) : null
                  })}
                  description="Maximum API calls per month (empty for unlimited)"
                />
              </div>
            </Tab>

            {/* Features Tab */}
            <Tab
              key="features"
              title={
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Features</span>
                </div>
              }
            >
              <div className="space-y-4 py-4">
                {/* Marketing Features */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Marketing Features</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a feature (e.g., Priority Support)"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                    />
                    <Button color="primary" onPress={addFeature}>
                      Add
                    </Button>
                  </div>
                  {formData.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.features.map((feature) => (
                        <Chip
                          key={feature}
                          onClose={() => removeFeature(feature)}
                          variant="flat"
                        >
                          {feature}
                        </Chip>
                      ))}
                    </div>
                  )}
                </div>

                {/* Enabled Modules */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Enabled Modules</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_MODULES.map((module) => (
                      <Chip
                        key={module}
                        onClick={() => toggleModule(module)}
                        variant={formData.enabled_modules.includes(module) ? 'solid' : 'flat'}
                        color={formData.enabled_modules.includes(module) ? 'primary' : 'default'}
                        className="cursor-pointer"
                      >
                        {module.replace('_', ' ')}
                      </Chip>
                    ))}
                  </div>
                </div>

                {/* AI Features */}
                <div className="space-y-3 pt-4 border-t">
                  <label className="text-sm font-medium">AI Features</label>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div>
                      <p className="text-sm font-medium">AI Features Enabled</p>
                      <p className="text-xs text-gray-500">Enable AI-powered features</p>
                    </div>
                    <Switch
                      isSelected={formData.ai_features_enabled}
                      onValueChange={(ai_features_enabled) => setFormData({ ...formData, ai_features_enabled })}
                    />
                  </div>

                  {formData.ai_features_enabled && (
                    <>
                      <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                        <span className="text-sm">AI Leave Approval</span>
                        <Switch
                          size="sm"
                          isSelected={formData.ai_leave_approval}
                          onValueChange={(ai_leave_approval) => setFormData({ ...formData, ai_leave_approval })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                        <span className="text-sm">AI Anomaly Detection</span>
                        <Switch
                          size="sm"
                          isSelected={formData.ai_anomaly_detection}
                          onValueChange={(ai_anomaly_detection) => setFormData({ ...formData, ai_anomaly_detection })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                        <span className="text-sm">AI Payroll Error Detection</span>
                        <Switch
                          size="sm"
                          isSelected={formData.ai_payroll_error_detection}
                          onValueChange={(ai_payroll_error_detection) => setFormData({ ...formData, ai_payroll_error_detection })}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Advanced Features */}
                <div className="space-y-3 pt-4 border-t">
                  <label className="text-sm font-medium">Advanced Features</label>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                      <span className="text-sm">Custom Reports</span>
                      <Switch
                        size="sm"
                        isSelected={formData.custom_reports}
                        onValueChange={(custom_reports) => setFormData({ ...formData, custom_reports })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                      <span className="text-sm">API Access</span>
                      <Switch
                        size="sm"
                        isSelected={formData.api_access}
                        onValueChange={(api_access) => setFormData({ ...formData, api_access })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                      <span className="text-sm">SSO</span>
                      <Switch
                        size="sm"
                        isSelected={formData.sso_enabled}
                        onValueChange={(sso_enabled) => setFormData({ ...formData, sso_enabled })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                      <span className="text-sm">White Label</span>
                      <Switch
                        size="sm"
                        isSelected={formData.white_label_enabled}
                        onValueChange={(white_label_enabled) => setFormData({ ...formData, white_label_enabled })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                      <span className="text-sm">Dedicated Support</span>
                      <Switch
                        size="sm"
                        isSelected={formData.dedicated_support}
                        onValueChange={(dedicated_support) => setFormData({ ...formData, dedicated_support })}
                      />
                    </div>
                  </div>

                  <Input
                    label="SLA Uptime"
                    placeholder="e.g., 99.9%"
                    value={formData.sla_uptime}
                    onChange={(e) => setFormData({ ...formData, sla_uptime: e.target.value })}
                    description="Service Level Agreement uptime guarantee"
                  />
                </div>
              </div>
            </Tab>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="light"
            onPress={handleClose}
            isDisabled={loading}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={loading}
          >
            Create Plan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
