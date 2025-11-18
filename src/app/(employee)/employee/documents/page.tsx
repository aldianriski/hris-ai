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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
  Progress,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';
import {
  Upload,
  File,
  FileText,
  Download,
  Trash2,
  Eye,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const documentTypes = [
  { value: 'ktp', label: 'KTP (ID Card)' },
  { value: 'npwp', label: 'NPWP (Tax ID)' },
  { value: 'kk', label: 'Kartu Keluarga (Family Card)' },
  { value: 'bpjs_kesehatan', label: 'BPJS Kesehatan' },
  { value: 'bpjs_ketenagakerjaan', label: 'BPJS Ketenagakerjaan' },
  { value: 'passport', label: 'Passport' },
  { value: 'ijazah', label: 'Ijazah (Diploma)' },
  { value: 'contract', label: 'Employment Contract' },
  { value: 'other', label: 'Other' },
];

export default function EmployeeDocumentsPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [documents] = useState([
    {
      id: '1',
      type: 'ktp',
      title: 'KTP - John Doe',
      fileName: 'ktp_123456.pdf',
      fileSize: 245000,
      uploadedAt: '2025-11-01T10:00:00Z',
      expiryDate: null,
      isVerified: true,
      status: 'verified',
    },
    {
      id: '2',
      type: 'npwp',
      title: 'NPWP - Tax ID',
      fileName: 'npwp_789.pdf',
      fileSize: 180000,
      uploadedAt: '2025-11-05T14:30:00Z',
      expiryDate: null,
      isVerified: true,
      status: 'verified',
    },
    {
      id: '3',
      type: 'bpjs_kesehatan',
      title: 'BPJS Kesehatan Card',
      fileName: 'bpjs_health.pdf',
      fileSize: 320000,
      uploadedAt: '2025-11-10T09:15:00Z',
      expiryDate: '2026-12-31',
      isVerified: false,
      status: 'pending',
    },
  ]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, JPEG, and PNG files are allowed');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // TODO: Implement actual upload to Supabase Storage
      // const formData = new FormData();
      // formData.append('file', selectedFile);
      // const response = await fetch('/api/v1/documents/upload', { method: 'POST', body: formData });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      clearInterval(interval);
      setUploadProgress(100);

      toast.success('Document uploaded successfully');
      setShowUpload(false);
      setSelectedFile(null);
      setUploadProgress(0);
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
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
      case 'expired':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <PageContainer
      title="My Documents"
      subtitle="Upload and manage your personal documents"
      action={
        <Button
          color="primary"
          startContent={<Upload className="h-4 w-4" />}
          onPress={() => setShowUpload(true)}
        >
          Upload Document
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 dark:bg-primary-100/10 rounded-lg">
                    <File className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{documents.length}</p>
                    <p className="text-sm text-default-500">Total Documents</p>
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
                  <div className="p-2 bg-success-50 dark:bg-success-100/10 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {documents.filter((d) => d.isVerified).length}
                    </p>
                    <p className="text-sm text-default-500">Verified</p>
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
                  <div className="p-2 bg-warning-50 dark:bg-warning-100/10 rounded-lg">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {documents.filter((d) => !d.isVerified).length}
                    </p>
                    <p className="text-sm text-default-500">Pending Review</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Your Documents</h3>
          </CardHeader>
          <CardBody>
            <Table aria-label="Documents table">
              <TableHeader>
                <TableColumn>DOCUMENT</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>SIZE</TableColumn>
                <TableColumn>UPLOADED</TableColumn>
                <TableColumn>EXPIRY</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-default-400" />
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-xs text-default-500">{doc.fileName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {documentTypes.find((t) => t.value === doc.type)?.label}
                    </TableCell>
                    <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                    <TableCell>
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {doc.expiryDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-default-400" />
                          <span>{new Date(doc.expiryDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-default-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getStatusColor(doc.status)}
                        variant="flat"
                        startContent={getStatusIcon(doc.status)}
                        size="sm"
                      >
                        {doc.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          aria-label="View document"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          aria-label="Download document"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          aria-label="Delete document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* Upload Modal */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} size="2xl">
        <ModalContent>
          <ModalHeader>Upload Document</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Select label="Document Type" placeholder="Select document type">
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </Select>

              <Input label="Document Title" placeholder="e.g., KTP - John Doe" />

              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload File
                </label>
                <div className="border-2 border-dashed border-default-300 rounded-lg p-6 text-center">
                  {selectedFile ? (
                    <div className="space-y-2">
                      <FileText className="h-12 w-12 mx-auto text-primary" />
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-default-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => setSelectedFile(null)}
                      >
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 mx-auto text-default-400" />
                      <p className="text-sm text-default-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-default-500">
                        PDF, JPEG, PNG up to 10MB
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button
                        as="label"
                        htmlFor="file-upload"
                        size="sm"
                        variant="flat"
                      >
                        Select File
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input type="date" label="Issue Date (Optional)" />
                <Input type="date" label="Expiry Date (Optional)" />
              </div>

              {isUploading && (
                <div>
                  <p className="text-sm text-default-600 mb-2">
                    Uploading... {uploadProgress}%
                  </p>
                  <Progress value={uploadProgress} color="primary" />
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setShowUpload(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleUpload}
              isLoading={isUploading}
              isDisabled={!selectedFile}
            >
              Upload
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageContainer>
  );
}
