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
} from '@heroui/react';
import { LifeBuoy } from 'lucide-react';
import { toast } from 'sonner';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTicketModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTicketModalProps) {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: '',
    tenant_id: '',
    requester_email: '',
    requester_name: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchTenants();
    }
  }, [isOpen]);

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/platform/tenants?limit=100');
      if (response.ok) {
        const { data } = await response.json();
        setTenants(data || []);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.subject || !formData.description || !formData.tenant_id ||
        !formData.requester_email || !formData.requester_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/platform/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create ticket');

      toast.success('Ticket created successfully');
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      description: '',
      priority: 'medium',
      category: '',
      tenant_id: '',
      requester_email: '',
      requester_name: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-primary" />
          <span>Create Support Ticket</span>
        </ModalHeader>
        <ModalBody className="gap-4">
          <Input
            label="Subject"
            placeholder="Brief description of the issue"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            isRequired
          />

          <Textarea
            label="Description"
            placeholder="Detailed description of the issue"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            minRows={4}
            isRequired
          />

          <Select
            label="Tenant"
            placeholder="Select tenant"
            selectedKeys={formData.tenant_id ? [formData.tenant_id] : []}
            onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
            isRequired
          >
            {tenants.map((tenant) => (
              <SelectItem key={tenant.id}>
                {tenant.name}
              </SelectItem>
            ))}
          </Select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Requester Name"
              value={formData.requester_name}
              onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
              isRequired
            />

            <Input
              label="Requester Email"
              type="email"
              value={formData.requester_email}
              onChange={(e) => setFormData({ ...formData, requester_email: e.target.value })}
              isRequired
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Priority"
              selectedKeys={[formData.priority]}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <SelectItem key="low">Low</SelectItem>
              <SelectItem key="medium">Medium</SelectItem>
              <SelectItem key="high">High</SelectItem>
              <SelectItem key="urgent">Urgent</SelectItem>
            </Select>

            <Input
              label="Category (optional)"
              placeholder="e.g., billing, technical"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSubmit} isLoading={loading}>
            Create Ticket
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
