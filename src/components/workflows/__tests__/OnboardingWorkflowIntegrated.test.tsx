import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnboardingWorkflowIntegrated } from '../OnboardingWorkflowIntegrated';

// Mock the hooks
vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    employerId: 'test-employer-123',
    user: { id: 'test-user', email: 'test@example.com', role: 'employer' },
    isAuthenticated: true,
  }),
}));

vi.mock('@/lib/hooks/useWorkflows', () => ({
  useWorkflow: vi.fn(),
  useUpdateWorkflowStep: vi.fn(),
}));

vi.mock('@/lib/hooks/useEmployees', () => ({
  useEmployee: vi.fn(),
}));

import { useWorkflow, useUpdateWorkflowStep } from '@/lib/hooks/useWorkflows';
import { useEmployee } from '@/lib/hooks/useEmployees';

describe('OnboardingWorkflowIntegrated', () => {
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

  const mockEmployee = {
    id: 'emp-1',
    fullName: 'John Doe',
    email: 'john@example.com',
    position: 'Software Engineer',
    department: 'Engineering',
    joinDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const mockWorkflow = {
    id: 'workflow-1',
    workflowName: 'Employee Onboarding',
    workflowType: 'onboarding',
    status: 'in_progress',
    progressPercentage: 30,
    totalSteps: 20,
    completedSteps: 6,
    currentStep: 6,
    startedAt: new Date().toISOString(),
    entityType: 'employee',
    entityId: 'emp-1',
    employerId: 'test-employer-123',
    autoApproved: false,
    stepsConfig: [
      {
        step: 1,
        name: 'Send welcome email',
        type: 'email',
        status: 'completed',
        completedAt: new Date().toISOString(),
      },
      {
        step: 2,
        name: 'Create employee account',
        type: 'system_setup',
        status: 'completed',
        completedAt: new Date().toISOString(),
      },
      {
        step: 3,
        name: 'Setup email account',
        type: 'system_setup',
        status: 'pending',
        completedAt: null,
      },
      {
        step: 6,
        name: 'Office tour',
        type: 'orientation',
        status: 'pending',
        completedAt: null,
      },
      {
        step: 11,
        name: 'Team introduction',
        type: 'orientation',
        status: 'pending',
        completedAt: null,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('should render loading state', () => {
    vi.mocked(useWorkflow).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    vi.mocked(useEmployee).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<OnboardingWorkflowIntegrated workflowId="workflow-1" employeeId="emp-1" />, { wrapper });

    expect(screen.getByText(/loading onboarding workflow/i)).toBeInTheDocument();
  });

  it('should display employee information', async () => {
    vi.mocked(useWorkflow).mockReturnValue({
      data: mockWorkflow,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useEmployee).mockReturnValue({
      data: mockEmployee,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useUpdateWorkflowStep).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<OnboardingWorkflowIntegrated workflowId="workflow-1" employeeId="emp-1" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText(/Software Engineer/i)).toBeInTheDocument();
      expect(screen.getByText(/Engineering/i)).toBeInTheDocument();
    });
  });

  it('should display onboarding progress', async () => {
    vi.mocked(useWorkflow).mockReturnValue({
      data: mockWorkflow,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useEmployee).mockReturnValue({
      data: mockEmployee,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useUpdateWorkflowStep).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<OnboardingWorkflowIntegrated workflowId="workflow-1" employeeId="emp-1" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText(/6 of 20 tasks completed/i)).toBeInTheDocument();
    });
  });

  it('should display workflow statistics', async () => {
    vi.mocked(useWorkflow).mockReturnValue({
      data: mockWorkflow,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useEmployee).mockReturnValue({
      data: mockEmployee,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useUpdateWorkflowStep).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<OnboardingWorkflowIntegrated workflowId="workflow-1" employeeId="emp-1" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('6 Tasks')).toBeInTheDocument(); // Completed
      expect(screen.getByText('14 Tasks')).toBeInTheDocument(); // Pending (20-6)
      expect(screen.getByText('6 of 20')).toBeInTheDocument(); // Current step
    });
  });

  it('should display onboarding timeline', async () => {
    vi.mocked(useWorkflow).mockReturnValue({
      data: mockWorkflow,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useEmployee).mockReturnValue({
      data: mockEmployee,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useUpdateWorkflowStep).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<OnboardingWorkflowIntegrated workflowId="workflow-1" employeeId="emp-1" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Onboarding Timeline')).toBeInTheDocument();
      expect(screen.getByText('Pre-boarding')).toBeInTheDocument();
    });
  });

  it('should display onboarding tasks with checkboxes', async () => {
    vi.mocked(useWorkflow).mockReturnValue({
      data: mockWorkflow,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useEmployee).mockReturnValue({
      data: mockEmployee,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useUpdateWorkflowStep).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<OnboardingWorkflowIntegrated workflowId="workflow-1" employeeId="emp-1" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Send welcome email')).toBeInTheDocument();
      expect(screen.getByText('Create employee account')).toBeInTheDocument();
      expect(screen.getByText('Setup email account')).toBeInTheDocument();
    });
  });

  it('should handle task toggle', async () => {
    const user = userEvent.setup();
    const mockUpdate = vi.fn().mockResolvedValue({});

    vi.mocked(useWorkflow).mockReturnValue({
      data: mockWorkflow,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useEmployee).mockReturnValue({
      data: mockEmployee,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useUpdateWorkflowStep).mockReturnValue({
      mutateAsync: mockUpdate,
      isPending: false,
    } as any);

    render(<OnboardingWorkflowIntegrated workflowId="workflow-1" employeeId="emp-1" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Setup email account')).toBeInTheDocument();
    });

    // Find checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    const uncheckedCheckbox = checkboxes.find((cb) => !(cb as HTMLInputElement).checked);

    if (uncheckedCheckbox) {
      await user.click(uncheckedCheckbox);

      expect(mockUpdate).toHaveBeenCalledWith({
        workflowId: 'workflow-1',
        stepNumber: expect.any(Number),
        status: 'completed',
      });
    }
  });

  it('should show days until start', async () => {
    vi.mocked(useWorkflow).mockReturnValue({
      data: mockWorkflow,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useEmployee).mockReturnValue({
      data: mockEmployee,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useUpdateWorkflowStep).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<OnboardingWorkflowIntegrated workflowId="workflow-1" employeeId="emp-1" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/days until start/i)).toBeInTheDocument();
    });
  });

  it('should show export checklist button', async () => {
    vi.mocked(useWorkflow).mockReturnValue({
      data: mockWorkflow,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useEmployee).mockReturnValue({
      data: mockEmployee,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useUpdateWorkflowStep).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<OnboardingWorkflowIntegrated workflowId="workflow-1" employeeId="emp-1" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Export Checklist')).toBeInTheDocument();
    });
  });

  it('should show not found when workflow missing', async () => {
    vi.mocked(useWorkflow).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useEmployee).mockReturnValue({
      data: mockEmployee,
      isLoading: false,
      error: null,
    } as any);

    render(<OnboardingWorkflowIntegrated workflowId="workflow-1" employeeId="emp-1" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Workflow not found')).toBeInTheDocument();
    });
  });

  it('should display completed tasks with strikethrough', async () => {
    vi.mocked(useWorkflow).mockReturnValue({
      data: mockWorkflow,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useEmployee).mockReturnValue({
      data: mockEmployee,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useUpdateWorkflowStep).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<OnboardingWorkflowIntegrated workflowId="workflow-1" employeeId="emp-1" />, { wrapper });

    await waitFor(() => {
      const completedTask = screen.getByText('Send welcome email');
      expect(completedTask).toHaveClass('line-through');
    });
  });

  it('should group tasks by phase', async () => {
    vi.mocked(useWorkflow).mockReturnValue({
      data: mockWorkflow,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useEmployee).mockReturnValue({
      data: mockEmployee,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useUpdateWorkflowStep).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<OnboardingWorkflowIntegrated workflowId="workflow-1" employeeId="emp-1" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Pre-boarding')).toBeInTheDocument();
      expect(screen.getByText(/Day -7 to Day 0/i)).toBeInTheDocument();
    });
  });
});
