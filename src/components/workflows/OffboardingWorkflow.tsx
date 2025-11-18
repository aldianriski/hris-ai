'use client';

import { Card, CardHeader, CardBody, Button, Progress, Chip, Accordion, AccordionItem, Checkbox, Avatar, Textarea } from '@heroui/react';
import {
  CheckCircle,
  Circle,
  Clock,
  Mail,
  FileText,
  Key,
  Laptop,
  Users,
  Award,
  Calendar,
  AlertTriangle,
  Download,
  UserX,
  Archive,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface OffboardingTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  assignee: 'employee' | 'hr' | 'manager' | 'it';
  priority: 'high' | 'medium' | 'low';
  blockedBy?: string[];
}

interface OffboardingPhase {
  id: string;
  name: string;
  period: string;
  icon: React.ElementType;
  tasks: OffboardingTask[];
}

export function OffboardingWorkflow() {
  // Mock data - replace with actual API integration
  const [employee] = useState({
    name: 'Sarah Johnson',
    position: 'Marketing Manager',
    department: 'Marketing',
    resignationDate: '2025-11-05',
    lastWorkingDay: '2025-12-05',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    reason: 'Career advancement opportunity',
    noticePeriodDays: 30,
    daysRemaining: 17,
  });

  const [exitInterview, setExitInterview] = useState({
    scheduled: false,
    date: '',
    notes: '',
  });

  const [phases, setPhases] = useState<OffboardingPhase[]>([
    {
      id: 'resignation',
      name: 'Resignation Handling',
      period: 'Day 1-3',
      icon: FileText,
      tasks: [
        {
          id: 'resignation-letter',
          title: 'Submit Resignation Letter',
          description: 'Employee submits formal resignation letter',
          dueDate: '2025-11-05',
          completed: true,
          assignee: 'employee',
          priority: 'high',
        },
        {
          id: 'manager-acknowledgment',
          title: 'Manager Acknowledgment',
          description: 'Manager reviews and acknowledges resignation',
          dueDate: '2025-11-06',
          completed: true,
          assignee: 'manager',
          priority: 'high',
        },
        {
          id: 'hr-processing',
          title: 'HR Processing',
          description: 'HR processes resignation and calculates final settlements',
          dueDate: '2025-11-07',
          completed: true,
          assignee: 'hr',
          priority: 'high',
        },
        {
          id: 'announce-departure',
          title: 'Announce Departure',
          description: 'Communicate departure to team and relevant stakeholders',
          dueDate: '2025-11-08',
          completed: true,
          assignee: 'manager',
          priority: 'medium',
        },
        {
          id: 'exit-interview-schedule',
          title: 'Schedule Exit Interview',
          description: 'Book exit interview with HR for feedback collection',
          dueDate: '2025-11-10',
          completed: false,
          assignee: 'hr',
          priority: 'high',
        },
      ],
    },
    {
      id: 'notice-period',
      name: 'Notice Period',
      period: 'Day 4-27',
      icon: Clock,
      tasks: [
        {
          id: 'knowledge-transfer',
          title: 'Knowledge Transfer Sessions',
          description: 'Document processes and train team members on ongoing projects',
          dueDate: '2025-11-28',
          completed: false,
          assignee: 'employee',
          priority: 'high',
        },
        {
          id: 'project-handover',
          title: 'Project Handover',
          description: 'Transfer all active projects and responsibilities',
          dueDate: '2025-11-25',
          completed: false,
          assignee: 'employee',
          priority: 'high',
        },
        {
          id: 'documentation',
          title: 'Complete Documentation',
          description: 'Create documentation for processes, passwords, and contacts',
          dueDate: '2025-11-30',
          completed: false,
          assignee: 'employee',
          priority: 'high',
        },
        {
          id: 'replacement-planning',
          title: 'Replacement Planning',
          description: 'HR and manager plan for position backfill or redistribution',
          dueDate: '2025-11-20',
          completed: false,
          assignee: 'hr',
          priority: 'medium',
        },
        {
          id: 'access-review',
          title: 'Access Review',
          description: 'IT reviews all system access for revocation planning',
          dueDate: '2025-11-22',
          completed: false,
          assignee: 'it',
          priority: 'medium',
        },
      ],
    },
    {
      id: 'final-day',
      name: 'Final Day',
      period: 'Last Working Day',
      icon: UserX,
      tasks: [
        {
          id: 'equipment-return',
          title: 'Return Company Equipment',
          description: 'Return laptop, phone, access cards, and all company assets',
          dueDate: '2025-12-05',
          completed: false,
          assignee: 'employee',
          priority: 'high',
          blockedBy: [],
        },
        {
          id: 'access-revocation',
          title: 'Revoke System Access',
          description: 'Disable all accounts: email, Slack, VPN, internal systems',
          dueDate: '2025-12-05',
          completed: false,
          assignee: 'it',
          priority: 'high',
        },
        {
          id: 'final-payroll',
          title: 'Process Final Payroll',
          description: 'Calculate and process final salary, unused leave, and severance',
          dueDate: '2025-12-05',
          completed: false,
          assignee: 'hr',
          priority: 'high',
        },
        {
          id: 'exit-clearance',
          title: 'Exit Clearance Form',
          description: 'Complete clearance checklist signed by all departments',
          dueDate: '2025-12-05',
          completed: false,
          assignee: 'hr',
          priority: 'high',
        },
        {
          id: 'team-farewell',
          title: 'Team Farewell',
          description: 'Organize farewell gathering with team members',
          dueDate: '2025-12-05',
          completed: false,
          assignee: 'manager',
          priority: 'low',
        },
      ],
    },
    {
      id: 'post-exit',
      name: 'Post-Exit',
      period: 'After Last Day',
      icon: Archive,
      tasks: [
        {
          id: 'exit-interview',
          title: 'Conduct Exit Interview',
          description: 'Gather feedback on experience, culture, and improvement areas',
          dueDate: '2025-12-06',
          completed: false,
          assignee: 'hr',
          priority: 'high',
        },
        {
          id: 'reference-letter',
          title: 'Issue Reference Letter',
          description: 'Provide employment reference letter if requested',
          dueDate: '2025-12-10',
          completed: false,
          assignee: 'hr',
          priority: 'medium',
        },
        {
          id: 'alumni-network',
          title: 'Alumni Network Invitation',
          description: 'Invite to company alumni network and LinkedIn group',
          dueDate: '2025-12-07',
          completed: false,
          assignee: 'hr',
          priority: 'low',
        },
        {
          id: 'data-archival',
          title: 'Archive Employee Data',
          description: 'Securely archive all employee records per retention policy',
          dueDate: '2025-12-15',
          completed: false,
          assignee: 'it',
          priority: 'medium',
        },
        {
          id: 'lessons-learned',
          title: 'Document Lessons Learned',
          description: 'Review offboarding process and document improvements',
          dueDate: '2025-12-20',
          completed: false,
          assignee: 'hr',
          priority: 'low',
        },
      ],
    },
  ]);

  const totalTasks = phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
  const completedTasks = phases.reduce(
    (sum, phase) => sum + phase.tasks.filter((t) => t.completed).length,
    0
  );
  const completionPercentage = (completedTasks / totalTasks) * 100;

  const toggleTaskCompletion = (phaseId: string, taskId: string) => {
    setPhases((prevPhases) =>
      prevPhases.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              tasks: phase.tasks.map((task) =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
              ),
            }
          : phase
      )
    );
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

  return (
    <div className="space-y-6">
      {/* Employee Overview Card */}
      <Card className="border-l-4 border-l-warning">
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar src={employee.avatar} size="lg" name={employee.name} />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{employee.name}</h3>
                  <Chip color="warning" variant="flat" size="sm">
                    Offboarding
                  </Chip>
                </div>
                <p className="text-default-600">
                  {employee.position} • {employee.department}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-default-400" />
                    <span className="text-sm text-default-500">
                      Last Day: {new Date(employee.lastWorkingDay).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <Chip size="sm" color="warning" variant="flat">
                    {employee.daysRemaining} days remaining
                  </Chip>
                </div>
                <p className="text-sm text-default-500 mt-1">
                  Reason: {employee.reason}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-default-500 mb-2">Offboarding Progress</p>
              <div className="flex items-center gap-3">
                <Progress
                  value={completionPercentage}
                  color={completionPercentage === 100 ? 'success' : 'warning'}
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
                <div className="p-2 bg-warning-50 dark:bg-warning-100/10 rounded-lg">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Notice Period</p>
                  <p className="text-lg font-semibold">{employee.noticePeriodDays} Days</p>
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
                <div className="p-2 bg-danger-50 dark:bg-danger-100/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-danger" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Critical Tasks</p>
                  <p className="text-lg font-semibold">
                    {phases.reduce(
                      (sum, phase) =>
                        sum + phase.tasks.filter((t) => t.priority === 'high' && !t.completed).length,
                      0
                    )}
                  </p>
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
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Stakeholders</p>
                  <p className="text-lg font-semibold">4 Teams</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Critical Alerts */}
      <Card className="bg-danger-50 dark:bg-danger-100/10 border-l-4 border-l-danger">
        <CardBody>
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-danger mt-0.5" />
            <div>
              <p className="font-semibold text-danger">Critical: {employee.daysRemaining} days until final day</p>
              <p className="text-sm text-default-600 mt-1">
                Ensure all equipment returns, access revocations, and knowledge transfers are completed before{' '}
                {new Date(employee.lastWorkingDay).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Offboarding Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold">Offboarding Timeline</h3>
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
          <Accordion variant="splitted" selectionMode="multiple" defaultExpandedKeys={['resignation', 'notice-period']}>
            {phases.map((phase, phaseIndex) => {
              const Icon = phase.icon;
              const phaseCompletedTasks = phase.tasks.filter((t) => t.completed).length;
              const phaseProgress = (phaseCompletedTasks / phase.tasks.length) * 100;

              return (
                <AccordionItem
                  key={phase.id}
                  aria-label={phase.name}
                  title={
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-warning-50 dark:bg-warning-100/10 rounded-lg">
                          <Icon className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                          <p className="font-semibold">{phase.name}</p>
                          <p className="text-sm text-default-500">{phase.period}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress
                          value={phaseProgress}
                          color={phaseProgress === 100 ? 'success' : 'warning'}
                          className="w-32"
                          size="sm"
                        />
                        <span className="text-sm text-default-600">
                          {phaseCompletedTasks}/{phase.tasks.length}
                        </span>
                      </div>
                    </div>
                  }
                >
                  <div className="space-y-3 px-4 pb-4">
                    {phase.tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: phaseIndex * 0.1 }}
                      >
                        <Card className={task.completed ? 'bg-default-50' : ''}>
                          <CardBody>
                            <div className="flex items-start gap-3">
                              <Checkbox
                                isSelected={task.completed}
                                onValueChange={() => toggleTaskCompletion(phase.id, task.id)}
                                color="success"
                                size="lg"
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4
                                      className={`font-semibold ${
                                        task.completed ? 'line-through text-default-400' : ''
                                      }`}
                                    >
                                      {task.title}
                                    </h4>
                                    <p className="text-sm text-default-600 mt-1">
                                      {task.description}
                                    </p>
                                  </div>
                                  {task.completed && (
                                    <Chip color="success" variant="flat" size="sm">
                                      Completed
                                    </Chip>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                  <Chip
                                    color={getAssigneeColor(task.assignee)}
                                    variant="flat"
                                    size="sm"
                                    startContent={<Users className="h-3 w-3" />}
                                  >
                                    {task.assignee.toUpperCase()}
                                  </Chip>
                                  <Chip
                                    color={getPriorityColor(task.priority)}
                                    variant="flat"
                                    size="sm"
                                  >
                                    {task.priority.toUpperCase()}
                                  </Chip>
                                  <Chip variant="flat" size="sm" startContent={<Clock className="h-3 w-3" />}>
                                    {new Date(task.dueDate).toLocaleDateString('id-ID')}
                                  </Chip>
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

      {/* Exit Interview Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Exit Interview</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-100/10 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-semibold">Exit Interview {exitInterview.scheduled ? 'Scheduled' : 'Pending'}</p>
              <p className="text-sm text-default-600">
                {exitInterview.scheduled
                  ? `Scheduled for ${exitInterview.date}`
                  : 'Schedule an exit interview to gather valuable feedback'}
              </p>
            </div>
            <Button color="primary" variant="flat" size="sm">
              {exitInterview.scheduled ? 'Reschedule' : 'Schedule Now'}
            </Button>
          </div>

          <Textarea
            label="Exit Interview Notes"
            placeholder="Document key feedback, suggestions, and insights from the exit interview..."
            value={exitInterview.notes}
            onValueChange={(value) => setExitInterview({ ...exitInterview, notes: value })}
            minRows={4}
          />
        </CardBody>
      </Card>

      {/* Automated Notifications */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Automated Notifications</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-warning-50 dark:bg-warning-100/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <p className="font-semibold">Knowledge transfer reminder sent</p>
                <p className="text-sm text-default-600">
                  Sarah has been reminded to complete documentation for ongoing projects
                </p>
                <p className="text-xs text-default-500 mt-1">Today at 9:00 AM</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-success-50 dark:bg-success-100/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-semibold">Manager completed project handover review</p>
                <p className="text-sm text-default-600">
                  All active projects have been reassigned successfully
                </p>
                <p className="text-xs text-default-500 mt-1">Yesterday at 4:30 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-primary-50 dark:bg-primary-100/10 rounded-lg">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold">IT team notified for access revocation</p>
                <p className="text-sm text-default-600">
                  Scheduled to revoke all system access on final working day
                </p>
                <p className="text-xs text-default-500 mt-1">Nov 20, 2025 at 10:15 AM</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
