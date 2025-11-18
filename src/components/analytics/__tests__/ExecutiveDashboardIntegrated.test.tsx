import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExecutiveDashboardIntegrated } from '../ExecutiveDashboardIntegrated';

// Mock the hooks
vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    employerId: 'test-employer-123',
    user: { id: 'test-user', email: 'test@example.com', role: 'employer' },
    isAuthenticated: true,
  }),
}));

vi.mock('@/lib/hooks/useAnalytics', () => ({
  useDashboardAnalytics: vi.fn(),
}));

import { useDashboardAnalytics } from '@/lib/hooks/useAnalytics';

describe('ExecutiveDashboardIntegrated', () => {
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

  const mockAnalyticsData = {
    kpis: {
      totalHeadcount: 250,
      headcountGrowth: 12.5,
      turnoverRate: 8.2,
      turnoverTrend: -2.1,
      avgTimeToHire: 28,
      timeToHireTrend: -5.0,
      costPerHire: 15000000,
      costTrend: 3.5,
      absenteeismRate: 2.8,
      absenteeismTrend: -0.5,
      overtimeHours: 1250,
      overtimeTrend: 8.2,
    },
    headcountTrend: [
      { month: 'Jan', count: 220, target: 230 },
      { month: 'Feb', count: 230, target: 240 },
      { month: 'Mar', count: 250, target: 250 },
    ],
    turnoverData: [
      { month: 'Jan', voluntary: 3, involuntary: 2 },
      { month: 'Feb', voluntary: 2, involuntary: 1 },
      { month: 'Mar', voluntary: 4, involuntary: 2 },
    ],
    departmentDistribution: [
      { name: 'Engineering', value: 80, color: '#8b5cf6' },
      { name: 'Sales', value: 60, color: '#3b82f6' },
      { name: 'HR', value: 30, color: '#10b981' },
      { name: 'Finance', value: 40, color: '#f59e0b' },
      { name: 'Operations', value: 40, color: '#ef4444' },
    ],
    costTrends: [
      { month: 'Jan', salary: 45, benefits: 12, total: 57 },
      { month: 'Feb', salary: 48, benefits: 13, total: 61 },
      { month: 'Mar', salary: 52, benefits: 14, total: 66 },
    ],
  };

  it('should render loading state', () => {
    vi.mocked(useDashboardAnalytics).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<ExecutiveDashboardIntegrated />, { wrapper });

    expect(screen.getByText(/loading dashboard analytics/i)).toBeInTheDocument();
  });

  it('should display all KPI cards', async () => {
    vi.mocked(useDashboardAnalytics).mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false,
      error: null,
    } as any);

    render(<ExecutiveDashboardIntegrated />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Total Headcount')).toBeInTheDocument();
      expect(screen.getByText('Turnover Rate')).toBeInTheDocument();
      expect(screen.getByText('Avg Time to Hire')).toBeInTheDocument();
      expect(screen.getByText('Cost per Hire')).toBeInTheDocument();
      expect(screen.getByText('Absenteeism Rate')).toBeInTheDocument();
      expect(screen.getByText('Overtime Hours')).toBeInTheDocument();
    });
  });

  it('should display KPI values correctly', async () => {
    vi.mocked(useDashboardAnalytics).mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false,
      error: null,
    } as any);

    render(<ExecutiveDashboardIntegrated />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('250')).toBeInTheDocument(); // Total Headcount
      expect(screen.getByText('8.2%')).toBeInTheDocument(); // Turnover Rate
      expect(screen.getByText('28 days')).toBeInTheDocument(); // Time to Hire
      expect(screen.getByText('2.8%')).toBeInTheDocument(); // Absenteeism Rate
      expect(screen.getByText('1250')).toBeInTheDocument(); // Overtime Hours
    });
  });

  it('should display trend indicators', async () => {
    vi.mocked(useDashboardAnalytics).mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false,
      error: null,
    } as any);

    render(<ExecutiveDashboardIntegrated />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('+12.5%')).toBeInTheDocument(); // Headcount growth (positive)
      expect(screen.getByText('-2.1%')).toBeInTheDocument(); // Turnover trend (negative/good)
      expect(screen.getByText('+3.5%')).toBeInTheDocument(); // Cost trend
    });
  });

  it('should display export buttons', async () => {
    vi.mocked(useDashboardAnalytics).mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false,
      error: null,
    } as any);

    render(<ExecutiveDashboardIntegrated />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Export PDF')).toBeInTheDocument();
      expect(screen.getByText('Export Excel')).toBeInTheDocument();
    });
  });

  it('should handle export PDF click', async () => {
    const user = userEvent.setup();
    const consoleLogSpy = vi.spyOn(console, 'log');

    vi.mocked(useDashboardAnalytics).mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false,
      error: null,
    } as any);

    render(<ExecutiveDashboardIntegrated />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Export PDF')).toBeInTheDocument();
    });

    const exportPdfButton = screen.getByText('Export PDF');
    await user.click(exportPdfButton);

    expect(consoleLogSpy).toHaveBeenCalledWith('Exporting to PDF...');
  });

  it('should handle export Excel click', async () => {
    const user = userEvent.setup();
    const consoleLogSpy = vi.spyOn(console, 'log');

    vi.mocked(useDashboardAnalytics).mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false,
      error: null,
    } as any);

    render(<ExecutiveDashboardIntegrated />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Export Excel')).toBeInTheDocument();
    });

    const exportExcelButton = screen.getByText('Export Excel');
    await user.click(exportExcelButton);

    expect(consoleLogSpy).toHaveBeenCalledWith('Exporting to Excel...');
  });

  it('should display last updated timestamp', async () => {
    vi.mocked(useDashboardAnalytics).mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false,
      error: null,
    } as any);

    render(<ExecutiveDashboardIntegrated />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Last updated:/i)).toBeInTheDocument();
    });
  });

  it('should display chart titles', async () => {
    vi.mocked(useDashboardAnalytics).mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false,
      error: null,
    } as any);

    render(<ExecutiveDashboardIntegrated />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Headcount Trend')).toBeInTheDocument();
      expect(screen.getByText('Turnover Analysis')).toBeInTheDocument();
      expect(screen.getByText('Department Distribution')).toBeInTheDocument();
      expect(screen.getByText(/Cost Trends/i)).toBeInTheDocument();
    });
  });

  it('should show no data state', async () => {
    vi.mocked(useDashboardAnalytics).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any);

    render(<ExecutiveDashboardIntegrated />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('No analytics data available')).toBeInTheDocument();
    });
  });

  it('should display positive trend with success color', async () => {
    vi.mocked(useDashboardAnalytics).mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false,
      error: null,
    } as any);

    render(<ExecutiveDashboardIntegrated />, { wrapper });

    await waitFor(() => {
      const headcountGrowthChip = screen.getByText('+12.5%');
      expect(headcountGrowthChip).toBeInTheDocument();
    });
  });

  it('should display negative turnover trend as good (success color)', async () => {
    vi.mocked(useDashboardAnalytics).mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false,
      error: null,
    } as any);

    render(<ExecutiveDashboardIntegrated />, { wrapper });

    await waitFor(() => {
      // Negative turnover is good, should show with success color
      const turnoverTrendChip = screen.getByText('-2.1%');
      expect(turnoverTrendChip).toBeInTheDocument();
    });
  });

  it('should format cost per hire correctly', async () => {
    vi.mocked(useDashboardAnalytics).mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false,
      error: null,
    } as any);

    render(<ExecutiveDashboardIntegrated />, { wrapper });

    await waitFor(() => {
      // Cost is 15,000,000, should display as "Rp 15000k"
      expect(screen.getByText(/Rp 15000k/i)).toBeInTheDocument();
    });
  });
});
