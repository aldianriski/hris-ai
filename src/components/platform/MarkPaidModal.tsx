'use client';

import { useState } from 'react';
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
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface MarkPaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: string;
    invoice_number: string;
    amount_total: number;
    currency: string;
  };
  onSuccess: () => void;
}

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'midtrans', label: 'Midtrans' },
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'other', label: 'Other' },
];

export function MarkPaidModal({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}: MarkPaidModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    payment_method: 'bank_transfer',
    payment_reference: '',
    payment_notes: '',
    paid_at: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/platform/invoices/${invoice.id}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to mark invoice as paid');
      }

      toast.success('Invoice marked as paid successfully');
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast.error('Failed to mark invoice as paid');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      payment_method: 'bank_transfer',
      payment_reference: '',
      payment_notes: '',
      paid_at: new Date().toISOString().split('T')[0],
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <span>Mark Invoice as Paid</span>
        </ModalHeader>
        <ModalBody className="gap-4">
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Invoice Number</span>
              <span className="font-mono font-semibold">{invoice.invoice_number}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Amount</span>
              <span className="text-lg font-bold">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: invoice.currency,
                }).format(invoice.amount_total)}
              </span>
            </div>
          </div>

          <Select
            label="Payment Method"
            selectedKeys={[formData.payment_method]}
            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
            isRequired
          >
            {PAYMENT_METHODS.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </Select>

          <Input
            label="Payment Reference / Transaction ID"
            placeholder="e.g., TXN-12345, Check #67890"
            value={formData.payment_reference}
            onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })}
            description="Optional reference number for this payment"
          />

          <Input
            label="Payment Date"
            type="date"
            value={formData.paid_at}
            onChange={(e) => setFormData({ ...formData, paid_at: e.target.value })}
            isRequired
          />

          <Textarea
            label="Payment Notes"
            placeholder="Add any additional notes about this payment (optional)"
            value={formData.payment_notes}
            onChange={(e) => setFormData({ ...formData, payment_notes: e.target.value })}
            minRows={3}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            variant="light"
            onPress={handleClose}
            isDisabled={loading}
          >
            Cancel
          </Button>
          <Button
            color="success"
            onPress={handleSubmit}
            isLoading={loading}
          >
            Mark as Paid
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
