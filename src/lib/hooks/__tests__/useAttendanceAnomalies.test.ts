import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useAttendanceAnomalies,
  useApproveAnomaly,
  useRejectAnomaly,
} from '../useAttendanceAnomalies';
import { toast } from 'sonner';

// Mock fetch globally
global.fetch = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useAttendanceAnomalies hooks', () => {
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

  describe('useAttendanceAnomalies', () => {
    it('should fetch attendance anomalies', async () => {
      const mockAnomalies = {
        anomalies: [
          {
            id: 'anomaly-1',
            employeeId: 'emp-1',
            employeeName: 'John Doe',
            type: 'location_deviation',
            severity: 'high',
            status: 'pending',
            aiConfidence: 0.92,
          },
          {
            id: 'anomaly-2',
            employeeId: 'emp-2',
            employeeName: 'Jane Smith',
            type: 'time_deviation',
            severity: 'medium',
            status: 'pending',
            aiConfidence: 0.85,
          },
        ],
        total: 2,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockAnomalies,
      } as Response);

      const { result } = renderHook(() => useAttendanceAnomalies('employer-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockAnomalies);
      expect(fetch).toHaveBeenCalledWith('/api/v1/attendance/anomalies?');
    });

    it('should apply filters to fetch anomalies', async () => {
      const mockAnomalies = { anomalies: [], total: 0 };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockAnomalies,
      } as Response);

      renderHook(
        () => useAttendanceAnomalies('employer-1', { status: 'pending', severity: 'high', startDate: '2025-01-01', endDate: '2025-01-31' }),
        { wrapper }
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/v1/attendance/anomalies?status=pending&severity=high&startDate=2025-01-01&endDate=2025-01-31');
      });
    });

    it('should not fetch when employerId is null', () => {
      const { result } = renderHook(() => useAttendanceAnomalies(null), { wrapper });

      expect(result.current.isPending).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should throw error on failed fetch', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const { result } = renderHook(() => useAttendanceAnomalies('employer-1'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useApproveAnomaly', () => {
    it('should approve anomaly and show success toast', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const { result } = renderHook(() => useApproveAnomaly(), { wrapper });

      result.current.mutate({ anomalyId: 'anomaly-1', notes: 'Approved after verification' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(fetch).toHaveBeenCalledWith('/api/v1/attendance/anomalies/anomaly-1/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Approved after verification' }),
      });
      expect(toast.success).toHaveBeenCalledWith('Anomaly approved successfully');
    });

    it('should approve anomaly without notes', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const { result } = renderHook(() => useApproveAnomaly(), { wrapper });

      result.current.mutate({ anomalyId: 'anomaly-1' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(fetch).toHaveBeenCalledWith('/api/v1/attendance/anomalies/anomaly-1/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(toast.success).toHaveBeenCalled();
    });

    it('should show error toast on failure', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const { result } = renderHook(() => useApproveAnomaly(), { wrapper });

      result.current.mutate({ anomalyId: 'anomaly-1' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Failed to approve anomaly', {
        description: 'Failed to approve anomaly',
      });
    });
  });

  describe('useRejectAnomaly', () => {
    it('should reject anomaly and show success toast', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const { result } = renderHook(() => useRejectAnomaly(), { wrapper });

      result.current.mutate({ anomalyId: 'anomaly-1', notes: 'False positive' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(fetch).toHaveBeenCalledWith('/api/v1/attendance/anomalies/anomaly-1/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'False positive' }),
      });
      expect(toast.success).toHaveBeenCalledWith('Anomaly rejected successfully');
    });

    it('should reject anomaly without notes', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const { result } = renderHook(() => useRejectAnomaly(), { wrapper });

      result.current.mutate({ anomalyId: 'anomaly-1' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(fetch).toHaveBeenCalledWith('/api/v1/attendance/anomalies/anomaly-1/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(toast.success).toHaveBeenCalled();
    });

    it('should show error toast on failure', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const { result } = renderHook(() => useRejectAnomaly(), { wrapper });

      result.current.mutate({ anomalyId: 'anomaly-1' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Failed to reject anomaly', {
        description: 'Failed to reject anomaly',
      });
    });
  });
});
