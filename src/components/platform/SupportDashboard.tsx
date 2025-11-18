'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader, Chip, Button, Input, Tabs, Tab } from '@heroui/react';
import {
  LifeBuoy,
  Search,
  Filter,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar
} from 'lucide-react';

// Mock data - will be replaced with real API
const supportMetrics = {
  open: 12,
  inProgress: 8,
  resolved: 145,
  avgResponseTime: '2.5 hours',
};

const mockTickets = [
  {
    id: '1',
    title: 'Cannot access payroll module',
    tenant: 'PT Maju Bersama',
    tenantId: '1',
    status: 'open',
    priority: 'high',
    category: 'technical',
    createdBy: 'Budi Santoso',
    createdAt: '2024-11-18T10:30:00Z',
    lastUpdate: '2024-11-18T10:30:00Z',
    messages: 1,
  },
  {
    id: '2',
    title: 'How to export employee data?',
    tenant: 'CV Digital Solutions',
    tenantId: '2',
    status: 'in_progress',
    priority: 'medium',
    category: 'question',
    createdBy: 'Ani Wijaya',
    createdAt: '2024-11-18T09:15:00Z',
    lastUpdate: '2024-11-18T11:20:00Z',
    messages: 3,
  },
  {
    id: '3',
    title: 'Request feature: Custom leave types',
    tenant: 'PT Tech Inovasi',
    tenantId: '3',
    status: 'open',
    priority: 'low',
    category: 'feature_request',
    createdBy: 'Rizki Pratama',
    createdAt: '2024-11-17T16:45:00Z',
    lastUpdate: '2024-11-17T16:45:00Z',
    messages: 1,
  },
  {
    id: '4',
    title: 'Billing inquiry - wrong amount charged',
    tenant: 'UD Sejahtera',
    tenantId: '4',
    status: 'in_progress',
    priority: 'high',
    category: 'billing',
    createdBy: 'Siti Rahma',
    createdAt: '2024-11-17T14:20:00Z',
    lastUpdate: '2024-11-18T08:30:00Z',
    messages: 5,
  },
  {
    id: '5',
    title: 'Employee import failed',
    tenant: 'PT Maju Bersama',
    tenantId: '1',
    status: 'resolved',
    priority: 'medium',
    category: 'technical',
    createdBy: 'Budi Santoso',
    createdAt: '2024-11-16T11:00:00Z',
    lastUpdate: '2024-11-16T15:30:00Z',
    messages: 7,
  },
];

const statusColors = {
  open: 'warning',
  in_progress: 'primary',
  resolved: 'success',
  closed: 'default',
} as const;

const priorityColors = {
  low: 'default',
  medium: 'warning',
  high: 'danger',
  urgent: 'danger',
} as const;

const categoryLabels = {
  technical: 'Technical Issue',
  billing: 'Billing',
  question: 'Question',
  feature_request: 'Feature Request',
  bug: 'Bug Report',
} as const;

export function SupportDashboard() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.createdBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'open' && ticket.status === 'open') ||
      (activeTab === 'in_progress' && ticket.status === 'in_progress') ||
      (activeTab === 'resolved' && ticket.status === 'resolved');

    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
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
                  {supportMetrics.open}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
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
                  {supportMetrics.inProgress}
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
                  Resolved (30d)
                </p>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  {supportMetrics.resolved}
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
                  Avg Response Time
                </p>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  {supportMetrics.avgResponseTime}
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
          <div className="flex flex-col md:flex-row gap-4 w-full">
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
            <Button variant="flat" startContent={<Filter className="w-4 h-4" />}>
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            classNames={{
              tabList: 'w-full relative rounded-none p-0 border-b border-gray-200 dark:border-gray-700',
              tab: 'max-w-fit px-6 h-12',
            }}
          >
            <Tab key="all" title="All Tickets" />
            <Tab key="open" title="Open" />
            <Tab key="in_progress" title="In Progress" />
            <Tab key="resolved" title="Resolved" />
          </Tabs>

          <div className="p-6 space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <LifeBuoy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500">No tickets found</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {ticket.title}
                        </h4>
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
                          variant="dot"
                        >
                          {ticket.priority}
                        </Chip>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{ticket.createdBy}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{ticket.messages} messages</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(ticket.lastUpdate)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-primary">
                          {ticket.tenant}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {categoryLabels[ticket.category as keyof typeof categoryLabels]}
                        </span>
                      </div>
                    </div>

                    <Button size="sm" variant="flat">
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
