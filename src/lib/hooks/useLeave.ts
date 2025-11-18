import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveService } from '../api/services';
import type { CreateLeaveRequestData, ListLeaveRequestsParams, LeaveRequest } from '../api/types';
import { toast } from 'sonner';

export const leaveKeys = {
  all: ['leave'] as const,
  requests: () => [...leaveKeys.all, 'requests'] as const,
  request: (params: ListLeaveRequestsParams) => [...leaveKeys.requests(), params] as const,
  detail: (id: string) => [...leaveKeys.all, 'detail', id] as const,
  balance: (employeeId: string) => [...leaveKeys.all, 'balance', employeeId] as const,
};

/**
 * Hook to fetch leave requests
 */
export function useLeaveRequests(params: ListLeaveRequestsParams) {
  return useQuery({
    queryKey: leaveKeys.request(params),
    queryFn: () => leaveService.list(params),
    enabled: !!(params.employeeId || params.employerId),
  });
}

/**
 * Hook to fetch single leave request
 */
export function useLeaveRequest(id: string) {
  return useQuery({
    queryKey: leaveKeys.detail(id),
    queryFn: () => leaveService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch leave balance
 */
export function useLeaveBalance(employeeId: string) {
  return useQuery({
    queryKey: leaveKeys.balance(employeeId),
    queryFn: () => leaveService.getBalance(employeeId),
    enabled: !!employeeId,
  });
}

/**
 * Hook to create leave request
 */
export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeaveRequestData) => leaveService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
      queryClient.invalidateQueries({
        queryKey: leaveKeys.balance(variables.employeeId),
      });
      toast.success('Permohonan cuti berhasil diajukan');
    },
    onError: (error: Error) => {
      toast.error('Gagal mengajukan permohonan cuti', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to update leave request (approve/reject)
 */
export function useUpdateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LeaveRequest> }) =>
      leaveService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.detail(variables.id) });

      if (variables.data.status === 'approved') {
        toast.success('Permohonan cuti disetujui');
      } else if (variables.data.status === 'rejected') {
        toast.success('Permohonan cuti ditolak');
      } else {
        toast.success('Permohonan cuti diperbarui');
      }
    },
    onError: (error: Error) => {
      toast.error('Gagal memperbarui permohonan cuti', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to delete leave request
 */
export function useDeleteLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leaveService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
      toast.success('Permohonan cuti berhasil dihapus');
    },
    onError: (error: Error) => {
      toast.error('Gagal menghapus permohonan cuti', {
        description: error.message,
      });
    },
  });
}
