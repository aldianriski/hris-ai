'use client';

import { Card, CardHeader, CardBody, Button, Chip, Tabs, Tab, Input } from '@heroui/react';
import { FileText, Download, Upload, Search, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Document {
  id: string;
  name: string;
  type: string;
  category: 'payslip' | 'contract' | 'tax' | 'certificate' | 'personal';
  date: string;
  size: string;
  status: 'verified' | 'pending' | 'expired';
  expiryDate?: string;
  downloadUrl: string;
}

export function MyDocumentsCenter() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with actual API
  const documents: Document[] = [
    {
      id: '1',
      name: 'Payslip - November 2025',
      type: 'PDF',
      category: 'payslip',
      date: '2025-11-01',
      size: '245 KB',
      status: 'verified',
      downloadUrl: '#',
    },
    {
      id: '2',
      name: 'Payslip - October 2025',
      type: 'PDF',
      category: 'payslip',
      date: '2025-10-01',
      size: '238 KB',
      status: 'verified',
      downloadUrl: '#',
    },
    {
      id: '3',
      name: 'Employment Contract 2024-2027',
      type: 'PDF',
      category: 'contract',
      date: '2024-01-15',
      size: '1.2 MB',
      status: 'verified',
      expiryDate: '2027-01-15',
      downloadUrl: '#',
    },
    {
      id: '4',
      name: 'PPh21 Annual Tax Report 2024',
      type: 'PDF',
      category: 'tax',
      date: '2025-01-31',
      size: '342 KB',
      status: 'verified',
      downloadUrl: '#',
    },
    {
      id: '5',
      name: 'BPJS Kesehatan Card',
      type: 'PDF',
      category: 'personal',
      date: '2024-02-10',
      size: '156 KB',
      status: 'verified',
      downloadUrl: '#',
    },
    {
      id: '6',
      name: 'Professional Certificate - AWS',
      type: 'PDF',
      category: 'certificate',
      date: '2025-06-15',
      size: '892 KB',
      status: 'verified',
      expiryDate: '2028-06-15',
      downloadUrl: '#',
    },
    {
      id: '7',
      name: 'KTP (ID Card)',
      type: 'JPG',
      category: 'personal',
      date: '2024-01-20',
      size: '1.8 MB',
      status: 'verified',
      expiryDate: '2030-01-20',
      downloadUrl: '#',
    },
    {
      id: '8',
      name: 'Work Reference Letter',
      type: 'PDF',
      category: 'contract',
      date: '2024-01-15',
      size: '234 KB',
      status: 'verified',
      downloadUrl: '#',
    },
  ];

  const getCategoryIcon = (category: string) => {
    return FileText;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'danger'> = {
      verified: 'success',
      pending: 'warning',
      expired: 'danger',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'verified') return <CheckCircle className="h-3 w-3" />;
    if (status === 'pending') return <Clock className="h-3 w-3" />;
    if (status === 'expired') return <AlertTriangle className="h-3 w-3" />;
    return null;
  };

  const filterDocuments = (docs: Document[]) => {
    let filtered = docs;

    if (activeTab !== 'all') {
      filtered = filtered.filter((doc) => doc.category === activeTab);
    }

    if (searchQuery) {
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredDocuments = filterDocuments(documents);

  const stats = {
    total: documents.length,
    payslips: documents.filter((d) => d.category === 'payslip').length,
    contracts: documents.filter((d) => d.category === 'contract').length,
    certificates: documents.filter((d) => d.category === 'certificate').length,
    personal: documents.filter((d) => d.category === 'personal').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-default-500">Total</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.payslips}</p>
                  <p className="text-sm text-default-500">Payslips</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.contracts}</p>
                  <p className="text-sm text-default-500">Contracts</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.certificates}</p>
                  <p className="text-sm text-default-500">Certificates</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.personal}</p>
                  <p className="text-sm text-default-500">Personal</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              size="lg"
            >
              <Tab key="all" title="All Documents" />
              <Tab key="payslip" title="Payslips" />
              <Tab key="contract" title="Contracts" />
              <Tab key="tax" title="Tax Documents" />
              <Tab key="certificate" title="Certificates" />
              <Tab key="personal" title="Personal" />
            </Tabs>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<Search className="h-4 w-4 text-default-400" />}
                className="w-64"
                size="sm"
              />
              <Button color="primary" startContent={<Upload className="h-4 w-4" />} size="sm">
                Upload
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="gap-3">
          {filteredDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card>
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 bg-primary-50 dark:bg-primary-100/10 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{doc.name}</h4>
                          <Chip
                            color={getStatusColor(doc.status)}
                            variant="flat"
                            size="sm"
                            startContent={getStatusIcon(doc.status)}
                          >
                            {doc.status}
                          </Chip>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-default-500">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {doc.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(doc.date).toLocaleDateString('id-ID')}
                          </span>
                          <span>{doc.size}</span>
                          {doc.expiryDate && (
                            <Chip size="sm" variant="flat">
                              Expires: {new Date(doc.expiryDate).toLocaleDateString('id-ID')}
                            </Chip>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      isIconOnly
                      variant="flat"
                      size="sm"
                      startContent={<Download className="h-4 w-4" />}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-default-300 mb-4" />
              <p className="text-default-500">No documents found</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
