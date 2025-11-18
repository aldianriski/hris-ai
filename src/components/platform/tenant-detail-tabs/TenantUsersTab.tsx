'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Input,
  Spinner,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import { Search, UserPlus, Mail, Shield, MoreVertical, Edit, Power, Trash2, UserCog } from 'lucide-react';
import { getRoleDisplayName } from '@/lib/auth/permissions';
import { AddTenantUserModal } from './AddTenantUserModal';
import { ImpersonateUserModal } from '../ImpersonateUserModal';

interface TenantUsersTabProps {
  tenantId: string;
}

const roleColors = {
  company_admin: 'danger',
  hr_admin: 'primary',
  payroll_admin: 'success',
  manager: 'secondary',
  employee: 'default',
} as const;

export function TenantUsersTab({ tenantId }: TenantUsersTabProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [tenantInfo, setTenantInfo] = useState<any | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isImpersonateModalOpen,
    onOpen: onImpersonateModalOpen,
    onClose: onImpersonateModalClose
  } = useDisclosure();

  useEffect(() => {
    fetchUsers();
    fetchTenantInfo();
  }, [tenantId, searchQuery]);

  const fetchTenantInfo = async () => {
    try {
      const response = await fetch(`/api/platform/tenants/${tenantId}`);
      if (response.ok) {
        const result = await response.json();
        setTenantInfo(result.tenant);
      }
    } catch (err) {
      console.error('Error fetching tenant info:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/platform/tenants/${tenantId}/users?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const result = await response.json();
      setUsers(result.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = (user: any) => {
    setSelectedUser(user);
    onImpersonateModalOpen();
  };

  const handleToggleStatus = async (user: any) => {
    try {
      const response = await fetch(`/api/platform/tenants/${tenantId}/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !user.is_active,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update user');
      }

      fetchUsers();
    } catch (err) {
      console.error('Error toggling user status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleDelete = async (user: any) => {
    if (!confirm(`Are you sure you want to remove ${user.full_name} from this tenant?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/platform/tenants/${tenantId}/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete user');
      }

      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
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

          <Button color="primary" startContent={<UserPlus className="w-4 h-4" />} onPress={onOpen}>
            Add User
          </Button>
        </div>

        {/* Search */}
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startContent={<Search className="w-4 h-4 text-gray-400" />}
          classNames={{
            input: 'text-sm',
          }}
        />

        {/* Users List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-500">{error}</p>
            <Button size="sm" variant="flat" onPress={fetchUsers} className="mt-4">
              Retry
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <Card key={user.id}>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">
                          {user.full_name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .toUpperCase()
                            .substring(0, 2)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {user.full_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Chip
                            size="sm"
                            color={roleColors[user.role as keyof typeof roleColors] || 'default'}
                            variant="flat"
                            startContent={<Shield className="w-3 h-3" />}
                          >
                            {getRoleDisplayName(user.role)}
                          </Chip>
                          <Chip
                            size="sm"
                            color={user.is_active ? 'success' : 'default'}
                            variant="dot"
                          >
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Chip>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Last login</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDate(user.last_login)}
                        </p>
                      </div>

                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly variant="flat" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="User actions">
                          <DropdownItem
                            key="impersonate"
                            startContent={<UserCog className="w-4 h-4" />}
                            className="text-primary"
                            onPress={() => handleImpersonate(user)}
                          >
                            Impersonate User
                          </DropdownItem>
                          <DropdownItem
                            key="toggle-status"
                            startContent={<Power className="w-4 h-4" />}
                            className={user.is_active ? 'text-warning' : 'text-success'}
                            onPress={() => handleToggleStatus(user)}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            startContent={<Trash2 className="w-4 h-4" />}
                            className="text-danger"
                            color="danger"
                            onPress={() => handleDelete(user)}
                          >
                            Remove User
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        {!loading && users.length > 0 && (
          <Card className="bg-gray-50 dark:bg-gray-800">
            <CardBody>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Users:</span>
                <span className="font-medium text-gray-900 dark:text-white">{users.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600 dark:text-gray-400">Active Users:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {users.filter((u) => u.is_active).length}
                </span>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      <AddTenantUserModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={fetchUsers}
        tenantId={tenantId}
      />

      {selectedUser && tenantInfo && (
        <ImpersonateUserModal
          isOpen={isImpersonateModalOpen}
          onClose={onImpersonateModalClose}
          targetUser={{
            id: selectedUser.id,
            email: selectedUser.email,
            full_name: selectedUser.full_name,
            role: selectedUser.role,
          }}
          tenant={{
            id: tenantInfo.id,
            company_name: tenantInfo.company_name,
          }}
        />
      )}
    </>
  );
}
