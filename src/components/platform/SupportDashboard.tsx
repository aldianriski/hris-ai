'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Chip, Button, Input, Spinner, useDisclosure } from '@heroui/react';
import {
  LifeBuoy,
  Search,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { CreateTicketModal } from './CreateTicketModal';
import { ViewTicketModal } from './ViewTicketModal';
import { formatDistanceToNow } from 'date-fns';

const statusColors = {
  open: 'warning',
  in_progress: 'primary',
  waiting_customer: 'secondary',
  resolved: 'success',
  closed: 'default',
} as const;

const priorityColors = {
  low: 'default',
  medium: 'warning',
  high: 'danger',
  urgent: 'danger',
} as const;

export function SupportDashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const createModal = useDisclosure();
  const viewModal = useDisclosure();

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchTickets();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/platform/support?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch tickets');

      const { data } = await response.json();
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    viewModal.onOpen();
  };

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    total: tickets.length,
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-end">
        <Button
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
          onPress={createModal.onOpen}
        >
          Create Ticket
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Open Tickets
                </p>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  {stats.open}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  In Progress
                </p>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  {stats.inProgress}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Resolved
                </p>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  {stats.resolved}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Tickets
                </p>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <LifeBuoy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex-1">
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              classNames={{
                input: 'text-sm',
                inputWrapper: 'h-10',
              }}
            />
          </div>
        </CardHeader>
        <CardBody className="p-6 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <LifeBuoy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500">No tickets found</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                onClick={() => handleViewTicket(ticket)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-mono text-xs text-gray-500">
                        {ticket.ticket_number}
                      </span>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {ticket.subject}
                      </h4>
                      <Chip
                        size="sm"
                        color={statusColors[ticket.status as keyof typeof statusColors] || 'default'}
                        variant="flat"
                      >
                        {ticket.status.replace('_', ' ')}
                      </Chip>
                      <Chip
                        size="sm"
                        color={priorityColors[ticket.priority as keyof typeof priorityColors] || 'default'}
                        variant="dot"
                      >
                        {ticket.priority}
                      </Chip>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{ticket.requester_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-primary">
                        {ticket.tenant?.name || 'Unknown Tenant'}
                      </span>
                      {ticket.category && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{ticket.category}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Button size="sm" variant="flat">
                    View
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      {/* Modals */}
      <CreateTicketModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        onSuccess={() => {
          createModal.onClose();
          fetchTickets();
        }}
      />

      {selectedTicket && (
        <ViewTicketModal
          isOpen={viewModal.isOpen}
          onClose={() => {
            viewModal.onClose();
            setSelectedTicket(null);
          }}
          ticket={selectedTicket}
          onUpdate={fetchTickets}
        />
      )}
    </div>
  );
}
