'use client';

import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Radio,
  RadioGroup,
  Chip,
} from '@heroui/react';
import { Check, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface ChangeSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenant: {
    id: string;
    company_name: string;
    subscription_plan: string;
    max_employees: number;
  };
}

const plans = [
  {
    id: 'trial',
    name: 'Trial',
    price: 0,
    employees: 10,
    features: ['Basic Features', 'Limited Support', '14 Days'],
    disabled: true,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 149000,
    employees: 50,
    features: ['All Basic Features', 'Email Support', 'Attendance & Leave'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 299000,
    employees: 200,
    features: ['All Starter Features', 'Payroll Management', 'AI Features', 'Priority Support'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999000,
    employees: 999999,
    features: ['All Professional Features', 'Custom Integrations', '24/7 Support', 'Dedicated Account Manager'],
  },
];

export function ChangeSubscriptionModal({
  isOpen,
  onClose,
  onSuccess,
  tenant,
}: ChangeSubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState(tenant.subscription_plan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPlan = plans.find((p) => p.id === tenant.subscription_plan);
  const newPlan = plans.find((p) => p.id === selectedPlan);
  const isUpgrade = newPlan && currentPlan && newPlan.price > currentPlan.price;
  const isDowngrade = newPlan && currentPlan && newPlan.price < currentPlan.price;
  const isNoChange = selectedPlan === tenant.subscription_plan;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async () => {
    if (isNoChange) {
      onClose();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/platform/tenants/${tenant.id}/subscription`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to change subscription');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error changing subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to change subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">Change Subscription Plan</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
            {tenant.company_name} - Current Plan: {currentPlan?.name}
          </p>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Plan Selection */}
            <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plans.map((plan) => (
                  <div key={plan.id} className="relative">
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <Chip size="sm" color="secondary" variant="solid">
                          Popular
                        </Chip>
                      </div>
                    )}
                    <Radio
                      value={plan.id}
                      classNames={{
                        base: 'w-full m-0',
                      }}
                      isDisabled={plan.disabled}
                    >
                      <Card
                        isPressable
                        className={`
                          w-full
                          ${selectedPlan === plan.id ? 'border-2 border-primary' : ''}
                          ${plan.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                          ${plan.popular ? 'border-secondary' : ''}
                        `}
                      >
                        <CardBody className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {plan.name}
                              </h4>
                              <p className="text-2xl font-bold text-primary mt-1">
                                {formatCurrency(plan.price)}
                                {plan.id !== 'trial' && (
                                  <span className="text-sm text-gray-500">/mo</span>
                                )}
                              </p>
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                Up to {plan.employees} employees
                              </p>
                              <ul className="space-y-1">
                                {plan.features.map((feature, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-1 text-xs text-gray-600 dark:text-gray-400"
                                  >
                                    <Check className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {tenant.subscription_plan === plan.id && (
                              <Chip size="sm" color="success" variant="flat" className="w-full">
                                Current Plan
                              </Chip>
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    </Radio>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {/* Change Summary */}
            {!isNoChange && (
              <div
                className={`
                  p-4 rounded-lg border
                  ${
                    isUpgrade
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {isUpgrade ? (
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h4
                      className={`text-sm font-semibold mb-1 ${
                        isUpgrade ? 'text-green-900 dark:text-green-100' : 'text-orange-900 dark:text-orange-100'
                      }`}
                    >
                      {isUpgrade ? 'Upgrading Plan' : 'Downgrading Plan'}
                    </h4>
                    <p
                      className={`text-xs ${
                        isUpgrade ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'
                      }`}
                    >
                      From <strong>{currentPlan?.name}</strong> ({formatCurrency(currentPlan?.price || 0)}/mo) to{' '}
                      <strong>{newPlan?.name}</strong> ({formatCurrency(newPlan?.price || 0)}/mo)
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        isUpgrade ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'
                      }`}
                    >
                      {isUpgrade && '✓ Upgrade takes effect immediately with prorated billing'}
                      {isDowngrade && '⚠️ Downgrade takes effect at the end of current billing period'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button
            color={isUpgrade ? 'success' : isDowngrade ? 'warning' : 'primary'}
            onPress={handleSubmit}
            isLoading={loading}
            isDisabled={isNoChange}
          >
            {isNoChange ? 'No Change' : isUpgrade ? 'Upgrade Plan' : 'Downgrade Plan'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
