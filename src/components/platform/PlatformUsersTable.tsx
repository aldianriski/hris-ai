'use client';

import { useState } from 'react';
import {
  Card,
  CardBody,
  Chip,
  Button,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import {
  Search,
  Filter,
  UserPlus,
  MoreVertical,
  Edit,
  Shield,
  ShieldCheck,
  ShieldAlert,
  DollarSign,
  Mail,
  Calendar
} from 'lucide-react';
import { getRoleDisplayName } from '@/lib/auth/permissions';

// Mock data - will be replaced with real API
const mockPlatformUsers = [
  {
    id: '1',
    email: 'admin@hris.com',
    fullName: 'Super Admin',
    role: 'super_admin',
    isActive: true,
    lastLogin: '2024-11-18T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'platform@hris.com',
    fullName: 'Platform Manager',
    role: 'platform_admin',
    isActive: true,
    lastLogin: '2024-11-18T09:15:00Z',
    createdAt: '2024-02-15T00:00:00Z',
  },
  {
    id: '3',
    email: 'support@hris.com',
    fullName: 'Support Lead',
    role: 'support_admin',
    isActive: true,
    lastLogin: '2024-11-17T16:45:00Z',
    createdAt: '2024-03-10T00:00:00Z',
  },
  {
    id: '4',
    email: 'billing@hris.com',
    fullName: 'Billing Specialist',
    role: 'billing_admin',
    isActive: true,
    lastLogin: '2024-11-18T08:20:00Z',
    createdAt: '2024-04-20T00:00:00Z',
  },
  {
    id: '5',
    email: 'old.admin@hris.com',
    fullName: 'Former Admin',
    role: 'platform_admin',
    isActive: false,
    lastLogin: '2024-10-15T12:00:00Z',
    createdAt: '2024-01-05T00:00:00Z',
  },
];

const roleIcons = {
  super_admin: ShieldAlert,
  platform_admin: ShieldCheck,
  support_admin: Shield,
  billing_admin: DollarSign,
} as const;

const roleColors = {
  super_admin: 'danger',
  platform_admin: 'primary',
  support_admin: 'secondary',
  billing_admin: 'success',
} as const;

export function PlatformUsersTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const filteredUsers = mockPlatformUsers.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search className="w-4 h-4 text-gray-400" />}
                classNames={{
                  input: 'text-sm',
                  inputWrapper: 'h-10',
                }}
              />
            </div>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  startContent={<Filter className="w-4 h-4" />}
                  className="w-full md:w-auto"
                >
                  Role: {roleFilter === 'all' ? 'All' : getRoleDisplayName(roleFilter as any)}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Filter by role"
                onAction={(key) => setRoleFilter(key as string)}
              >
                <DropdownItem key="all">All Roles</DropdownItem>
                <DropdownItem key="super_admin">Super Admin</DropdownItem>
                <DropdownItem key="platform_admin">Platform Admin</DropdownItem>
                <DropdownItem key="support_admin">Support Admin</DropdownItem>
                <DropdownItem key="billing_admin">Billing Admin</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  startContent={<Filter className="w-4 h-4" />}
                  className="w-full md:w-auto"
                >
                  Status: {statusFilter === 'all' ? 'All' : statusFilter}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Filter by status"
                onAction={(key) => setStatusFilter(key as string)}
              >
                <DropdownItem key="all">All Status</DropdownItem>
                <DropdownItem key="active">Active</DropdownItem>
                <DropdownItem key="inactive">Inactive</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Button
              color="primary"
              startContent={<UserPlus className="w-4 h-4" />}
              className="w-full md:w-auto"
            >
              Add User
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Users Table */}
      <Card>
        <CardBody>
          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">No users found</p>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const RoleIcon = roleIcons[user.role as keyof typeof roleIcons] || Shield;

                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                        <RoleIcon className="w-6 h-6 text-white" />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {user.fullName}
                          </h4>
                          <Chip
                            size="sm"
                            color={roleColors[user.role as keyof typeof roleColors]}
                            variant="flat"
                            startContent={<RoleIcon className="w-3 h-3" />}
                          >
                            {getRoleDisplayName(user.role as any)}
                          </Chip>
                          <Chip
                            size="sm"
                            color={user.isActive ? 'success' : 'default'}
                            variant="dot"
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Chip>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Last login: {formatDate(user.lastLogin)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly variant="flat" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="User actions">
                        <DropdownItem
                          key="edit"
                          startContent={<Edit className="w-4 h-4" />}
                        >
                          Edit User
                        </DropdownItem>
                        <DropdownItem
                          key="change-role"
                          startContent={<Shield className="w-4 h-4" />}
                        >
                          Change Role
                        </DropdownItem>
                        <DropdownItem
                          key="toggle-status"
                          className={user.isActive ? 'text-warning' : 'text-success'}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                );
              })
            )}
          </div>
        </CardBody>
      </Card>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>
          Showing {filteredUsers.length} of {mockPlatformUsers.length} users
        </span>
        <span>
          {mockPlatformUsers.filter((u) => u.isActive).length} active users
        </span>
      </div>
    </div>
  );
}
