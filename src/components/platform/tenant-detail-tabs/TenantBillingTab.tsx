'use client';

import { Card, CardBody, Button, Chip } from '@heroui/react';
import { CreditCard, Download, Calendar } from 'lucide-react';

interface TenantBillingTabProps {
  tenant: any;
}

const mockInvoices = [
  { id: '1', number: 'INV-2024-011', date: '2024-11-01', amount: 299000, status: 'paid' },
  { id: '2', number: 'INV-2024-010', date: '2024-10-01', amount: 299000, status: 'paid' },
  { id: '3', number: 'INV-2024-009', date: '2024-09-01', amount: 299000, status: 'paid' },
];

export function TenantBillingTab({ tenant }: TenantBillingTabProps) {
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
                <Chip size="lg" color="secondary" variant="flat">
                  {tenant.subscriptionPlan} Plan
                </Chip>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  Rp 299,000 <span className="text-sm text-gray-500">/month</span>
                </span>
              </div>
            </div>

            <Button color="primary">
              Change Plan
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Billing Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Next Billing Date</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              Dec 1, 2024
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              Rp 897,000
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <CreditCard className="w-5 h-5" />
              <p className="font-medium text-gray-900 dark:text-white">
                •••• 1234
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Invoice History */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Invoice History
          </h3>

          <div className="space-y-3">
            {mockInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Calendar className="w-10 h-10 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {invoice.number}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(invoice.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      Rp {invoice.amount.toLocaleString('id-ID')}
                    </p>
                    <Chip size="sm" color="success" variant="flat">
                      {invoice.status}
                    </Chip>
                  </div>

                  <Button
                    size="sm"
                    variant="flat"
                    isIconOnly
                    aria-label="Download invoice"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
