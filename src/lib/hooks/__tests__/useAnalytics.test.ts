import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useDashboardAnalytics,
  useEmployeeAnalytics,
  useAttendanceAnalytics,
  useLeaveAnalytics,
  usePayrollAnalytics,
  usePerformanceAnalytics,
} from '../useAnalytics';

// Mock fetch globally
global.fetch = vi.fn();

describe('useAnalytics hooks', () => {
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

  describe('useDashboardAnalytics', () => {
    it('should fetch dashboard analytics', async () => {
      const mockAnalytics = {
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
          { month: 'Jan', count: 220 },
          { month: 'Feb', count: 230 },
        ],
        turnoverData: [
          { month: 'Jan', voluntary: 3, involuntary: 2 },
        ],
        departmentDistribution: [
          { name: 'Engineering', value: 80, color: '#8b5cf6' },
        ],
        costTrends: [
          { month: 'Jan', salary: 45, benefits: 12, total: 57 },
        ],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockAnalytics,
      } as Response);

      const { result } = renderHook(() => useDashboardAnalytics('employer-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockAnalytics);
      expect(fetch).toHaveBeenCalledWith('/api/v1/analytics/dashboard');
    });

    it('should not fetch when employerId is null', () => {
      const { result } = renderHook(() => useDashboardAnalytics(null), { wrapper });

      expect(result.current.isPending).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should throw error on failed fetch', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const { result } = renderHook(() => useDashboardAnalytics('employer-1'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useEmployeeAnalytics', () => {
    it('should fetch employee analytics', async () => {
      const mockAnalytics = {
        totalEmployees: 250,
        activeEmployees: 235,
        departmentBreakdown: [{ department: 'Engineering', count: 80 }],
        growthRate: 5.5,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockAnalytics,
      } as Response);

      const { result } = renderHook(() => useEmployeeAnalytics('employer-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockAnalytics);
      expect(fetch).toHaveBeenCalledWith('/api/v1/analytics/employees');
    });

    it('should not fetch when employerId is null', () => {
      const { result } = renderHook(() => useEmployeeAnalytics(null), { wrapper });

      expect(result.current.isPending).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('useAttendanceAnalytics', () => {
    it('should fetch attendance analytics', async () => {
      const mockAnalytics = {
        averageAttendanceRate: 95.5,
        lateArrivals: 12,
        earlyDepartures: 8,
        absences: 15,
        trends: [{ date: '2025-01-01', rate: 96.0 }],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockAnalytics,
      } as Response);

      const { result } = renderHook(() => useAttendanceAnalytics('employer-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockAnalytics);
      expect(fetch).toHaveBeenCalledWith('/api/v1/analytics/attendance');
    });

    it('should not fetch when employerId is null', () => {
      const { result } = renderHook(() => useAttendanceAnalytics(null), { wrapper });

      expect(result.current.isPending).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('useLeaveAnalytics', () => {
    it('should fetch leave analytics', async () => {
      const mockAnalytics = {
        totalLeaveRequests: 45,
        approvedLeaves: 38,
        rejectedLeaves: 4,
        pendingLeaves: 3,
        leaveTypes: [
          { type: 'annual', count: 25 },
          { type: 'sick', count: 12 },
        ],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockAnalytics,
      } as Response);

      const { result } = renderHook(() => useLeaveAnalytics('employer-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockAnalytics);
      expect(fetch).toHaveBeenCalledWith('/api/v1/analytics/leave');
    });

    it('should not fetch when employerId is null', () => {
      const { result } = renderHook(() => useLeaveAnalytics(null), { wrapper });

      expect(result.current.isPending).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('usePayrollAnalytics', () => {
    it('should fetch payroll analytics', async () => {
      const mockAnalytics = {
        totalPayroll: 5000000000,
        averageSalary: 15000000,
        payrollByDepartment: [
          { department: 'Engineering', amount: 2000000000 },
        ],
        monthlyTrend: [
          { month: 'Jan', amount: 4800000000 },
        ],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockAnalytics,
      } as Response);

      const { result } = renderHook(() => usePayrollAnalytics('employer-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockAnalytics);
      expect(fetch).toHaveBeenCalledWith('/api/v1/analytics/payroll');
    });

    it('should not fetch when employerId is null', () => {
      const { result } = renderHook(() => usePayrollAnalytics(null), { wrapper });

      expect(result.current.isPending).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('usePerformanceAnalytics', () => {
    it('should fetch performance analytics', async () => {
      const mockAnalytics = {
        averageRating: 4.2,
        completedReviews: 180,
        pendingReviews: 20,
        ratingDistribution: [
          { rating: 5, count: 80 },
          { rating: 4, count: 70 },
          { rating: 3, count: 30 },
        ],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockAnalytics,
      } as Response);

      const { result } = renderHook(() => usePerformanceAnalytics('employer-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockAnalytics);
      expect(fetch).toHaveBeenCalledWith('/api/v1/analytics/performance');
    });

    it('should not fetch when employerId is null', () => {
      const { result } = renderHook(() => usePerformanceAnalytics(null), { wrapper });

      expect(result.current.isPending).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
