'use client';

import { Card, CardHeader, CardBody, Button, Chip, Progress, RadioGroup, Radio, Slider } from '@heroui/react';
import {
  TrendingUp,
  TrendingDown,
  Smile,
  Meh,
  Frown,
  MessageSquare,
  Users,
  BarChart3,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Survey {
  id: string;
  title: string;
  type: 'pulse' | 'engagement' | 'onboarding' | 'exit' | 'manager_feedback';
  status: 'active' | 'completed' | 'pending';
  dueDate: string;
  completionRate: number;
  respondents: number;
  totalRecipients: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  trend?: 'up' | 'down' | 'stable';
}

interface PulseQuestion {
  id: string;
  question: string;
  type: 'mood' | 'rating' | 'multiple_choice' | 'text';
  options?: string[];
}

export function PulseCheckSurveys() {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [workloadRating, setWorkloadRating] = useState(5);

  // Mock data - replace with actual API
  const surveys: Survey[] = [
    {
      id: '1',
      title: 'Weekly Pulse Check',
      type: 'pulse',
      status: 'active',
      dueDate: '2025-11-22',
      completionRate: 68,
      respondents: 168,
      totalRecipients: 247,
      sentiment: 'positive',
      trend: 'up',
    },
    {
      id: '2',
      title: 'Q4 Engagement Survey',
      type: 'engagement',
      status: 'active',
      dueDate: '2025-12-31',
      completionRate: 42,
      respondents: 104,
      totalRecipients: 247,
      sentiment: 'neutral',
      trend: 'stable',
    },
    {
      id: '3',
      title: 'Manager Effectiveness (360°)',
      type: 'manager_feedback',
      status: 'completed',
      dueDate: '2025-11-15',
      completionRate: 100,
      respondents: 45,
      totalRecipients: 45,
      sentiment: 'positive',
      trend: 'up',
    },
    {
      id: '4',
      title: 'New Hire Onboarding Feedback',
      type: 'onboarding',
      status: 'active',
      dueDate: '2025-11-30',
      completionRate: 75,
      respondents: 6,
      totalRecipients: 8,
      sentiment: 'positive',
      trend: 'stable',
    },
  ];

  const pulseQuestions: PulseQuestion[] = [
    {
      id: '1',
      question: 'How are you feeling this week?',
      type: 'mood',
    },
    {
      id: '2',
      question: 'How would you rate your current workload?',
      type: 'rating',
    },
    {
      id: '3',
      question: 'Do you feel supported by your manager?',
      type: 'multiple_choice',
      options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
    },
  ];

  const getSentimentIcon = (sentiment?: string) => {
    if (sentiment === 'positive') return <Smile className="h-5 w-5 text-success" />;
    if (sentiment === 'negative') return <Frown className="h-5 w-5 text-danger" />;
    return <Meh className="h-5 w-5 text-warning" />;
  };

  const getSentimentColor = (sentiment?: string) => {
    if (sentiment === 'positive') return 'success';
    if (sentiment === 'negative') return 'danger';
    return 'warning';
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-danger" />;
    return null;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'default'> = {
      active: 'success',
      completed: 'default',
      pending: 'warning',
    };
    return colors[status] || 'default';
  };

  const stats = {
    totalSurveys: surveys.length,
    active: surveys.filter((s) => s.status === 'active').length,
    avgCompletion: Math.round(surveys.reduce((sum, s) => sum + s.completionRate, 0) / surveys.length),
    totalResponses: surveys.reduce((sum, s) => sum + s.respondents, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 dark:bg-primary-100/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalSurveys}</p>
                  <p className="text-sm text-default-500">Total Surveys</p>
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
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
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
                <div className="p-2 bg-warning-50 dark:bg-warning-100/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgCompletion}%</p>
                  <p className="text-sm text-default-500">Avg Completion</p>
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
                <div className="p-2 bg-purple-50 dark:bg-purple-100/10 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalResponses}</p>
                  <p className="text-sm text-default-500">Total Responses</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Active Pulse Check */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <h3 className="text-lg font-semibold">Weekly Pulse Check</h3>
              <p className="text-sm text-default-500">Quick check-in on how you're doing this week</p>
            </div>
            <Chip color="success" variant="flat">
              2 min
            </Chip>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* Mood Question */}
          <div>
            <label className="text-sm font-medium mb-3 block">{pulseQuestions[0].question}</label>
            <div className="flex justify-center gap-6">
              {[
                { value: 'great', emoji: '😄', label: 'Great', color: 'success' },
                { value: 'good', emoji: '🙂', label: 'Good', color: 'primary' },
                { value: 'okay', emoji: '😐', label: 'Okay', color: 'warning' },
                { value: 'bad', emoji: '😟', label: 'Not Great', color: 'danger' },
              ].map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    selectedMood === mood.value
                      ? 'border-primary bg-primary-50 dark:bg-primary-950/30 scale-110'
                      : 'border-default-200 hover:border-default-300'
                  }`}
                >
                  <span className="text-4xl">{mood.emoji}</span>
                  <span className="text-sm font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Workload Rating */}
          <div>
            <label className="text-sm font-medium mb-3 block">{pulseQuestions[1].question}</label>
            <div className="px-2">
              <Slider
                size="lg"
                step={1}
                minValue={1}
                maxValue={10}
                value={workloadRating}
                onChange={(value) => setWorkloadRating(value as number)}
                className="max-w-full"
                showTooltip
                marks={[
                  { value: 1, label: '1 (Light)' },
                  { value: 5, label: '5 (Balanced)' },
                  { value: 10, label: '10 (Heavy)' },
                ]}
              />
            </div>
          </div>

          {/* Manager Support */}
          <div>
            <label className="text-sm font-medium mb-3 block">{pulseQuestions[2].question}</label>
            <RadioGroup>
              {pulseQuestions[2].options?.map((option) => (
                <Radio key={option} value={option}>
                  {option}
                </Radio>
              ))}
            </RadioGroup>
          </div>

          <Button color="primary" fullWidth size="lg">
            Submit Pulse Check
          </Button>
        </CardBody>
      </Card>

      {/* Survey List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">All Surveys</h3>
        </CardHeader>
        <CardBody className="gap-3">
          {surveys.map((survey, index) => (
            <motion.div
              key={survey.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardBody className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{survey.title}</h4>
                        <Chip color={getStatusColor(survey.status)} variant="flat" size="sm">
                          {survey.status}
                        </Chip>
                        {survey.trend && getTrendIcon(survey.trend)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-default-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {survey.respondents}/{survey.totalRecipients} responses
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Due {new Date(survey.dueDate).toLocaleDateString('id-ID')}</span>
                        </div>
                        {survey.sentiment && (
                          <div className="flex items-center gap-1">
                            {getSentimentIcon(survey.sentiment)}
                            <span className="capitalize">{survey.sentiment}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-default-500">Completion Rate</span>
                          <span className="text-xs font-semibold">{survey.completionRate}%</span>
                        </div>
                        <Progress
                          value={survey.completionRate}
                          color={
                            survey.completionRate >= 70
                              ? 'success'
                              : survey.completionRate >= 40
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        />
                      </div>
                    </div>
                    <Button
                      variant="flat"
                      size="sm"
                      color={survey.status === 'active' ? 'primary' : 'default'}
                    >
                      {survey.status === 'completed' ? 'View Results' : 'Take Survey'}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
