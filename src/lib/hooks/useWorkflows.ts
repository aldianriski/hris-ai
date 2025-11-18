import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workflowService } from '../api/services/workflowService';

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
    queryFn: () => workflowService.list(employerId!, filters),
    enabled: !!employerId,
  });
}

/**
 * Fetch single workflow instance
 */
export function useWorkflow(id: string) {
  return useQuery({
    queryKey: workflowKeys.detail(id),
    queryFn: () => workflowService.getById(id),
    enabled: !!id,
  });
}

/**
 * Create workflow instance (e.g., start onboarding for new employee)
 */
export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      employerId: string;
      workflowType: 'onboarding' | 'offboarding';
      entityType: 'employee';
      entityId: string;
      workflowName: string;
    }) => workflowService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
      toast.success('Workflow created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create workflow', {
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
    mutationFn: (data: {
      workflowId: string;
      stepNumber: number;
      status: 'completed' | 'failed';
    }) => workflowService.updateStep(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(variables.workflowId) });
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
      toast.success('Workflow step updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update workflow step', {
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
    mutationFn: (data: { workflowId: string }) => workflowService.execute(data.workflowId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(variables.workflowId) });
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
