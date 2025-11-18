'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardBody,
  Input,
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
  Switch,
  useDisclosure,
} from '@heroui/react';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Flag,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { CreateFeatureFlagModal } from '@/components/platform/CreateFeatureFlagModal';
import { EditFeatureFlagModal } from '@/components/platform/EditFeatureFlagModal';

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  rollout_type: 'global' | 'percentage' | 'whitelist' | 'blacklist';
  rollout_percentage: number;
  tenant_whitelist: string[];
  tenant_blacklist: string[];
  enable_at: string | null;
  disable_at: string | null;
  created_at: string;
  updated_at: string;
  created_by_user?: {
    id: string;
    email: string;
    full_name: string | null;
  };
  last_modified_by_user?: {
    id: string;
    email: string;
    full_name: string | null;
  };
}

export default function FeatureFlagsPage() {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [enabledFilter, setEnabledFilter] = useState<string>('all');
  const [rolloutTypeFilter, setRolloutTypeFilter] = useState<string>('all');
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);

  const createModal = useDisclosure();
  const editModal = useDisclosure();

  // Fetch feature flags
  const fetchFeatureFlags = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (enabledFilter !== 'all') {
        params.append('enabled', enabledFilter);
      }
      if (rolloutTypeFilter !== 'all') {
        params.append('rollout_type', rolloutTypeFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/platform/feature-flags?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch feature flags');
      }

      const { data } = await response.json();
      setFeatureFlags(data || []);
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      toast.error('Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatureFlags();
  }, [enabledFilter, rolloutTypeFilter]);

  // Toggle feature flag enabled state
  const toggleEnabled = async (flag: FeatureFlag) => {
    try {
      const response = await fetch(`/api/platform/feature-flags/${flag.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !flag.enabled }),
      });

      if (!response.ok) {
        throw new Error('Failed to update feature flag');
      }

      toast.success(`Feature flag ${!flag.enabled ? 'enabled' : 'disabled'}`);
      fetchFeatureFlags();
    } catch (error) {
      console.error('Error toggling feature flag:', error);
      toast.error('Failed to update feature flag');
    }
  };

  // Delete feature flag
  const deleteFlag = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature flag? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/platform/feature-flags/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete feature flag');
      }

      toast.success('Feature flag deleted successfully');
      fetchFeatureFlags();
    } catch (error) {
      console.error('Error deleting feature flag:', error);
      toast.error('Failed to delete feature flag');
    }
  };

  // Handle edit
  const handleEdit = (flag: FeatureFlag) => {
    setSelectedFlag(flag);
    editModal.onOpen();
  };

  // Handle search
  const handleSearch = () => {
    fetchFeatureFlags();
  };

  // Get rollout badge
  const getRolloutBadge = (flag: FeatureFlag) => {
    const { rollout_type, rollout_percentage, tenant_whitelist, tenant_blacklist } = flag;

    switch (rollout_type) {
      case 'global':
        return <Chip size="sm" variant="flat" color="primary">Global</Chip>;
      case 'percentage':
        return <Chip size="sm" variant="flat" color="secondary">{rollout_percentage}% Rollout</Chip>;
      case 'whitelist':
        return <Chip size="sm" variant="flat" color="success">{tenant_whitelist.length} Tenants</Chip>;
      case 'blacklist':
        return <Chip size="sm" variant="flat" color="warning">{tenant_blacklist.length} Excluded</Chip>;
      default:
        return <Chip size="sm" variant="flat">Unknown</Chip>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Flag className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Feature Flags
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Control feature availability and rollout strategies
            </p>
          </div>
        </div>
        <Button
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
          onPress={createModal.onOpen}
        >
          Create Flag
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              className="flex-1"
              placeholder="Search by key, name, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              endContent={
                searchTerm && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => {
                      setSearchTerm('');
                      fetchFeatureFlags();
                    }}
                  >
                    ×
                  </Button>
                )
              }
            />
            <Select
              label="Status"
              placeholder="All statuses"
              className="w-full sm:w-48"
              selectedKeys={[enabledFilter]}
              onChange={(e) => setEnabledFilter(e.target.value)}
            >
              <SelectItem key="all" value="all">All</SelectItem>
              <SelectItem key="true" value="true">Enabled</SelectItem>
              <SelectItem key="false" value="false">Disabled</SelectItem>
            </Select>
            <Select
              label="Rollout Type"
              placeholder="All types"
              className="w-full sm:w-48"
              selectedKeys={[rolloutTypeFilter]}
              onChange={(e) => setRolloutTypeFilter(e.target.value)}
            >
              <SelectItem key="all" value="all">All Types</SelectItem>
              <SelectItem key="global" value="global">Global</SelectItem>
              <SelectItem key="percentage" value="percentage">Percentage</SelectItem>
              <SelectItem key="whitelist" value="whitelist">Whitelist</SelectItem>
              <SelectItem key="blacklist" value="blacklist">Blacklist</SelectItem>
            </Select>
            <Button
              color="primary"
              variant="flat"
              onPress={handleSearch}
            >
              Search
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Feature Flags Table */}
      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Spinner size="lg" />
            </div>
          ) : featureFlags.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Flag className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No feature flags found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {searchTerm || enabledFilter !== 'all' || rolloutTypeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first feature flag'}
              </p>
              {!searchTerm && enabledFilter === 'all' && rolloutTypeFilter === 'all' && (
                <Button
                  color="primary"
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={createModal.onOpen}
                >
                  Create Feature Flag
                </Button>
              )}
            </div>
          ) : (
            <Table aria-label="Feature flags table">
              <TableHeader>
                <TableColumn>FLAG</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ROLLOUT</TableColumn>
                <TableColumn>LAST MODIFIED</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {featureFlags.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                            {flag.key}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {flag.name}
                        </span>
                        {flag.description && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                            {flag.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        size="sm"
                        isSelected={flag.enabled}
                        onValueChange={() => toggleEnabled(flag)}
                        color={flag.enabled ? 'success' : 'default'}
                      >
                        {flag.enabled ? (
                          <Chip
                            size="sm"
                            variant="flat"
                            color="success"
                            startContent={<CheckCircle2 className="w-3 h-3" />}
                          >
                            Enabled
                          </Chip>
                        ) : (
                          <Chip
                            size="sm"
                            variant="flat"
                            color="default"
                            startContent={<AlertCircle className="w-3 h-3" />}
                          >
                            Disabled
                          </Chip>
                        )}
                      </Switch>
                    </TableCell>
                    <TableCell>
                      {getRolloutBadge(flag)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {new Date(flag.updated_at).toLocaleDateString()}
                        </span>
                        {flag.last_modified_by_user && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            by {flag.last_modified_by_user.email}
                          </span>
                        )}
                      </div>
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
                        <DropdownMenu aria-label="Feature flag actions">
                          <DropdownItem
                            key="edit"
                            startContent={<Edit className="w-4 h-4" />}
                            onPress={() => handleEdit(flag)}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Trash2 className="w-4 h-4" />}
                            onPress={() => deleteFlag(flag.id)}
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
      <CreateFeatureFlagModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        onSuccess={() => {
          createModal.onClose();
          fetchFeatureFlags();
        }}
      />

      {selectedFlag && (
        <EditFeatureFlagModal
          isOpen={editModal.isOpen}
          onClose={() => {
            editModal.onClose();
            setSelectedFlag(null);
          }}
          flag={selectedFlag}
          onSuccess={() => {
            editModal.onClose();
            setSelectedFlag(null);
            fetchFeatureFlags();
          }}
        />
      )}
    </div>
  );
}
