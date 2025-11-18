'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardBody,
  Spinner,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Select,
  SelectItem,
  useDisclosure,
} from '@heroui/react';
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Lock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { CreateRoleModal } from '@/components/platform/CreateRoleModal';
import { EditRoleModal } from '@/components/platform/EditRoleModal';

interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: 'platform' | 'tenant';
  permissions: string[];
  scope: string;
  is_system_role: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const createModal = useDisclosure();
  const editModal = useDisclosure();

  // Fetch roles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }

      const response = await fetch(`/api/platform/roles?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }

      const { data } = await response.json();
      setRoles(data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [typeFilter]);

  // Toggle role active state
  const toggleActive = async (role: Role) => {
    if (role.is_system_role) {
      toast.error('Cannot deactivate system roles');
      return;
    }

    try {
      const response = await fetch(`/api/platform/roles/${role.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !role.is_active }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      toast.success(`Role ${!role.is_active ? 'activated' : 'deactivated'}`);
      fetchRoles();
    } catch (error) {
      console.error('Error toggling role:', error);
      toast.error('Failed to update role');
    }
  };

  // Delete role
  const deleteRole = async (role: Role) => {
    if (role.is_system_role) {
      toast.error('Cannot delete system roles');
      return;
    }

    if (!confirm(`Are you sure you want to delete the "${role.name}" role? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/platform/roles/${role.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete role');
      }

      toast.success('Role deleted successfully');
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete role');
    }
  };

  // Handle edit
  const handleEdit = (role: Role) => {
    if (role.is_system_role) {
      toast.error('System roles cannot be edited');
      return;
    }
    setSelectedRole(role);
    editModal.onOpen();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Platform Roles
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage roles and permissions for platform and tenant users
            </p>
          </div>
        </div>
        <Button
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
          onPress={createModal.onOpen}
        >
          Create Role
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex gap-4">
            <Select
              label="Role Type"
              placeholder="All types"
              className="w-full sm:w-64"
              selectedKeys={[typeFilter]}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <SelectItem key="all" value="all">All Roles</SelectItem>
              <SelectItem key="platform" value="platform">Platform Roles</SelectItem>
              <SelectItem key="tenant" value="tenant">Tenant Roles</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Roles Table */}
      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Spinner size="lg" />
            </div>
          ) : roles.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Shield className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No roles found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first custom role'}
              </p>
              {typeFilter === 'all' && (
                <Button
                  color="primary"
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={createModal.onOpen}
                >
                  Create Role
                </Button>
              )}
            </div>
          ) : (
            <Table aria-label="Roles table">
              <TableHeader>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>PERMISSIONS</TableColumn>
                <TableColumn>SCOPE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {role.name}
                          </span>
                          {role.is_system_role && (
                            <Lock className="w-4 h-4 text-warning-500" title="System Role" />
                          )}
                        </div>
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                          {role.slug}
                        </span>
                        {role.description && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                            {role.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={role.type === 'platform' ? 'secondary' : 'primary'}
                      >
                        {role.type === 'platform' ? 'Platform' : 'Tenant'}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {role.permissions.length}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          permissions
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat">
                        {role.scope}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {role.is_active ? (
                        <Chip
                          size="sm"
                          variant="flat"
                          color="success"
                          startContent={<CheckCircle2 className="w-3 h-3" />}
                        >
                          Active
                        </Chip>
                      ) : (
                        <Chip
                          size="sm"
                          variant="flat"
                          color="default"
                          startContent={<XCircle className="w-3 h-3" />}
                        >
                          Inactive
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Role actions">
                          <DropdownItem
                            key="edit"
                            startContent={<Edit className="w-4 h-4" />}
                            onPress={() => handleEdit(role)}
                            isDisabled={role.is_system_role}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="toggle-active"
                            onPress={() => toggleActive(role)}
                            isDisabled={role.is_system_role}
                          >
                            {role.is_active ? 'Deactivate' : 'Activate'}
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Trash2 className="w-4 h-4" />}
                            onPress={() => deleteRole(role)}
                            isDisabled={role.is_system_role}
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Modals */}
      <CreateRoleModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        onSuccess={() => {
          createModal.onClose();
          fetchRoles();
        }}
      />

      {selectedRole && (
        <EditRoleModal
          isOpen={editModal.isOpen}
          onClose={() => {
            editModal.onClose();
            setSelectedRole(null);
          }}
          role={selectedRole}
          onSuccess={() => {
            editModal.onClose();
            setSelectedRole(null);
            fetchRoles();
          }}
        />
      )}
    </div>
  );
}
