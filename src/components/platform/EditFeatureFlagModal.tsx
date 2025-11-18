'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Switch,
  Slider,
  Chip,
} from '@heroui/react';
import { Flag, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  rollout_type: 'global' | 'percentage' | 'whitelist' | 'blacklist';
  rollout_percentage: number;
  tenant_whitelist: string[];
  tenant_blacklist: string[];
  enable_at: string | null;
  disable_at: string | null;
  created_at: string;
  updated_at: string;
}

interface EditFeatureFlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  flag: FeatureFlag;
  onSuccess: () => void;
}

export function EditFeatureFlagModal({
  isOpen,
  onClose,
  flag,
  onSuccess,
}: EditFeatureFlagModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabled: false,
    rollout_type: 'global' as 'global' | 'percentage' | 'whitelist' | 'blacklist',
    rollout_percentage: 0,
    tenant_whitelist: [] as string[],
    tenant_blacklist: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (flag) {
      setFormData({
        name: flag.name,
        description: flag.description || '',
        enabled: flag.enabled,
        rollout_type: flag.rollout_type,
        rollout_percentage: flag.rollout_percentage,
        tenant_whitelist: flag.tenant_whitelist || [],
        tenant_blacklist: flag.tenant_blacklist || [],
      });
    }
  }, [flag]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.rollout_type === 'percentage' && (formData.rollout_percentage < 0 || formData.rollout_percentage > 100)) {
      newErrors.rollout_percentage = 'Percentage must be between 0 and 100';
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

      const response = await fetch(`/api/platform/feature-flags/${flag.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update feature flag');
      }

      toast.success('Feature flag updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating feature flag:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update feature flag');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-primary" />
          <div className="flex flex-col gap-1">
            <span>Edit Feature Flag</span>
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
              {flag.key}
            </span>
          </div>
        </ModalHeader>
        <ModalBody className="gap-4">
          {/* Read-only key display */}
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Flag Key (read-only)</p>
            <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
              {flag.key}
            </p>
          </div>

          {/* Created info */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Created: {new Date(flag.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Updated: {new Date(flag.updated_at).toLocaleDateString()}</span>
            </div>
          </div>

          <Input
            label="Display Name"
            placeholder="e.g., AI Leave Approval"
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
            placeholder="Describe what this feature flag controls..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            minRows={3}
          />

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Enable Feature
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Turn this feature on or off globally
              </p>
            </div>
            <Switch
              isSelected={formData.enabled}
              onValueChange={(enabled) => setFormData({ ...formData, enabled })}
              color={formData.enabled ? 'success' : 'default'}
            />
          </div>

          <Select
            label="Rollout Strategy"
            description="How this feature will be rolled out"
            selectedKeys={[formData.rollout_type]}
            onChange={(e) => setFormData({
              ...formData,
              rollout_type: e.target.value as typeof formData.rollout_type
            })}
          >
            <SelectItem key="global" value="global">
              Global - All tenants
            </SelectItem>
            <SelectItem key="percentage" value="percentage">
              Percentage - Gradual rollout
            </SelectItem>
            <SelectItem key="whitelist" value="whitelist">
              Whitelist - Specific tenants only
            </SelectItem>
            <SelectItem key="blacklist" value="blacklist">
              Blacklist - Exclude specific tenants
            </SelectItem>
          </Select>

          {formData.rollout_type === 'percentage' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Rollout Percentage
              </label>
              <Slider
                value={formData.rollout_percentage}
                onChange={(value) => setFormData({
                  ...formData,
                  rollout_percentage: Array.isArray(value) ? value[0] : value
                })}
                minValue={0}
                maxValue={100}
                step={5}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 25, label: '25%' },
                  { value: 50, label: '50%' },
                  { value: 75, label: '75%' },
                  { value: 100, label: '100%' },
                ]}
                className="max-w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Feature will be enabled for {formData.rollout_percentage}% of tenants
              </p>
            </div>
          )}

          {formData.rollout_type === 'whitelist' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Whitelisted Tenants
              </label>
              {formData.tenant_whitelist.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.tenant_whitelist.map((tenantId) => (
                    <Chip key={tenantId} size="sm" variant="flat" color="success">
                      {tenantId.substring(0, 8)}...
                    </Chip>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No tenants whitelisted yet
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage tenant whitelist from the tenant detail page
              </p>
            </div>
          )}

          {formData.rollout_type === 'blacklist' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Blacklisted Tenants
              </label>
              {formData.tenant_blacklist.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.tenant_blacklist.map((tenantId) => (
                    <Chip key={tenantId} size="sm" variant="flat" color="warning">
                      {tenantId.substring(0, 8)}...
                    </Chip>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No tenants blacklisted yet
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage tenant blacklist from the tenant detail page
              </p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="light"
            onPress={onClose}
            isDisabled={loading}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={loading}
          >
            Update Feature Flag
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
