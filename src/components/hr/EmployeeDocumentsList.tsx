'use client';

import { useState, useEffect } from 'react';
import { Button, Chip, Spinner, Card, CardBody } from '@heroui/react';
import { FileText, Download, Eye, Upload, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Document {
  id: string;
  file_name: string;
  document_type: 'contract' | 'id_card' | 'certificate' | 'policy' | 'payslip' | 'tax_form' | 'other';
  uploaded_at: string;
  expiry_date?: string;
  file_url: string;
  is_verified: boolean;
}

interface EmployeeDocumentsListProps {
  employeeId: string;
}

export function EmployeeDocumentsList({ employeeId }: EmployeeDocumentsListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/documents?employeeId=${employeeId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }

        const result = await response.json();
        setDocuments(result.data || []);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, [employeeId]);

  const getDocumentColor = (type: Document['document_type']) => {
    const colors = {
      contract: 'success',
      id_card: 'primary',
      certificate: 'warning',
      policy: 'secondary',
      payslip: 'default',
      tax_form: 'danger',
      other: 'default',
    };
    return colors[type] as any;
  };

  const getDocumentLabel = (type: Document['document_type']) => {
    const labels = {
      contract: 'Contract',
      id_card: 'ID Card',
      certificate: 'Certificate',
      policy: 'Policy',
      payslip: 'Payslip',
      tax_form: 'Tax Form',
      other: 'Other',
    };
    return labels[type];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <Spinner size="lg" color="primary" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Documents</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Button color="primary" size="sm" onPress={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Documents</h3>
        <Button
          color="primary"
          size="sm"
          startContent={<Upload className="w-4 h-4" />}
        >
          Upload Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">No documents uploaded yet</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">{doc.file_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Chip size="sm" color={getDocumentColor(doc.document_type)} variant="flat">
                      {getDocumentLabel(doc.document_type)}
                    </Chip>
                    <span className="text-xs text-gray-500">
                      Uploaded {format(new Date(doc.uploaded_at), 'MMM dd, yyyy')}
                    </span>
                    {doc.is_verified && (
                      <Chip size="sm" color="success" variant="flat">
                        Verified
                      </Chip>
                    )}
                    {doc.expiry_date && (
                      <span className="text-xs text-orange-600">
                        Expires {format(new Date(doc.expiry_date), 'MMM dd, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  aria-label="View document"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  aria-label="Download document"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
