'use client';

import { Card, CardBody, CardHeader, Chip, Button, Tabs, Tab, Spinner } from '@heroui/react';
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
import { useAuth } from '@/lib/hooks/useAuth';
import { useWorkflows } from '@/lib/hooks/useWorkflows';
import { formatDistanceToNow } from 'date-fns';

export function WorkflowList() {
  const { employerId } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  const { data, isLoading } = useWorkflows(
    employerId,
    activeTab === 'all' ? undefined : { status: activeTab }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" label="Loading workflows..." />
      </div>
    );
  }

  const workflows = data?.workflows || [];

  // Calculate statistics
  const activeWorkflows = workflows.filter((w) => w.status === 'in_progress').length;
  const totalRuns = workflows.length;
  const avgProgress = workflows.length > 0
    ? workflows.reduce((sum, w) => sum + w.progressPercentage, 0) / workflows.length
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'failed':
        return 'danger';
      case 'cancelled':
        return 'warning';
      case 'pending':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Play className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3" />;
      case 'cancelled':
        return <Clock className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'onboarding':
        return Users;
      case 'offboarding':
        return Users;
      case 'leave_approval':
        return CheckCircle2;
      case 'document_approval':
        return FileText;
      case 'performance_review':
        return FileText;
      case 'payroll_processing':
        return Calendar;
      default:
        return FileText;
    }
  };

  const getViewUrl = (workflow: any) => {
    switch (workflow.workflowType) {
      case 'onboarding':
        return `/hr/workflows/onboarding?id=${workflow.id}`;
      case 'offboarding':
        return `/hr/workflows/offboarding?id=${workflow.id}`;
      default:
        return null;
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
                  <p className="text-2xl font-bold">{activeWorkflows}</p>
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
                  <p className="text-2xl font-bold">{totalRuns}</p>
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
                  <p className="text-2xl font-bold">{avgProgress.toFixed(0)}%</p>
                  <p className="text-sm text-default-500">Avg Progress</p>
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
            <Tab key="in_progress" title="In Progress" />
            <Tab key="completed" title="Completed" />
            <Tab key="pending" title="Pending" />
          </Tabs>
        </CardHeader>
        <CardBody className="gap-3">
          {filteredWorkflows.length === 0 ? (
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
          ) : (
            filteredWorkflows.map((workflow, index) => {
              const TypeIcon = getTypeIcon(workflow.workflowType);
              const viewUrl = getViewUrl(workflow);

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
                                <h3 className="font-semibold text-lg">{workflow.workflowName}</h3>
                                <Chip
                                  color={getStatusColor(workflow.status)}
                                  variant="flat"
                                  size="sm"
                                  startContent={getStatusIcon(workflow.status)}
                                >
                                  {workflow.status.replace('_', ' ')}
                                </Chip>
                              </div>
                              <p className="text-sm text-default-600 capitalize">
                                {workflow.workflowType.replace('_', ' ')} workflow
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-default-500">Progress</p>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">
                                  {workflow.progressPercentage.toFixed(0)}%
                                </p>
                                <div className="flex-1 bg-default-200 rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${workflow.progressPercentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-default-500">Steps</p>
                              <p className="text-sm font-medium">
                                {workflow.completedSteps}/{workflow.totalSteps}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-default-500">Started</p>
                              <p className="text-sm font-medium">
                                {formatDistanceToNow(new Date(workflow.startedAt), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-default-500">Entity</p>
                              <p className="text-sm font-medium capitalize">
                                {workflow.entityType}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-default-200">
                            <div className="flex items-center gap-2">
                              {workflow.autoApproved && (
                                <Chip size="sm" variant="flat" color="secondary">
                                  AI Auto-approved
                                </Chip>
                              )}
                              {workflow.aiConfidenceScore && (
                                <Chip size="sm" variant="flat">
                                  Confidence: {(workflow.aiConfidenceScore * 100).toFixed(0)}%
                                </Chip>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {viewUrl && (
                                <Button
                                  as={Link}
                                  href={viewUrl}
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
                              {workflow.status === 'in_progress' ? (
                                <Button isIconOnly size="sm" variant="light" color="warning">
                                  <Pause className="h-4 w-4" />
                                </Button>
                              ) : workflow.status === 'pending' ? (
                                <Button isIconOnly size="sm" variant="light" color="success">
                                  <Play className="h-4 w-4" />
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })
          )}
        </CardBody>
      </Card>
    </div>
  );
}
