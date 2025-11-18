'use client';

import { useState, useEffect } from 'react';
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
  Spinner,
  useDisclosure,
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
  Calendar,
  Trash2,
  Power,
} from 'lucide-react';
import { getRoleDisplayName } from '@/lib/auth/permissions';
import { CreatePlatformUserModal } from './CreatePlatformUserModal';
import { EditPlatformUserModal } from './EditPlatformUserModal';

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
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Modals
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('isActive', statusFilter === 'active' ? 'true' : 'false');

      const response = await fetch(`/api/platform/users?${params.toString()}`);

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

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    onEditOpen();
  };

  const handleToggleStatus = async (user: any) => {
    try {
      const response = await fetch(`/api/platform/users/${user.id}`, {
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

      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error('Error toggling user status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleDelete = async (user: any) => {
    if (!confirm(`Are you sure you want to delete ${user.full_name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/platform/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete user');
      }

      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

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

  return (
    <>
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
                onPress={onCreateOpen}
              >
                Add User
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Users Table */}
        <Card>
          <CardBody>
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
                {users.map((user) => {
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
                              {user.full_name}
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
                              color={user.is_active ? 'success' : 'default'}
                              variant="dot"
                            >
                              {user.is_active ? 'Active' : 'Inactive'}
                            </Chip>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span>{user.email}</span>
                            </div>
                            {user.last_login && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Last login: {formatDate(user.last_login)}</span>
                              </div>
                            )}
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
                            onPress={() => handleEdit(user)}
                          >
                            Edit User
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
                            Delete User
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Summary */}
        {!loading && users.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Showing {users.length} users</span>
            <span>{users.filter((u) => u.is_active).length} active users</span>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreatePlatformUserModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        onSuccess={fetchUsers}
      />

      <EditPlatformUserModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        onSuccess={fetchUsers}
        user={selectedUser}
      />
    </>
  );
}
