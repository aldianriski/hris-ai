'use client';

import { Card, CardBody, Progress } from '@heroui/react';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  BarChart3,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface FeatureAdoption {
  featureKey: string;
  featureName: string;
  description: string;
  tenantsUsing: number;
  totalTenants: number;
  adoptionRate: number; // Percentage
  trend: 'up' | 'down' | 'stable';
  category: 'core' | 'advanced' | 'premium';
}

interface FeatureAdoptionWidgetProps {
  features: FeatureAdoption[];
}

export function FeatureAdoptionWidget({ features }: FeatureAdoptionWidgetProps) {
  const getFeatureIcon = (key: string) => {
    const icons: Record<string, any> = {
      employee_management: Users,
      attendance: Calendar,
      payroll: DollarSign,
      performance: TrendingUp,
      documents: FileText,
      reports: BarChart3,
      ai_features: Zap,
      leave_management: Calendar,
    };
    return icons[key] || CheckCircle2;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core':
        return 'primary';
      case 'advanced':
        return 'secondary';
      case 'premium':
        return 'success';
      default:
        return 'default';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-danger rotate-180" />;
      default:
        return null;
    }
  };

  const overallAdoptionRate = features.length > 0
    ? Math.round(features.reduce((sum, f) => sum + f.adoptionRate, 0) / features.length)
    : 0;

  const categoryAdoption = {
    core: features.filter(f => f.category === 'core'),
    advanced: features.filter(f => f.category === 'advanced'),
    premium: features.filter(f => f.category === 'premium'),
  };

  // Sort by adoption rate (lowest first to highlight opportunities)
  const sortedFeatures = [...features].sort((a, b) => a.adoptionRate - b.adoptionRate);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary to-secondary">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Overall Adoption</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {overallAdoptionRate}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Core Features</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {categoryAdoption.core.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Avg {Math.round(categoryAdoption.core.reduce((sum, f) => sum + f.adoptionRate, 0) / Math.max(categoryAdoption.core.length, 1))}% adoption
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Advanced Features</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {categoryAdoption.advanced.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Avg {Math.round(categoryAdoption.advanced.reduce((sum, f) => sum + f.adoptionRate, 0) / Math.max(categoryAdoption.advanced.length, 1))}% adoption
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Premium Features</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {categoryAdoption.premium.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Avg {Math.round(categoryAdoption.premium.reduce((sum, f) => sum + f.adoptionRate, 0) / Math.max(categoryAdoption.premium.length, 1))}% adoption
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Feature List */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Feature Adoption Rates
          </h3>

          <div className="space-y-4">
            {sortedFeatures.map((feature) => {
              const Icon = getFeatureIcon(feature.featureKey);

              return (
                <div
                  key={feature.featureKey}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `var(--heroui-${getCategoryColor(feature.category)})20`,
                      }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: `var(--heroui-${getCategoryColor(feature.category)})` }}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {feature.featureName}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {feature.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(feature.trend)}
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                            {feature.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {feature.adoptionRate}%
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({feature.tenantsUsing}/{feature.totalTenants} tenants)
                          </span>
                        </div>
                      </div>

                      <Progress
                        value={feature.adoptionRate}
                        color={
                          feature.adoptionRate >= 80
                            ? 'success'
                            : feature.adoptionRate >= 50
                            ? 'primary'
                            : 'warning'
                        }
                        size="sm"
                        className="max-w-2xl"
                      />

                      {feature.adoptionRate < 50 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                          💡 Low adoption - Consider promoting this feature or improving onboarding
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Insights */}
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <CardBody>
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Feature Adoption Insights
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
            <li>
              • <strong>Most Adopted:</strong>{' '}
              {features.sort((a, b) => b.adoptionRate - a.adoptionRate)[0]?.featureName} (
              {features.sort((a, b) => b.adoptionRate - a.adoptionRate)[0]?.adoptionRate}%)
            </li>
            <li>
              • <strong>Least Adopted:</strong>{' '}
              {features.sort((a, b) => a.adoptionRate - b.adoptionRate)[0]?.featureName} (
              {features.sort((a, b) => a.adoptionRate - b.adoptionRate)[0]?.adoptionRate}%)
            </li>
            <li>
              • <strong>Features with &lt;50% adoption:</strong>{' '}
              {features.filter(f => f.adoptionRate < 50).length} features need attention
            </li>
            <li>
              • <strong>Recommendation:</strong> Focus on improving documentation and onboarding
              for low-adoption features to increase platform value
            </li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
