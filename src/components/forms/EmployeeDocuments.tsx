'use client';

import { Card, CardBody, Button } from '@heroui/react';
import { Upload, FileText, CheckCircle } from 'lucide-react';

export function EmployeeDocuments() {
  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold mb-4">Document Upload</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Upload employee documents for verification and record keeping.
          </p>

          <div className="space-y-4">
            {/* KTP Upload */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="font-medium mb-1">KTP (National ID)</h4>
              <p className="text-sm text-gray-500 mb-3">
                AI will automatically extract ID number, name, and address
              </p>
              <Button color="primary" variant="flat" startContent={<Upload className="w-4 h-4" />}>
                Upload KTP
              </Button>
            </div>

            {/* NPWP Upload */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="font-medium mb-1">NPWP (Tax ID)</h4>
              <p className="text-sm text-gray-500 mb-3">
                AI will automatically extract tax ID number
              </p>
              <Button color="primary" variant="flat" startContent={<Upload className="w-4 h-4" />}>
                Upload NPWP
              </Button>
            </div>

            {/* Other Documents */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="font-medium mb-1">Other Documents</h4>
              <p className="text-sm text-gray-500 mb-3">
                CV, certificates, diplomas, etc.
              </p>
              <Button color="primary" variant="flat" startContent={<Upload className="w-4 h-4" />}>
                Upload Documents
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  AI Document Extraction
                </p>
                <p className="text-blue-700 dark:text-blue-200">
                  Our AI will automatically extract information from KTP and NPWP documents,
                  filling in the form fields for you. You can review and correct any extracted data.
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <CardBody>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Document upload is optional during employee creation.
            You can upload documents later from the employee detail page.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
