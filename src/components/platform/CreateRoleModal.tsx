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
  Accordion,
  AccordionItem,
  Checkbox,
  Chip,
} from '@heroui/react';
import { Shield, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { PERMISSION_MODULES } from '@/lib/permissions/definitions';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateRoleModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRoleModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    type: 'tenant' as 'platform' | 'tenant',
    scope: 'global',
  });
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9_]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must be lowercase alphanumeric with underscores only';
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

      const response = await fetch('/api/platform/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          permissions: Array.from(selectedPermissions),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create role');
      }

      toast.success('Role created successfully');
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      type: 'tenant',
      scope: 'global',
    });
    setSelectedPermissions(new Set());
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const togglePermission = (permissionSlug: string) => {
    const newPermissions = new Set(selectedPermissions);
    if (newPermissions.has(permissionSlug)) {
      newPermissions.delete(permissionSlug);
    } else {
      newPermissions.add(permissionSlug);
    }
    setSelectedPermissions(newPermissions);
  };

  const toggleAllModulePermissions = (moduleId: string) => {
    const module = PERMISSION_MODULES.find(m => m.id === moduleId);
    if (!module) return;

    const modulePermissionSlugs = module.permissions.map(p => p.slug);
    const allSelected = modulePermissionSlugs.every(slug => selectedPermissions.has(slug));

    const newPermissions = new Set(selectedPermissions);
    if (allSelected) {
      // Deselect all
      modulePermissionSlugs.forEach(slug => newPermissions.delete(slug));
    } else {
      // Select all
      modulePermissionSlugs.forEach(slug => newPermissions.add(slug));
    }
    setSelectedPermissions(newPermissions);
  };

  // Filter modules by role type
  const filteredModules = PERMISSION_MODULES.filter(m => m.category === formData.type);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span>Create Role</span>
        </ModalHeader>
        <ModalBody className="gap-4">
          <Input
            label="Role Name"
            placeholder="e.g., HR Manager"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              setErrors({ ...errors, name: '' });
            }}
            isInvalid={!!errors.name}
            errorMessage={errors.name}
            isRequired
          />

          <Input
            label="Slug"
            placeholder="e.g., hr_manager"
            description="Unique identifier (lowercase, alphanumeric, underscores only)"
            value={formData.slug}
            onChange={(e) => {
              setFormData({ ...formData, slug: e.target.value });
              setErrors({ ...errors, slug: '' });
            }}
            isInvalid={!!errors.slug}
            errorMessage={errors.slug}
            isRequired
          />

          <Textarea
            label="Description"
            placeholder="Describe this role's purpose and responsibilities..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            minRows={2}
          />

          <Select
            label="Role Type"
            description="Platform roles for admins, Tenant roles for customer users"
            selectedKeys={[formData.type]}
            onChange={(e) => {
              setFormData({ ...formData, type: e.target.value as 'platform' | 'tenant' });
              setSelectedPermissions(new Set()); // Clear permissions when type changes
            }}
            isRequired
          >
            <SelectItem key="platform">
              Platform Role (For platform administrators)
            </SelectItem>
            <SelectItem key="tenant">
              Tenant Role (For customer company users)
            </SelectItem>
          </Select>

          <Select
            label="Scope"
            description="Defines the access scope for this role"
            selectedKeys={[formData.scope]}
            onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
          >
            <SelectItem key="global">
              Global - Full access within context
            </SelectItem>
            <SelectItem key="tenant">
              Tenant - Limited to tenant data
            </SelectItem>
            <SelectItem key="department">
              Department - Limited to department
            </SelectItem>
            <SelectItem key="self">
              Self - Own data only
            </SelectItem>
          </Select>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Permissions
                <span className="ml-2 text-xs text-gray-500">
                  ({selectedPermissions.size} selected)
                </span>
              </label>
              {selectedPermissions.size > 0 && (
                <Button
                  size="sm"
                  variant="flat"
                  color="warning"
                  onPress={() => setSelectedPermissions(new Set())}
                >
                  Clear All
                </Button>
              )}
            </div>

            <Accordion variant="splitted">
              {filteredModules.map((module) => {
                const modulePermissionSlugs = module.permissions.map(p => p.slug);
                const selectedCount = modulePermissionSlugs.filter(slug =>
                  selectedPermissions.has(slug)
                ).length;
                const allSelected = selectedCount === modulePermissionSlugs.length;

                return (
                  <AccordionItem
                    key={module.id}
                    aria-label={module.name}
                    title={
                      <div className="flex items-center justify-between flex-1 pr-2">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{module.name}</span>
                          <span className="text-xs text-gray-500">{module.description}</span>
                        </div>
                        {selectedCount > 0 && (
                          <Chip size="sm" color="primary" variant="flat">
                            {selectedCount}/{modulePermissionSlugs.length}
                          </Chip>
                        )}
                      </div>
                    }
                  >
                    <div className="space-y-2 pt-2">
                      <Checkbox
                        isSelected={allSelected}
                        onChange={() => toggleAllModulePermissions(module.id)}
                      >
                        <span className="text-sm font-medium">
                          Select All {module.name} Permissions
                        </span>
                      </Checkbox>
                      <div className="pl-6 space-y-2">
                        {module.permissions.map((permission) => (
                          <Checkbox
                            key={permission.slug}
                            isSelected={selectedPermissions.has(permission.slug)}
                            onChange={() => togglePermission(permission.slug)}
                          >
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium">{permission.name}</span>
                              <span className="text-xs text-gray-500">{permission.description}</span>
                            </div>
                          </Checkbox>
                        ))}
                      </div>
                    </div>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>

          {selectedPermissions.size > 0 && (
            <div className="p-3 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success-600 dark:text-success-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-success-800 dark:text-success-200">
                  {selectedPermissions.size} permission{selectedPermissions.size !== 1 ? 's' : ''} selected for this role
                </p>
              </div>
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
            Create Role
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
