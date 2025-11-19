import { apiClient } from '../client';

export interface WorkflowInstance {
  id: string;
  workflowName: string;
  workflowType: 'onboarding' | 'offboarding';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progressPercentage: number;
  totalSteps: number;
  completedSteps: number;
  currentStep: number;
  entityType: 'employee';
  entityId: string;
  employerId: string;
  startedAt: string;
  completedAt?: string;
  dueAt?: string;
  autoApproved: boolean;
  aiConfidenceScore?: number;
  stepsConfig: WorkflowStep[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  step: number;
  name: string;
  type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  completedAt: string | null;
}

export interface CreateWorkflowData {
  workflowName: string;
  workflowType: 'onboarding' | 'offboarding';
  entityType: 'employee';
  entityId: string;
  employerId: string;
}

export interface UpdateWorkflowStepData {
  workflowId: string;
  stepNumber: number;
  status: 'completed' | 'failed';
}

export interface WorkflowFilters {
  status?: string;
  workflowType?: string;
}

export const workflowService = {
  /**
   * Get list of workflows
   */
  list: async (employerId: string, filters?: WorkflowFilters) => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.workflowType) params.workflowType = filters.workflowType;

    return apiClient.get<{ workflows: WorkflowInstance[]; total: number }>('/onboarding/workflows', params);
  },

  /**
   * Get single workflow by ID
   */
  getById: async (workflowId: string) => {
    return apiClient.get<WorkflowInstance>(`/onboarding/workflows/${workflowId}`);
  },

  /**
   * Create new workflow
   */
  create: async (data: CreateWorkflowData) => {
    // Map frontend data to backend format
    const backendData = {
      employeeId: data.entityId,
      workflowType: data.workflowType,
    };
    return apiClient.post<WorkflowInstance>('/onboarding/workflows', backendData);
  },

  /**
   * Update workflow step
   */
  updateStep: async (data: UpdateWorkflowStepData) => {
    return apiClient.patch<{ success: boolean }>(
      `/onboarding/workflows/${data.workflowId}/steps/${data.stepNumber}`,
      { status: data.status }
    );
  },

  /**
   * Execute workflow
   */
  execute: async (workflowId: string) => {
    return apiClient.post<{ success: boolean; message: string }>(
      `/onboarding/workflows/${workflowId}/execute`,
      {}
    );
  },
};
