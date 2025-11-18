'use client';

import { Card, CardHeader, CardBody, Chip, Progress, Button } from '@heroui/react';
import { Heart, Umbrella, PiggyBank, Calendar, TrendingUp, Download, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface BenefitItem {
  id: string;
  name: string;
  type: 'health' | 'pension' | 'leave' | 'loan';
  status: 'active' | 'pending' | 'inactive';
  details: {
    label: string;
    value: string;
  }[];
}

export function MyBenefitsDashboard() {
  // Mock data - replace with actual API
  const benefits: BenefitItem[] = [
    {
      id: '1',
      name: 'BPJS Kesehatan (Health Insurance)',
      type: 'health',
      status: 'active',
      details: [
        { label: 'Card Number', value: '0001234567890' },
        { label: 'Family Members', value: '3 (Spouse + 2 Children)' },
        { label: 'Monthly Premium', value: 'Rp 150,000' },
        { label: 'Employer Contribution', value: 'Rp 100,000 (67%)' },
        { label: 'Employee Contribution', value: 'Rp 50,000 (33%)' },
        { label: 'Valid Until', value: 'Active (Monthly)' },
      ],
    },
    {
      id: '2',
      name: 'BPJS Ketenagakerjaan (Employment Insurance)',
      type: 'health',
      status: 'active',
      details: [
        { label: 'Participant Number', value: 'BPJS-TK-9876543210' },
        { label: 'Programs Covered', value: 'JKK, JKM, JHT, JP' },
        { label: 'JHT Balance', value: 'Rp 45,200,000' },
        { label: 'JP (Pension) Balance', value: 'Rp 12,400,000' },
        { label: 'Last Contribution', value: 'November 2025' },
      ],
    },
    {
      id: '3',
      name: 'Annual Leave Balance',
      type: 'leave',
      status: 'active',
      details: [
        { label: 'Annual Leave', value: '8 days remaining (of 12)' },
        { label: 'Sick Leave', value: 'Unlimited (with doctor note)' },
        { label: 'Emergency Leave', value: '2 days remaining' },
        { label: 'Maternity/Paternity', value: 'Not used (90/3 days)' },
        { label: 'Carry Forward', value: '3 days from 2024' },
      ],
    },
    {
      id: '4',
      name: 'Pension Fund',
      type: 'pension',
      status: 'active',
      details: [
        { label: 'Total Balance', value: 'Rp 156,000,000' },
        { label: 'Employee Contribution', value: '2% of salary' },
        { label: 'Employer Contribution', value: '3% of salary' },
        { label: 'Average Return', value: '8.5% per year' },
        { label: 'Vesting Period', value: 'Fully vested after 5 years' },
        { label: 'Time to Vesting', value: '2 years remaining' },
      ],
    },
  ];

  const leaveBalance = {
    annual: { total: 12, used: 4, remaining: 8 },
    sick: { total: 0, used: 2, remaining: 0 }, // Unlimited
    emergency: { total: 3, used: 1, remaining: 2 },
  };

  const bpjsContributions = {
    kesehatan: {
      employee: 50000,
      employer: 100000,
      total: 150000,
    },
    ketenagakerjaan: {
      jht: 250000, // 5.7% total
      jp: 120000, // 3% total
      jkk: 30000, // 0.24-1.74%
      jkm: 15000, // 0.3%
      total: 415000,
    },
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'health':
        return Heart;
      case 'pension':
        return PiggyBank;
      case 'leave':
        return Calendar;
      case 'loan':
        return TrendingUp;
      default:
        return Umbrella;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'health':
        return 'text-red-600';
      case 'pension':
        return 'text-green-600';
      case 'leave':
        return 'text-blue-600';
      case 'loan':
        return 'text-purple-600';
      default:
        return 'text-default-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardBody className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-default-500 mb-1">BPJS Health</p>
                  <p className="text-2xl font-bold">Rp 150K</p>
                  <p className="text-xs text-default-400">Monthly Premium</p>
                </div>
                <div className="p-2 bg-red-50 dark:bg-red-100/10 rounded-lg">
                  <Heart className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-default-500">Employer</span>
                  <span className="font-medium">Rp 100K (67%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-default-500">Employee</span>
                  <span className="font-medium">Rp 50K (33%)</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardBody className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-default-500 mb-1">Annual Leave</p>
                  <p className="text-2xl font-bold">{leaveBalance.annual.remaining} Days</p>
                  <p className="text-xs text-default-400">Remaining (of {leaveBalance.annual.total})</p>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-100/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <Progress
                value={(leaveBalance.annual.remaining / leaveBalance.annual.total) * 100}
                color="primary"
                size="sm"
                className="mb-2"
              />
              <p className="text-xs text-default-500">Used: {leaveBalance.annual.used} days</p>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardBody className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-default-500 mb-1">Pension Fund</p>
                  <p className="text-2xl font-bold">Rp 156M</p>
                  <p className="text-xs text-default-400">Total Balance</p>
                </div>
                <div className="p-2 bg-green-50 dark:bg-green-100/10 rounded-lg">
                  <PiggyBank className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm text-success font-medium">+8.5% avg return</span>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Benefits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {benefits.map((benefit, index) => {
          const Icon = getTypeIcon(benefit.type);
          const iconColor = getTypeColor(benefit.type);

          return (
            <motion.div
              key={benefit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${benefit.type === 'health' ? 'bg-red-50 dark:bg-red-100/10' : benefit.type === 'pension' ? 'bg-green-50 dark:bg-green-100/10' : 'bg-blue-50 dark:bg-blue-100/10'}`}>
                        <Icon className={`h-5 w-5 ${iconColor}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{benefit.name}</h3>
                        <Chip color="success" variant="flat" size="sm" className="mt-1">
                          {benefit.status}
                        </Chip>
                      </div>
                    </div>
                    <Button
                      isIconOnly
                      variant="flat"
                      size="sm"
                      startContent={<ExternalLink className="h-4 w-4" />}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="space-y-3">
                    {benefit.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-start py-2 border-b border-default-100 last:border-0"
                      >
                        <span className="text-sm text-default-500">{detail.label}</span>
                        <span className="text-sm font-medium text-right">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Quick Actions</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Button variant="bordered" startContent={<Download className="h-4 w-4" />}>
              Download BPJS Card
            </Button>
            <Button variant="bordered" startContent={<Download className="h-4 w-4" />}>
              View Contribution History
            </Button>
            <Button variant="bordered" startContent={<Download className="h-4 w-4" />}>
              Request Benefits Statement
            </Button>
            <Button variant="bordered" startContent={<ExternalLink className="h-4 w-4" />}>
              BPJS Portal
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
