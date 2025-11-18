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
  Select,
  SelectItem,
  Switch,
} from '@heroui/react';
import { Edit, Shield } from 'lucide-react';
import { getRoleDisplayName, type PlatformRole } from '@/lib/auth/permissions';

interface EditPlatformUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    is_active: boolean;
  } | null;
}

const platformRoles: PlatformRole[] = [
  'super_admin',
  'platform_admin',
  'support_admin',
  'billing_admin',
];

export function EditPlatformUserModal({
  isOpen,
  onClose,
  onSuccess,
  user,
}: EditPlatformUserModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    role: 'platform_admin' as PlatformRole,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name,
        role: user.role as PlatformRole,
        isActive: user.is_active,
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/platform/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update user');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            <span>Edit User</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <Input
              label="Email"
              value={user.email}
              isDisabled
              description="Email cannot be changed"
            />

            <Input
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              isRequired
              isDisabled={loading}
            />

            <Select
              label="Role"
              selectedKeys={[formData.role]}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as PlatformRole })}
              isRequired
              isDisabled={loading}
              startContent={<Shield className="w-4 h-4 text-gray-400" />}
            >
              {platformRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {getRoleDisplayName(role)}
                </SelectItem>
              ))}
            </Select>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm font-medium">Active Status</p>
                <p className="text-xs text-gray-500">
                  {formData.isActive ? 'User can access the platform' : 'User access is disabled'}
                </p>
              </div>
              <Switch
                isSelected={formData.isActive}
                onValueChange={(checked) => setFormData({ ...formData, isActive: checked })}
                isDisabled={loading}
                color={formData.isActive ? 'success' : 'default'}
              />
            </div>

            {!formData.isActive && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Deactivating this user will immediately revoke their access to the platform.
                </p>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={handleClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSubmit} isLoading={loading}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
