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
  Select,
  SelectItem,
  Textarea,
  Chip,
} from '@heroui/react';
import { Receipt, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Tenant {
  id: string;
  company_name: string;
  slug: string;
  support_email: string;
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateInvoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [formData, setFormData] = useState({
    tenant_id: '',
    billing_name: '',
    billing_email: '',
    billing_address: '',
    billing_tax_id: '',
    billing_phone: '',
    due_date: '',
    notes: '',
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unit_price: 0, amount: 0 },
  ]);

  const TAX_RATE = 11.00; // PPN 11%

  useEffect(() => {
    if (isOpen) {
      fetchTenants();
    }
  }, [isOpen]);

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/platform/tenants');
      if (response.ok) {
        const { data } = await response.json();
        setTenants(data || []);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const handleTenantChange = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setFormData({
        ...formData,
        tenant_id: tenantId,
        billing_name: tenant.company_name,
        billing_email: tenant.support_email || '',
      });
    }
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0, amount: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };

    // Recalculate amount
    if (field === 'quantity' || field === 'unit_price') {
      updated[index].amount = updated[index].quantity * updated[index].unit_price;
    }

    setLineItems(updated);
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * (TAX_RATE / 100);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleSubmit = async () => {
    if (!formData.tenant_id || !formData.billing_name || !formData.due_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (lineItems.some(item => !item.description || item.amount === 0)) {
      toast.error('Please complete all line items');
      return;
    }

    try {
      setLoading(true);
      const { subtotal, tax, total } = calculateTotals();

      const response = await fetch('/api/platform/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          line_items: lineItems,
          amount_subtotal: subtotal,
          amount_tax: tax,
          amount_total: total,
          tax_rate: TAX_RATE,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      toast.success('Invoice created successfully');
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tenant_id: '',
      billing_name: '',
      billing_email: '',
      billing_address: '',
      billing_tax_id: '',
      billing_phone: '',
      due_date: '',
      notes: '',
    });
    setLineItems([{ description: '', quantity: 1, unit_price: 0, amount: 0 }]);
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-primary" />
          <span>Create Invoice</span>
        </ModalHeader>
        <ModalBody className="gap-4">
          <Select
            label="Tenant"
            placeholder="Select tenant"
            selectedKeys={formData.tenant_id ? [formData.tenant_id] : []}
            onChange={(e) => handleTenantChange(e.target.value)}
            isRequired
          >
            {tenants.map((tenant) => (
              <SelectItem key={tenant.id}>
                {tenant.company_name}
              </SelectItem>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Billing Name"
              value={formData.billing_name}
              onChange={(e) => setFormData({ ...formData, billing_name: e.target.value })}
              isRequired
            />
            <Input
              label="Billing Email"
              type="email"
              value={formData.billing_email}
              onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
              isRequired
            />
          </div>

          <Textarea
            label="Billing Address"
            value={formData.billing_address}
            onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
            minRows={2}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tax ID (NPWP)"
              placeholder="Optional"
              value={formData.billing_tax_id}
              onChange={(e) => setFormData({ ...formData, billing_tax_id: e.target.value })}
            />
            <Input
              label="Due Date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              isRequired
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Line Items</label>
              <Button
                size="sm"
                variant="flat"
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                onPress={addLineItem}
              >
                Add Item
              </Button>
            </div>

            {lineItems.map((item, index) => (
              <div key={index} className="flex gap-2 items-start">
                <Input
                  size="sm"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                  className="flex-1"
                />
                <Input
                  size="sm"
                  type="number"
                  placeholder="Qty"
                  value={item.quantity.toString()}
                  onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                <Input
                  size="sm"
                  type="number"
                  placeholder="Price"
                  value={item.unit_price.toString()}
                  onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  className="w-32"
                />
                <div className="w-32 flex items-center">
                  <span className="text-sm font-semibold">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.amount)}
                  </span>
                </div>
                {lineItems.length > 1 && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => removeLineItem(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-semibold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (PPN 11%):</span>
              <span className="font-semibold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(total)}</span>
            </div>
          </div>

          <Textarea
            label="Notes"
            placeholder="Additional notes for the customer (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            minRows={2}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSubmit} isLoading={loading}>
            Create Invoice
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
