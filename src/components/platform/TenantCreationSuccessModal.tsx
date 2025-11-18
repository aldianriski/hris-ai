'use client';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react';
import { CheckCircle, Copy, Mail, Key, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface TenantCreationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantData: {
    id: string;
    companyName: string;
    adminEmail: string;
    tempPassword: string;
  };
}

export function TenantCreationSuccessModal({
  isOpen,
  onClose,
  tenantData,
}: TenantCreationSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(tenantData.tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCredentials = () => {
    const credentials = `Email: ${tenantData.adminEmail}\nPassword: ${tenantData.tempPassword}`;
    navigator.clipboard.writeText(credentials);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isDismissable={false}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Tenant Created Successfully!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                {tenantData.companyName} is ready to use
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            {/* Important Notice */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                ⚠️ Important: Save the credentials below
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                The temporary password won't be shown again. Make sure to save it or send it to the admin.
              </p>
            </div>

            {/* Credentials Card */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Admin Login Credentials
              </h4>

              <div className="space-y-3">
                {/* Email */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white font-mono bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
                    {tenantData.adminEmail}
                  </p>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Key className="w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Temporary Password</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-primary font-mono bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700 flex-1">
                      {tenantData.tempPassword}
                    </p>
                    <Button
                      size="sm"
                      variant="flat"
                      isIconOnly
                      onPress={handleCopyPassword}
                      aria-label="Copy password"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Copy All Button */}
              <Button
                size="sm"
                variant="flat"
                color={copied ? 'success' : 'default'}
                startContent={<Copy className="w-4 h-4" />}
                onPress={handleCopyCredentials}
                className="w-full mt-3"
              >
                {copied ? 'Copied!' : 'Copy All Credentials'}
              </Button>
            </div>

            {/* Next Steps */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Next Steps
              </h4>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• The admin will receive a welcome email (if enabled)</li>
                <li>• They should change their password on first login</li>
                <li>• You can configure additional settings in the tenant detail page</li>
              </ul>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="flat"
            onPress={onClose}
          >
            Close
          </Button>
          <Button
            color="primary"
            as="a"
            href={`/platform-admin/tenants/${tenantData.id}`}
            startContent={<ExternalLink className="w-4 h-4" />}
          >
            View Tenant Details
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
