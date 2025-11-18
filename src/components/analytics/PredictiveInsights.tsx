'use client';

import { Card, CardHeader, CardBody, Button, Chip, Progress, Avatar } from '@heroui/react';
import {
  Brain,
  TrendingUp,
  Users,
  AlertTriangle,
  Target,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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

export function PredictiveInsights() {
  // Attrition Risk Data
  const attritionRisks = [
    {
      id: '1',
      name: 'Sarah Johnson',
      department: 'Engineering',
      tenure: '2.5 years',
      riskScore: 85,
      riskLevel: 'high',
      factors: ['Low salary growth', 'Declined promotion', 'Low engagement score'],
      recommendations: ['Salary review', 'Career development talk', 'Manager 1-on-1'],
    },
    {
      id: '2',
      name: 'Michael Chen',
      department: 'Sales',
      tenure: '1.8 years',
      riskScore: 72,
      riskLevel: 'high',
      factors: ['High stress score', 'Frequent overtime', 'Low manager rating'],
      recommendations: ['Workload review', 'Team transfer option', 'Wellness program'],
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      department: 'Marketing',
      tenure: '3.2 years',
      riskScore: 58,
      riskLevel: 'medium',
      factors: ['Plateaued performance', 'No recent training'],
      recommendations: ['Learning opportunities', 'New project assignment'],
    },
  ];

  const attritionTrend = [
    { month: 'Jul', predicted: 4, actual: 3 },
    { month: 'Aug', predicted: 5, actual: 4 },
    { month: 'Sep', predicted: 3, actual: 3 },
    { month: 'Oct', predicted: 4, actual: null },
    { month: 'Nov', predicted: 6, actual: null },
    { month: 'Dec', predicted: 5, actual: null },
  ];

  // Hiring Forecast Data
  const hiringForecast = [
    { month: 'Oct', Engineering: 5, Sales: 3, Marketing: 2, Operations: 2 },
    { month: 'Nov', Engineering: 7, Sales: 4, Marketing: 3, Operations: 3 },
    { month: 'Dec', Engineering: 4, Sales: 2, Marketing: 2, Operations: 1 },
    { month: 'Jan', Engineering: 8, Sales: 5, Marketing: 4, Operations: 4 },
    { month: 'Feb', Engineering: 6, Sales: 3, Marketing: 3, Operations: 2 },
    { month: 'Mar', Engineering: 5, Sales: 4, Marketing: 2, Operations: 3 },
  ];

  const departmentNeedsData = [
    { dept: 'Engineering', urgency: 90, positions: 8 },
    { dept: 'Sales', urgency: 75, positions: 5 },
    { dept: 'Marketing', urgency: 60, positions: 4 },
    { dept: 'Operations', urgency: 55, positions: 4 },
    { dept: 'HR', urgency: 30, positions: 1 },
    { dept: 'Finance', urgency: 25, positions: 1 },
  ];

  // Performance Trends Data
  const performanceTrends = [
    {
      id: '1',
      name: 'Alex Thompson',
      department: 'Engineering',
      currentRating: 4.2,
      predictedRating: 4.5,
      potential: 'high',
      recommendation: 'Fast-track for senior role',
    },
    {
      id: '2',
      name: 'Lisa Wang',
      department: 'Product',
      currentRating: 4.5,
      predictedRating: 4.8,
      potential: 'high',
      recommendation: 'Leadership training program',
    },
    {
      id: '3',
      name: 'David Kim',
      department: 'Sales',
      currentRating: 3.8,
      predictedRating: 4.2,
      potential: 'medium',
      recommendation: 'Sales methodology training',
    },
  ];

  const trainingNeeds = [
    { skill: 'Leadership', gap: 35, employees: 42 },
    { skill: 'Technical Skills', gap: 45, employees: 38 },
    { skill: 'Communication', gap: 28, employees: 35 },
    { skill: 'Project Management', gap: 40, employees: 25 },
    { skill: 'Data Analysis', gap: 50, employees: 22 },
  ];

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'danger';
    if (score >= 50) return 'warning';
    return 'success';
  };

  const getPotentialBadge = (potential: string) => {
    const colors = {
      high: 'success',
      medium: 'primary',
      low: 'default',
    };
    return colors[potential as keyof typeof colors] || 'default';
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
              <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">AI-Powered Predictive Insights</h2>
              <p className="text-default-600">
                Machine learning models analyze historical patterns to predict future trends and identify
                proactive actions.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <Chip color="success" variant="flat" size="sm" startContent={<Sparkles className="h-3 w-3" />}>
                  90% Accuracy
                </Chip>
                <Chip color="primary" variant="flat" size="sm">
                  Updated Daily
                </Chip>
                <Chip variant="flat" size="sm">
                  12 Months Historical Data
                </Chip>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Attrition Risk Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Employee Attrition Risk</h3>
          <Button variant="flat" size="sm" endContent={<ChevronRight className="h-4 w-4" />}>
            View All At-Risk Employees
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* High Risk Employees */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <h4 className="font-semibold">High Risk Employees</h4>
                <Chip color="danger" variant="flat" size="sm">
                  {attritionRisks.filter((e) => e.riskScore >= 70).length} employees
                </Chip>
              </div>
            </CardHeader>
            <CardBody className="gap-3">
              {attritionRisks.map((employee, index) => (
                <motion.div
                  key={employee.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="shadow-sm">
                    <CardBody className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar
                          name={employee.name}
                          className="flex-shrink-0"
                          size="md"
                          color="primary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold">{employee.name}</p>
                              <p className="text-sm text-default-500">
                                {employee.department} • {employee.tenure}
                              </p>
                            </div>
                            <Chip
                              color={getRiskColor(employee.riskScore)}
                              variant="flat"
                              size="sm"
                            >
                              {employee.riskScore}% Risk
                            </Chip>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-medium text-default-600 mb-1">
                                Risk Factors:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {employee.factors.map((factor, i) => (
                                  <Chip
                                    key={i}
                                    size="sm"
                                    variant="flat"
                                    color="warning"
                                    className="text-xs"
                                  >
                                    {factor}
                                  </Chip>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-medium text-default-600 mb-1">
                                Recommended Actions:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {employee.recommendations.map((rec, i) => (
                                  <Chip
                                    key={i}
                                    size="sm"
                                    variant="flat"
                                    color="success"
                                    className="text-xs"
                                  >
                                    {rec}
                                  </Chip>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </CardBody>
          </Card>

          {/* Attrition Trend */}
          <Card>
            <CardHeader>
              <h4 className="font-semibold">Predicted vs Actual Attrition</h4>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={attritionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Actual"
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted"
                    dot={{ fill: '#8b5cf6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Hiring Forecast Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Hiring Forecast (Next 6 Months)</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department-wise Forecast */}
          <Card>
            <CardHeader>
              <h4 className="font-semibold">Predicted Hiring Needs by Department</h4>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hiringForecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Engineering" stackId="a" fill="#8b5cf6" />
                  <Bar dataKey="Sales" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="Marketing" stackId="a" fill="#10b981" />
                  <Bar dataKey="Operations" stackId="a" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Urgency by Department */}
          <Card>
            <CardHeader>
              <h4 className="font-semibold">Department Hiring Urgency</h4>
            </CardHeader>
            <CardBody className="gap-3">
              {departmentNeedsData.map((dept, index) => (
                <motion.div
                  key={dept.dept}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{dept.dept}</p>
                        <p className="text-sm text-default-500">{dept.positions} positions needed</p>
                      </div>
                      <Chip
                        color={dept.urgency >= 70 ? 'danger' : dept.urgency >= 50 ? 'warning' : 'success'}
                        variant="flat"
                        size="sm"
                      >
                        {dept.urgency}% Urgency
                      </Chip>
                    </div>
                    <Progress
                      value={dept.urgency}
                      color={dept.urgency >= 70 ? 'danger' : dept.urgency >= 50 ? 'warning' : 'success'}
                      className="max-w-md"
                    />
                  </div>
                </motion.div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Performance Trends Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Performance Trends & High Potential Employees</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* High Potential Employees */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <h4 className="font-semibold">High Potential Employees</h4>
                <Chip color="success" variant="flat" size="sm" startContent={<Target className="h-3 w-3" />}>
                  Top Performers
                </Chip>
              </div>
            </CardHeader>
            <CardBody className="gap-3">
              {performanceTrends.map((employee, index) => (
                <motion.div
                  key={employee.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="shadow-sm">
                    <CardBody className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar name={employee.name} size="md" color="success" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold">{employee.name}</p>
                              <p className="text-sm text-default-500">{employee.department}</p>
                            </div>
                            <Chip
                              color={getPotentialBadge(employee.potential)}
                              variant="flat"
                              size="sm"
                            >
                              {employee.potential.toUpperCase()} POTENTIAL
                            </Chip>
                          </div>

                          <div className="flex items-center gap-4 mb-2">
                            <div>
                              <p className="text-xs text-default-500">Current Rating</p>
                              <p className="font-semibold">{employee.currentRating}/5.0</p>
                            </div>
                            <TrendingUp className="h-4 w-4 text-success" />
                            <div>
                              <p className="text-xs text-default-500">Predicted Rating</p>
                              <p className="font-semibold text-success">{employee.predictedRating}/5.0</p>
                            </div>
                          </div>

                          <Chip size="sm" variant="flat" color="primary" className="text-xs">
                            {employee.recommendation}
                          </Chip>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </CardBody>
          </Card>

          {/* Training Needs Analysis */}
          <Card>
            <CardHeader>
              <h4 className="font-semibold">Training Needs Analysis</h4>
            </CardHeader>
            <CardBody className="gap-3">
              {trainingNeeds.map((skill, index) => (
                <motion.div
                  key={skill.skill}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{skill.skill}</p>
                        <p className="text-sm text-default-500">{skill.employees} employees need training</p>
                      </div>
                      <Chip color="warning" variant="flat" size="sm">
                        {skill.gap}% Gap
                      </Chip>
                    </div>
                    <Progress value={skill.gap} color="warning" className="max-w-md" />
                  </div>
                </motion.div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
