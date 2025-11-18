'use client';

import { Card, CardBody } from '@heroui/react';
import { Users, Activity, Clock, TrendingUp } from 'lucide-react';

interface UserEngagement {
  totalUsers: number;
  dailyActiveUsers: number; // DAU
  weeklyActiveUsers: number; // WAU
  monthlyActiveUsers: number; // MAU
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  averageSessionDuration: number; // minutes
  pagesPerSession: number;
  retention: {
    day7: number; // 7-day retention rate %
    day30: number; // 30-day retention rate %
    day90: number; // 90-day retention rate %
  };
}

interface UserEngagementWidgetProps {
  engagement: UserEngagement;
}

export function UserEngagementWidget({ engagement }: UserEngagementWidgetProps) {
  const dauRate = engagement.totalUsers > 0
    ? ((engagement.dailyActiveUsers / engagement.totalUsers) * 100).toFixed(1)
    : '0.0';

  const wauRate = engagement.totalUsers > 0
    ? ((engagement.weeklyActiveUsers / engagement.totalUsers) * 100).toFixed(1)
    : '0.0';

  const mauRate = engagement.totalUsers > 0
    ? ((engagement.monthlyActiveUsers / engagement.totalUsers) * 100).toFixed(1)
    : '0.0';

  // DAU/MAU ratio (engagement metric - higher is better, >20% is good)
  const stickiness = engagement.monthlyActiveUsers > 0
    ? ((engagement.dailyActiveUsers / engagement.monthlyActiveUsers) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">DAU</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {engagement.dailyActiveUsers.toLocaleString()}
                </p>
                <p className="text-xs text-white/60 mt-1">{dauRate}% of users</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">WAU</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {engagement.weeklyActiveUsers.toLocaleString()}
                </p>
                <p className="text-xs text-white/60 mt-1">{wauRate}% of users</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">MAU</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {engagement.monthlyActiveUsers.toLocaleString()}
                </p>
                <p className="text-xs text-white/60 mt-1">{mauRate}% of users</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Stickiness</p>
                <p className="text-3xl font-bold text-white mt-2">{stickiness}%</p>
                <p className="text-xs text-white/60 mt-1">DAU/MAU ratio</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* New Users */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            New User Growth
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Today</p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {engagement.newUsersToday}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">new users</p>
            </div>
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">This Week</p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {engagement.newUsersThisWeek}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">new users</p>
            </div>
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">This Month</p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {engagement.newUsersThisMonth}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">new users</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardBody>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Session Metrics
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Avg Session Duration</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {engagement.averageSessionDuration} min
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pages per Session</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {engagement.pagesPerSession.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              User Retention
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">7-Day Retention</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {engagement.retention.day7}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 rounded-full h-2 transition-all"
                    style={{ width: `${engagement.retention.day7}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">30-Day Retention</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {engagement.retention.day30}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 rounded-full h-2 transition-all"
                    style={{ width: `${engagement.retention.day30}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">90-Day Retention</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {engagement.retention.day90}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-500 rounded-full h-2 transition-all"
                    style={{ width: `${engagement.retention.day90}%` }}
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Insights */}
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <CardBody>
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Engagement Insights
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
            <li>
              • <strong>Stickiness ({stickiness}%):</strong>{' '}
              {parseFloat(stickiness) > 20
                ? 'Excellent! Users are highly engaged'
                : parseFloat(stickiness) > 10
                ? 'Good engagement, but room for improvement'
                : 'Low stickiness - focus on improving daily usage'}
            </li>
            <li>
              • <strong>Retention:</strong>{' '}
              {engagement.retention.day30 > 40
                ? 'Strong 30-day retention'
                : 'Consider improving onboarding and feature discovery'}
            </li>
            <li>
              • <strong>Session Quality:</strong>{' '}
              {engagement.averageSessionDuration > 15
                ? 'Users are spending good time in the app'
                : 'Sessions are short - improve navigation and engagement'}
            </li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
