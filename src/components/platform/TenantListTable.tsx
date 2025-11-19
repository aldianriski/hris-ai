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
  const [totalCount, setTotalCount] = useState(0);

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
        setTotalCount(result.count || result.data?.length || 0);
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
            <span>Showing {filteredTenants.length} {totalCount > filteredTenants.length ? `of ${totalCount}` : ''} tenants</span>
          </div>
        </CardBody>
      </Card>

      {/* Tenants Table */}
      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <Spinner size="lg" color="primary" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading tenants...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Tenants</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <Button color="primary" size="sm" onPress={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Building2 className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tenants found</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'all' || planFilter !== 'all'
                  ? 'Try adjusting your filters to find what you\'re looking for'
                  : 'Get started by creating your first tenant'}
              </p>
              {!searchQuery && statusFilter === 'all' && planFilter === 'all' && (
                <Link href="/(platform-admin)/tenants/new">
                  <Button color="primary" variant="shadow">
                    Create First Tenant
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Employees
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTenants.map((tenant, index) => (
                    <tr
                      key={tenant.id}
                      className="group hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent dark:hover:from-gray-800/50 dark:hover:to-transparent transition-all duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-200">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/(platform-admin)/tenants/${tenant.id}`}
                              className="font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors truncate block"
                            >
                              {tenant.companyName}
                            </Link>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
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
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            {tenant.primaryAdmin.email}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <Chip
                          size="sm"
                          color={planColors[tenant.subscriptionPlan as keyof typeof planColors]}
                          variant="flat"
                          className="capitalize font-medium"
                        >
                          {tenant.subscriptionPlan}
                        </Chip>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <Chip
                          size="sm"
                          color={statusColors[tenant.subscriptionStatus as keyof typeof statusColors]}
                          variant="dot"
                          className="capitalize font-medium"
                        >
                          {tenant.subscriptionStatus}
                        </Chip>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900 dark:text-white mb-1">
                            {tenant.currentEmployeeCount} / {tenant.maxEmployees}
                          </p>
                          <div className="w-28 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 shadow-sm"
                              style={{
                                width: `${(tenant.currentEmployeeCount / tenant.maxEmployees) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(tenant.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
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
          )}
        </CardBody>
      </Card>
    </div>
  );
}
