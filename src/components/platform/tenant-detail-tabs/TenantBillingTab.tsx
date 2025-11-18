'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Chip, Spinner, useDisclosure } from '@heroui/react';
import { CreditCard, Download, Calendar, AlertCircle } from 'lucide-react';
import { ChangeSubscriptionModal } from '../ChangeSubscriptionModal';

interface TenantBillingTabProps {
  tenantId: string;
}

const planPricing: Record<string, number> = {
  trial: 0,
  starter: 149000,
  professional: 299000,
  enterprise: 999000,
};

const statusColors = {
  paid: 'success',
  pending: 'warning',
  failed: 'danger',
  cancelled: 'default',
} as const;

export function TenantBillingTab({ tenantId }: TenantBillingTabProps) {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchTenant();
  }, [tenantId]);

  const fetchTenant = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/platform/tenants/${tenantId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch tenant');
      }

      const result = await response.json();
      setTenant(result.tenant);
    } catch (err) {
      console.error('Error fetching tenant:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tenant');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getNextBillingDate = () => {
    if (!tenant?.subscription_starts_at) return 'N/A';
    const startDate = new Date(tenant.subscription_starts_at);
    const nextMonth = new Date(startDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return formatDate(nextMonth.toISOString());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 text-red-500 mb-4">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error || 'Tenant not found'}</p>
        </div>
        <Button size="sm" variant="flat" onPress={fetchTenant}>
          Retry
        </Button>
      </div>
    );
  }

  const currentPlan = tenant.subscription_plan || 'trial';
  const planPrice = planPricing[currentPlan] || 0;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Current Subscription
              </h3>
              <div className="flex items-center gap-3">
                <Chip size="lg" color="secondary" variant="flat" className="capitalize">
                  {currentPlan} Plan
                </Chip>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(planPrice)}{' '}
                  {currentPlan !== 'trial' && (
                    <span className="text-sm text-gray-500">/month</span>
                  )}
                </span>
              </div>
              <div className="mt-2">
                <Chip
                  size="sm"
                  color={
                    tenant.subscription_status === 'active'
                      ? 'success'
                      : tenant.subscription_status === 'trial'
                      ? 'primary'
                      : 'warning'
                  }
                  variant="flat"
                  className="capitalize"
                >
                  {tenant.subscription_status}
                </Chip>
              </div>
            </div>

            <Button color="primary" onPress={onOpen}>Change Plan</Button>
          </div>
        </CardBody>
      </Card>

      {/* Billing Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Subscription Started</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {formatDate(tenant.subscription_starts_at)}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Next Billing Date</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {getNextBillingDate()}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <CreditCard className="w-5 h-5" />
              <p className="font-medium text-gray-900 dark:text-white">
                {tenant.stripe_customer_id ? '•••• 1234' : 'Not set'}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Subscription Details */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Subscription Details
          </h3>

          <div className="space-y-3">
            {tenant.trial_ends_at && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trial Ends
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {formatDate(tenant.trial_ends_at)}
                </span>
              </div>
            )}

            {tenant.subscription_ends_at && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subscription Ends
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {formatDate(tenant.subscription_ends_at)}
                </span>
              </div>
            )}

            {tenant.stripe_customer_id && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Stripe Customer ID
                </span>
                <span className="text-sm font-mono text-gray-900 dark:text-white">
                  {tenant.stripe_customer_id}
                </span>
              </div>
            )}

            {tenant.stripe_subscription_id && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Stripe Subscription ID
                </span>
                <span className="text-sm font-mono text-gray-900 dark:text-white">
                  {tenant.stripe_subscription_id}
                </span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Invoices Placeholder */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Invoice History
          </h3>

          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Invoice history will be available once billing integration is complete
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              This feature will integrate with Stripe/Midtrans for invoice management
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Change Subscription Modal */}
      {tenant && (
        <ChangeSubscriptionModal
          isOpen={isOpen}
          onClose={onClose}
          onSuccess={fetchTenant}
          tenant={{
            id: tenant.id,
            company_name: tenant.company_name,
            subscription_plan: tenant.subscription_plan,
            max_employees: tenant.max_employees,
          }}
        />
      )}
    </div>
  );
}
