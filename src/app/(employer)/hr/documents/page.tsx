'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
} from '@heroui/react';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  AlertTriangle,
  File,
} from 'lucide-react';
import { motion } from 'framer-motion';

const documentTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'ktp', label: 'KTP' },
  { value: 'npwp', label: 'NPWP' },
  { value: 'bpjs_kesehatan', label: 'BPJS Kesehatan' },
  { value: 'bpjs_ketenagakerjaan', label: 'BPJS Ketenagakerjaan' },
  { value: 'contract', label: 'Contract' },
];

export default function HRDocumentsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const [documents] = useState([
    {
      id: '1',
      employeeId: 'emp1',
      employeeName: 'John Doe',
      department: 'Engineering',
      type: 'ktp',
      title: 'KTP - John Doe',
      fileName: 'ktp_123456.pdf',
      fileSize: 245000,
      uploadedAt: '2025-11-01T10:00:00Z',
      expiryDate: null,
      isVerified: true,
      status: 'verified',
      daysUntilExpiry: null,
    },
    {
      id: '2',
      employeeId: 'emp2',
      employeeName: 'Jane Smith',
      department: 'Marketing',
      type: 'bpjs_kesehatan',
      title: 'BPJS Kesehatan - Jane Smith',
      fileName: 'bpjs_health_jane.pdf',
      fileSize: 320000,
      uploadedAt: '2025-10-15T14:30:00Z',
      expiryDate: '2025-12-15',
      isVerified: true,
      status: 'expiring_soon',
      daysUntilExpiry: 27,
    },
    {
      id: '3',
      employeeId: 'emp3',
      employeeName: 'Bob Johnson',
      department: 'Sales',
      type: 'contract',
      title: 'Employment Contract - Bob Johnson',
      fileName: 'contract_bob.pdf',
      fileSize: 450000,
      uploadedAt: '2025-09-01T09:00:00Z',
      expiryDate: '2025-11-20',
      isVerified: true,
      status: 'expired',
      daysUntilExpiry: -2,
    },
    {
      id: '4',
      employeeId: 'emp4',
      employeeName: 'Alice Brown',
      department: 'HR',
      type: 'npwp',
      title: 'NPWP - Alice Brown',
      fileName: 'npwp_alice.pdf',
      fileSize: 180000,
      uploadedAt: '2025-11-10T11:20:00Z',
      expiryDate: null,
      isVerified: false,
      status: 'pending',
      daysUntilExpiry: null,
    },
  ]);

  const stats = {
    total: documents.length,
    verified: documents.filter((d) => d.isVerified).length,
    pending: documents.filter((d) => !d.isVerified).length,
    expiringSoon: documents.filter(
      (d) => d.daysUntilExpiry !== null && d.daysUntilExpiry > 0 && d.daysUntilExpiry <= 30
    ).length,
    expired: documents.filter((d) => d.status === 'expired').length,
  };

  const getFilteredDocuments = () => {
    let filtered = documents;

    // Filter by tab
    if (activeTab === 'verified') {
      filtered = filtered.filter((d) => d.isVerified);
    } else if (activeTab === 'pending') {
      filtered = filtered.filter((d) => !d.isVerified);
    } else if (activeTab === 'expiring') {
      filtered = filtered.filter(
        (d) => d.daysUntilExpiry !== null && d.daysUntilExpiry > 0 && d.daysUntilExpiry <= 30
      );
    } else if (activeTab === 'expired') {
      filtered = filtered.filter((d) => d.status === 'expired');
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter((d) => d.type === selectedType);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (d) =>
          d.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'expiring_soon':
        return 'warning';
      case 'expired':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'expiring_soon':
        return <AlertTriangle className="h-4 w-4" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (doc: any) => {
    if (doc.status === 'expired') return 'Expired';
    if (doc.status === 'expiring_soon') return `Expires in ${doc.daysUntilExpiry} days`;
    if (!doc.isVerified) return 'Pending Verification';
    return 'Verified';
  };

  const filteredDocuments = getFilteredDocuments();

  return (
    <PageContainer
      title="Document Library"
      subtitle="Manage employee documents and compliance"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 dark:bg-primary-100/10 rounded-lg">
                    <File className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-default-500">Total</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success-50 dark:bg-success-100/10 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.verified}</p>
                    <p className="text-xs text-default-500">Verified</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning-50 dark:bg-warning-100/10 rounded-lg">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                    <p className="text-xs text-default-500">Pending</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 dark:bg-orange-100/10 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.expiringSoon}</p>
                    <p className="text-xs text-default-500">Expiring Soon</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-danger-50 dark:bg-danger-100/10 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-danger" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.expired}</p>
                    <p className="text-xs text-default-500">Expired</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Filters and Table */}
        <Card>
          <CardHeader className="flex flex-col gap-4">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold">All Documents</h3>
              <Button
                variant="flat"
                startContent={<Filter className="h-4 w-4" />}
                size="sm"
              >
                Export
              </Button>
            </div>

            <div className="flex items-center gap-3 w-full">
              <Input
                placeholder="Search by employee or document..."
                startContent={<Search className="h-4 w-4 text-default-400" />}
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="max-w-md"
              />
              <Select
                placeholder="Filter by type"
                selectedKeys={[selectedType]}
                onSelectionChange={(keys) => setSelectedType(Array.from(keys)[0] as string)}
                className="max-w-xs"
              >
                {documentTypes.map((type) => (
                  <SelectItem key={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)}>
              <Tab key="all" title="All" />
              <Tab key="verified" title="Verified" />
              <Tab key="pending" title="Pending" />
              <Tab key="expiring" title="Expiring Soon" />
              <Tab key="expired" title="Expired" />
            </Tabs>
          </CardHeader>

          <CardBody>
            <Table aria-label="Documents table">
              <TableHeader>
                <TableColumn>EMPLOYEE</TableColumn>
                <TableColumn>DEPARTMENT</TableColumn>
                <TableColumn>DOCUMENT</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>UPLOADED</TableColumn>
                <TableColumn>EXPIRY</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <p className="font-medium">{doc.employeeName}</p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-default-600">{doc.department}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-default-400" />
                        <div>
                          <p className="font-medium text-sm">{doc.title}</p>
                          <p className="text-xs text-default-500">
                            {formatFileSize(doc.fileSize)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {documentTypes.find((t) => t.value === doc.type)?.label}
                    </TableCell>
                    <TableCell>
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {doc.expiryDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-default-400" />
                          <span className="text-sm">
                            {new Date(doc.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-default-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getStatusColor(doc.status)}
                        variant="flat"
                        startContent={getStatusIcon(doc.status)}
                        size="sm"
                      >
                        {getStatusLabel(doc)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button isIconOnly size="sm" variant="light">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button isIconOnly size="sm" variant="light">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredDocuments.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-default-300 mb-2" />
                <p className="text-default-500">No documents found</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
}
