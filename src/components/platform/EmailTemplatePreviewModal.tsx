'use client';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Tabs,
  Tab,
} from '@heroui/react';

interface EmailTemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: any;
}

export function EmailTemplatePreviewModal({
  isOpen,
  onClose,
  template,
}: EmailTemplatePreviewModalProps) {
  // Replace variables with preview data
  const renderWithPreviewData = (content: string) => {
    let rendered = content;
    if (template.preview_data) {
      Object.entries(template.preview_data).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        rendered = rendered.replaceAll(placeholder, String(value));
      });
    }
    return rendered;
  };

  const renderedSubject = renderWithPreviewData(template.subject);
  const renderedHtml = renderWithPreviewData(template.html_content);
  const renderedText = renderWithPreviewData(template.plain_text_content || '');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>Preview: {template.name}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Subject */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subject:</p>
              <p className="font-medium text-gray-900 dark:text-white">{renderedSubject}</p>
            </div>

            {/* Content Tabs */}
            <Tabs aria-label="Email content preview">
              <Tab key="html" title="HTML Preview">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900 min-h-[400px]">
                  <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
                </div>
              </Tab>
              <Tab key="html-code" title="HTML Code">
                <div className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-auto max-h-[500px]">
                  <pre className="text-xs">
                    <code>{renderedHtml}</code>
                  </pre>
                </div>
              </Tab>
              <Tab key="text" title="Plain Text">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg min-h-[400px]">
                  <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {renderedText || 'No plain text version available'}
                  </pre>
                </div>
              </Tab>
            </Tabs>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
