'use client';

import { Card, CardBody, Chip } from '@heroui/react';
import { Building2, Users, Calendar, MapPin, Globe, DollarSign } from 'lucide-react';

interface TenantOverviewTabProps {
  tenant: any; // TODO: Replace with proper Tenant type
}

export function TenantOverviewTab({ tenant }: TenantOverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {tenant.currentEmployeeCount}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Employees</p>
            <p className="text-xs text-gray-400 mt-1">
              of {tenant.maxEmployees} limit
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <Building2 className="w-8 h-8 text-secondary mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {tenant.industry}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Industry</p>
            <p className="text-xs text-gray-400 mt-1">
              {tenant.companySize} size
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <Calendar className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.floor((Date.now() - new Date(tenant.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Days Active</p>
            <p className="text-xs text-gray-400 mt-1">
              Since {new Date(tenant.createdAt).toLocaleDateString()}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <DollarSign className="w-8 h-8 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {tenant.subscriptionPlan === 'trial' ? 'Free' :
               tenant.subscriptionPlan === 'starter' ? 'Rp 99K' :
               tenant.subscriptionPlan === 'professional' ? 'Rp 299K' : 'Custom'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Cost</p>
            <p className="text-xs text-gray-400 mt-1">
              {tenant.subscriptionPlan} plan
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Company Information */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Company Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                Company Name
              </label>
              <p className="text-gray-900 dark:text-white">{tenant.companyName}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                Slug
              </label>
              <p className="text-gray-900 dark:text-white font-mono text-sm">
                {tenant.slug}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                Industry
              </label>
              <p className="text-gray-900 dark:text-white">{tenant.industry}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                Company Size
              </label>
              <p className="text-gray-900 dark:text-white">{tenant.companySize} employees</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                Status
              </label>
              <Chip
                size="sm"
                color={tenant.status === 'active' ? 'success' : 'warning'}
                variant="flat"
              >
                {tenant.status}
              </Chip>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                Created At
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(tenant.createdAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Primary Administrator */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Primary Administrator
          </h3>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-xl font-bold text-white">
                {tenant.primaryAdmin.firstName[0]}{tenant.primaryAdmin.lastName[0]}
              </span>
            </div>

            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {tenant.primaryAdmin.firstName} {tenant.primaryAdmin.lastName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {tenant.primaryAdmin.email}
              </p>
              <Chip size="sm" color="primary" variant="flat" className="mt-1">
                Company Admin
              </Chip>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Subscription Details */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Subscription Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                Current Plan
              </label>
              <Chip
                size="md"
                color={
                  tenant.subscriptionPlan === 'trial' ? 'default' :
                  tenant.subscriptionPlan === 'starter' ? 'primary' :
                  tenant.subscriptionPlan === 'professional' ? 'secondary' : 'success'
                }
                variant="flat"
              >
                {tenant.subscriptionPlan}
              </Chip>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                Subscription Status
              </label>
              <Chip
                size="md"
                color={
                  tenant.subscriptionStatus === 'active' ? 'success' :
                  tenant.subscriptionStatus === 'trial' ? 'primary' :
                  tenant.subscriptionStatus === 'suspended' ? 'warning' : 'danger'
                }
                variant="flat"
              >
                {tenant.subscriptionStatus}
              </Chip>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                Employee Limit
              </label>
              <p className="text-gray-900 dark:text-white">
                {tenant.currentEmployeeCount} / {tenant.maxEmployees}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-primary rounded-full h-2"
                  style={{
                    width: `${(tenant.currentEmployeeCount / tenant.maxEmployees) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
