import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkflowList } from '../WorkflowList';

// Mock the hooks
vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    employerId: 'test-employer-123',
    user: { id: 'test-user', email: 'test@example.com', role: 'employer' },
    isAuthenticated: true,
  }),
}));

vi.mock('@/lib/hooks/useWorkflows', () => ({
  useWorkflows: vi.fn(),
}));

import { useWorkflows } from '@/lib/hooks/useWorkflows';

describe('WorkflowList', () => {
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

  it('should render loading state', () => {
    vi.mocked(useWorkflows).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<WorkflowList />, { wrapper });

    expect(screen.getByText(/loading workflows/i)).toBeInTheDocument();
  });

  it('should display workflow statistics', async () => {
    const mockData = {
      workflows: [
        {
          id: '1',
          workflowName: 'Employee Onboarding',
          workflowType: 'onboarding',
          status: 'in_progress',
          progressPercentage: 50,
          totalSteps: 10,
          completedSteps: 5,
          currentStep: 5,
          startedAt: new Date().toISOString(),
          entityType: 'employee',
          entityId: 'emp-1',
          employerId: 'test-employer-123',
          autoApproved: false,
          stepsConfig: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          workflowName: 'Leave Approval',
          workflowType: 'leave_approval',
          status: 'completed',
          progressPercentage: 100,
          totalSteps: 5,
          completedSteps: 5,
          currentStep: 5,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          entityType: 'leave',
          entityId: 'leave-1',
          employerId: 'test-employer-123',
          autoApproved: true,
          aiConfidenceScore: 0.95,
          stepsConfig: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 2,
    };

    vi.mocked(useWorkflows).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any);

    render(<WorkflowList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Total Workflows')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Total Runs')).toBeInTheDocument();
      expect(screen.getByText('Avg Progress')).toBeInTheDocument();
    });

    // Verify counts
    expect(screen.getByText('2')).toBeInTheDocument(); // Total workflows
  });

  it('should display workflow cards', async () => {
    const mockData = {
      workflows: [
        {
          id: '1',
          workflowName: 'Employee Onboarding - John Doe',
          workflowType: 'onboarding',
          status: 'in_progress',
          progressPercentage: 75,
          totalSteps: 12,
          completedSteps: 9,
          currentStep: 9,
          startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          entityType: 'employee',
          entityId: 'emp-1',
          employerId: 'test-employer-123',
          autoApproved: false,
          stepsConfig: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 1,
    };

    vi.mocked(useWorkflows).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any);

    render(<WorkflowList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/employee onboarding/i)).toBeInTheDocument();
      expect(screen.getByText(/75%/)).toBeInTheDocument();
      expect(screen.getByText(/9\/12/)).toBeInTheDocument();
    });
  });

  it('should show empty state when no workflows', async () => {
    vi.mocked(useWorkflows).mockReturnValue({
      data: { workflows: [], total: 0 },
      isLoading: false,
      error: null,
    } as any);

    render(<WorkflowList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/no workflows found/i)).toBeInTheDocument();
      expect(screen.getByText(/create your first workflow/i)).toBeInTheDocument();
    });
  });

  it('should filter workflows by tab', async () => {
    const user = userEvent.setup();

    const mockData = {
      workflows: [
        {
          id: '1',
          workflowName: 'Onboarding 1',
          workflowType: 'onboarding',
          status: 'in_progress',
          progressPercentage: 50,
          totalSteps: 10,
          completedSteps: 5,
          currentStep: 5,
          startedAt: new Date().toISOString(),
          entityType: 'employee',
          entityId: 'emp-1',
          employerId: 'test-employer-123',
          autoApproved: false,
          stepsConfig: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 1,
    };

    vi.mocked(useWorkflows).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any);

    render(<WorkflowList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /all workflows/i })).toBeInTheDocument();
    });

    const inProgressTab = screen.getByRole('tab', { name: /in progress/i });
    await user.click(inProgressTab);

    // Tab should be selected
    expect(inProgressTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should display AI auto-approved badge', async () => {
    const mockData = {
      workflows: [
        {
          id: '1',
          workflowName: 'Auto Approved Workflow',
          workflowType: 'leave_approval',
          status: 'completed',
          progressPercentage: 100,
          totalSteps: 5,
          completedSteps: 5,
          currentStep: 5,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          entityType: 'leave',
          entityId: 'leave-1',
          employerId: 'test-employer-123',
          autoApproved: true,
          aiConfidenceScore: 0.92,
          stepsConfig: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 1,
    };

    vi.mocked(useWorkflows).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any);

    render(<WorkflowList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/ai auto-approved/i)).toBeInTheDocument();
      expect(screen.getByText(/confidence: 92%/i)).toBeInTheDocument();
    });
  });

  it('should display workflow progress bar', async () => {
    const mockData = {
      workflows: [
        {
          id: '1',
          workflowName: 'Test Workflow',
          workflowType: 'onboarding',
          status: 'in_progress',
          progressPercentage: 60,
          totalSteps: 10,
          completedSteps: 6,
          currentStep: 6,
          startedAt: new Date().toISOString(),
          entityType: 'employee',
          entityId: 'emp-1',
          employerId: 'test-employer-123',
          autoApproved: false,
          stepsConfig: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 1,
    };

    vi.mocked(useWorkflows).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any);

    render(<WorkflowList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('60%')).toBeInTheDocument();
    });
  });

  it('should show relative time since started', async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const mockData = {
      workflows: [
        {
          id: '1',
          workflowName: 'Recent Workflow',
          workflowType: 'onboarding',
          status: 'in_progress',
          progressPercentage: 30,
          totalSteps: 10,
          completedSteps: 3,
          currentStep: 3,
          startedAt: twoHoursAgo,
          entityType: 'employee',
          entityId: 'emp-1',
          employerId: 'test-employer-123',
          autoApproved: false,
          stepsConfig: [],
          createdAt: twoHoursAgo,
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 1,
    };

    vi.mocked(useWorkflows).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any);

    render(<WorkflowList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/ago/i)).toBeInTheDocument();
    });
  });

  it('should display workflow status chip', async () => {
    const mockData = {
      workflows: [
        {
          id: '1',
          workflowName: 'Completed Workflow',
          workflowType: 'onboarding',
          status: 'completed',
          progressPercentage: 100,
          totalSteps: 10,
          completedSteps: 10,
          currentStep: 10,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          entityType: 'employee',
          entityId: 'emp-1',
          employerId: 'test-employer-123',
          autoApproved: false,
          stepsConfig: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 1,
    };

    vi.mocked(useWorkflows).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any);

    render(<WorkflowList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/completed/i)).toBeInTheDocument();
    });
  });

  it('should show workflow entity type', async () => {
    const mockData = {
      workflows: [
        {
          id: '1',
          workflowName: 'Employee Workflow',
          workflowType: 'onboarding',
          status: 'in_progress',
          progressPercentage: 50,
          totalSteps: 10,
          completedSteps: 5,
          currentStep: 5,
          startedAt: new Date().toISOString(),
          entityType: 'employee',
          entityId: 'emp-1',
          employerId: 'test-employer-123',
          autoApproved: false,
          stepsConfig: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 1,
    };

    vi.mocked(useWorkflows).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any);

    render(<WorkflowList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/employee/i)).toBeInTheDocument();
    });
  });
});
