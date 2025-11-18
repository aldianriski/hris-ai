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
  Select,
  SelectItem,
  Switch,
  Slider,
} from '@heroui/react';
import { Flag } from 'lucide-react';
import { toast } from 'sonner';

interface CreateFeatureFlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateFeatureFlagModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateFeatureFlagModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    enabled: false,
    rollout_type: 'global' as 'global' | 'percentage' | 'whitelist' | 'blacklist',
    rollout_percentage: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.key.trim()) {
      newErrors.key = 'Key is required';
    } else if (!/^[a-z0-9_]+$/.test(formData.key)) {
      newErrors.key = 'Key must be lowercase alphanumeric with underscores only';
    }

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

      const response = await fetch('/api/platform/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create feature flag');
      }

      toast.success('Feature flag created successfully');
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error creating feature flag:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create feature flag');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      key: '',
      name: '',
      description: '',
      enabled: false,
      rollout_type: 'global',
      rollout_percentage: 0,
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-primary" />
          <span>Create Feature Flag</span>
        </ModalHeader>
        <ModalBody className="gap-4">
          <Input
            label="Flag Key"
            placeholder="e.g., ai_leave_approval"
            description="Unique identifier (lowercase, alphanumeric, underscores only)"
            value={formData.key}
            onChange={(e) => {
              setFormData({ ...formData, key: e.target.value });
              setErrors({ ...errors, key: '' });
            }}
            isInvalid={!!errors.key}
            errorMessage={errors.key}
            isRequired
          />

          <Input
            label="Display Name"
            placeholder="e.g., AI Leave Approval"
            description="Human-readable name for this feature"
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
            description="Optional description for documentation"
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
                Turn on this feature immediately after creation
              </p>
            </div>
            <Switch
              isSelected={formData.enabled}
              onValueChange={(enabled) => setFormData({ ...formData, enabled })}
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
            <SelectItem key="global">
              Global - All tenants
            </SelectItem>
            <SelectItem key="percentage">
              Percentage - Gradual rollout
            </SelectItem>
            <SelectItem key="whitelist">
              Whitelist - Specific tenants only
            </SelectItem>
            <SelectItem key="blacklist">
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

          {(formData.rollout_type === 'whitelist' || formData.rollout_type === 'blacklist') && (
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {formData.rollout_type === 'whitelist'
                  ? 'You can add specific tenants to the whitelist after creating the flag'
                  : 'You can add specific tenants to the blacklist after creating the flag'}
              </p>
            </div>
          )}
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
            Create Feature Flag
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
