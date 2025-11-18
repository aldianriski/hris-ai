'use client';

import { Card, CardBody, CardHeader, Chip, Button, Progress, Accordion, AccordionItem, Checkbox, Avatar, Spinner } from '@heroui/react';
import {
  CheckCircle,
  Circle,
  Clock,
  Mail,
  FileText,
  Key,
  Briefcase,
  Users,
  GraduationCap,
  Target,
  Calendar,
  AlertCircle,
  Download,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { useWorkflow, useUpdateWorkflowStep } from '@/lib/hooks/useWorkflows';
import { useEmployee } from '@/lib/hooks/useEmployees';

interface OnboardingWorkflowIntegratedProps {
  workflowId: string;
  employeeId: string;
}

export function OnboardingWorkflowIntegrated({ workflowId, employeeId }: OnboardingWorkflowIntegratedProps) {
  const { employerId } = useAuth();
  const { data: workflow, isLoading: workflowLoading } = useWorkflow(workflowId);
  const { data: employee, isLoading: employeeLoading } = useEmployee(employeeId);
  const updateStep = useUpdateWorkflowStep();

  if (workflowLoading || employeeLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" label="Loading onboarding workflow..." />
      </div>
    );
  }

  if (!workflow || !employee) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
        <p className="text-gray-500">Workflow not found</p>
      </div>
    );
  }

  const totalTasks = workflow.totalSteps;
  const completedTasks = workflow.completedSteps;
  const completionPercentage = workflow.progressPercentage;

  const handleTaskToggle = async (stepNumber: number, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await updateStep.mutateAsync({
      workflowId: workflow.id,
      stepNumber,
      status: newStatus as 'completed' | 'failed',
    });
  };

  const getAssigneeColor = (assignee: string) => {
    const colors: Record<string, 'primary' | 'success' | 'warning' | 'secondary'> = {
      employee: 'primary',
      hr: 'success',
      manager: 'warning',
      it: 'secondary',
    };
    return colors[assignee] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, 'danger' | 'warning' | 'default'> = {
      high: 'danger',
      medium: 'warning',
      low: 'default',
    };
    return colors[priority] || 'default';
  };

  // Group steps by phase (based on step number ranges)
  const phases = [
    {
      id: 'preboarding',
      name: 'Pre-boarding',
      period: 'Day -7 to Day 0',
      icon: Mail,
      steps: workflow.stepsConfig.filter(s => s.step >= 1 && s.step <= 5),
    },
    {
      id: 'day1',
      name: 'Day 1 - First Day',
      period: 'Day 1',
      icon: Briefcase,
      steps: workflow.stepsConfig.filter(s => s.step >= 6 && s.step <= 10),
    },
    {
      id: 'week1',
      name: 'First Week',
      period: 'Day 2-7',
      icon: GraduationCap,
      steps: workflow.stepsConfig.filter(s => s.step >= 11 && s.step <= 16),
    },
    {
      id: 'month1',
      name: 'First Month',
      period: 'Week 2-4',
      icon: Target,
      steps: workflow.stepsConfig.filter(s => s.step >= 17),
    },
  ];

  // Calculate days until start
  const daysUntilStart = employee.joinDate
    ? Math.ceil((new Date(employee.joinDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-6">
      {/* Employee Overview Card */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                src={`https://i.pravatar.cc/150?u=${employee.email}`}
                size="lg"
                name={employee.fullName}
              />
              <div>
                <h3 className="text-xl font-semibold">{employee.fullName}</h3>
                <p className="text-default-600">
                  {employee.position} • {employee.department}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-default-400" />
                  <span className="text-sm text-default-500">
                    Start Date: {new Date(employee.joinDate).toLocaleDateString('id-ID')}
                  </span>
                  {daysUntilStart > 0 && (
                    <Chip size="sm" color="primary" variant="flat">
                      {daysUntilStart} days until start
                    </Chip>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-default-500 mb-2">Onboarding Progress</p>
              <div className="flex items-center gap-3">
                <Progress
                  value={completionPercentage}
                  color={completionPercentage === 100 ? 'success' : 'primary'}
                  className="w-48"
                  size="md"
                />
                <span className="text-2xl font-bold">{completionPercentage.toFixed(0)}%</span>
              </div>
              <p className="text-sm text-default-500 mt-1">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 dark:bg-primary-100/10 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Status</p>
                  <p className="text-lg font-semibold capitalize">{workflow.status.replace('_', ' ')}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success-50 dark:bg-success-100/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Completed</p>
                  <p className="text-lg font-semibold">{completedTasks} Tasks</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning-50 dark:bg-warning-100/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Pending</p>
                  <p className="text-lg font-semibold">{totalTasks - completedTasks} Tasks</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-100/10 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Current Step</p>
                  <p className="text-lg font-semibold">{workflow.currentStep} of {workflow.totalSteps}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Onboarding Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold">Onboarding Timeline</h3>
            <Button
              variant="flat"
              startContent={<Download className="h-4 w-4" />}
              size="sm"
            >
              Export Checklist
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <Accordion variant="splitted" selectionMode="multiple" defaultExpandedKeys={['preboarding']}>
            {phases.map((phase, phaseIndex) => {
              if (phase.steps.length === 0) return null;

              const Icon = phase.icon;
              const phaseCompletedTasks = phase.steps.filter((s) => s.status === 'completed').length;
              const phaseProgress = (phaseCompletedTasks / phase.steps.length) * 100;

              return (
                <AccordionItem
                  key={phase.id}
                  aria-label={phase.name}
                  title={
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-50 dark:bg-primary-100/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{phase.name}</p>
                          <p className="text-sm text-default-500">{phase.period}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress
                          value={phaseProgress}
                          color={phaseProgress === 100 ? 'success' : 'primary'}
                          className="w-32"
                          size="sm"
                        />
                        <span className="text-sm text-default-600">
                          {phaseCompletedTasks}/{phase.steps.length}
                        </span>
                      </div>
                    </div>
                  }
                >
                  <div className="space-y-3 px-4 pb-4">
                    {phase.steps.map((step) => (
                      <motion.div
                        key={step.step}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: phaseIndex * 0.1 }}
                      >
                        <Card className={step.status === 'completed' ? 'bg-default-50' : ''}>
                          <CardBody>
                            <div className="flex items-start gap-3">
                              <Checkbox
                                isSelected={step.status === 'completed'}
                                onValueChange={() => handleTaskToggle(step.step, step.status)}
                                color="success"
                                size="lg"
                                isDisabled={updateStep.isPending}
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4
                                      className={`font-semibold ${
                                        step.status === 'completed' ? 'line-through text-default-400' : ''
                                      }`}
                                    >
                                      {step.name}
                                    </h4>
                                    <p className="text-sm text-default-600 mt-1">
                                      {step.type.replace('_', ' ')}
                                    </p>
                                  </div>
                                  {step.status === 'completed' && (
                                    <Chip color="success" variant="flat" size="sm">
                                      Completed
                                    </Chip>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                  <Chip variant="flat" size="sm">
                                    Step {step.step}
                                  </Chip>
                                  {step.completedAt && (
                                    <Chip variant="flat" size="sm" startContent={<Clock className="h-3 w-3" />}>
                                      {new Date(step.completedAt).toLocaleDateString('id-ID')}
                                    </Chip>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardBody>
      </Card>

      {/* Workflow Info */}
      {workflow.metadata && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Workflow Information</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-default-500">Started</p>
                <p className="font-medium">{new Date(workflow.startedAt).toLocaleDateString('id-ID')}</p>
              </div>
              {workflow.dueAt && (
                <div>
                  <p className="text-sm text-default-500">Due Date</p>
                  <p className="font-medium">{new Date(workflow.dueAt).toLocaleDateString('id-ID')}</p>
                </div>
              )}
              {workflow.completedAt && (
                <div>
                  <p className="text-sm text-default-500">Completed</p>
                  <p className="font-medium">{new Date(workflow.completedAt).toLocaleDateString('id-ID')}</p>
                </div>
              )}
              {workflow.autoApproved && (
                <div>
                  <p className="text-sm text-default-500">AI Confidence</p>
                  <p className="font-medium">{(workflow.aiConfidenceScore! * 100).toFixed(0)}%</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
