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
  Card,
  CardBody,
  Chip,
} from '@heroui/react';
import { Shield, Copy, CheckCircle2, Download } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface MFASetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface SetupData {
  qrCodeUrl: string;
  secret: string;
  backupCodes: string[];
}

export function MFASetup({ isOpen, onClose, onSuccess }: MFASetupProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState<number | null>(null);

  const startSetup = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate setup');
      }

      const { data } = await response.json();
      setSetupData(data);

      // Generate QR code image
      const qrImage = await QRCode.toDataURL(data.qrCodeUrl);
      setQrCodeImage(qrImage);

      setStep('verify');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to setup MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid verification code');
      }

      setStep('backup');
      toast.success('MFA enabled successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      setCopiedSecret(true);
      toast.success('Secret copied to clipboard');
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const copyBackupCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedBackup(index);
    toast.success('Backup code copied');
    setTimeout(() => setCopiedBackup(null), 2000);
  };

  const downloadBackupCodes = () => {
    if (!setupData?.backupCodes) return;

    const content = `HRIS Platform - MFA Backup Codes
Generated: ${new Date().toISOString()}

IMPORTANT: Save these codes securely. Each code can only be used once.

${setupData.backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

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

  const finish = () => {
    onSuccess();
    onClose();
    // Reset state
    setStep('setup');
    setSetupData(null);
    setQrCodeImage('');
    setVerificationCode('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      isDismissable={false}
      hideCloseButton
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span>Enable Two-Factor Authentication</span>
        </ModalHeader>

        <ModalBody>
          {/* Step 1: Setup */}
          {step === 'setup' && (
            <div className="space-y-4">
              <p className="text-sm text-default-600">
                Two-factor authentication adds an extra layer of security to your account.
                You'll need an authenticator app like Google Authenticator or Authy.
              </p>

              <Card>
                <CardBody className="space-y-3">
                  <h4 className="font-semibold">How it works:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-default-600">
                    <li>Scan the QR code with your authenticator app</li>
                    <li>Enter the 6-digit code from the app</li>
                    <li>Save your backup codes in a secure place</li>
                    <li>You're protected!</li>
                  </ol>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Step 2: Verify */}
          {step === 'verify' && setupData && (
            <div className="space-y-4">
              <div className="text-center space-y-4">
                <p className="text-sm text-default-600">
                  Scan this QR code with your authenticator app
                </p>

                {qrCodeImage && (
                  <div className="flex justify-center">
                    <img
                      src={qrCodeImage}
                      alt="QR Code"
                      className="w-48 h-48 border-2 border-default-200 rounded-lg"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs text-default-500">Or enter this key manually:</p>
                  <div className="flex items-center gap-2 justify-center">
                    <code className="px-3 py-2 bg-default-100 rounded-lg text-sm font-mono">
                      {setupData.secret}
                    </code>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      onClick={copySecret}
                      className="min-w-unit-8 w-unit-8 h-unit-8"
                    >
                      {copiedSecret ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Enter verification code</label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                />
                <p className="text-xs text-default-500">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Backup Codes */}
          {step === 'backup' && setupData && (
            <div className="space-y-4">
              <div className="bg-warning-50 dark:bg-warning-100/10 p-4 rounded-lg border border-warning-200">
                <p className="text-sm font-semibold text-warning-800 dark:text-warning-500">
                  Save your backup codes
                </p>
                <p className="text-xs text-warning-700 dark:text-warning-600 mt-1">
                  Each backup code can only be used once. Store them in a safe place.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {setupData.backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-default-100 rounded-lg"
                  >
                    <code className="font-mono text-sm">{code}</code>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onClick={() => copyBackupCode(code, index)}
                      className="min-w-unit-6 w-unit-6 h-unit-6"
                    >
                      {copiedBackup === index ? (
                        <CheckCircle2 className="h-3 w-3 text-success" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
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
          {step === 'setup' && (
            <>
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={startSetup}
                isLoading={isLoading}
              >
                Get Started
              </Button>
            </>
          )}

          {step === 'verify' && (
            <>
              <Button
                variant="flat"
                onPress={() => setStep('setup')}
                isDisabled={isLoading}
              >
                Back
              </Button>
              <Button
                color="primary"
                onPress={verifyAndEnable}
                isLoading={isLoading}
                isDisabled={verificationCode.length !== 6}
              >
                Verify & Enable
              </Button>
            </>
          )}

          {step === 'backup' && (
            <Button
              color="primary"
              onPress={finish}
              fullWidth
            >
              Done - I've Saved My Codes
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
