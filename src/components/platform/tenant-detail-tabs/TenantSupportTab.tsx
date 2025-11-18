'use client';

import { Card, CardBody, Chip, Button, Textarea } from '@heroui/react';
import { MessageSquare, Plus } from 'lucide-react';

interface TenantSupportTabProps {
  tenantId: string;
}

const mockTickets = [
  {
    id: '1',
    number: 'TKT-2024-123',
    subject: 'Issue with payroll calculation',
    status: 'open',
    priority: 'high',
    createdAt: '2024-11-18T09:00:00Z',
    lastReply: '2024-11-18T10:30:00Z',
  },
  {
    id: '2',
    number: 'TKT-2024-118',
    subject: 'Question about leave policies',
    status: 'in_progress',
    priority: 'normal',
    createdAt: '2024-11-15T14:20:00Z',
    lastReply: '2024-11-16T09:15:00Z',
  },
  {
    id: '3',
    number: 'TKT-2024-105',
    subject: 'Feature request: Custom reports',
    status: 'resolved',
    priority: 'low',
    createdAt: '2024-11-10T11:30:00Z',
    lastReply: '2024-11-12T16:45:00Z',
  },
];

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
            <p className="text-2xl font-bold text-gray-900 dark:text-white">1</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">1</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">1</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Resolved</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">4.5</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Response (hrs)</p>
          </CardBody>
        </Card>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {mockTickets.map((ticket) => (
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
                        #{ticket.number}
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
                      Created {new Date(ticket.createdAt).toLocaleDateString()} • Last reply {new Date(ticket.lastReply).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

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
