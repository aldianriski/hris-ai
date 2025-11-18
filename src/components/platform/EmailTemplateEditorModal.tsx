'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Switch,
  Chip,
} from '@heroui/react';
import { Save, X } from 'lucide-react';

interface EmailTemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: any | null;
}

export function EmailTemplateEditorModal({
  isOpen,
  onClose,
  template,
}: EmailTemplateEditorModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'transactional',
    subject: '',
    htmlContent: '',
    plainTextContent: '',
    isActive: true,
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        description: template.description || '',
        category: template.category || 'transactional',
        subject: template.subject || '',
        htmlContent: template.html_content || '',
        plainTextContent: template.plain_text_content || '',
        isActive: template.is_active ?? true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'transactional',
        subject: '',
        htmlContent: '',
        plainTextContent: '',
        isActive: true,
      });
    }
  }, [template]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const url = template
        ? `/api/platform/email-templates/${template.id}`
        : '/api/platform/email-templates';

      const method = template ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to save template');
      }

      onClose();
    } catch (err) {
      console.error('Error saving template:', err);
      setError(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {template ? 'Edit Email Template' : 'Create Email Template'}
          {template?.is_system_template && (
            <Chip size="sm" variant="flat" color="warning">
              System Template - Cannot delete, but can modify
            </Chip>
          )}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Template Name"
                placeholder="e.g., Welcome Email"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isRequired
                isDisabled={saving}
              />

              <Select
                label="Category"
                selectedKeys={[formData.category]}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                isRequired
                isDisabled={saving}
              >
                <SelectItem key="transactional" value="transactional">
                  Transactional
                </SelectItem>
                <SelectItem key="marketing" value="marketing">
                  Marketing
                </SelectItem>
                <SelectItem key="billing" value="billing">
                  Billing
                </SelectItem>
              </Select>
            </div>

            <Textarea
              label="Description"
              placeholder="Describe when this template is used"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              minRows={2}
              isDisabled={saving}
            />

            <Input
              label="Subject Line"
              placeholder="e.g., Welcome to {{companyName}}!"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              description="Use {{variableName}} for dynamic content"
              isRequired
              isDisabled={saving}
            />

            <Textarea
              label="HTML Content"
              placeholder="Enter HTML email content with {{variables}}"
              value={formData.htmlContent}
              onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
              minRows={10}
              description="Full HTML email body. Use {{variableName}} for placeholders."
              isRequired
              isDisabled={saving}
            />

            <Textarea
              label="Plain Text Content (Optional)"
              placeholder="Plain text version for email clients that don't support HTML"
              value={formData.plainTextContent}
              onChange={(e) => setFormData({ ...formData, plainTextContent: e.target.value })}
              minRows={6}
              isDisabled={saving}
            />

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Active Status
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Only active templates can be used in the system
                </p>
              </div>
              <Switch
                isSelected={formData.isActive}
                onValueChange={(checked) => setFormData({ ...formData, isActive: checked })}
                isDisabled={saving}
              />
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Available Variables
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                Use these placeholders in your subject and content:
              </p>
              <div className="flex flex-wrap gap-2">
                {['{{userName}}', '{{userEmail}}', '{{companyName}}', '{{currentDate}}'].map((variable) => (
                  <Chip key={variable} size="sm" variant="flat">
                    {variable}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={saving}>
            Cancel
          </Button>
          <Button
            color="primary"
            startContent={<Save className="w-4 h-4" />}
            onPress={handleSave}
            isLoading={saving}
          >
            {template ? 'Update Template' : 'Create Template'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
