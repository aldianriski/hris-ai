'use client';

import { Card, CardHeader, CardBody, Button, Chip } from '@heroui/react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  UserMinus,
  Download,
  Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

export function ExecutiveDashboard() {
  // Mock data - replace with actual API calls
  const kpis = {
    totalHeadcount: 247,
    headcountGrowth: 12.5,
    turnoverRate: 8.2,
    turnoverTrend: -2.1,
    avgTimeToHire: 21,
    timeToHireTrend: -15,
    costPerHire: 8500000,
    costTrend: 5.3,
    absenteeismRate: 3.2,
    absenteeismTrend: -0.8,
    overtimeHours: 1247,
    overtimeTrend: 8.5,
  };

  const headcountTrend = [
    { month: 'Jan', count: 220, target: 225 },
    { month: 'Feb', count: 225, target: 230 },
    { month: 'Mar', count: 228, target: 235 },
    { month: 'Apr', count: 232, target: 240 },
    { month: 'May', count: 238, target: 245 },
    { month: 'Jun', count: 247, target: 250 },
  ];

  const turnoverData = [
    { month: 'Jan', voluntary: 3, involuntary: 1 },
    { month: 'Feb', voluntary: 2, involuntary: 2 },
    { month: 'Mar', voluntary: 4, involuntary: 1 },
    { month: 'Apr', voluntary: 2, involuntary: 1 },
    { month: 'May', voluntary: 3, involuntary: 0 },
    { month: 'Jun', voluntary: 2, involuntary: 1 },
  ];

  const departmentDistribution = [
    { name: 'Engineering', value: 85, color: '#8b5cf6' },
    { name: 'Sales', value: 52, color: '#3b82f6' },
    { name: 'Marketing', value: 38, color: '#10b981' },
    { name: 'Operations', value: 42, color: '#f59e0b' },
    { name: 'HR', value: 15, color: '#ef4444' },
    { name: 'Finance', value: 15, color: '#6366f1' },
  ];

  const costTrends = [
    { month: 'Jan', salary: 1850, benefits: 420, total: 2270 },
    { month: 'Feb', salary: 1920, benefits: 435, total: 2355 },
    { month: 'Mar', salary: 1950, benefits: 440, total: 2390 },
    { month: 'Apr', salary: 2010, benefits: 455, total: 2465 },
    { month: 'May', salary: 2080, benefits: 470, total: 2550 },
    { month: 'Jun', salary: 2150, benefits: 485, total: 2635 },
  ];

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Exporting to PDF...');
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    console.log('Exporting to Excel...');
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-default-500" />
          <span className="text-sm text-default-600">Last updated: Today, 10:30 AM</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="flat"
            startContent={<Download className="h-4 w-4" />}
            onPress={handleExportPDF}
          >
            Export PDF
          </Button>
          <Button
            variant="flat"
            startContent={<Download className="h-4 w-4" />}
            onPress={handleExportExcel}
          >
            Export Excel
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardBody>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary-50 dark:bg-primary-100/10 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Total Headcount</p>
                    <p className="text-3xl font-bold mt-1">{kpis.totalHeadcount}</p>
                  </div>
                </div>
                <Chip
                  color="success"
                  variant="flat"
                  size="sm"
                  startContent={<TrendingUp className="h-3 w-3" />}
                >
                  +{kpis.headcountGrowth}%
                </Chip>
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
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-warning-50 dark:bg-warning-100/10 rounded-lg">
                    <UserMinus className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Turnover Rate</p>
                    <p className="text-3xl font-bold mt-1">{kpis.turnoverRate}%</p>
                  </div>
                </div>
                <Chip
                  color="success"
                  variant="flat"
                  size="sm"
                  startContent={<TrendingDown className="h-3 w-3" />}
                >
                  {kpis.turnoverTrend}%
                </Chip>
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
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-success-50 dark:bg-success-100/10 rounded-lg">
                    <Clock className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Avg Time to Hire</p>
                    <p className="text-3xl font-bold mt-1">{kpis.avgTimeToHire}d</p>
                  </div>
                </div>
                <Chip
                  color="success"
                  variant="flat"
                  size="sm"
                  startContent={<TrendingDown className="h-3 w-3" />}
                >
                  {kpis.timeToHireTrend}%
                </Chip>
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
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-100/10 rounded-lg">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Cost per Hire</p>
                    <p className="text-3xl font-bold mt-1">
                      {(kpis.costPerHire / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
                <Chip
                  color="warning"
                  variant="flat"
                  size="sm"
                  startContent={<TrendingUp className="h-3 w-3" />}
                >
                  +{kpis.costTrend}%
                </Chip>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardBody>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-50 dark:bg-orange-100/10 rounded-lg">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Absenteeism Rate</p>
                    <p className="text-3xl font-bold mt-1">{kpis.absenteeismRate}%</p>
                  </div>
                </div>
                <Chip
                  color="success"
                  variant="flat"
                  size="sm"
                  startContent={<TrendingDown className="h-3 w-3" />}
                >
                  {kpis.absenteeismTrend}%
                </Chip>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardBody>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-100/10 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Overtime Hours</p>
                    <p className="text-3xl font-bold mt-1">{kpis.overtimeHours}</p>
                  </div>
                </div>
                <Chip
                  color="warning"
                  variant="flat"
                  size="sm"
                  startContent={<TrendingUp className="h-3 w-3" />}
                >
                  +{kpis.overtimeTrend}%
                </Chip>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Headcount Trend */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Headcount Growth Trend</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={headcountTrend}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  name="Actual"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  name="Target"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Department Distribution</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Turnover Analysis */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Turnover Analysis</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={turnoverData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="voluntary" fill="#f59e0b" name="Voluntary" />
                <Bar dataKey="involuntary" fill="#ef4444" name="Involuntary" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Cost Trends */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Compensation Cost Trends (IDR Millions)</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="salary"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Salary"
                />
                <Line
                  type="monotone"
                  dataKey="benefits"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Benefits"
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Total"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
