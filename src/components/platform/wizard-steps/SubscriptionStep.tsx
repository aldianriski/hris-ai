'use client';

import { Card, CardBody, Chip, RadioGroup, Radio, Input } from '@heroui/react';
import { Check } from 'lucide-react';
import type { CreateTenantData } from '@/lib/api/types';

interface SubscriptionStepProps {
  data: Partial<CreateTenantData>;
  updateData: (data: Partial<CreateTenantData>) => void;
}

const plans = [
  {
    id: 'trial',
    name: 'Free Trial',
    price: 0,
    currency: 'IDR',
    duration: '14 days',
    maxEmployees: 10,
    features: [
      'All modules access',
      'AI features enabled',
      'Up to 10 employees',
      'Email support',
      '1 GB storage',
    ],
    recommended: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 99000,
    currency: 'IDR',
    duration: 'month',
    maxEmployees: 50,
    features: [
      'Employee management',
      'Attendance & leave',
      'Basic payroll',
      'Email support',
      '10 GB storage',
      'Up to 50 employees',
    ],
    recommended: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 299000,
    currency: 'IDR',
    duration: 'month',
    maxEmployees: 200,
    features: [
      'All Starter features',
      'AI leave approval',
      'AI anomaly detection',
      'Performance management',
      'Priority support',
      '50 GB storage',
      'Up to 200 employees',
    ],
    recommended: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    currency: 'IDR',
    duration: 'month',
    maxEmployees: 999999,
    features: [
      'All Professional features',
      'Unlimited employees',
      'White-label branding',
      'SSO & advanced security',
      'Dedicated support',
      '500 GB storage',
      'Custom integrations',
    ],
    recommended: false,
  },
];

export function SubscriptionStep({ data, updateData }: SubscriptionStepProps) {
  const selectedPlan = plans.find((p) => p.id === data.subscriptionPlan);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Subscription Plan
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Choose the plan that best fits the company's needs
        </p>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            isPressable
            onPress={() => {
              updateData({
                subscriptionPlan: plan.id as CreateTenantData['subscriptionPlan'],
                maxEmployees: plan.maxEmployees,
              });
            }}
            className={`
              relative transition-all
              ${
                data.subscriptionPlan === plan.id
                  ? 'border-2 border-primary shadow-lg'
                  : 'border border-gray-200 dark:border-gray-700'
              }
            `}
          >
            {plan.recommended && (
              <Chip
                size="sm"
                color="primary"
                className="absolute -top-2 left-1/2 -translate-x-1/2 z-10"
              >
                Recommended
              </Chip>
            )}

            <CardBody className="p-4">
              <div className="text-center mb-4">
                <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                  {plan.name}
                </h4>
                <div className="mt-2">
                  {plan.price === null ? (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      Custom
                    </p>
                  ) : plan.price === 0 ? (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      Free
                    </p>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        Rp {(plan.price / 1000).toFixed(0)}K
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        per {plan.duration}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>

              {data.subscriptionPlan === plan.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-medium">Selected</span>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Billing Cycle */}
      {data.subscriptionPlan && data.subscriptionPlan !== 'trial' && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <RadioGroup
            label="Billing Cycle"
            value={data.billingCycle}
            onValueChange={(value) =>
              updateData({ billingCycle: value as CreateTenantData['billingCycle'] })
            }
            classNames={{
              label: 'text-sm font-medium',
            }}
          >
            <Radio value="monthly">
              <div className="ml-2">
                <p className="text-sm font-medium">Monthly</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Billed monthly, cancel anytime
                </p>
              </div>
            </Radio>
            <Radio value="annual">
              <div className="ml-2">
                <p className="text-sm font-medium">Annual</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Save 20% with annual billing
                </p>
              </div>
            </Radio>
          </RadioGroup>
        </div>
      )}

      {/* Trial Days (for trial plan) */}
      {data.subscriptionPlan === 'trial' && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Input
            type="number"
            label="Trial Duration (days)"
            value={data.trialDays?.toString()}
            onValueChange={(value) => updateData({ trialDays: parseInt(value) || 14 })}
            min={1}
            max={30}
            description="Default is 14 days. Maximum 30 days."
            classNames={{
              label: 'text-sm font-medium',
            }}
          />
        </div>
      )}

      {/* Summary */}
      {selectedPlan && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Plan:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedPlan.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Max Employees:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedPlan.maxEmployees === 999999 ? 'Unlimited' : selectedPlan.maxEmployees}
              </span>
            </div>
            {data.billingCycle && data.subscriptionPlan !== 'trial' && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Billing:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.billingCycle === 'monthly' ? 'Monthly' : 'Annual (20% off)'}
                </span>
              </div>
            )}
            {selectedPlan.price !== null && (
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Total:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedPlan.price === 0
                    ? 'Free'
                    : `Rp ${selectedPlan.price.toLocaleString('id-ID')} / ${selectedPlan.duration}`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
