'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
  useDisclosure,
} from '@heroui/react';
import {
  Plus,
  Mail,
  Edit,
  Trash2,
  Eye,
  Send,
  AlertCircle,
} from 'lucide-react';
import { EmailTemplateEditorModal } from '@/components/platform/EmailTemplateEditorModal';
import { EmailTemplatePreviewModal } from '@/components/platform/EmailTemplatePreviewModal';
import { SendTestEmailModal } from '@/components/platform/SendTestEmailModal';

interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  description: string;
  category: 'transactional' | 'marketing' | 'billing';
  subject: string;
  html_content: string;
  plain_text_content: string;
  variables: string[];
  preview_data: Record<string, string>;
  is_active: boolean;
  is_system_template: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

const categoryColors = {
  transactional: 'primary',
  marketing: 'secondary',
  billing: 'success',
} as const;

export default function EmailTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const { isOpen: isEditorOpen, onOpen: onEditorOpen, onClose: onEditorClose } = useDisclosure();
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const { isOpen: isTestEmailOpen, onOpen: onTestEmailOpen, onClose: onTestEmailClose } = useDisclosure();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/platform/email-templates');

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    onEditorOpen();
  };

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    onPreviewOpen();
  };

  const handleSendTest = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    onTestEmailOpen();
  };

  const handleDelete = async (template: EmailTemplate) => {
    if (template.is_system_template) {
      alert('System templates cannot be deleted');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/platform/email-templates/${template.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      fetchTemplates();
    } catch (err) {
      console.error('Error deleting template:', err);
      alert('Failed to delete template');
    }
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    onEditorOpen();
  };

  const handleModalClose = () => {
    setSelectedTemplate(null);
    onEditorClose();
    fetchTemplates();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Email Templates
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage and customize email templates for platform communication
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
          onPress={handleCreateNew}
        >
          Create Template
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardBody>
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Templates Table */}
      <Card>
        <CardBody className="p-0">
          <Table aria-label="Email templates table">
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>CATEGORY</TableColumn>
              <TableColumn>SUBJECT</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>VARIABLES</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No email templates found">
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {template.name}
                      </p>
                      {template.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {template.description}
                        </p>
                      )}
                      {template.is_system_template && (
                        <Chip size="sm" variant="flat" className="mt-1">
                          System Template
                        </Chip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={categoryColors[template.category]}
                      variant="flat"
                    >
                      {template.category}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">
                      {template.subject}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={template.is_active ? 'success' : 'default'}
                      variant="flat"
                    >
                      {template.is_active ? 'Active' : 'Inactive'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {template.variables?.length || 0} variables
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        onPress={() => handlePreview(template)}
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        onPress={() => handleEdit(template)}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="success"
                        onPress={() => handleSendTest(template)}
                        title="Send Test"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                      {!template.is_system_template && (
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          color="danger"
                          onPress={() => handleDelete(template)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Modals */}
      {isEditorOpen && (
        <EmailTemplateEditorModal
          isOpen={isEditorOpen}
          onClose={handleModalClose}
          template={selectedTemplate}
        />
      )}

      {isPreviewOpen && selectedTemplate && (
        <EmailTemplatePreviewModal
          isOpen={isPreviewOpen}
          onClose={onPreviewClose}
          template={selectedTemplate}
        />
      )}

      {isTestEmailOpen && selectedTemplate && (
        <SendTestEmailModal
          isOpen={isTestEmailOpen}
          onClose={onTestEmailClose}
          template={selectedTemplate}
        />
      )}
    </div>
  );
}
