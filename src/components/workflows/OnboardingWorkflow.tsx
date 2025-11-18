'use client';

import { Card, CardHeader, CardBody, Button, Progress, Chip, Accordion, AccordionItem, Checkbox, Avatar } from '@heroui/react';
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
import { useState } from 'react';
import { motion } from 'framer-motion';

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  assignee: 'employee' | 'hr' | 'manager' | 'it';
  priority: 'high' | 'medium' | 'low';
}

interface OnboardingPhase {
  id: string;
  name: string;
  period: string;
  icon: React.ElementType;
  tasks: OnboardingTask[];
}

export function OnboardingWorkflow() {
  // Mock data - replace with actual API integration
  const [employee] = useState({
    name: 'Alex Thompson',
    position: 'Senior Software Engineer',
    department: 'Engineering',
    startDate: '2025-11-25',
    avatar: 'https://i.pravatar.cc/150?u=alex',
    daysUntilStart: 7,
  });

  const [phases, setPhases] = useState<OnboardingPhase[]>([
    {
      id: 'preboarding',
      name: 'Pre-boarding',
      period: 'Day -7 to Day 0',
      icon: Mail,
      tasks: [
        {
          id: 'welcome-email',
          title: 'Send Welcome Email',
          description: 'Automated welcome email with company overview and what to expect',
          dueDate: '2025-11-18',
          completed: true,
          assignee: 'hr',
          priority: 'high',
        },
        {
          id: 'create-credentials',
          title: 'Create System Credentials',
          description: 'Generate email, Slack, and system access credentials',
          dueDate: '2025-11-20',
          completed: true,
          assignee: 'it',
          priority: 'high',
        },
        {
          id: 'document-checklist',
          title: 'Complete Document Checklist',
          description: 'Upload KTP, NPWP, BPJS, bank account, and tax forms',
          dueDate: '2025-11-22',
          completed: false,
          assignee: 'employee',
          priority: 'high',
        },
        {
          id: 'workspace-setup',
          title: 'Prepare Workspace',
          description: 'Set up desk, chair, monitor, and office supplies',
          dueDate: '2025-11-24',
          completed: false,
          assignee: 'hr',
          priority: 'medium',
        },
        {
          id: 'equipment-order',
          title: 'Order Equipment',
          description: 'Laptop (MacBook Pro), mouse, keyboard, headphones',
          dueDate: '2025-11-23',
          completed: false,
          assignee: 'it',
          priority: 'high',
        },
      ],
    },
    {
      id: 'day1',
      name: 'Day 1 - First Day',
      period: 'Day 1',
      icon: Briefcase,
      tasks: [
        {
          id: 'office-tour',
          title: 'Office Tour',
          description: 'Introduction to office layout, facilities, and emergency exits',
          dueDate: '2025-11-25',
          completed: false,
          assignee: 'hr',
          priority: 'high',
        },
        {
          id: 'team-introduction',
          title: 'Team Introduction',
          description: 'Meet the team, manager, and key stakeholders',
          dueDate: '2025-11-25',
          completed: false,
          assignee: 'manager',
          priority: 'high',
        },
        {
          id: 'equipment-handover',
          title: 'Equipment Handover',
          description: 'Receive laptop, access cards, and company assets',
          dueDate: '2025-11-25',
          completed: false,
          assignee: 'it',
          priority: 'high',
        },
        {
          id: 'access-provisioning',
          title: 'System Access Provisioning',
          description: 'Email, Slack, GitHub, Jira, and internal tools setup',
          dueDate: '2025-11-25',
          completed: false,
          assignee: 'it',
          priority: 'high',
        },
        {
          id: 'welcome-lunch',
          title: 'Welcome Lunch',
          description: 'Team lunch to get to know colleagues',
          dueDate: '2025-11-25',
          completed: false,
          assignee: 'manager',
          priority: 'medium',
        },
      ],
    },
    {
      id: 'week1',
      name: 'First Week',
      period: 'Day 2-7',
      icon: GraduationCap,
      tasks: [
        {
          id: 'complete-profile',
          title: 'Complete Employee Profile',
          description: 'Fill in personal information, emergency contacts, and preferences',
          dueDate: '2025-11-27',
          completed: false,
          assignee: 'employee',
          priority: 'high',
        },
        {
          id: 'bpjs-registration',
          title: 'BPJS Registration',
          description: 'Enroll in BPJS Kesehatan and Ketenagakerjaan',
          dueDate: '2025-11-28',
          completed: false,
          assignee: 'hr',
          priority: 'high',
        },
        {
          id: 'orientation-training',
          title: 'Company Orientation',
          description: 'Attend orientation session covering culture, values, and policies',
          dueDate: '2025-11-26',
          completed: false,
          assignee: 'hr',
          priority: 'high',
        },
        {
          id: 'security-training',
          title: 'Security & Compliance Training',
          description: 'Complete information security and data privacy courses',
          dueDate: '2025-11-29',
          completed: false,
          assignee: 'employee',
          priority: 'high',
        },
        {
          id: 'orientation-quiz',
          title: 'Orientation Quiz',
          description: 'Complete quiz to verify understanding of company policies',
          dueDate: '2025-11-29',
          completed: false,
          assignee: 'employee',
          priority: 'medium',
        },
        {
          id: 'buddy-assignment',
          title: 'Onboarding Buddy Pairing',
          description: 'Get paired with an experienced team member as a buddy',
          dueDate: '2025-11-26',
          completed: false,
          assignee: 'manager',
          priority: 'medium',
        },
      ],
    },
    {
      id: 'month1',
      name: 'First Month',
      period: 'Week 2-4',
      icon: Target,
      tasks: [
        {
          id: 'week2-checkin',
          title: 'Week 2 Check-in',
          description: '1-on-1 with manager to discuss progress and challenges',
          dueDate: '2025-12-02',
          completed: false,
          assignee: 'manager',
          priority: 'high',
        },
        {
          id: 'goal-setting',
          title: '30-60-90 Day Goal Setting',
          description: 'Establish goals and expectations for first 90 days',
          dueDate: '2025-12-05',
          completed: false,
          assignee: 'manager',
          priority: 'high',
        },
        {
          id: 'technical-training',
          title: 'Role-Specific Training',
          description: 'Complete training modules for technical tools and processes',
          dueDate: '2025-12-15',
          completed: false,
          assignee: 'employee',
          priority: 'medium',
        },
        {
          id: 'first-project',
          title: 'First Project Assignment',
          description: 'Receive and start working on first meaningful project',
          dueDate: '2025-12-10',
          completed: false,
          assignee: 'manager',
          priority: 'high',
        },
        {
          id: 'month1-feedback',
          title: '30-Day Feedback Session',
          description: 'Structured feedback session with manager and HR',
          dueDate: '2025-12-25',
          completed: false,
          assignee: 'manager',
          priority: 'high',
        },
        {
          id: 'benefits-enrollment',
          title: 'Benefits Enrollment',
          description: 'Complete enrollment for health insurance and other benefits',
          dueDate: '2025-12-20',
          completed: false,
          assignee: 'hr',
          priority: 'medium',
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
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar src={employee.avatar} size="lg" name={employee.name} />
              <div>
                <h3 className="text-xl font-semibold">{employee.name}</h3>
                <p className="text-default-600">
                  {employee.position} • {employee.department}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-default-400" />
                  <span className="text-sm text-default-500">
                    Start Date: {new Date(employee.startDate).toLocaleDateString('id-ID')}
                  </span>
                  <Chip size="sm" color="primary" variant="flat">
                    {employee.daysUntilStart} days until start
                  </Chip>
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
                  <p className="text-sm text-default-500">Current Phase</p>
                  <p className="text-lg font-semibold">Pre-boarding</p>
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

      {/* Manager Notifications */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Automated Notifications</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-primary-50 dark:bg-primary-100/10 rounded-lg">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold">Manager notification sent</p>
                <p className="text-sm text-default-600">
                  John Doe (Manager) has been notified about Alex's upcoming start date
                </p>
                <p className="text-xs text-default-500 mt-1">Today at 9:00 AM</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-success-50 dark:bg-success-100/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-semibold">IT team completed equipment setup</p>
                <p className="text-sm text-default-600">
                  Laptop and credentials are ready for Day 1
                </p>
                <p className="text-xs text-default-500 mt-1">Yesterday at 3:45 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-warning-50 dark:bg-warning-100/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <p className="font-semibold">Reminder: Document checklist pending</p>
                <p className="text-sm text-default-600">
                  Alex Thompson needs to upload remaining documents by Nov 22
                </p>
                <p className="text-xs text-default-500 mt-1">Tomorrow at 10:00 AM</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
