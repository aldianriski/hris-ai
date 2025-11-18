'use client';

import { Card, CardBody, CardHeader, Chip, Button, Tabs, Tab } from '@heroui/react';
import {
  Play,
  Pause,
  Edit,
  Copy,
  Trash2,
  Users,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

interface Workflow {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'active' | 'paused' | 'draft';
  trigger: string;
  steps: number;
  runs: number;
  successRate: number;
  lastRun: string;
  createdAt: string;
  viewUrl?: string;
}

export function WorkflowList() {
  const [activeTab, setActiveTab] = useState('all');

  const workflows: Workflow[] = [
    {
      id: '1',
      name: 'Leave Approval Process',
      description: 'Automated leave request approval with AI evaluation',
      type: 'Approval',
      status: 'active',
      trigger: 'Leave Request Submitted',
      steps: 5,
      runs: 847,
      successRate: 94.5,
      lastRun: '5 minutes ago',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Employee Onboarding',
      description: 'Complete onboarding workflow from offer to first day',
      type: 'Onboarding',
      status: 'active',
      trigger: 'Candidate Hired',
      steps: 12,
      runs: 45,
      successRate: 100,
      lastRun: '2 hours ago',
      createdAt: '2024-02-01',
      viewUrl: '/hr/workflows/onboarding',
    },
    {
      id: '3',
      name: 'Document Expiry Reminder',
      description: 'Send reminders for expiring documents',
      type: 'Notification',
      status: 'active',
      trigger: 'Scheduled Daily',
      steps: 3,
      runs: 120,
      successRate: 98.3,
      lastRun: '1 day ago',
      createdAt: '2024-01-20',
    },
    {
      id: '4',
      name: 'Performance Review Cycle',
      description: 'Quarterly performance review workflow',
      type: 'Review',
      status: 'paused',
      trigger: 'Scheduled Quarterly',
      steps: 8,
      runs: 12,
      successRate: 91.7,
      lastRun: '45 days ago',
      createdAt: '2024-01-10',
    },
    {
      id: '5',
      name: 'Offboarding Process',
      description: 'Employee exit workflow with asset return tracking',
      type: 'Offboarding',
      status: 'active',
      trigger: 'Resignation Submitted',
      steps: 10,
      runs: 8,
      successRate: 100,
      lastRun: '3 days ago',
      createdAt: '2024-11-10',
      viewUrl: '/hr/workflows/offboarding',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'paused':
        return <Clock className="h-3 w-3" />;
      case 'draft':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Approval':
        return CheckCircle2;
      case 'Onboarding':
        return Users;
      case 'Offboarding':
        return Users;
      case 'Review':
        return FileText;
      case 'Notification':
        return Calendar;
      default:
        return FileText;
    }
  };

  const filteredWorkflows =
    activeTab === 'all'
      ? workflows
      : workflows.filter((w) => w.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 dark:bg-primary-100/10 rounded-lg">
                  <Play className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{workflows.length}</p>
                  <p className="text-sm text-default-500">Total Workflows</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success-50 dark:bg-success-100/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {workflows.filter((w) => w.status === 'active').length}
                  </p>
                  <p className="text-sm text-default-500">Active</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-100/10 rounded-lg">
                  <Play className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {workflows.reduce((sum, w) => sum + w.runs, 0)}
                  </p>
                  <p className="text-sm text-default-500">Total Runs</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-100/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {(
                      workflows.reduce((sum, w) => sum + w.successRate, 0) /
                      workflows.filter((w) => w.runs > 0).length
                    ).toFixed(1)}
                    %
                  </p>
                  <p className="text-sm text-default-500">Avg Success Rate</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Workflow List */}
      <Card>
        <CardHeader>
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
          >
            <Tab key="all" title="All Workflows" />
            <Tab key="active" title="Active" />
            <Tab key="paused" title="Paused" />
            <Tab key="draft" title="Drafts" />
          </Tabs>
        </CardHeader>
        <CardBody className="gap-3">
          {filteredWorkflows.map((workflow, index) => {
            const TypeIcon = getTypeIcon(workflow.type);
            return (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardBody className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-950/30 dark:to-purple-950/30 rounded-xl">
                        <TypeIcon className="h-6 w-6 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{workflow.name}</h3>
                              <Chip
                                color={getStatusColor(workflow.status)}
                                variant="flat"
                                size="sm"
                                startContent={getStatusIcon(workflow.status)}
                              >
                                {workflow.status}
                              </Chip>
                            </div>
                            <p className="text-sm text-default-600">{workflow.description}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-default-500">Trigger</p>
                            <p className="text-sm font-medium">{workflow.trigger}</p>
                          </div>
                          <div>
                            <p className="text-xs text-default-500">Steps</p>
                            <p className="text-sm font-medium">{workflow.steps} steps</p>
                          </div>
                          <div>
                            <p className="text-xs text-default-500">Runs</p>
                            <p className="text-sm font-medium">{workflow.runs} times</p>
                          </div>
                          <div>
                            <p className="text-xs text-default-500">Success Rate</p>
                            <p className="text-sm font-medium">
                              {workflow.successRate > 0 ? `${workflow.successRate}%` : '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-default-200">
                          <p className="text-xs text-default-500">
                            Last run: {workflow.lastRun}
                          </p>
                          <div className="flex items-center gap-1">
                            {workflow.viewUrl && (
                              <Button
                                as={Link}
                                href={workflow.viewUrl}
                                size="sm"
                                variant="flat"
                                color="primary"
                                startContent={<Eye className="h-4 w-4" />}
                              >
                                View
                              </Button>
                            )}
                            <Button isIconOnly size="sm" variant="light">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button isIconOnly size="sm" variant="light">
                              <Copy className="h-4 w-4" />
                            </Button>
                            {workflow.status === 'active' ? (
                              <Button isIconOnly size="sm" variant="light" color="warning">
                                <Pause className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button isIconOnly size="sm" variant="light" color="success">
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            <Button isIconOnly size="sm" variant="light" color="danger">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}

          {filteredWorkflows.length === 0 && (
            <div className="text-center py-12">
              <Play className="h-16 w-16 mx-auto text-default-300 mb-4" />
              <p className="text-default-500">No workflows found</p>
              <Button
                as={Link}
                href="/hr/workflows/builder"
                color="primary"
                variant="flat"
                className="mt-4"
                startContent={<Plus className="h-4 w-4" />}
              >
                Create Your First Workflow
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
