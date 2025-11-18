'use client';

import { Card, CardHeader, CardBody, Button, Chip, Spinner } from '@heroui/react';
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
  AreaChart,
  Area,
} from 'recharts';
import { useAuth } from '@/lib/hooks/useAuth';
import { useDashboardAnalytics } from '@/lib/hooks/useAnalytics';

export function ExecutiveDashboardIntegrated() {
  const { employerId } = useAuth();
  const { data, isLoading } = useDashboardAnalytics(employerId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" label="Loading dashboard analytics..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Calendar className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const { kpis, headcountTrend, turnoverData, departmentDistribution, costTrends } = data;

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
          <span className="text-sm text-default-600">
            Last updated: {new Date().toLocaleString('id-ID')}
          </span>
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
                  color={kpis.headcountGrowth >= 0 ? 'success' : 'danger'}
                  variant="flat"
                  size="sm"
                  startContent={
                    kpis.headcountGrowth >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )
                  }
                >
                  {kpis.headcountGrowth >= 0 ? '+' : ''}
                  {kpis.headcountGrowth}%
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
                  color={kpis.turnoverTrend <= 0 ? 'success' : 'danger'}
                  variant="flat"
                  size="sm"
                  startContent={
                    kpis.turnoverTrend <= 0 ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : (
                      <TrendingUp className="h-3 w-3" />
                    )
                  }
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
                    <p className="text-3xl font-bold mt-1">{kpis.avgTimeToHire} days</p>
                  </div>
                </div>
                <Chip
                  color={kpis.timeToHireTrend <= 0 ? 'success' : 'danger'}
                  variant="flat"
                  size="sm"
                  startContent={
                    kpis.timeToHireTrend <= 0 ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : (
                      <TrendingUp className="h-3 w-3" />
                    )
                  }
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
                      Rp {(kpis.costPerHire / 1000).toFixed(0)}k
                    </p>
                  </div>
                </div>
                <Chip
                  color={kpis.costTrend <= 0 ? 'success' : 'warning'}
                  variant="flat"
                  size="sm"
                  startContent={
                    kpis.costTrend >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )
                  }
                >
                  {kpis.costTrend >= 0 ? '+' : ''}
                  {kpis.costTrend}%
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
                  <div className="p-2 bg-red-50 dark:bg-red-100/10 rounded-lg">
                    <UserMinus className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Absenteeism Rate</p>
                    <p className="text-3xl font-bold mt-1">{kpis.absenteeismRate}%</p>
                  </div>
                </div>
                <Chip
                  color={kpis.absenteeismTrend <= 0 ? 'success' : 'danger'}
                  variant="flat"
                  size="sm"
                  startContent={
                    kpis.absenteeismTrend <= 0 ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : (
                      <TrendingUp className="h-3 w-3" />
                    )
                  }
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
                  <div className="p-2 bg-orange-50 dark:bg-orange-100/10 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Overtime Hours</p>
                    <p className="text-3xl font-bold mt-1">{kpis.overtimeHours}</p>
                  </div>
                </div>
                <Chip
                  color={kpis.overtimeTrend <= 0 ? 'success' : 'warning'}
                  variant="flat"
                  size="sm"
                  startContent={
                    kpis.overtimeTrend >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )
                  }
                >
                  {kpis.overtimeTrend >= 0 ? '+' : ''}
                  {kpis.overtimeTrend}%
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
            <h3 className="text-lg font-semibold">Headcount Trend</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={headcountTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                  name="Actual"
                />
                {headcountTrend[0]?.target && (
                  <Area
                    type="monotone"
                    dataKey="target"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                    name="Target"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Turnover Analysis */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Turnover Analysis</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={turnoverData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="voluntary" fill="#f59e0b" name="Voluntary" />
                <Bar dataKey="involuntary" fill="#ef4444" name="Involuntary" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  label={(entry) => `${entry.name}: ${entry.value}`}
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

        {/* Cost Trends */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Cost Trends (Millions IDR)</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="salary" stroke="#3b82f6" name="Salary" />
                <Line type="monotone" dataKey="benefits" stroke="#10b981" name="Benefits" />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#8b5cf6"
                  strokeWidth={2}
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
