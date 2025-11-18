'use client';

import { Card, CardBody, Progress, Chip } from '@heroui/react';
import {
  Heart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface TenantHealthScore {
  tenantId: string;
  companyName: string;
  score: number; // 0-100
  metrics: {
    featureAdoption: number; // % of features used
    activeUsers: number; // % of users active monthly
    dataCompleteness: number; // % of profiles completed
    engagement: number; // Logins per user per week
    supportTickets: number; // Count (negative indicator)
  };
  riskLevel: 'low' | 'medium' | 'high' | 'churn_risk';
  recommendations: string[];
}

interface TenantHealthWidgetProps {
  tenants: TenantHealthScore[];
  showTop?: number;
}

export function TenantHealthWidget({ tenants, showTop = 10 }: TenantHealthWidgetProps) {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      case 'churn_risk':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4" />;
      case 'high':
      case 'churn_risk':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'danger';
  };

  const averageScore = tenants.length > 0
    ? Math.round(tenants.reduce((sum, t) => sum + t.score, 0) / tenants.length)
    : 0;

  const riskDistribution = {
    low: tenants.filter(t => t.riskLevel === 'low').length,
    medium: tenants.filter(t => t.riskLevel === 'medium').length,
    high: tenants.filter(t => t.riskLevel === 'high').length,
    churn_risk: tenants.filter(t => t.riskLevel === 'churn_risk').length,
  };

  // Sort by score (lowest first for at-risk tenants)
  const sortedTenants = [...tenants]
    .sort((a, b) => a.score - b.score)
    .slice(0, showTop);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Health Score</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {averageScore}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Healthy</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
                  {riskDistribution.low}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-900/20">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">At Risk</p>
                <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100 mt-2">
                  {riskDistribution.medium + riskDistribution.high}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 dark:text-red-300">Churn Risk</p>
                <p className="text-3xl font-bold text-red-900 dark:text-red-100 mt-2">
                  {riskDistribution.churn_risk}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* At-Risk Tenants List */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tenant Health Scores (Lowest First)
          </h3>

          <div className="space-y-4">
            {sortedTenants.map((tenant) => (
              <div
                key={tenant.tenantId}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {tenant.companyName}
                      </h4>
                      <Chip
                        size="sm"
                        color={getRiskColor(tenant.riskLevel)}
                        variant="flat"
                        startContent={getRiskIcon(tenant.riskLevel)}
                      >
                        {tenant.riskLevel.replace('_', ' ')}
                      </Chip>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {tenant.score}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">/100</span>
                      </div>
                      <Progress
                        value={tenant.score}
                        color={getScoreColor(tenant.score)}
                        className="flex-1"
                        size="sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Feature Adoption</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {tenant.metrics.featureAdoption}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Active Users</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {tenant.metrics.activeUsers}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Data Complete</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {tenant.metrics.dataCompleteness}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Engagement</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {tenant.metrics.engagement.toFixed(1)} logins/week
                        </p>
                      </div>
                    </div>

                    {tenant.recommendations.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Recommendations:
                        </p>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                          {tenant.recommendations.slice(0, 2).map((rec, idx) => (
                            <li key={idx}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
