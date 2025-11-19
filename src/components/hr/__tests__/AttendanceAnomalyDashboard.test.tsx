import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AttendanceAnomalyDashboard } from '../AttendanceAnomalyDashboard';

// Mock the hooks
vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    employerId: 'test-employer-123',
    user: { id: 'test-user', email: 'test@example.com', role: 'employer' },
    isAuthenticated: true,
  }),
}));

vi.mock('@/lib/hooks/useAttendanceAnomalies', () => ({
  useAttendanceAnomalies: vi.fn(),
  useApproveAnomaly: vi.fn(),
  useRejectAnomaly: vi.fn(),
}));

import { useAttendanceAnomalies, useApproveAnomaly, useRejectAnomaly } from '@/lib/hooks/useAttendanceAnomalies';

describe('AttendanceAnomalyDashboard', () => {
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

  const mockAnomalies = [
    {
      id: 'anomaly-1',
      employeeId: 'emp-1',
      employeeName: 'John Doe',
      date: new Date().toISOString(),
      type: 'location_deviation' as const,
      severity: 'high' as const,
      description: 'Clock-in location 15km from usual office location',
      normalValue: 'Office Building A',
      anomalousValue: 'Remote Location X',
      aiConfidence: 0.92,
      status: 'pending' as const,
      location: {
        normal: { lat: -6.2, lng: 106.8, address: 'Office Building A' },
        anomalous: { lat: -6.3, lng: 106.9, address: 'Remote Location X' },
        distance: 15,
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'anomaly-2',
      employeeId: 'emp-2',
      employeeName: 'Jane Smith',
      date: new Date().toISOString(),
      type: 'time_deviation' as const,
      severity: 'medium' as const,
      description: 'Clock-in time 2 hours earlier than usual pattern',
      normalValue: '09:00 AM',
      anomalousValue: '07:00 AM',
      aiConfidence: 0.85,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    },
  ];

  it('should render loading state', () => {
    vi.mocked(useAttendanceAnomalies).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<AttendanceAnomalyDashboard />, { wrapper });

    expect(screen.getByText(/loading attendance anomalies/i)).toBeInTheDocument();
  });

  it('should display statistics cards', async () => {
    vi.mocked(useAttendanceAnomalies).mockReturnValue({
      data: { anomalies: mockAnomalies, total: 2 },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useApproveAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useRejectAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<AttendanceAnomalyDashboard />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Total Anomalies')).toBeInTheDocument();
      expect(screen.getByText('Pending Review')).toBeInTheDocument();
      expect(screen.getByText('High Severity')).toBeInTheDocument();
    });
  });

  it('should display anomaly count correctly', async () => {
    vi.mocked(useAttendanceAnomalies).mockReturnValue({
      data: { anomalies: mockAnomalies, total: 2 },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useApproveAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useRejectAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<AttendanceAnomalyDashboard />, { wrapper });

    await waitFor(() => {
      const totalElements = screen.getAllByText('2');
      expect(totalElements.length).toBeGreaterThan(0);
    });
  });

  it('should display anomaly list', async () => {
    vi.mocked(useAttendanceAnomalies).mockReturnValue({
      data: { anomalies: mockAnomalies, total: 2 },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useApproveAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useRejectAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<AttendanceAnomalyDashboard />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Location Deviation')).toBeInTheDocument();
      expect(screen.getByText('Time Deviation')).toBeInTheDocument();
    });
  });

  it('should display severity chips', async () => {
    vi.mocked(useAttendanceAnomalies).mockReturnValue({
      data: { anomalies: mockAnomalies, total: 2 },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useApproveAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useRejectAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<AttendanceAnomalyDashboard />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
    });
  });

  it('should display AI confidence scores', async () => {
    vi.mocked(useAttendanceAnomalies).mockReturnValue({
      data: { anomalies: mockAnomalies, total: 2 },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useApproveAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useRejectAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<AttendanceAnomalyDashboard />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('AI Confidence: 92%')).toBeInTheDocument();
      expect(screen.getByText('AI Confidence: 85%')).toBeInTheDocument();
    });
  });

  it('should display approve and reject buttons for pending anomalies', async () => {
    vi.mocked(useAttendanceAnomalies).mockReturnValue({
      data: { anomalies: mockAnomalies, total: 2 },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useApproveAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useRejectAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<AttendanceAnomalyDashboard />, { wrapper });

    await waitFor(() => {
      const approveButtons = screen.getAllByText('Approve');
      const rejectButtons = screen.getAllByText('Reject');
      expect(approveButtons.length).toBe(2);
      expect(rejectButtons.length).toBe(2);
    });
  });

  it('should handle approve button click', async () => {
    const user = userEvent.setup();
    const mockApprove = vi.fn().mockResolvedValue({});

    vi.mocked(useAttendanceAnomalies).mockReturnValue({
      data: { anomalies: mockAnomalies, total: 2 },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useApproveAnomaly).mockReturnValue({
      mutateAsync: mockApprove,
      isPending: false,
    } as any);

    vi.mocked(useRejectAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<AttendanceAnomalyDashboard />, { wrapper });

    await waitFor(() => {
      expect(screen.getAllByText('Approve')[0]).toBeInTheDocument();
    });

    const firstApproveButton = screen.getAllByText('Approve')[0];
    await user.click(firstApproveButton);

    expect(mockApprove).toHaveBeenCalledWith({ anomalyId: 'anomaly-1' });
  });

  it('should handle reject button click', async () => {
    const user = userEvent.setup();
    const mockReject = vi.fn().mockResolvedValue({});

    vi.mocked(useAttendanceAnomalies).mockReturnValue({
      data: { anomalies: mockAnomalies, total: 2 },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useApproveAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useRejectAnomaly).mockReturnValue({
      mutateAsync: mockReject,
      isPending: false,
    } as any);

    render(<AttendanceAnomalyDashboard />, { wrapper });

    await waitFor(() => {
      expect(screen.getAllByText('Reject')[0]).toBeInTheDocument();
    });

    const firstRejectButton = screen.getAllByText('Reject')[0];
    await user.click(firstRejectButton);

    expect(mockReject).toHaveBeenCalledWith({ anomalyId: 'anomaly-1' });
  });

  it('should show empty state when no anomalies', async () => {
    vi.mocked(useAttendanceAnomalies).mockReturnValue({
      data: { anomalies: [], total: 0 },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useApproveAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useRejectAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<AttendanceAnomalyDashboard />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/No pending anomalies found/i)).toBeInTheDocument();
      expect(screen.getByText(/All attendance patterns look normal!/i)).toBeInTheDocument();
    });
  });

  it('should display location deviation details', async () => {
    vi.mocked(useAttendanceAnomalies).mockReturnValue({
      data: { anomalies: mockAnomalies, total: 2 },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useApproveAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useRejectAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<AttendanceAnomalyDashboard />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Location Deviation Detected')).toBeInTheDocument();
      expect(screen.getByText(/Distance from usual location: 15 km/i)).toBeInTheDocument();
    });
  });

  it('should switch between tabs', async () => {
    const user = userEvent.setup();

    vi.mocked(useAttendanceAnomalies).mockReturnValue({
      data: { anomalies: mockAnomalies, total: 2 },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useApproveAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useRejectAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<AttendanceAnomalyDashboard />, { wrapper });

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Pending/i })).toBeInTheDocument();
    });

    const approvedTab = screen.getByRole('tab', { name: /Approved/i });
    await user.click(approvedTab);

    expect(approvedTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should display AI-powered detection badge', async () => {
    vi.mocked(useAttendanceAnomalies).mockReturnValue({
      data: { anomalies: mockAnomalies, total: 2 },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useApproveAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useRejectAnomaly).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    render(<AttendanceAnomalyDashboard />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('AI-powered detection')).toBeInTheDocument();
    });
  });
});
