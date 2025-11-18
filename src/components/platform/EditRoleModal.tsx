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
  Accordion,
  AccordionItem,
  Checkbox,
  Chip,
} from '@heroui/react';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import { PERMISSION_MODULES } from '@/lib/permissions/definitions';

interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: 'platform' | 'tenant';
  permissions: string[];
  scope: string;
}

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
  onSuccess: () => void;
}

export function EditRoleModal({
  isOpen,
  onClose,
  role,
  onSuccess,
}: EditRoleModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
      });
      setSelectedPermissions(new Set(role.permissions));
    }
  }, [role]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/platform/roles/${role.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          permissions: Array.from(selectedPermissions),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      toast.success('Role updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    } finally {
      setLoading(false);
    }
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

  const filteredModules = PERMISSION_MODULES.filter(m => m.category === role.type);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <div className="flex flex-col gap-1">
            <span>Edit Role</span>
            <span className="text-xs font-mono text-gray-500">{role.slug}</span>
          </div>
        </ModalHeader>
        <ModalBody className="gap-4">
          <Input
            label="Role Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            isRequired
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            minRows={2}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Permissions ({selectedPermissions.size} selected)
            </label>
            <Accordion variant="splitted">
              {filteredModules.map((module) => {
                const selectedCount = module.permissions.filter(p =>
                  selectedPermissions.has(p.slug)
                ).length;

                return (
                  <AccordionItem
                    key={module.id}
                    title={
                      <div className="flex items-center justify-between flex-1 pr-2">
                        <span className="font-medium">{module.name}</span>
                        {selectedCount > 0 && (
                          <Chip size="sm" color="primary" variant="flat">
                            {selectedCount}/{module.permissions.length}
                          </Chip>
                        )}
                      </div>
                    }
                  >
                    <div className="space-y-2 pt-2">
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
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSubmit} isLoading={loading}>
            Update Role
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
