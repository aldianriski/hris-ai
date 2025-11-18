'use client';

import { Card, CardHeader, CardBody, Tabs, Tab, Chip } from '@heroui/react';
import { Clock, Calendar, DollarSign, Target, TrendingUp, TrendingDown } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { useState } from 'react';

export function HRAnalyticsHub() {
  const [activeModule, setActiveModule] = useState('attendance');

  // Attendance Analytics Data
  const lateArrivalPatterns = [
    { day: 'Mon', count: 12, avg: 8 },
    { day: 'Tue', count: 8, avg: 8 },
    { day: 'Wed', count: 6, avg: 8 },
    { day: 'Thu', count: 10, avg: 8 },
    { day: 'Fri', count: 15, avg: 8 },
  ];

  const absenteeismByDept = [
    { dept: 'Engineering', rate: 2.5 },
    { dept: 'Sales', rate: 4.2 },
    { dept: 'Marketing', rate: 3.1 },
    { dept: 'Operations', rate: 3.8 },
    { dept: 'HR', rate: 1.9 },
    { dept: 'Finance', rate: 2.2 },
  ];

  const overtimeDistribution = [
    { range: '0-10h', count: 120 },
    { range: '11-20h', count: 85 },
    { range: '21-30h', count: 35 },
    { range: '31-40h', count: 7 },
  ];

  const attendanceMode = [
    { name: 'Office', value: 165, color: '#8b5cf6' },
    { name: 'Remote', value: 72, color: '#3b82f6' },
    { name: 'Hybrid', value: 10, color: '#10b981' },
  ];

  // Leave Analytics Data
  const leaveUtilization = [
    { month: 'Jan', utilized: 65, total: 100 },
    { month: 'Feb', utilized: 58, total: 100 },
    { month: 'Mar', utilized: 72, total: 100 },
    { month: 'Apr', utilized: 68, total: 100 },
    { month: 'May', utilized: 75, total: 100 },
    { month: 'Jun', utilized: 82, total: 100 },
  ];

  const peakLeavePeriods = [
    { period: 'Jan', annual: 35, sick: 12, unpaid: 5 },
    { period: 'Feb', annual: 28, sick: 15, unpaid: 3 },
    { period: 'Mar', annual: 42, sick: 10, unpaid: 4 },
    { period: 'Apr', annual: 38, sick: 8, unpaid: 2 },
    { period: 'May', annual: 45, sick: 12, unpaid: 3 },
    { period: 'Jun', annual: 52, sick: 14, unpaid: 6 },
  ];

  // Payroll Analytics Data
  const salaryDistribution = [
    { range: '<5M', count: 45 },
    { range: '5-10M', count: 85 },
    { range: '10-15M', count: 72 },
    { range: '15-20M', count: 32 },
    { range: '>20M', count: 13 },
  ];

  const compensationTrend = [
    { month: 'Jan', base: 1850, allowance: 285, bonus: 135 },
    { month: 'Feb', base: 1920, allowance: 295, bonus: 140 },
    { month: 'Mar', base: 1950, allowance: 300, bonus: 140 },
    { month: 'Apr', base: 2010, allowance: 310, bonus: 145 },
    { month: 'May', base: 2080, allowance: 320, bonus: 150 },
    { month: 'Jun', base: 2150, allowance: 330, bonus: 155 },
  ];

  // Performance Analytics Data
  const performanceDistribution = [
    { rating: 'Outstanding', count: 25, color: '#10b981' },
    { rating: 'Exceeds', count: 85, color: '#3b82f6' },
    { rating: 'Meets', count: 115, color: '#f59e0b' },
    { rating: 'Below', count: 18, color: '#ef4444' },
    { rating: 'Poor', count: 4, color: '#991b1b' },
  ];

  const goalCompletion = [
    { dept: 'Engineering', completion: 85 },
    { dept: 'Sales', completion: 92 },
    { dept: 'Marketing', completion: 78 },
    { dept: 'Operations', completion: 88 },
    { dept: 'HR', completion: 95 },
    { dept: 'Finance', completion: 90 },
  ];

  return (
    <div className="space-y-6">
      {/* Module Selector */}
      <Tabs
        selectedKey={activeModule}
        onSelectionChange={(key) => setActiveModule(key as string)}
        color="primary"
        variant="bordered"
        fullWidth
      >
        <Tab
          key="attendance"
          title={
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Attendance</span>
            </div>
          }
        />
        <Tab
          key="leave"
          title={
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Leave</span>
            </div>
          }
        />
        <Tab
          key="payroll"
          title={
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>Payroll</span>
            </div>
          }
        />
        <Tab
          key="performance"
          title={
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>Performance</span>
            </div>
          }
        />
      </Tabs>

      {/* Attendance Analytics */}
      {activeModule === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <h3 className="text-lg font-semibold">Late Arrival Patterns</h3>
                <Chip color="warning" variant="flat" size="sm">
                  Weekly Average: 10.2
                </Chip>
              </div>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={lateArrivalPatterns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#f59e0b" name="Late Count" />
                  <Bar dataKey="avg" fill="#e5e7eb" name="Average" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Absenteeism Rate by Department</h3>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={absenteeismByDept} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis type="category" dataKey="dept" stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="rate" fill="#ef4444" name="Absenteeism %" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Overtime Distribution</h3>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={overtimeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="range" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" name="Employees" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Work Mode Distribution</h3>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={attendanceMode}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {attendanceMode.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Leave Analytics */}
      {activeModule === 'leave' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <h3 className="text-lg font-semibold">Leave Utilization Rate</h3>
                <Chip color="success" variant="flat" size="sm">
                  Average: 70%
                </Chip>
              </div>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={leaveUtilization}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="utilized"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Utilized %"
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#e5e7eb"
                    strokeDasharray="5 5"
                    name="Total Quota"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <h3 className="text-lg font-semibold">Peak Leave Periods & Seasonality</h3>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={peakLeavePeriods}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="period" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="annual" stackId="a" fill="#3b82f6" name="Annual Leave" />
                  <Bar dataKey="sick" stackId="a" fill="#f59e0b" name="Sick Leave" />
                  <Bar dataKey="unpaid" stackId="a" fill="#ef4444" name="Unpaid Leave" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Payroll Analytics */}
      {activeModule === 'payroll' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Salary Distribution (IDR)</h3>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={salaryDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="range" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" name="Employees" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <h3 className="text-lg font-semibold">Compensation Cost Trends (IDR Millions)</h3>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={compensationTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="base" stackId="a" fill="#8b5cf6" name="Base Salary" />
                  <Bar dataKey="allowance" stackId="a" fill="#3b82f6" name="Allowances" />
                  <Bar dataKey="bonus" stackId="a" fill="#10b981" name="Bonuses" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Performance Analytics */}
      {activeModule === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Performance Distribution Curve</h3>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={performanceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, count }) => `${name}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {performanceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Goal Completion Rate by Department</h3>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={goalCompletion}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="dept" stroke="#6b7280" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
                  <Radar
                    name="Completion %"
                    dataKey="completion"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
