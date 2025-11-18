'use client';

import { Card, CardHeader, CardBody, Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Select, SelectItem, Switch } from '@heroui/react';
import { Webhook, Plus, Edit, Trash2, Copy, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';

interface WebhookConfig {
  id: string;
  name: string;
  endpointUrl: string;
  events: string[];
  isActive: boolean;
  lastDelivery?: {
    status: 'success' | 'failed';
    timestamp: string;
    attempts: number;
  };
  deliveryStats: {
    total: number;
    success: number;
    failed: number;
    successRate: number;
  };
}

export function WebhookManagement() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: '1',
      name: 'Payroll to Accounting Sync',
      endpointUrl: 'https://api.accurate.id/webhooks/payroll',
      events: ['payroll.processed', 'payroll.updated'],
      isActive: true,
      lastDelivery: {
        status: 'success',
        timestamp: '2025-11-18T14:30:00Z',
        attempts: 1,
      },
      deliveryStats: {
        total: 247,
        success: 245,
        failed: 2,
        successRate: 99.2,
      },
    },
    {
      id: '2',
      name: 'Leave Approval Notifications',
      endpointUrl: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX',
      events: ['leave.submitted', 'leave.approved', 'leave.rejected'],
      isActive: true,
      lastDelivery: {
        status: 'success',
        timestamp: '2025-11-18T10:15:00Z',
        attempts: 1,
      },
      deliveryStats: {
        total: 156,
        success: 156,
        failed: 0,
        successRate: 100,
      },
    },
    {
      id: '3',
      name: 'Employee Onboarding',
      endpointUrl: 'https://api.company.com/webhooks/onboarding',
      events: ['employee.created', 'employee.onboarding_started'],
      isActive: false,
      lastDelivery: {
        status: 'failed',
        timestamp: '2025-11-17T16:45:00Z',
        attempts: 3,
      },
      deliveryStats: {
        total: 45,
        success: 42,
        failed: 3,
        successRate: 93.3,
      },
    },
  ]);

  const availableEvents = [
    { value: 'employee.created', label: 'Employee Created', category: 'Employee' },
    { value: 'employee.updated', label: 'Employee Updated', category: 'Employee' },
    { value: 'employee.terminated', label: 'Employee Terminated', category: 'Employee' },
    { value: 'leave.submitted', label: 'Leave Request Submitted', category: 'Leave' },
    { value: 'leave.approved', label: 'Leave Request Approved', category: 'Leave' },
    { value: 'leave.rejected', label: 'Leave Request Rejected', category: 'Leave' },
    { value: 'attendance.clocked_in', label: 'Employee Clocked In', category: 'Attendance' },
    { value: 'attendance.clocked_out', label: 'Employee Clocked Out', category: 'Attendance' },
    { value: 'payroll.processed', label: 'Payroll Processed', category: 'Payroll' },
    { value: 'payroll.updated', label: 'Payroll Updated', category: 'Payroll' },
    { value: 'document.uploaded', label: 'Document Uploaded', category: 'Documents' },
    { value: 'performance.review_completed', label: 'Performance Review Completed', category: 'Performance' },
  ];

  const handleCopySecret = () => {
    toast.success('Webhook secret copied to clipboard');
  };

  const handleToggleWebhook = (id: string) => {
    setWebhooks(prev => prev.map(w =>
      w.id === id ? { ...w, isActive: !w.isActive } : w
    ));
    toast.success('Webhook status updated');
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== id));
    toast.success('Webhook deleted successfully');
  };

  const getStatusIcon = (status: string) => {
    if (status === 'success') return <CheckCircle className="h-4 w-4 text-success" />;
    if (status === 'failed') return <XCircle className="h-4 w-4 text-danger" />;
    return <Clock className="h-4 w-4 text-warning" />;
  };

  const stats = {
    total: webhooks.length,
    active: webhooks.filter(w => w.isActive).length,
    totalDeliveries: webhooks.reduce((sum, w) => sum + w.deliveryStats.total, 0),
    avgSuccessRate: Math.round(webhooks.reduce((sum, w) => sum + w.deliveryStats.successRate, 0) / webhooks.length),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <Webhook className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-default-500">Total Webhooks</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-success" />
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-sm text-default-500">Active</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalDeliveries}</p>
                  <p className="text-sm text-default-500">Total Deliveries</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-success" />
                <div>
                  <p className="text-2xl font-bold">{stats.avgSuccessRate}%</p>
                  <p className="text-sm text-default-500">Success Rate</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Webhooks List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold">Configured Webhooks</h3>
            <Button color="primary" startContent={<Plus className="h-4 w-4" />} onPress={onOpen}>
              Create Webhook
            </Button>
          </div>
        </CardHeader>
        <CardBody className="gap-4">
          {webhooks.map((webhook, index) => (
            <motion.div
              key={webhook.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardBody className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{webhook.name}</h4>
                        <Chip
                          color={webhook.isActive ? 'success' : 'default'}
                          variant="flat"
                          size="sm"
                        >
                          {webhook.isActive ? 'Active' : 'Inactive'}
                        </Chip>
                        {webhook.lastDelivery && (
                          <Chip
                            variant="flat"
                            size="sm"
                            startContent={getStatusIcon(webhook.lastDelivery.status)}
                          >
                            Last: {webhook.lastDelivery.status}
                          </Chip>
                        )}
                      </div>
                      <p className="text-sm text-default-600 mb-2 font-mono">{webhook.endpointUrl}</p>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event) => (
                          <Chip key={event} size="sm" variant="bordered">
                            {event}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 p-3 bg-default-50 rounded-lg mb-3">
                    <div className="text-center">
                      <p className="text-xs text-default-500">Total</p>
                      <p className="text-sm font-semibold">{webhook.deliveryStats.total}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-default-500">Success</p>
                      <p className="text-sm font-semibold text-success">{webhook.deliveryStats.success}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-default-500">Failed</p>
                      <p className="text-sm font-semibold text-danger">{webhook.deliveryStats.failed}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-default-500">Success Rate</p>
                      <p className="text-sm font-semibold">{webhook.deliveryStats.successRate}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      color={webhook.isActive ? 'warning' : 'success'}
                      onPress={() => handleToggleWebhook(webhook.id)}
                    >
                      {webhook.isActive ? 'Pause' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={<Edit className="h-4 w-4" />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={<Copy className="h-4 w-4" />}
                      onPress={handleCopySecret}
                    >
                      Copy Secret
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      startContent={<Trash2 className="h-4 w-4" />}
                      onPress={() => handleDeleteWebhook(webhook.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}

          {webhooks.length === 0 && (
            <div className="text-center py-12">
              <Webhook className="h-16 w-16 mx-auto text-default-300 mb-4" />
              <p className="text-default-500">No webhooks configured</p>
              <Button color="primary" className="mt-4" onPress={onOpen}>
                Create Your First Webhook
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Create Webhook Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Create New Webhook</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Webhook Name"
                    placeholder="e.g., Payroll Sync to Accounting"
                    required
                  />
                  <Input
                    label="Endpoint URL"
                    placeholder="https://api.example.com/webhooks/..."
                    required
                    type="url"
                  />
                  <Select
                    label="Subscribe to Events"
                    placeholder="Select events to listen"
                    selectionMode="multiple"
                  >
                    {availableEvents.map(event => (
                      <SelectItem key={event.value}>
                        {event.label} ({event.category})
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    label="Timeout (seconds)"
                    placeholder="30"
                    type="number"
                    defaultValue="30"
                  />
                  <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg">
                    <div>
                      <p className="font-medium">Active</p>
                      <p className="text-sm text-default-500">Start delivering events immediately</p>
                    </div>
                    <Switch defaultSelected />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose}>
                  Create Webhook
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
