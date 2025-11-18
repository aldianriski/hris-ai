import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useWorkflows,
  useWorkflow,
  useCreateWorkflow,
  useUpdateWorkflowStep,
  useExecuteWorkflow,
} from '../useWorkflows';
import { toast } from 'sonner';

// Mock fetch globally
global.fetch = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useWorkflows hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useWorkflows', () => {
    it('should fetch workflows list', async () => {
      const mockWorkflows = {
        workflows: [
          { id: 'wf-1', workflowName: 'Onboarding - John Doe', status: 'in_progress', progressPercentage: 50 },
          { id: 'wf-2', workflowName: 'Offboarding - Jane Smith', status: 'completed', progressPercentage: 100 },
        ],
        total: 2,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWorkflows,
      } as Response);

      const { result } = renderHook(() => useWorkflows('employer-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockWorkflows);
      expect(fetch).toHaveBeenCalledWith('/api/v1/workflows?');
    });

    it('should apply filters to fetch workflows', async () => {
      const mockWorkflows = { workflows: [], total: 0 };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWorkflows,
      } as Response);

      renderHook(
        () => useWorkflows('employer-1', { status: 'completed', workflowType: 'onboarding' }),
        { wrapper }
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/v1/workflows?status=completed&workflowType=onboarding');
      });
    });

    it('should not fetch when employerId is null', () => {
      const { result } = renderHook(() => useWorkflows(null), { wrapper });

      expect(result.current.isPending).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should throw error on failed fetch', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const { result } = renderHook(() => useWorkflows('employer-1'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useWorkflow', () => {
    it('should fetch single workflow', async () => {
      const mockWorkflow = {
        id: 'wf-1',
        workflowName: 'Onboarding - John Doe',
        status: 'in_progress',
        progressPercentage: 50,
        stepsConfig: [
          { step: 1, name: 'Task 1', status: 'completed' },
          { step: 2, name: 'Task 2', status: 'pending' },
        ],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWorkflow,
      } as Response);

      const { result } = renderHook(() => useWorkflow('wf-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockWorkflow);
      expect(fetch).toHaveBeenCalledWith('/api/v1/workflows/wf-1');
    });

    it('should not fetch when id is null', () => {
      const { result } = renderHook(() => useWorkflow(null as any), { wrapper });

      expect(result.current.isPending).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('useCreateWorkflow', () => {
    it('should create workflow and show success toast', async () => {
      const newWorkflow = {
        workflowName: 'New Onboarding',
        workflowType: 'onboarding' as const,
        entityType: 'employee' as const,
        entityId: 'emp-1',
        employerId: 'employer-1',
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'wf-3', ...newWorkflow }),
      } as Response);

      const { result } = renderHook(() => useCreateWorkflow(), { wrapper });

      result.current.mutate(newWorkflow);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(fetch).toHaveBeenCalledWith('/api/v1/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkflow),
      });
      expect(toast.success).toHaveBeenCalledWith('Workflow created successfully');
    });

    it('should show error toast on failure', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const { result } = renderHook(() => useCreateWorkflow(), { wrapper });

      result.current.mutate({
        workflowName: 'Test',
        workflowType: 'onboarding',
        entityType: 'employee',
        entityId: 'emp-1',
        employerId: 'employer-1',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Failed to create workflow', {
        description: 'Failed to create workflow',
      });
    });
  });

  describe('useUpdateWorkflowStep', () => {
    it('should update workflow step and show success toast', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const { result } = renderHook(() => useUpdateWorkflowStep(), { wrapper });

      result.current.mutate({
        workflowId: 'wf-1',
        stepNumber: 2,
        status: 'completed',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(fetch).toHaveBeenCalledWith('/api/v1/workflows/wf-1/steps/2', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      expect(toast.success).toHaveBeenCalledWith('Workflow step updated successfully');
    });

    it('should show error toast on failure', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const { result } = renderHook(() => useUpdateWorkflowStep(), { wrapper });

      result.current.mutate({
        workflowId: 'wf-1',
        stepNumber: 2,
        status: 'completed',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Failed to update workflow step', {
        description: 'Failed to update workflow step',
      });
    });
  });

  describe('useExecuteWorkflow', () => {
    it('should execute workflow and show success toast', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, message: 'Workflow executed' }),
      } as Response);

      const { result } = renderHook(() => useExecuteWorkflow(), { wrapper });

      result.current.mutate({ workflowId: 'wf-1' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(fetch).toHaveBeenCalledWith('/api/v1/workflows/wf-1/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(toast.success).toHaveBeenCalledWith('Workflow executed successfully');
    });

    it('should show error toast on failure', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const { result } = renderHook(() => useExecuteWorkflow(), { wrapper });

      result.current.mutate({ workflowId: 'wf-1' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Failed to execute workflow', {
        description: 'Failed to execute workflow',
      });
    });
  });
});
