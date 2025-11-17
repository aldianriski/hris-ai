import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../api/services';
import type { ClockInRequest, ClockOutRequest } from '../api/types';
import { toast } from 'sonner';

export const attendanceKeys = {
  all: ['attendance'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (employeeId: string, startDate: string, endDate: string) =>
    [...attendanceKeys.lists(), { employeeId, startDate, endDate }] as const,
  today: (employeeId: string) => [...attendanceKeys.all, 'today', employeeId] as const,
};

/**
 * Hook to fetch attendance records by date range
 */
export function useAttendanceRecords(
  employeeId: string,
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: attendanceKeys.list(employeeId, startDate, endDate),
    queryFn: () =>
      attendanceService.getByEmployeeAndDateRange(employeeId, startDate, endDate),
    enabled: !!employeeId && !!startDate && !!endDate,
  });
}

/**
 * Hook to fetch today's attendance record
 */
export function useTodayAttendance(employeeId: string) {
  return useQuery({
    queryKey: attendanceKeys.today(employeeId),
    queryFn: () => attendanceService.getTodayRecord(employeeId),
    enabled: !!employeeId,
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Hook to clock in
 */
export function useClockIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClockInRequest) => attendanceService.clockIn(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.today(variables.employeeId),
      });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      toast.success('Clock in berhasil!', {
        description: `Anda clock in pada ${new Date(variables.clockInTime).toLocaleTimeString('id-ID')}`,
      });
    },
    onError: (error: Error) => {
      toast.error('Gagal clock in', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to clock out
 */
export function useClockOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClockOutRequest) => attendanceService.clockOut(data),
    onSuccess: (data) => {
      if (data.employeeId) {
        queryClient.invalidateQueries({
          queryKey: attendanceKeys.today(data.employeeId),
        });
      }
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      toast.success('Clock out berhasil!', {
        description: `Anda clock out pada ${new Date(data.clockOutTime!).toLocaleTimeString('id-ID')}`,
      });
    },
    onError: (error: Error) => {
      toast.error('Gagal clock out', {
        description: error.message,
      });
    },
  });
}
