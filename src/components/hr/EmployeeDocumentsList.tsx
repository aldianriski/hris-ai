'use client';

import { Button, Chip } from '@heroui/react';
import { FileText, Download, Eye, Upload } from 'lucide-react';
import { format } from 'date-fns';

interface Document {
  id: string;
  name: string;
  type: 'KTP' | 'NPWP' | 'Contract' | 'Certificate' | 'Other';
  uploadedAt: string;
  expiryDate?: string;
  url: string;
}

interface EmployeeDocumentsListProps {
  employeeId: string;
}

export function EmployeeDocumentsList({ employeeId }: EmployeeDocumentsListProps) {
  // TODO: Fetch actual documents from API
  const documents: Document[] = [
    {
      id: '1',
      name: 'KTP - National ID',
      type: 'KTP',
      uploadedAt: '2024-01-15',
      url: '#',
    },
    {
      id: '2',
      name: 'NPWP - Tax ID',
      type: 'NPWP',
      uploadedAt: '2024-01-15',
      url: '#',
    },
    {
      id: '3',
      name: 'Employment Contract',
      type: 'Contract',
      uploadedAt: '2024-01-15',
      expiryDate: '2025-01-15',
      url: '#',
    },
  ];

  const getDocumentColor = (type: Document['type']) => {
    const colors = {
      KTP: 'primary',
      NPWP: 'secondary',
      Contract: 'success',
      Certificate: 'warning',
      Other: 'default',
    };
    return colors[type] as any;
  };

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
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No documents uploaded yet</p>
        </div>
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
                  <p className="font-medium">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Chip size="sm" color={getDocumentColor(doc.type)} variant="flat">
                      {doc.type}
                    </Chip>
                    <span className="text-xs text-gray-500">
                      Uploaded {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                    </span>
                    {doc.expiryDate && (
                      <span className="text-xs text-orange-600">
                        Expires {format(new Date(doc.expiryDate), 'MMM dd, yyyy')}
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
                  startContent={<Eye className="w-4 h-4" />}
                >
                  View
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  startContent={<Download className="w-4 h-4" />}
                >
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
