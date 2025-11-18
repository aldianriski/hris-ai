'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Avatar,
  Spinner,
  Tabs,
  Tab,
  Badge,
  Select,
  SelectItem,
} from '@heroui/react';
import {
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ChatSessionDetail } from '@/components/platform/ChatSessionDetail';
import { AgentAvailabilityToggle } from '@/components/platform/AgentAvailabilityToggle';

interface ChatSession {
  id: string;
  status: string;
  subject: string;
  category: string;
  priority: string;
  started_at: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  agent?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  tenant: {
    id: string;
    company_name: string;
    subscription_plan: string;
  };
  first_response_at?: string;
  response_time_seconds?: number;
}

interface ChatStats {
  total: number;
  open: number;
  active: number;
  avgResponseTime: number;
}

export default function ChatDashboardPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [stats, setStats] = useState<ChatStats>({
    total: 0,
    open: 0,
    active: 0,
    avgResponseTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'active' | 'waiting'>('open');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [filter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await fetch(`/api/platform/chat/sessions?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch chat sessions');
      }

      const data = await response.json();
      setSessions(data.sessions || []);

      // Calculate stats
      const allSessions = data.sessions || [];
      const stats = {
        total: allSessions.length,
        open: allSessions.filter((s: ChatSession) => s.status === 'open').length,
        active: allSessions.filter((s: ChatSession) => s.status === 'active').length,
        avgResponseTime:
          allSessions.reduce((sum: number, s: ChatSession) => sum + (s.response_time_seconds || 0), 0) /
            allSessions.filter((s: ChatSession) => s.response_time_seconds).length || 0,
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      toast.error('Failed to load chat sessions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'danger';
      case 'active':
        return 'primary';
      case 'waiting':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'danger';
      case 'high':
        return 'warning';
      case 'normal':
        return 'primary';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatResponseTime = (seconds: number) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Live Chat Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time support chat with customers
          </p>
        </div>
        <AgentAvailabilityToggle onUpdate={fetchSessions} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Chats</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 dark:text-red-300">Open</p>
                <p className="text-3xl font-bold text-red-900 dark:text-red-100 mt-2">
                  {stats.open}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Active</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                  {stats.active}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Avg Response Time
                </p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
                  {formatResponseTime(stats.avgResponseTime)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={filter === 'all' ? 'solid' : 'flat'}
          color={filter === 'all' ? 'primary' : 'default'}
          onPress={() => setFilter('all')}
        >
          All Chats
        </Button>
        <Button
          size="sm"
          variant={filter === 'open' ? 'solid' : 'flat'}
          color={filter === 'open' ? 'danger' : 'default'}
          onPress={() => setFilter('open')}
        >
          Open
        </Button>
        <Button
          size="sm"
          variant={filter === 'active' ? 'solid' : 'flat'}
          color={filter === 'active' ? 'primary' : 'default'}
          onPress={() => setFilter('active')}
        >
          Active
        </Button>
        <Button
          size="sm"
          variant={filter === 'waiting' ? 'solid' : 'flat'}
          color={filter === 'waiting' ? 'warning' : 'default'}
          onPress={() => setFilter('waiting')}
        >
          Waiting
        </Button>
      </div>

      {/* Chat Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions List */}
        <Card>
          <CardBody className="p-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sessions.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No chat sessions found
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedSession === session.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => setSelectedSession(session.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={session.user.avatar_url}
                        name={session.user.full_name}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {session.user.full_name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {session.tenant.company_name}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Chip
                              size="sm"
                              color={getStatusColor(session.status) as any}
                              variant="flat"
                            >
                              {session.status}
                            </Chip>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDistanceToNow(new Date(session.started_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-1">
                          {session.subject}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Chip size="sm" variant="flat">
                            {session.category}
                          </Chip>
                          {session.priority !== 'normal' && (
                            <Chip
                              size="sm"
                              color={getPriorityColor(session.priority) as any}
                              variant="flat"
                            >
                              {session.priority}
                            </Chip>
                          )}
                          {session.agent && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Users className="w-3 h-3" />
                              {session.agent.full_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>

        {/* Chat Detail */}
        {selectedSession && (
          <ChatSessionDetail
            sessionId={selectedSession}
            onClose={() => setSelectedSession(null)}
            onUpdate={fetchSessions}
          />
        )}
      </div>
    </div>
  );
}
