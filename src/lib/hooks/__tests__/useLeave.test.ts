import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useLeaveRequests,
  useLeaveRequest,
  useLeaveBalance,
  useCreateLeaveRequest,
  useUpdateLeaveRequest,
  useDeleteLeaveRequest,
} from '../useLeave';
import { leaveService } from '../../api/services';
import { toast } from 'sonner';

vi.mock('../../api/services', () => ({
  leaveService: {
    list: vi.fn(),
    getById: vi.fn(),
    getBalance: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useLeave hooks', () => {
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

  describe('useLeaveRequests', () => {
    it('should fetch leave requests by employeeId', async () => {
      const mockRequests = {
        data: [
          { id: 'leave-1', type: 'annual', status: 'pending', startDate: '2025-01-01', endDate: '2025-01-05' },
          { id: 'leave-2', type: 'sick', status: 'approved', startDate: '2025-02-01', endDate: '2025-02-02' },
        ],
        total: 2,
      };

      vi.mocked(leaveService.list).mockResolvedValue(mockRequests);

      const { result } = renderHook(() => useLeaveRequests({ employeeId: 'emp-1' }), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockRequests);
      expect(leaveService.list).toHaveBeenCalledWith({ employeeId: 'emp-1' });
    });

    it('should fetch leave requests by employerId', async () => {
      const mockRequests = { data: [], total: 0 };
      vi.mocked(leaveService.list).mockResolvedValue(mockRequests);

      const { result } = renderHook(() => useLeaveRequests({ employerId: 'employer-1' }), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(leaveService.list).toHaveBeenCalledWith({ employerId: 'employer-1' });
    });

    it('should not fetch when both employeeId and employerId are missing', () => {
      const { result } = renderHook(() => useLeaveRequests({}), { wrapper });

      expect(result.current.isPending).toBe(true);
      expect(leaveService.list).not.toHaveBeenCalled();
    });
  });

  describe('useLeaveRequest', () => {
    it('should fetch single leave request', async () => {
      const mockRequest = {
        id: 'leave-1',
        type: 'annual',
        status: 'pending',
        startDate: '2025-01-01',
        endDate: '2025-01-05',
        reason: 'Vacation',
      };

      vi.mocked(leaveService.getById).mockResolvedValue(mockRequest);

      const { result } = renderHook(() => useLeaveRequest('leave-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockRequest);
      expect(leaveService.getById).toHaveBeenCalledWith('leave-1');
    });

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useLeaveRequest(''), { wrapper });

      expect(result.current.isPending).toBe(true);
      expect(leaveService.getById).not.toHaveBeenCalled();
    });
  });

  describe('useLeaveBalance', () => {
    it('should fetch leave balance for employee', async () => {
      const mockBalance = {
        employeeId: 'emp-1',
        annual: { total: 12, used: 3, remaining: 9 },
        sick: { total: 10, used: 1, remaining: 9 },
      };

      vi.mocked(leaveService.getBalance).mockResolvedValue(mockBalance);

      const { result } = renderHook(() => useLeaveBalance('emp-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockBalance);
      expect(leaveService.getBalance).toHaveBeenCalledWith('emp-1');
    });

    it('should not fetch when employeeId is empty', () => {
      const { result } = renderHook(() => useLeaveBalance(''), { wrapper });

      expect(result.current.isPending).toBe(true);
      expect(leaveService.getBalance).not.toHaveBeenCalled();
    });
  });

  describe('useCreateLeaveRequest', () => {
    it('should create leave request and show success toast', async () => {
      const newRequest = {
        employeeId: 'emp-1',
        type: 'annual' as const,
        startDate: '2025-03-01',
        endDate: '2025-03-05',
        reason: 'Family vacation',
      };

      vi.mocked(leaveService.create).mockResolvedValue({ id: 'leave-3', ...newRequest } as any);

      const { result } = renderHook(() => useCreateLeaveRequest(), { wrapper });

      result.current.mutate(newRequest);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(leaveService.create).toHaveBeenCalledWith(newRequest);
      expect(toast.success).toHaveBeenCalledWith('Permohonan cuti berhasil diajukan');
    });

    it('should show error toast on failure', async () => {
      const error = new Error('Failed to create leave request');
      vi.mocked(leaveService.create).mockRejectedValue(error);

      const { result } = renderHook(() => useCreateLeaveRequest(), { wrapper });

      result.current.mutate({
        employeeId: 'emp-1',
        type: 'annual',
        startDate: '2025-03-01',
        endDate: '2025-03-05',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Gagal mengajukan permohonan cuti', {
        description: 'Failed to create leave request',
      });
    });
  });

  describe('useUpdateLeaveRequest', () => {
    it('should update leave request and show success toast for approval', async () => {
      const updateData = { status: 'approved' as const };
      vi.mocked(leaveService.update).mockResolvedValue({ id: 'leave-1', ...updateData } as any);

      const { result } = renderHook(() => useUpdateLeaveRequest(), { wrapper });

      result.current.mutate({ id: 'leave-1', data: updateData });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(leaveService.update).toHaveBeenCalledWith('leave-1', updateData);
      expect(toast.success).toHaveBeenCalledWith('Permohonan cuti disetujui');
    });

    it('should show rejection toast when status is rejected', async () => {
      const updateData = { status: 'rejected' as const };
      vi.mocked(leaveService.update).mockResolvedValue({ id: 'leave-1', ...updateData } as any);

      const { result } = renderHook(() => useUpdateLeaveRequest(), { wrapper });

      result.current.mutate({ id: 'leave-1', data: updateData });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(toast.success).toHaveBeenCalledWith('Permohonan cuti ditolak');
    });

    it('should show generic success toast for other updates', async () => {
      const updateData = { reason: 'Updated reason' };
      vi.mocked(leaveService.update).mockResolvedValue({ id: 'leave-1', ...updateData } as any);

      const { result } = renderHook(() => useUpdateLeaveRequest(), { wrapper });

      result.current.mutate({ id: 'leave-1', data: updateData });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(toast.success).toHaveBeenCalledWith('Permohonan cuti diperbarui');
    });

    it('should show error toast on failure', async () => {
      const error = new Error('Update failed');
      vi.mocked(leaveService.update).mockRejectedValue(error);

      const { result } = renderHook(() => useUpdateLeaveRequest(), { wrapper });

      result.current.mutate({ id: 'leave-1', data: { status: 'approved' } });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Gagal memperbarui permohonan cuti', {
        description: 'Update failed',
      });
    });
  });

  describe('useDeleteLeaveRequest', () => {
    it('should delete leave request and show success toast', async () => {
      vi.mocked(leaveService.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteLeaveRequest(), { wrapper });

      result.current.mutate('leave-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(leaveService.delete).toHaveBeenCalledWith('leave-1');
      expect(toast.success).toHaveBeenCalledWith('Permohonan cuti berhasil dihapus');
    });

    it('should show error toast on failure', async () => {
      const error = new Error('Delete failed');
      vi.mocked(leaveService.delete).mockRejectedValue(error);

      const { result } = renderHook(() => useDeleteLeaveRequest(), { wrapper });

      result.current.mutate('leave-1');

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Gagal menghapus permohonan cuti', {
        description: 'Delete failed',
      });
    });
  });
});
