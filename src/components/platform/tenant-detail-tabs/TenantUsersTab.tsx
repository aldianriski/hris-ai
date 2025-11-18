'use client';

import { Card, CardBody, Button, Chip, Input } from '@heroui/react';
import { Search, UserPlus, Mail, Shield } from 'lucide-react';

interface TenantUsersTabProps {
  tenantId: string;
}

// Mock data
const mockUsers = [
  {
    id: '1',
    firstName: 'Budi',
    lastName: 'Santoso',
    email: 'budi@majubersama.com',
    role: 'Company Admin',
    status: 'active',
    lastLogin: '2024-11-18T10:30:00Z',
  },
  {
    id: '2',
    firstName: 'Ani',
    lastName: 'Wijaya',
    email: 'ani@majubersama.com',
    role: 'HR Manager',
    status: 'active',
    lastLogin: '2024-11-18T09:15:00Z',
  },
  {
    id: '3',
    firstName: 'Rizki',
    lastName: 'Pratama',
    email: 'rizki@majubersama.com',
    role: 'Payroll Manager',
    status: 'active',
    lastLogin: '2024-11-17T16:45:00Z',
  },
];

export function TenantUsersTab({ tenantId }: TenantUsersTabProps) {
  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Users & Access
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage users and their roles for this tenant
          </p>
        </div>

        <Button
          color="primary"
          startContent={<UserPlus className="w-4 h-4" />}
        >
          Add User
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Search users..."
        startContent={<Search className="w-4 h-4 text-gray-400" />}
        classNames={{
          input: 'text-sm',
        }}
      />

      {/* Users List */}
      <div className="space-y-3">
        {mockUsers.map((user) => (
          <Card key={user.id}>
            <CardBody>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>

                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Chip size="sm" color="primary" variant="flat" startContent={<Shield className="w-3 h-3" />}>
                        {user.role}
                      </Chip>
                      <Chip size="sm" color="success" variant="flat">
                        {user.status}
                      </Chip>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last login</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-gray-50 dark:bg-gray-800">
        <CardBody>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total Users:</span>
            <span className="font-medium text-gray-900 dark:text-white">{mockUsers.length}</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
