'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
} from '@heroui/react';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  PauseCircle,
  PlayCircle,
  Trash2,
  Building2
} from 'lucide-react';
import { useRealtimeTenants } from '@/lib/realtime/use-realtime-tenants';

// Mock data - will be replaced with real API
const mockTenants = [
  {
    id: '1',
    companyName: 'PT Maju Bersama',
    slug: 'maju-bersama',
    primaryAdmin: { firstName: 'Budi', lastName: 'Santoso', email: 'budi@majubersama.com' },
    subscriptionPlan: 'professional',
    subscriptionStatus: 'active',
    currentEmployeeCount: 45,
    maxEmployees: 200,
    status: 'active',
    createdAt: '2024-10-15T10:30:00Z',
  },
  {
    id: '2',
    companyName: 'CV Digital Solutions',
    slug: 'digital-solutions',
    primaryAdmin: { firstName: 'Ani', lastName: 'Wijaya', email: 'ani@digital-solutions.com' },
    subscriptionPlan: 'starter',
    subscriptionStatus: 'active',
    currentEmployeeCount: 28,
    maxEmployees: 50,
    status: 'active',
    createdAt: '2024-11-01T14:20:00Z',
  },
  {
    id: '3',
    companyName: 'PT Tech Inovasi',
    slug: 'tech-inovasi',
    primaryAdmin: { firstName: 'Rizki', lastName: 'Pratama', email: 'rizki@techinovasi.com' },
    subscriptionPlan: 'trial',
    subscriptionStatus: 'trial',
    currentEmployeeCount: 8,
    maxEmployees: 10,
    status: 'active',
    createdAt: '2024-11-15T09:00:00Z',
  },
  {
    id: '4',
    companyName: 'UD Sejahtera',
    slug: 'sejahtera',
    primaryAdmin: { firstName: 'Siti', lastName: 'Rahma', email: 'siti@sejahtera.com' },
    subscriptionPlan: 'starter',
    subscriptionStatus: 'suspended',
    currentEmployeeCount: 15,
    maxEmployees: 50,
    status: 'suspended',
    createdAt: '2024-09-10T11:45:00Z',
  },
];

const statusColors = {
  active: 'success',
  trial: 'primary',
  suspended: 'warning',
  cancelled: 'danger',
} as const;

const planColors = {
  trial: 'default',
  starter: 'primary',
  professional: 'secondary',
  enterprise: 'success',
} as const;

export function TenantListTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use real-time hook for automatic updates
  const { tenants, setTenants } = useRealtimeTenants([]);

  useEffect(() => {
    async function fetchTenants() {
      try {
        setLoading(true);

        // Build query params
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (planFilter !== 'all') params.append('plan', planFilter);

        const response = await fetch(`/api/platform/tenants?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch tenants');
        }

        const result = await response.json();
        setTenants(result.data || []);
      } catch (err) {
        console.error('Error fetching tenants:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tenants');
      } finally {
        setLoading(false);
      }
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchTenants();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, statusFilter, planFilter, setTenants]);

  const filteredTenants = tenants;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tenants..."
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
                  Status: {statusFilter === 'all' ? 'All' : statusFilter}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Filter by status"
                onAction={(key) => setStatusFilter(key as string)}
              >
                <DropdownItem key="all">All Status</DropdownItem>
                <DropdownItem key="active">Active</DropdownItem>
                <DropdownItem key="trial">Trial</DropdownItem>
                <DropdownItem key="suspended">Suspended</DropdownItem>
                <DropdownItem key="cancelled">Cancelled</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  startContent={<Filter className="w-4 h-4" />}
                  className="w-full md:w-auto"
                >
                  Plan: {planFilter === 'all' ? 'All' : planFilter}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Filter by plan"
                onAction={(key) => setPlanFilter(key as string)}
              >
                <DropdownItem key="all">All Plans</DropdownItem>
                <DropdownItem key="trial">Trial</DropdownItem>
                <DropdownItem key="starter">Starter</DropdownItem>
                <DropdownItem key="professional">Professional</DropdownItem>
                <DropdownItem key="enterprise">Enterprise</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          <div className="flex items-center gap-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Showing {filteredTenants.length} of {mockTenants.length} tenants</span>
          </div>
        </CardBody>
      </Card>

      {/* Tenants Table */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Employees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <Link
                            href={`/(platform-admin)/tenants/${tenant.id}`}
                            className="font-medium text-gray-900 dark:text-white hover:text-primary transition-colors"
                          >
                            {tenant.companyName}
                          </Link>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {tenant.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {tenant.primaryAdmin.firstName} {tenant.primaryAdmin.lastName}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          {tenant.primaryAdmin.email}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <Chip
                        size="sm"
                        color={planColors[tenant.subscriptionPlan as keyof typeof planColors]}
                        variant="flat"
                      >
                        {tenant.subscriptionPlan}
                      </Chip>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <Chip
                        size="sm"
                        color={statusColors[tenant.subscriptionStatus as keyof typeof statusColors]}
                        variant="flat"
                      >
                        {tenant.subscriptionStatus}
                      </Chip>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {tenant.currentEmployeeCount} / {tenant.maxEmployees}
                        </p>
                        <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${(tenant.currentEmployeeCount / tenant.maxEmployees) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(tenant.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Tenant actions">
                          <DropdownItem
                            key="view"
                            startContent={<Eye className="w-4 h-4" />}
                          >
                            View Details
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<Edit className="w-4 h-4" />}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="suspend"
                            startContent={
                              tenant.status === 'suspended' ?
                                <PlayCircle className="w-4 h-4" /> :
                                <PauseCircle className="w-4 h-4" />
                            }
                            className={tenant.status === 'suspended' ? 'text-success' : 'text-warning'}
                          >
                            {tenant.status === 'suspended' ? 'Activate' : 'Suspend'}
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Trash2 className="w-4 h-4" />}
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTenants.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No tenants found matching your filters
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
