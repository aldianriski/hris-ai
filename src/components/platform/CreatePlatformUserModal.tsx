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
  Select,
  SelectItem,
  Switch,
} from '@heroui/react';
import { UserPlus, Mail } from 'lucide-react';
import { getRoleDisplayName, type PlatformRole } from '@/lib/auth/permissions';

interface CreatePlatformUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const platformRoles: PlatformRole[] = [
  'super_admin',
  'platform_admin',
  'support_admin',
  'billing_admin',
];

export function CreatePlatformUserModal({
  isOpen,
  onClose,
  onSuccess,
}: CreatePlatformUserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    role: 'platform_admin' as PlatformRole,
    sendInviteEmail: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setTempPassword(null);

    try {
      const response = await fetch('/api/platform/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      // Store temp password to show to user
      if (result.tempPassword) {
        setTempPassword(result.tempPassword);
      }

      // Reset form
      setFormData({
        email: '',
        fullName: '',
        role: 'platform_admin',
        sendInviteEmail: true,
      });

      onSuccess();

      // If we have a temp password, keep modal open to show it
      if (!result.tempPassword) {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      fullName: '',
      role: 'platform_admin',
      sendInviteEmail: true,
    });
    setError(null);
    setTempPassword(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            <span>Create Platform User</span>
          </div>
        </ModalHeader>
        <ModalBody>
          {tempPassword ? (
            // Show temporary password
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                  User Created Successfully!
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                  Please save the temporary password below. It won't be shown again.
                </p>
                <div className="bg-white dark:bg-gray-800 p-3 rounded border border-green-300 dark:border-green-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email:</p>
                  <p className="text-sm font-medium mb-3">{formData.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Temporary Password:</p>
                  <p className="text-sm font-mono font-bold text-primary">{tempPassword}</p>
                </div>
              </div>
            </div>
          ) : (
            // Show form
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <Input
                label="Full Name"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                isRequired
                isDisabled={loading}
              />

              <Input
                label="Email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                isRequired
                isDisabled={loading}
                startContent={<Mail className="w-4 h-4 text-gray-400" />}
              />

              <Select
                label="Role"
                selectedKeys={[formData.role]}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as PlatformRole })}
                isRequired
                isDisabled={loading}
              >
                {platformRoles.map((role) => (
                  <SelectItem key={role}>
                    {getRoleDisplayName(role)}
                  </SelectItem>
                ))}
              </Select>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Send Invite Email</p>
                  <p className="text-xs text-gray-500">
                    Email the user their login credentials
                  </p>
                </div>
                <Switch
                  isSelected={formData.sendInviteEmail}
                  onValueChange={(checked) =>
                    setFormData({ ...formData, sendInviteEmail: checked })
                  }
                  isDisabled={loading}
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  A temporary password will be generated for this user. They should change it on
                  first login.
                </p>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {tempPassword ? (
            <Button color="primary" onPress={handleClose} fullWidth>
              Done
            </Button>
          ) : (
            <>
              <Button variant="flat" onPress={handleClose} isDisabled={loading}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={loading}
                isDisabled={!formData.email || !formData.fullName}
              >
                Create User
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
