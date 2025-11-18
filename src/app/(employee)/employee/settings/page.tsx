'use client';

import { PageContainer } from '@/components/ui/PageContainer';
import { MFASettings } from '@/components/auth/MFASettings';
import { Card, CardHeader, CardBody, Avatar, Button, Input, Divider } from '@heroui/react';
import { User, Mail, Phone, Bell, Shield } from 'lucide-react';
import { useState } from 'react';

export default function EmployeeSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('security');

  return (
    <PageContainer
      title="Settings"
      subtitle="Manage your account settings and preferences"
    >
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar Navigation */}
        <div className="col-span-12 md:col-span-3">
          <Card>
            <CardBody className="gap-2 p-2">
              <Button
                variant={activeTab === 'profile' ? 'flat' : 'light'}
                className="justify-start"
                startContent={<User className="h-4 w-4" />}
                onPress={() => setActiveTab('profile')}
              >
                Profile
              </Button>
              <Button
                variant={activeTab === 'security' ? 'flat' : 'light'}
                className="justify-start"
                startContent={<Shield className="h-4 w-4" />}
                onPress={() => setActiveTab('security')}
              >
                Security
              </Button>
              <Button
                variant={activeTab === 'notifications' ? 'flat' : 'light'}
                className="justify-start"
                startContent={<Bell className="h-4 w-4" />}
                onPress={() => setActiveTab('notifications')}
              >
                Notifications
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Main Content */}
        <div className="col-span-12 md:col-span-9 space-y-6">
          {activeTab === 'profile' && (
            <>
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Profile Information</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar
                      src="/api/placeholder/100/100"
                      className="w-20 h-20"
                    />
                    <div>
                      <Button size="sm" variant="flat">Change Photo</Button>
                      <p className="text-xs text-default-500 mt-1">JPG, PNG max 2MB</p>
                    </div>
                  </div>

                  <Divider />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      defaultValue="John"
                      startContent={<User className="h-4 w-4 text-default-400" />}
                    />
                    <Input
                      label="Last Name"
                      defaultValue="Doe"
                    />
                    <Input
                      label="Email"
                      type="email"
                      defaultValue="john.doe@company.com"
                      startContent={<Mail className="h-4 w-4 text-default-400" />}
                      classNames={{ base: "col-span-2" }}
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      defaultValue="+62 812 3456 7890"
                      startContent={<Phone className="h-4 w-4 text-default-400" />}
                      classNames={{ base: "col-span-2" }}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="flat">Cancel</Button>
                    <Button color="primary">Save Changes</Button>
                  </div>
                </CardBody>
              </Card>
            </>
          )}

          {activeTab === 'security' && (
            <>
              <MFASettings />

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Change Password</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                  />
                  <Input
                    label="New Password"
                    type="password"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="flat">Cancel</Button>
                    <Button color="primary">Update Password</Button>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Active Sessions</h3>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-default-600">
                    Manage and monitor your active sessions across all devices.
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-default-100 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Current Session</p>
                        <p className="text-xs text-default-500">Chrome on Windows • Jakarta, Indonesia</p>
                      </div>
                      <Button size="sm" color="success" variant="flat" isDisabled>
                        Active
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </>
          )}

          {activeTab === 'notifications' && (
            <>
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Email Notifications</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Leave Approvals</p>
                      <p className="text-xs text-default-500">Get notified when your leave is approved/rejected</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  <Divider />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Payslip Ready</p>
                      <p className="text-xs text-default-500">Get notified when your payslip is available</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  <Divider />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Performance Reviews</p>
                      <p className="text-xs text-default-500">Get notified about performance review cycles</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Push Notifications</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <p className="text-sm text-default-600">
                    Receive push notifications on your mobile device for important updates.
                  </p>
                  <Button color="primary" variant="flat">
                    Enable Push Notifications
                  </Button>
                </CardBody>
              </Card>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
