'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Chip, Spinner, Button } from '@heroui/react';
import { Calendar, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface AttendanceSummary {
  total_days: number;
  present_days: number;
  late_days: number;
  absent_days: number;
  total_hours: number;
  overtime_hours: number;
}

interface AttendanceRecord {
  date: string;
  status: 'present' | 'late' | 'absent' | 'leave';
  clock_in?: string;
  clock_out?: string;
  total_hours?: number;
}

interface EmployeeAttendanceSummaryProps {
  employeeId: string;
}

export function EmployeeAttendanceSummary({ employeeId }: EmployeeAttendanceSummaryProps) {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAttendanceSummary() {
      try {
        setLoading(true);

        // Get current month date range
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const endDate = now.toISOString().split('T')[0];

        const response = await fetch(
          `/api/v1/attendance/summary?employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch attendance summary');
        }

        const result = await response.json();

        // Set summary from API response
        if (result.summary) {
          setSummary(result.summary);
        }

        // Set recent records (last 5 days)
        if (result.records) {
          setRecentRecords(result.records.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching attendance summary:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch attendance summary');
      } finally {
        setLoading(false);
      }
    }

    fetchAttendanceSummary();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <Spinner size="lg" color="primary" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading attendance summary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Attendance</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Button color="primary" size="sm" onPress={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">No attendance data available</p>
        </CardBody>
      </Card>
    );
  }

  const attendanceRate = summary.total_days > 0
    ? ((summary.present_days / summary.total_days) * 100).toFixed(1)
    : '0';

  const punctualityRate = summary.total_days > 0
    ? (((summary.present_days - summary.late_days) / summary.total_days) * 100).toFixed(1)
    : '0';

  const averageWorkHours = summary.present_days > 0
    ? (summary.total_hours / summary.present_days).toFixed(1)
    : '0';

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
                {summary.present_days}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Present Days</p>
            </CardBody>
          </Card>

          <Card className="bg-yellow-50 dark:bg-yellow-900/20">
            <CardBody className="text-center">
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">
                {summary.late_days}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Late Days</p>
            </CardBody>
          </Card>

          <Card className="bg-red-50 dark:bg-red-900/20">
            <CardBody className="text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">
                {summary.absent_days}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Absent Days</p>
            </CardBody>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-900/20">
            <CardBody className="text-center">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">
                {summary.overtime_hours}h
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
              {averageWorkHours}h / day
            </span>
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      {recentRecords.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Attendance</h3>
          <div className="space-y-2">
            {recentRecords.map((record, index) => {
              const statusColor =
                record.status === 'present'
                  ? 'success'
                  : record.status === 'late'
                  ? 'warning'
                  : record.status === 'leave'
                  ? 'primary'
                  : 'danger';

              return (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    {record.clock_in && record.clock_out && (
                      <p className="text-xs text-gray-500">
                        {new Date(record.clock_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(record.clock_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        {record.total_hours && ` • ${record.total_hours.toFixed(1)} hours`}
                      </p>
                    )}
                  </div>
                  <Chip size="sm" color={statusColor} variant="flat">
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </Chip>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
