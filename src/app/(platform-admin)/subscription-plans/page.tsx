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
  Switch,
  useDisclosure,
} from '@heroui/react';
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  CreditCard,
  Star,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { CreateSubscriptionPlanModal } from '@/components/platform/CreateSubscriptionPlanModal';
import { EditSubscriptionPlanModal } from '@/components/platform/EditSubscriptionPlanModal';

interface SubscriptionPlan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  pricing_monthly: number;
  pricing_annual: number;
  currency: string;
  per_employee: boolean;
  max_employees: number | null;
  max_storage_gb: number;
  features: string[];
  enabled_modules: string[];
  ai_features_enabled: boolean;
  is_active: boolean;
  is_public: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const createModal = useDisclosure();
  const editModal = useDisclosure();

  // Fetch subscription plans
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/platform/subscription-plans');

      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }

      const { data } = await response.json();
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Toggle plan active state
  const toggleActive = async (plan: SubscriptionPlan) => {
    try {
      const response = await fetch(`/api/platform/subscription-plans/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !plan.is_active }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription plan');
      }

      toast.success(`Plan ${!plan.is_active ? 'activated' : 'deactivated'}`);
      fetchPlans();
    } catch (error) {
      console.error('Error toggling plan:', error);
      toast.error('Failed to update plan');
    }
  };

  // Toggle featured state
  const toggleFeatured = async (plan: SubscriptionPlan) => {
    try {
      const response = await fetch(`/api/platform/subscription-plans/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !plan.is_featured }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription plan');
      }

      toast.success(`Plan ${!plan.is_featured ? 'marked as featured' : 'unfeatured'}`);
      fetchPlans();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Failed to update plan');
    }
  };

  // Delete plan
  const deletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription plan? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/platform/subscription-plans/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete subscription plan');
      }

      toast.success('Subscription plan deleted successfully');
      fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete plan');
    }
  };

  // Handle edit
  const handleEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    editModal.onOpen();
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    if (amount === 0) return 'Contact Sales';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Subscription Plans
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage pricing tiers and features for your platform
            </p>
          </div>
        </div>
        <Button
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
          onPress={createModal.onOpen}
        >
          Create Plan
        </Button>
      </div>

      {/* Plans Table */}
      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Spinner size="lg" />
            </div>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <CreditCard className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No subscription plans found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Get started by creating your first subscription plan
              </p>
              <Button
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                onPress={createModal.onOpen}
              >
                Create Subscription Plan
              </Button>
            </div>
          ) : (
            <Table aria-label="Subscription plans table">
              <TableHeader>
                <TableColumn>PLAN</TableColumn>
                <TableColumn>PRICING</TableColumn>
                <TableColumn>LIMITS</TableColumn>
                <TableColumn>FEATURES</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {plan.name}
                          </span>
                          {plan.is_featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                          {plan.slug}
                        </span>
                        {plan.description && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                            {plan.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="text-sm">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(plan.pricing_monthly, plan.currency)}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">/month</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatCurrency(plan.pricing_annual, plan.currency)}/year
                        </div>
                        {plan.per_employee && (
                          <Chip size="sm" variant="flat" color="secondary">
                            Per Employee
                          </Chip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="text-gray-900 dark:text-white">
                          {plan.max_employees ? `${plan.max_employees} employees` : 'Unlimited'}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {plan.max_storage_gb}GB storage
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {plan.enabled_modules.length} modules
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {plan.ai_features_enabled && (
                          <Chip size="sm" variant="flat" color="secondary">
                            AI
                          </Chip>
                        )}
                        {plan.features.slice(0, 2).map((feature, index) => (
                          <Chip key={index} size="sm" variant="flat">
                            {feature.length > 20 ? `${feature.substring(0, 20)}...` : feature}
                          </Chip>
                        ))}
                        {plan.features.length > 2 && (
                          <Chip size="sm" variant="flat">
                            +{plan.features.length - 2}
                          </Chip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          {plan.is_active ? (
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
                        </div>
                        {plan.is_public && (
                          <Chip size="sm" variant="flat" color="primary">
                            Public
                          </Chip>
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
                        <DropdownMenu aria-label="Plan actions">
                          <DropdownItem
                            key="edit"
                            startContent={<Edit className="w-4 h-4" />}
                            onPress={() => handleEdit(plan)}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="toggle-active"
                            onPress={() => toggleActive(plan)}
                          >
                            {plan.is_active ? 'Deactivate' : 'Activate'}
                          </DropdownItem>
                          <DropdownItem
                            key="toggle-featured"
                            startContent={<Star className="w-4 h-4" />}
                            onPress={() => toggleFeatured(plan)}
                          >
                            {plan.is_featured ? 'Unfeature' : 'Mark as Featured'}
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Trash2 className="w-4 h-4" />}
                            onPress={() => deletePlan(plan.id)}
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
      <CreateSubscriptionPlanModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        onSuccess={() => {
          createModal.onClose();
          fetchPlans();
        }}
      />

      {selectedPlan && (
        <EditSubscriptionPlanModal
          isOpen={editModal.isOpen}
          onClose={() => {
            editModal.onClose();
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          onSuccess={() => {
            editModal.onClose();
            setSelectedPlan(null);
            fetchPlans();
          }}
        />
      )}
    </div>
  );
}
