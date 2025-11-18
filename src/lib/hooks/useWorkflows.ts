import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Workflow types
export interface WorkflowInstance {
  id: string;
  employerId: string;
  workflowName: string;
  workflowType: 'onboarding' | 'offboarding' | 'leave_approval' | 'document_approval' | 'performance_review' | 'payroll_processing' | 'custom';
  entityType: string;
  entityId: string;
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
  progressPercentage: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  stepsConfig: WorkflowStep[];
  aiConfidenceScore?: number;
  aiDecision?: string;
  aiReasoning?: string;
  autoApproved: boolean;
  assignedTo?: string;
  assignedAt?: string;
  startedAt: string;
  dueAt?: string;
  completedAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  step: number;
  name: string;
  type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  completedAt?: string;
  required_docs?: string[];
  ai_extraction?: boolean;
  timeout_days?: number;
}

export interface WorkflowTemplate {
  id: string;
  employerId?: string;
  templateName: string;
  workflowType: string;
  description?: string;
  steps: WorkflowStep[];
  isActive: boolean;
  isSystemTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

export const workflowKeys = {
  all: ['workflows'] as const,
  lists: () => [...workflowKeys.all, 'list'] as const,
  list: (employerId: string, filters?: any) => [...workflowKeys.lists(), employerId, filters] as const,
  details: () => [...workflowKeys.all, 'detail'] as const,
  detail: (id: string) => [...workflowKeys.details(), id] as const,
  templates: () => [...workflowKeys.all, 'templates'] as const,
};

/**
 * Fetch workflow instances for an employer
 */
export function useWorkflows(employerId: string | null, filters?: { status?: string; workflowType?: string }) {
  return useQuery({
    queryKey: workflowKeys.list(employerId!, filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.workflowType) params.append('workflowType', filters.workflowType);

      const response = await fetch(`/api/v1/workflows?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch workflows');
      return response.json() as Promise<{ workflows: WorkflowInstance[]; total: number }>;
    },
    enabled: !!employerId,
  });
}

/**
 * Fetch single workflow instance
 */
export function useWorkflow(id: string) {
  return useQuery({
    queryKey: workflowKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/v1/workflows/${id}`);
      if (!response.ok) throw new Error('Failed to fetch workflow');
      return response.json() as Promise<WorkflowInstance>;
    },
    enabled: !!id,
  });
}

/**
 * Create workflow instance (e.g., start onboarding for new employee)
 */
export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      employerId: string;
      workflowType: string;
      entityType: string;
      entityId: string;
      workflowName?: string;
    }) => {
      const response = await fetch('/api/v1/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create workflow');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
      toast.success('Workflow started successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to start workflow', {
        description: error.message,
      });
    },
  });
}

/**
 * Update workflow step status
 */
export function useUpdateWorkflowStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workflowId,
      stepNumber,
      status,
    }: {
      workflowId: string;
      stepNumber: number;
      status: 'completed' | 'failed';
    }) => {
      const response = await fetch(`/api/v1/workflows/${workflowId}/steps/${stepNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update workflow step');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(variables.workflowId) });
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
      toast.success('Task updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update task', {
        description: error.message,
      });
    },
  });
}

/**
 * Execute/trigger workflow
 */
export function useExecuteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflowId: string) => {
      const response = await fetch(`/api/v1/workflows/${workflowId}/execute`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to execute workflow');
      return response.json();
    },
    onSuccess: (_, workflowId) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(workflowId) });
      toast.success('Workflow executed successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to execute workflow', {
        description: error.message,
      });
    },
  });
}

/**
 * Fetch workflow templates
 */
export function useWorkflowTemplates(employerId: string | null) {
  return useQuery({
    queryKey: workflowKeys.templates(),
    queryFn: async () => {
      const response = await fetch('/api/v1/workflows/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json() as Promise<WorkflowTemplate[]>;
    },
    enabled: !!employerId,
  });
}
