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
import { AlertCircle, Ban, CheckCircle } from 'lucide-react';

interface SuspendTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenant: {
    id: string;
    company_name: string;
    status: string;
  };
}

export function SuspendTenantModal({
  isOpen,
  onClose,
  onSuccess,
  tenant,
}: SuspendTenantModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSuspending = tenant.status === 'active';
  const newStatus = isSuspending ? 'suspended' : 'active';

  const handleSubmit = async () => {
    if (isSuspending && !reason.trim()) {
      setError('Please provide a reason for suspending this tenant');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/platform/tenants/${tenant.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          reason: reason.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to change tenant status');
      }

      onSuccess();
      onClose();
      setReason('');
    } catch (err) {
      console.error('Error changing tenant status:', err);
      setError(err instanceof Error ? err.message : 'Failed to change tenant status');
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
            {isSuspending ? (
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Ban className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold">
                {isSuspending ? 'Suspend Tenant' : 'Activate Tenant'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                {tenant.company_name}
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            {/* Warning Message */}
            <div
              className={`p-4 rounded-lg border ${
                isSuspending
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                  : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              }`}
            >
              <p
                className={`text-sm font-semibold mb-2 ${
                  isSuspending
                    ? 'text-orange-900 dark:text-orange-100'
                    : 'text-green-900 dark:text-green-100'
                }`}
              >
                {isSuspending ? '⚠️ Warning: This will suspend the tenant' : '✓ Reactivate Tenant'}
              </p>
              <ul
                className={`text-xs space-y-1 ${
                  isSuspending
                    ? 'text-orange-700 dark:text-orange-300'
                    : 'text-green-700 dark:text-green-300'
                }`}
              >
                {isSuspending ? (
                  <>
                    <li>• All users will be unable to access the system</li>
                    <li>• Active sessions will be invalidated</li>
                    <li>• Subscription billing will be paused</li>
                    <li>• Data will be retained but not accessible</li>
                    <li>• You can reactivate the tenant at any time</li>
                  </>
                ) : (
                  <>
                    <li>• All users will regain access to the system</li>
                    <li>• Subscription billing will resume</li>
                    <li>• All data will be accessible again</li>
                    <li>• Previous suspension reason will be cleared</li>
                  </>
                )}
              </ul>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Reason Input */}
            <Textarea
              label={isSuspending ? 'Reason for Suspension *' : 'Reason for Activation (Optional)'}
              placeholder={
                isSuspending
                  ? 'e.g., Payment overdue, Policy violation, Customer request'
                  : 'e.g., Payment received, Issue resolved'
              }
              value={reason}
              onValueChange={setReason}
              minRows={3}
              maxRows={6}
              isRequired={isSuspending}
              description={
                isSuspending
                  ? 'This reason will be logged and visible in audit logs'
                  : 'Optional reason for reactivation'
              }
              isDisabled={loading}
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={handleClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button
            color={isSuspending ? 'warning' : 'success'}
            onPress={handleSubmit}
            isLoading={loading}
          >
            {isSuspending ? 'Suspend Tenant' : 'Activate Tenant'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
