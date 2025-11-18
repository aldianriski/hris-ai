'use client';

import { Card, CardHeader, CardBody, Avatar, Chip, Button, Progress } from '@heroui/react';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  Calendar,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  Cake,
  Gift,
  Smile,
  Meh,
  Frown,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function ManagerDashboardEnhanced() {
  // Mock data - replace with actual API
  const teamStats = {
    totalMembers: 12,
    present: 10,
    absent: 1,
    onLeave: 1,
    avgPerformance: 4.2,
    pendingApprovals: 5,
  };

  const todayAttendance = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      status: 'present',
      clockIn: '08:45',
      location: 'Office',
    },
    {
      id: '2',
      name: 'Alex Thompson',
      avatar: 'https://i.pravatar.cc/150?u=alex',
      status: 'present',
      clockIn: '09:00',
      location: 'Remote',
    },
    {
      id: '3',
      name: 'Maria Garcia',
      avatar: 'https://i.pravatar.cc/150?u=maria',
      status: 'absent',
      clockIn: '-',
      location: '-',
    },
    {
      id: '4',
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/150?u=john',
      status: 'leave',
      clockIn: '-',
      location: 'Annual Leave',
    },
  ];

  const pendingApprovals = [
    {
      id: '1',
      type: 'leave',
      employee: 'Emma Wilson',
      avatar: 'https://i.pravatar.cc/150?u=emma',
      description: 'Annual Leave - 3 days (Dec 20-22)',
      submittedAt: '2 hours ago',
    },
    {
      id: '2',
      type: 'overtime',
      employee: 'Michael Brown',
      avatar: 'https://i.pravatar.cc/150?u=michael',
      description: 'Overtime Claim - 8 hours',
      submittedAt: '5 hours ago',
    },
    {
      id: '3',
      type: 'expense',
      employee: 'Sophie Chen',
      avatar: 'https://i.pravatar.cc/150?u=sophie',
      description: 'Expense Claim - Rp 2,500,000',
      submittedAt: '1 day ago',
    },
  ];

  const upcomingEvents = [
    {
      id: '1',
      type: 'birthday',
      name: 'David Kim',
      avatar: 'https://i.pravatar.cc/150?u=david',
      date: '2025-11-22',
      icon: Cake,
      color: 'text-pink-600',
    },
    {
      id: '2',
      type: 'anniversary',
      name: 'Lisa Wang',
      avatar: 'https://i.pravatar.cc/150?u=lisa',
      date: '2025-11-25',
      description: '3 years',
      icon: Gift,
      color: 'text-purple-600',
    },
    {
      id: '3',
      type: 'new_joiner',
      name: 'James Lee',
      avatar: 'https://i.pravatar.cc/150?u=james',
      date: '2025-11-20',
      description: 'Starting as Software Engineer',
      icon: Users,
      color: 'text-green-600',
    },
  ];

  const teamPerformance = [
    { name: 'Sarah Johnson', rating: 4.8, progress: 95 },
    { name: 'Alex Thompson', rating: 4.5, progress: 90 },
    { name: 'Maria Garcia', rating: 4.2, progress: 85 },
    { name: 'John Doe', rating: 4.0, progress: 80 },
  ];

  const teamMood = {
    positive: 7,
    neutral: 3,
    negative: 2,
    avgSentiment: 'positive',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'danger';
      case 'leave':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <UserCheck className="h-3 w-3" />;
      case 'absent':
        return <UserX className="h-3 w-3" />;
      case 'leave':
        return <Calendar className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 dark:bg-primary-100/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{teamStats.totalMembers}</p>
                  <p className="text-sm text-default-500">Team Members</p>
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
                  <UserCheck className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{teamStats.present}</p>
                  <p className="text-sm text-default-500">Present Today</p>
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
                  <p className="text-2xl font-bold">{teamStats.pendingApprovals}</p>
                  <p className="text-sm text-default-500">Pending Approvals</p>
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
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{teamStats.avgPerformance}</p>
                  <p className="text-sm text-default-500">Avg Performance</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Attendance Today */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <h3 className="font-semibold">Team Attendance (Today)</h3>
              <Button size="sm" variant="flat">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardBody className="gap-3">
            {todayAttendance.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar src={member.avatar} size="sm" name={member.name} />
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <div className="flex items-center gap-2 text-xs text-default-500">
                      <Clock className="h-3 w-3" />
                      {member.clockIn}
                      {member.location && <span>• {member.location}</span>}
                    </div>
                  </div>
                </div>
                <Chip
                  color={getStatusColor(member.status)}
                  variant="flat"
                  size="sm"
                  startContent={getStatusIcon(member.status)}
                >
                  {member.status}
                </Chip>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <h3 className="font-semibold">Pending Approvals</h3>
              <Chip color="warning" variant="flat" size="sm">
                {pendingApprovals.length}
              </Chip>
            </div>
          </CardHeader>
          <CardBody className="gap-3">
            {pendingApprovals.map((item) => (
              <div key={item.id} className="p-3 bg-default-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar src={item.avatar} size="sm" name={item.employee} />
                    <div>
                      <p className="font-medium text-sm">{item.employee}</p>
                      <p className="text-xs text-default-500">{item.submittedAt}</p>
                    </div>
                  </div>
                  <Chip size="sm" variant="flat" className="capitalize">
                    {item.type}
                  </Chip>
                </div>
                <p className="text-sm text-default-600 mb-2">{item.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" color="success" variant="flat">
                    Approve
                  </Button>
                  <Button size="sm" color="danger" variant="flat">
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Team Performance Summary */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Team Performance Summary</h3>
          </CardHeader>
          <CardBody className="gap-4">
            {teamPerformance.map((member, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{member.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{member.rating}</span>
                    <span className="text-xs text-default-500">/ 5.0</span>
                  </div>
                </div>
                <Progress value={member.progress} color="primary" size="sm" />
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Upcoming Birthdays & Anniversaries</h3>
          </CardHeader>
          <CardBody className="gap-3">
            {upcomingEvents.map((event) => {
              const Icon = event.icon;
              return (
                <div key={event.id} className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${event.type === 'birthday' ? 'bg-pink-50 dark:bg-pink-100/10' : event.type === 'anniversary' ? 'bg-purple-50 dark:bg-purple-100/10' : 'bg-green-50 dark:bg-green-100/10'}`}>
                      <Icon className={`h-4 w-4 ${event.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{event.name}</p>
                      {event.description && (
                        <p className="text-xs text-default-500">{event.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-default-500">
                    {new Date(event.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </CardBody>
        </Card>

        {/* Team Mood Tracker */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Team Mood Tracker</h3>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-around mb-4">
              <div className="flex flex-col items-center">
                <Smile className="h-12 w-12 text-success mb-2" />
                <p className="text-2xl font-bold">{teamMood.positive}</p>
                <p className="text-xs text-default-500">Positive</p>
              </div>
              <div className="flex flex-col items-center">
                <Meh className="h-12 w-12 text-warning mb-2" />
                <p className="text-2xl font-bold">{teamMood.neutral}</p>
                <p className="text-xs text-default-500">Neutral</p>
              </div>
              <div className="flex flex-col items-center">
                <Frown className="h-12 w-12 text-danger mb-2" />
                <p className="text-2xl font-bold">{teamMood.negative}</p>
                <p className="text-xs text-default-500">Needs Attention</p>
              </div>
            </div>
            <p className="text-sm text-center text-default-600">
              Overall team sentiment: <span className="font-semibold text-success capitalize">{teamMood.avgSentiment}</span>
            </p>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Quick Actions</h3>
          </CardHeader>
          <CardBody className="gap-2">
            <Button variant="bordered" startContent={<CheckCircle className="h-4 w-4" />}>
              Bulk Approve Leave Requests
            </Button>
            <Button variant="bordered" startContent={<Calendar className="h-4 w-4" />}>
              Schedule 1-on-1 Meetings
            </Button>
            <Button variant="bordered" startContent={<MessageSquare className="h-4 w-4" />}>
              Send Team Announcement
            </Button>
            <Button variant="bordered" startContent={<Users className="h-4 w-4" />}>
              Request Team Feedback
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
