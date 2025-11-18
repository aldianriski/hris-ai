'use client';

import { Card, CardBody, Chip } from '@heroui/react';
import { Calendar, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  averageWorkHours: number;
  overtimeHours: number;
}

interface EmployeeAttendanceSummaryProps {
  employeeId: string;
}

export function EmployeeAttendanceSummary({ employeeId }: EmployeeAttendanceSummaryProps) {
  // TODO: Fetch actual attendance data from API
  const summary: AttendanceSummary = {
    totalDays: 22,
    presentDays: 20,
    lateDays: 3,
    absentDays: 2,
    averageWorkHours: 8.5,
    overtimeHours: 12,
  };

  const attendanceRate = ((summary.presentDays / summary.totalDays) * 100).toFixed(1);
  const punctualityRate = (
    ((summary.presentDays - summary.lateDays) / summary.totalDays) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">This Month Summary</h3>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-green-50 dark:bg-green-900/20">
            <CardBody className="text-center">
              <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {summary.presentDays}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Present Days</p>
            </CardBody>
          </Card>

          <Card className="bg-yellow-50 dark:bg-yellow-900/20">
            <CardBody className="text-center">
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">
                {summary.lateDays}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Late Days</p>
            </CardBody>
          </Card>

          <Card className="bg-red-50 dark:bg-red-900/20">
            <CardBody className="text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">
                {summary.absentDays}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Absent Days</p>
            </CardBody>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-900/20">
            <CardBody className="text-center">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">
                {summary.overtimeHours}h
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overtime</p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Performance Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Attendance Rate
            </span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600"
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
              <span className="text-sm font-medium">{attendanceRate}%</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Punctuality Rate
            </span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${punctualityRate}%` }}
                />
              </div>
              <span className="text-sm font-medium">{punctualityRate}%</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Average Work Hours
            </span>
            <span className="text-sm font-medium">
              {summary.averageWorkHours}h / day
            </span>
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Attendance</h3>
        <div className="space-y-2">
          {[...Array(5)].map((_, index) => {
            const date = new Date();
            date.setDate(date.getDate() - index);
            const status = index === 2 ? 'late' : index === 4 ? 'absent' : 'present';
            const statusColor =
              status === 'present'
                ? 'success'
                : status === 'late'
                ? 'warning'
                : 'danger';

            return (
              <div
                key={index}
                className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {date.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  {status !== 'absent' && (
                    <p className="text-xs text-gray-500">
                      08:00 - 17:00 • 9.0 hours
                    </p>
                  )}
                </div>
                <Chip size="sm" color={statusColor} variant="flat">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Chip>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
