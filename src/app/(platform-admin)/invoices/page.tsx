'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardBody,
  Input,
  Spinner,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Select,
  SelectItem,
  useDisclosure,
} from '@heroui/react';
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Send,
  CheckCircle2,
  XCircle,
  Receipt,
  Download,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { CreateInvoiceModal } from '@/components/platform/CreateInvoiceModal';
import { MarkPaidModal } from '@/components/platform/MarkPaidModal';

interface Invoice {
  id: string;
  invoice_number: string;
  tenant: {
    id: string;
    company_name: string;
    slug: string;
  };
  billing_name: string;
  billing_email: string;
  amount_total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  due_date: string;
  paid_at: string | null;
  issue_date: string;
  created_at: string;
}

const STATUS_COLORS = {
  draft: 'default',
  sent: 'primary',
  paid: 'success',
  overdue: 'danger',
  cancelled: 'default',
  refunded: 'warning',
} as const;

const STATUS_ICONS = {
  draft: AlertCircle,
  sent: Send,
  paid: CheckCircle2,
  overdue: AlertCircle,
  cancelled: XCircle,
  refunded: AlertCircle,
};

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const createModal = useDisclosure();
  const markPaidModal = useDisclosure();

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/platform/invoices?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const { data } = await response.json();
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  // Send invoice
  const sendInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/platform/invoices/${invoice.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to send invoice');
      }

      toast.success('Invoice sent successfully');
      fetchInvoices();
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
    }
  };

  // Cancel invoice
  const cancelInvoice = async (invoice: Invoice) => {
    if (!confirm(`Are you sure you want to cancel invoice ${invoice.invoice_number}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/platform/invoices/${invoice.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel invoice');
      }

      toast.success('Invoice cancelled successfully');
      fetchInvoices();
    } catch (error) {
      console.error('Error cancelling invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel invoice');
    }
  };

  // Mark as paid
  const handleMarkPaid = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    markPaidModal.onOpen();
  };

  // View invoice
  const viewInvoice = (invoice: Invoice) => {
    router.push(`/invoices/${invoice.id}`);
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status chip
  const getStatusChip = (status: Invoice['status']) => {
    const Icon = STATUS_ICONS[status];
    return (
      <Chip
        size="sm"
        variant="flat"
        color={STATUS_COLORS[status]}
        startContent={<Icon className="w-3 h-3" />}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Chip>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Receipt className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Invoices
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage invoices and billing for all tenants
            </p>
          </div>
        </div>
        <Button
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
          onPress={createModal.onOpen}
        >
          Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              className="flex-1"
              placeholder="Search by invoice number, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchInvoices()}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
            />
            <Select
              label="Status"
              placeholder="All statuses"
              className="w-full sm:w-48"
              selectedKeys={[statusFilter]}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <SelectItem key="all" value="all">All</SelectItem>
              <SelectItem key="draft" value="draft">Draft</SelectItem>
              <SelectItem key="sent" value="sent">Sent</SelectItem>
              <SelectItem key="paid" value="paid">Paid</SelectItem>
              <SelectItem key="overdue" value="overdue">Overdue</SelectItem>
              <SelectItem key="cancelled" value="cancelled">Cancelled</SelectItem>
            </Select>
            <Button
              color="primary"
              variant="flat"
              onPress={fetchInvoices}
            >
              Search
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Spinner size="lg" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Receipt className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No invoices found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first invoice'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button
                  color="primary"
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={createModal.onOpen}
                >
                  Create Invoice
                </Button>
              )}
            </div>
          ) : (
            <Table aria-label="Invoices table">
              <TableHeader>
                <TableColumn>INVOICE</TableColumn>
                <TableColumn>CUSTOMER</TableColumn>
                <TableColumn>AMOUNT</TableColumn>
                <TableColumn>DUE DATE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                          {invoice.invoice_number}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(invoice.issue_date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {invoice.billing_name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {invoice.tenant.company_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(invoice.amount_total, invoice.currency)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formatDate(invoice.due_date)}
                        </span>
                        {invoice.paid_at && (
                          <span className="text-xs text-success-600 dark:text-success-400">
                            Paid {formatDate(invoice.paid_at)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(invoice.status)}
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Invoice actions">
                          <DropdownItem
                            key="view"
                            startContent={<Eye className="w-4 h-4" />}
                            onPress={() => viewInvoice(invoice)}
                          >
                            View Details
                          </DropdownItem>
                          {invoice.status === 'draft' && (
                            <DropdownItem
                              key="send"
                              startContent={<Send className="w-4 h-4" />}
                              onPress={() => sendInvoice(invoice)}
                            >
                              Send Invoice
                            </DropdownItem>
                          )}
                          {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                            <DropdownItem
                              key="mark-paid"
                              startContent={<CheckCircle2 className="w-4 h-4" />}
                              onPress={() => handleMarkPaid(invoice)}
                            >
                              Mark as Paid
                            </DropdownItem>
                          )}
                          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                            <DropdownItem
                              key="cancel"
                              className="text-danger"
                              color="danger"
                              startContent={<XCircle className="w-4 h-4" />}
                              onPress={() => cancelInvoice(invoice)}
                            >
                              Cancel Invoice
                            </DropdownItem>
                          )}
                          <DropdownItem
                            key="download"
                            startContent={<Download className="w-4 h-4" />}
                          >
                            Download PDF
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        onSuccess={() => {
          createModal.onClose();
          fetchInvoices();
        }}
      />

      {selectedInvoice && (
        <MarkPaidModal
          isOpen={markPaidModal.isOpen}
          onClose={() => {
            markPaidModal.onClose();
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice}
          onSuccess={() => {
            markPaidModal.onClose();
            setSelectedInvoice(null);
            fetchInvoices();
          }}
        />
      )}
    </div>
  );
}
