'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Chip, Button, Textarea, Spinner } from '@heroui/react';
import { MessageSquare, Plus, AlertCircle } from 'lucide-react';

interface TenantSupportTabProps {
  tenantId: string;
}

interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

const statusColors = {
  open: 'primary',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'default',
} as const;

const priorityColors = {
  low: 'default',
  normal: 'primary',
  high: 'warning',
  urgent: 'danger',
} as const;

export function TenantSupportTab({ tenantId }: TenantSupportTabProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTickets() {
      try {
        setLoading(true);
        const response = await fetch(`/api/platform/support?tenant_id=${tenantId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch support tickets');
        }

        const result = await response.json();
        setTickets(result.data || []);
      } catch (err) {
        console.error('Error fetching support tickets:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch support tickets');
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, [tenantId]);

  // Calculate stats from tickets
  const stats = {
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    avgResponse: tickets.length > 0 ? '4.5' : '0', // TODO: Calculate from actual data
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <Spinner size="lg" color="primary" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading support tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Tickets</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Button color="primary" size="sm" onPress={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Support Tickets
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View and manage support tickets for this tenant
          </p>
        </div>

        <Button
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
        >
          Create Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.open}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.resolved}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Resolved</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgResponse}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Response (hrs)</p>
          </CardBody>
        </Card>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">No support tickets</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              This tenant hasn't created any support tickets yet
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Card key={ticket.id} isPressable>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {ticket.subject}
                        </p>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          #{ticket.ticket_number}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Chip
                          size="sm"
                          color={statusColors[ticket.status as keyof typeof statusColors]}
                          variant="flat"
                        >
                          {ticket.status.replace('_', ' ')}
                        </Chip>
                        <Chip
                          size="sm"
                          color={priorityColors[ticket.priority as keyof typeof priorityColors]}
                          variant="flat"
                        >
                          {ticket.priority}
                        </Chip>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Created {new Date(ticket.created_at).toLocaleDateString()} • Last updated {new Date(ticket.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Internal Notes */}
      <Card>
        <CardBody>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Internal Notes
          </h4>
          <Textarea
            placeholder="Add internal notes about this tenant (not visible to customer)..."
            minRows={3}
          />
          <div className="flex justify-end mt-3">
            <Button size="sm" color="primary">
              Save Note
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
