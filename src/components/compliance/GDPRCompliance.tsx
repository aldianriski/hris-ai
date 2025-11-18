'use client';

import { Card, CardHeader, CardBody, Button, Chip } from '@heroui/react';
import { Shield, Download, Trash2, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function GDPRCompliance() {
  const handleExportData = () => {
    toast.info('Preparing your data export. You will receive an email when ready.');
  };

  const handleDeleteData = () => {
    toast.warning('Data deletion request submitted. This action cannot be undone.');
  };

  const dataRequests = [
    {
      id: '1',
      type: 'export',
      status: 'completed',
      requestedAt: '2025-11-15',
      completedAt: '2025-11-16',
      downloadUrl: '#',
    },
    {
      id: '2',
      type: 'export',
      status: 'processing',
      requestedAt: '2025-11-18',
      completedAt: null,
      downloadUrl: null,
    },
  ];

  const consents = [
    {
      id: '1',
      type: 'Terms of Service',
      version: '2.0',
      consentDate: '2024-01-15',
      status: 'active',
    },
    {
      id: '2',
      type: 'Privacy Policy',
      version: '1.5',
      consentDate: '2024-01-15',
      status: 'active',
    },
    {
      id: '3',
      type: 'Marketing Communications',
      version: '1.0',
      consentDate: '2024-02-01',
      status: 'active',
    },
    {
      id: '4',
      type: 'Data Processing Agreement',
      version: '1.0',
      consentDate: '2024-01-15',
      status: 'active',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'danger'> = {
      completed: 'success',
      processing: 'warning',
      failed: 'danger',
      active: 'success',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed' || status === 'active') return <CheckCircle className="h-3 w-3" />;
    if (status === 'processing') return <Clock className="h-3 w-3" />;
    if (status === 'failed') return <AlertTriangle className="h-3 w-3" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* GDPR Rights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardBody className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-primary-50 dark:bg-primary-100/10 rounded-lg">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Right to Data Portability</h3>
                  <p className="text-sm text-default-600">Export all your personal data in a machine-readable format</p>
                </div>
              </div>
              <Button color="primary" fullWidth onPress={handleExportData}>
                Request Data Export
              </Button>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardBody className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-danger-50 dark:bg-danger-100/10 rounded-lg">
                  <Trash2 className="h-6 w-6 text-danger" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Right to Be Forgotten</h3>
                  <p className="text-sm text-default-600">Request deletion of all your personal data</p>
                </div>
              </div>
              <Button color="danger" variant="bordered" fullWidth onPress={handleDeleteData}>
                Request Data Deletion
              </Button>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardBody className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-success-50 dark:bg-success-100/10 rounded-lg">
                  <FileText className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Right to Access</h3>
                  <p className="text-sm text-default-600">View all data we store about you</p>
                </div>
              </div>
              <Button color="success" variant="bordered" fullWidth>
                View My Data
              </Button>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Data Export Requests */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Data Export History</h3>
        </CardHeader>
        <CardBody className="gap-3">
          {dataRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Download className="h-8 w-8 text-primary" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">Data Export Request</p>
                          <Chip
                            color={getStatusColor(request.status)}
                            variant="flat"
                            size="sm"
                            startContent={getStatusIcon(request.status)}
                          >
                            {request.status}
                          </Chip>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-default-500">
                          <span>Requested: {new Date(request.requestedAt).toLocaleDateString('id-ID')}</span>
                          {request.completedAt && (
                            <span>Completed: {new Date(request.completedAt).toLocaleDateString('id-ID')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {request.status === 'completed' && request.downloadUrl && (
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        startContent={<Download className="h-4 w-4" />}
                      >
                        Download
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </CardBody>
      </Card>

      {/* Consent Management */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Consent & Agreements</h3>
        </CardHeader>
        <CardBody className="gap-3">
          {consents.map((consent, index) => (
            <motion.div
              key={consent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Shield className="h-6 w-6 text-success" />
                  <div>
                    <p className="font-medium">{consent.type}</p>
                    <div className="flex items-center gap-3 text-sm text-default-500 mt-1">
                      <span>Version {consent.version}</span>
                      <span>•</span>
                      <span>Accepted on {new Date(consent.consentDate).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Chip
                    color={getStatusColor(consent.status)}
                    variant="flat"
                    size="sm"
                    startContent={<CheckCircle className="h-3 w-3" />}
                  >
                    {consent.status}
                  </Chip>
                  <Button size="sm" variant="light">
                    View
                  </Button>
                  <Button size="sm" variant="light" color="danger">
                    Withdraw
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </CardBody>
      </Card>

      {/* Privacy Information */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Your Privacy Rights</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Data We Collect</h4>
              <p className="text-sm text-default-600">
                We collect and process personal information including: name, email, phone number, address, employment information,
                salary details, attendance records, performance data, and documents you upload.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">How We Use Your Data</h4>
              <p className="text-sm text-default-600">
                Your data is used for: employment management, payroll processing, performance evaluation, compliance with labor laws,
                and improving our services.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Data Retention</h4>
              <p className="text-sm text-default-600">
                We retain your data for 7 years after employment termination as required by Indonesian labor law.
                You can request deletion after this period or if legally permissible.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Contact Data Protection Officer</h4>
              <p className="text-sm text-default-600">
                For questions about your privacy rights: dpo@company.com
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
