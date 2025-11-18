import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useComplianceAlerts,
  useResolveAlert,
  useAuditLogs,
} from '../useCompliance';
import { toast } from 'sonner';

// Mock fetch globally
global.fetch = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useCompliance hooks', () => {
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

  describe('useComplianceAlerts', () => {
    it('should fetch compliance alerts', async () => {
      const mockAlerts = {
        alerts: [
          { id: 'alert-1', title: 'Missing Documents', severity: 'high', status: 'active' },
          { id: 'alert-2', title: 'Expired Certification', severity: 'medium', status: 'active' },
        ],
        total: 2,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockAlerts,
      } as Response);

      const { result } = renderHook(() => useComplianceAlerts('employer-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockAlerts);
      expect(fetch).toHaveBeenCalledWith('/api/v1/compliance/alerts?');
    });

    it('should apply filters to fetch alerts', async () => {
      const mockAlerts = { alerts: [], total: 0 };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockAlerts,
      } as Response);

      renderHook(
        () => useComplianceAlerts('employer-1', { status: 'active', severity: 'high' }),
        { wrapper }
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/v1/compliance/alerts?status=active&severity=high');
      });
    });

    it('should not fetch when employerId is null', () => {
      const { result } = renderHook(() => useComplianceAlerts(null), { wrapper });

      expect(result.current.isPending).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should throw error on failed fetch', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const { result } = renderHook(() => useComplianceAlerts('employer-1'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useResolveAlert', () => {
    it('should resolve alert and show success toast', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const { result } = renderHook(() => useResolveAlert(), { wrapper });

      result.current.mutate({ alertId: 'alert-1', resolution: 'Documents uploaded' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(fetch).toHaveBeenCalledWith('/api/v1/compliance/alerts/alert-1/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution: 'Documents uploaded' }),
      });
      expect(toast.success).toHaveBeenCalledWith('Alert resolved successfully');
    });

    it('should resolve alert without resolution notes', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const { result } = renderHook(() => useResolveAlert(), { wrapper });

      result.current.mutate({ alertId: 'alert-1' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(fetch).toHaveBeenCalledWith('/api/v1/compliance/alerts/alert-1/resolve', {
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

      const { result } = renderHook(() => useResolveAlert(), { wrapper });

      result.current.mutate({ alertId: 'alert-1' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Failed to resolve alert', {
        description: 'Failed to resolve alert',
      });
    });
  });

  describe('useAuditLogs', () => {
    it('should fetch audit logs', async () => {
      const mockLogs = {
        logs: [
          { id: 'log-1', action: 'employee_created', userId: 'user-1', timestamp: '2025-01-01T10:00:00Z' },
          { id: 'log-2', action: 'leave_approved', userId: 'user-2', timestamp: '2025-01-02T11:00:00Z' },
        ],
        total: 2,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockLogs,
      } as Response);

      const { result } = renderHook(() => useAuditLogs('employer-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockLogs);
      expect(fetch).toHaveBeenCalledWith('/api/v1/compliance/audit-logs?');
    });

    it('should apply filters to fetch audit logs', async () => {
      const mockLogs = { logs: [], total: 0 };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockLogs,
      } as Response);

      renderHook(
        () => useAuditLogs('employer-1', { action: 'employee_created', startDate: '2025-01-01' }),
        { wrapper }
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/v1/compliance/audit-logs?action=employee_created&startDate=2025-01-01');
      });
    });

    it('should not fetch when employerId is null', () => {
      const { result } = renderHook(() => useAuditLogs(null), { wrapper });

      expect(result.current.isPending).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should throw error on failed fetch', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const { result } = renderHook(() => useAuditLogs('employer-1'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });
});
