'use client';

import { Card, CardBody, CardHeader, Switch, Input, Button } from '@heroui/react';
import { Save, Globe, Mail, Database, Shield, Zap } from 'lucide-react';

export function PlatformSettings() {
  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          <h3 className="text-lg font-semibold">General Settings</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <Input
              label="Platform Name"
              defaultValue="HRIS Platform"
              description="The name of your platform"
            />
          </div>
          <div>
            <Input
              label="Support Email"
              type="email"
              defaultValue="support@hris.com"
              description="Contact email for customer support"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Allow New Tenant Registrations</p>
              <p className="text-xs text-gray-500">Enable self-service tenant registration</p>
            </div>
            <Switch defaultSelected />
          </div>
        </CardBody>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Email Configuration</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <Input
              label="SMTP Host"
              defaultValue="smtp.gmail.com"
              placeholder="smtp.example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="SMTP Port" type="number" defaultValue="587" />
            <Input label="SMTP User" defaultValue="noreply@hris.com" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Send Welcome Emails</p>
              <p className="text-xs text-gray-500">Automatically send emails to new users</p>
            </div>
            <Switch defaultSelected />
          </div>
        </CardBody>
      </Card>

      {/* Database & Performance */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Database & Performance</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable Query Caching</p>
              <p className="text-xs text-gray-500">Cache frequently used database queries</p>
            </div>
            <Switch defaultSelected />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable Real-time Subscriptions</p>
              <p className="text-xs text-gray-500">Use Supabase realtime for live updates</p>
            </div>
            <Switch defaultSelected />
          </div>
        </CardBody>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Security</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <Input
              label="Session Timeout (minutes)"
              type="number"
              defaultValue="60"
              description="Automatically logout inactive users"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Require 2FA for Platform Admins</p>
              <p className="text-xs text-gray-500">Enforce two-factor authentication</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable Audit Logging</p>
              <p className="text-xs text-gray-500">Log all administrative actions</p>
            </div>
            <Switch defaultSelected />
          </div>
        </CardBody>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Integrations</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Stripe Payment Gateway</p>
              <p className="text-xs text-gray-500">Enable Stripe for payments</p>
            </div>
            <Switch defaultSelected />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Midtrans Payment Gateway</p>
              <p className="text-xs text-gray-500">Enable Midtrans for Indonesian payments</p>
            </div>
            <Switch defaultSelected />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Analytics Tracking</p>
              <p className="text-xs text-gray-500">Google Analytics integration</p>
            </div>
            <Switch />
          </div>
        </CardBody>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button color="primary" size="lg" startContent={<Save className="w-4 h-4" />}>
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
