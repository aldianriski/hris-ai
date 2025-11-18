'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from '@heroui/react';
import { Shield, ShieldCheck, ShieldOff, Key, Download } from 'lucide-react';
import { MFASetup } from './MFASetup';
import { toast } from 'sonner';

interface MFASettingsData {
  mfa_enabled: boolean;
  mfa_method: string | null;
  totp_verified_at: string | null;
  backup_codes_generated_at: string | null;
}

export function MFASettings() {
  const [mfaSettings, setMfaSettings] = useState<MFASettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMFASettings();
  }, []);

  const fetchMFASettings = async () => {
    try {
      const response = await fetch('/api/auth/mfa/settings');
      if (response.ok) {
        const { data } = await response.json();
        setMfaSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch MFA settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    if (disableCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/mfa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: disableCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to disable MFA');
      }

      toast.success('MFA disabled successfully');
      setShowDisable(false);
      setDisableCode('');
      await fetchMFASettings();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to disable MFA');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    if (backupCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/mfa/backup-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: backupCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate backup codes');
      }

      const { data } = await response.json();
      setNewBackupCodes(data.backupCodes);
      setBackupCode('');
      toast.success('New backup codes generated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate backup codes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadBackupCodes = () => {
    if (newBackupCodes.length === 0) return;

    const content = `HRIS Platform - MFA Backup Codes
Generated: ${new Date().toISOString()}

IMPORTANT: Save these codes securely. Each code can only be used once.

${newBackupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

Keep these codes safe and do not share them with anyone.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mfa-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded');
  };

  if (isLoading) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-default-500">Loading MFA settings...</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-50 dark:bg-primary-100/10 rounded-lg">
              {mfaSettings?.mfa_enabled ? (
                <ShieldCheck className="h-5 w-5 text-success" />
              ) : (
                <ShieldOff className="h-5 w-5 text-default-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
              <p className="text-sm text-default-600">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>

          {mfaSettings?.mfa_enabled ? (
            <Chip
              color="success"
              variant="flat"
              startContent={<ShieldCheck className="h-3 w-3" />}
            >
              Enabled
            </Chip>
          ) : (
            <Chip color="default" variant="flat">
              Disabled
            </Chip>
          )}
        </CardHeader>

        <CardBody className="space-y-4">
          {mfaSettings?.mfa_enabled ? (
            <>
              <div className="flex items-start gap-3 p-4 bg-success-50 dark:bg-success-100/10 rounded-lg border border-success-200">
                <Shield className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-success-800 dark:text-success-500">
                    Your account is protected
                  </p>
                  <p className="text-xs text-success-700 dark:text-success-600 mt-1">
                    Two-factor authentication is active using {mfaSettings.mfa_method?.toUpperCase()}
                  </p>
                  {mfaSettings.totp_verified_at && (
                    <p className="text-xs text-success-600 dark:text-success-700 mt-1">
                      Enabled since {new Date(mfaSettings.totp_verified_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="flat"
                  startContent={<Key className="h-4 w-4" />}
                  onPress={() => setShowBackupCodes(true)}
                >
                  Generate New Backup Codes
                </Button>

                <Button
                  color="danger"
                  variant="flat"
                  startContent={<ShieldOff className="h-4 w-4" />}
                  onPress={() => setShowDisable(true)}
                >
                  Disable Two-Factor Authentication
                </Button>
              </div>
            </>
          ) : (
            <div>
              <p className="text-sm text-default-600 mb-4">
                Protect your account with an additional layer of security. Once enabled,
                you'll be required to enter both your password and an authentication code
                from your mobile device to sign in.
              </p>

              <Button
                color="primary"
                startContent={<Shield className="h-4 w-4" />}
                onPress={() => setShowSetup(true)}
              >
                Enable Two-Factor Authentication
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* MFA Setup Modal */}
      <MFASetup
        isOpen={showSetup}
        onClose={() => setShowSetup(false)}
        onSuccess={() => fetchMFASettings()}
      />

      {/* Disable MFA Modal */}
      <Modal
        isOpen={showDisable}
        onClose={() => {
          setShowDisable(false);
          setDisableCode('');
        }}
      >
        <ModalContent>
          <ModalHeader>Disable Two-Factor Authentication</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600 mb-4">
              To disable two-factor authentication, please enter your current verification code.
            </p>

            <Input
              type="text"
              label="Verification Code"
              placeholder="000000"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center"
            />

            <div className="bg-warning-50 dark:bg-warning-100/10 p-3 rounded-lg border border-warning-200 mt-4">
              <p className="text-xs text-warning-700 dark:text-warning-600">
                Warning: Disabling MFA will make your account less secure.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setShowDisable(false)}>
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleDisableMFA}
              isLoading={isSubmitting}
              isDisabled={disableCode.length !== 6}
            >
              Disable MFA
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Generate Backup Codes Modal */}
      <Modal
        isOpen={showBackupCodes}
        onClose={() => {
          setShowBackupCodes(false);
          setBackupCode('');
          setNewBackupCodes([]);
        }}
        size="2xl"
      >
        <ModalContent>
          <ModalHeader>Generate New Backup Codes</ModalHeader>
          <ModalBody>
            {newBackupCodes.length === 0 ? (
              <>
                <p className="text-sm text-default-600 mb-4">
                  Enter your current verification code to generate new backup codes.
                  This will invalidate all previous backup codes.
                </p>

                <Input
                  type="text"
                  label="Verification Code"
                  placeholder="000000"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center"
                />
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-warning-50 dark:bg-warning-100/10 p-4 rounded-lg border border-warning-200">
                  <p className="text-sm font-semibold text-warning-800 dark:text-warning-500">
                    Save your new backup codes
                  </p>
                  <p className="text-xs text-warning-700 dark:text-warning-600 mt-1">
                    Your previous backup codes are now invalid. Store these new codes securely.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {newBackupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="p-3 bg-default-100 rounded-lg text-center"
                    >
                      <code className="font-mono text-sm">{code}</code>
                    </div>
                  ))}
                </div>

                <Button
                  fullWidth
                  variant="flat"
                  startContent={<Download className="h-4 w-4" />}
                  onClick={downloadBackupCodes}
                >
                  Download Backup Codes
                </Button>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {newBackupCodes.length === 0 ? (
              <>
                <Button variant="flat" onPress={() => setShowBackupCodes(false)}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleGenerateBackupCodes}
                  isLoading={isSubmitting}
                  isDisabled={backupCode.length !== 6}
                >
                  Generate Codes
                </Button>
              </>
            ) : (
              <Button
                color="primary"
                fullWidth
                onPress={() => {
                  setShowBackupCodes(false);
                  setNewBackupCodes([]);
                }}
              >
                Done
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
