'use client';

import { Card, CardHeader, CardBody, Button, Chip } from '@heroui/react';
import { AlertTriangle, Calendar, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ExpiringDocument {
  id: string;
  employeeId: string;
  employeeName: string;
  documentType: string;
  documentTitle: string;
  expiryDate: string;
  daysUntilExpiry: number;
}

interface DocumentExpiryAlertsProps {
  limit?: number;
}

export function DocumentExpiryAlerts({ limit = 5 }: DocumentExpiryAlertsProps) {
  // Mock data - replace with actual API call
  const expiringDocuments: ExpiringDocument[] = [
    {
      id: '1',
      employeeId: 'emp1',
      employeeName: 'Jane Smith',
      documentType: 'BPJS Kesehatan',
      documentTitle: 'BPJS Health Card',
      expiryDate: '2025-12-15',
      daysUntilExpiry: 27,
    },
    {
      id: '2',
      employeeId: 'emp2',
      employeeName: 'Bob Johnson',
      documentType: 'Contract',
      documentTitle: 'Employment Contract (PKWT)',
      expiryDate: '2025-12-01',
      daysUntilExpiry: 13,
    },
    {
      id: '3',
      employeeId: 'emp3',
      employeeName: 'Alice Brown',
      documentType: 'Passport',
      documentTitle: 'Passport',
      expiryDate: '2025-11-25',
      daysUntilExpiry: 7,
    },
    {
      id: '4',
      employeeId: 'emp4',
      employeeName: 'Charlie Davis',
      documentType: 'BPJS Ketenagakerjaan',
      documentTitle: 'BPJS Employment Card',
      expiryDate: '2025-12-20',
      daysUntilExpiry: 32,
    },
  ].slice(0, limit);

  const getUrgencyColor = (days: number) => {
    if (days <= 7) return 'danger';
    if (days <= 14) return 'warning';
    return 'default';
  };

  const getUrgencyLabel = (days: number) => {
    if (days <= 0) return 'Expired';
    if (days === 1) return 'Tomorrow';
    if (days <= 7) return 'This week';
    if (days <= 30) return 'This month';
    return `${days} days`;
  };

  if (expiringDocuments.length === 0) {
    return (
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-default-400" />
          <h3 className="text-lg font-semibold">Document Expiry Alerts</h3>
        </CardHeader>
        <CardBody>
          <div className="text-center py-6">
            <FileText className="h-12 w-12 mx-auto text-default-300 mb-2" />
            <p className="text-default-500">No documents expiring soon</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-warning-50 dark:bg-warning-100/10 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Document Expiry Alerts</h3>
            <p className="text-sm text-default-500">
              {expiringDocuments.length} documents expiring soon
            </p>
          </div>
        </div>
        <Button
          as={Link}
          href="/hr/documents?tab=expiring"
          variant="light"
          size="sm"
          endContent={<ChevronRight className="h-4 w-4" />}
        >
          View All
        </Button>
      </CardHeader>
      <CardBody className="gap-3">
        {expiringDocuments.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between p-3 bg-default-100 dark:bg-default-50 rounded-lg hover:bg-default-200 dark:hover:bg-default-100 transition-colors">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                  <FileText className="h-4 w-4 text-default-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.employeeName}</p>
                  <p className="text-xs text-default-600 truncate">
                    {doc.documentType}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3 text-default-400" />
                    <span className="text-xs text-default-500">
                      Expires {new Date(doc.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Chip
                  color={getUrgencyColor(doc.daysUntilExpiry)}
                  variant="flat"
                  size="sm"
                  className="ml-2"
                >
                  {getUrgencyLabel(doc.daysUntilExpiry)}
                </Chip>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  as={Link}
                  href={`/hr/employees/${doc.employeeId}/documents`}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </CardBody>
    </Card>
  );
}
