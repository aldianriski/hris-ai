'use client';

import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
} from '@heroui/react';
import { Shield, AlertTriangle, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ImpersonateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    email: string;
    full_name: string;
    role?: string;
  };
  tenant: {
    id: string;
    company_name: string;
  };
}

export function ImpersonateUserModal({
  isOpen,
  onClose,
  targetUser,
  tenant,
}: ImpersonateUserModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!reason.trim() || reason.trim().length < 10) {
      setError('Reason must be at least 10 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/platform/impersonate/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: targetUser.id,
          tenantId: tenant.id,
          reason: reason.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to start impersonation');
      }

      // Close modal
      onClose();

      // Redirect to tenant app as impersonated user
      router.push(result.redirectUrl || '/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Error starting impersonation:', err);
      setError(err instanceof Error ? err.message : 'Failed to start impersonation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setReason('');
      setError(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Impersonate User</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                Login as user to debug issues
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            {/* User Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {targetUser.full_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {targetUser.email}
                  </p>
                  {targetUser.role && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Role: <span className="font-medium">{targetUser.role}</span>
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tenant: <span className="font-medium">{tenant.company_name}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Security Warning */}
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    Security & Compliance Notice
                  </p>
                  <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                    <li>• All actions during impersonation are logged for security audit</li>
                    <li>• Session will auto-expire after 2 hours</li>
                    <li>• You will have the exact same permissions as the target user</li>
                    <li>• A reason is required for compliance and audit purposes</li>
                    <li>• Impersonation is only allowed for support and debugging</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Reason Input */}
            <Textarea
              label="Reason for Impersonation *"
              placeholder="e.g., Investigating bug #1234 reported by user, Debugging payroll calculation issue, Helping user with navigation problem"
              value={reason}
              onValueChange={setReason}
              minRows={3}
              maxRows={6}
              isRequired
              description="Provide a clear business justification (minimum 10 characters)"
              isDisabled={loading}
              errorMessage={error}
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={handleClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button
            color="warning"
            onPress={handleSubmit}
            isLoading={loading}
            isDisabled={!reason.trim() || reason.trim().length < 10}
          >
            Start Impersonation
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
