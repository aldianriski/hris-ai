import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useAttendanceRecords,
  useTodayAttendance,
  useClockIn,
  useClockOut,
} from '../useAttendance';
import { attendanceService } from '../../api/services';
import { toast } from 'sonner';

vi.mock('../../api/services', () => ({
  attendanceService: {
    getByEmployeeAndDateRange: vi.fn(),
    getTodayRecord: vi.fn(),
    clockIn: vi.fn(),
    clockOut: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useAttendance hooks', () => {
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

  describe('useAttendanceRecords', () => {
    it('should fetch attendance records by date range', async () => {
      const mockRecords = {
        data: [
          { id: 'att-1', date: '2025-01-01', clockInTime: '09:00', clockOutTime: '17:00', status: 'present' },
          { id: 'att-2', date: '2025-01-02', clockInTime: '09:05', clockOutTime: '17:10', status: 'present' },
        ],
        total: 2,
      };

      vi.mocked(attendanceService.getByEmployeeAndDateRange).mockResolvedValue(mockRecords);

      const { result } = renderHook(
        () => useAttendanceRecords('emp-1', '2025-01-01', '2025-01-31'),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockRecords);
      expect(attendanceService.getByEmployeeAndDateRange).toHaveBeenCalledWith(
        'emp-1',
        '2025-01-01',
        '2025-01-31'
      );
    });

    it('should not fetch when employeeId is missing', () => {
      const { result } = renderHook(
        () => useAttendanceRecords('', '2025-01-01', '2025-01-31'),
        { wrapper }
      );

      expect(result.current.isPending).toBe(true);
      expect(attendanceService.getByEmployeeAndDateRange).not.toHaveBeenCalled();
    });

    it('should not fetch when dates are missing', () => {
      const { result } = renderHook(
        () => useAttendanceRecords('emp-1', '', ''),
        { wrapper }
      );

      expect(result.current.isPending).toBe(true);
      expect(attendanceService.getByEmployeeAndDateRange).not.toHaveBeenCalled();
    });
  });

  describe('useTodayAttendance', () => {
    it('should fetch today attendance record', async () => {
      const mockRecord = {
        id: 'att-today',
        employeeId: 'emp-1',
        date: new Date().toISOString().split('T')[0],
        clockInTime: '09:00',
        clockOutTime: null,
        status: 'present',
      };

      vi.mocked(attendanceService.getTodayRecord).mockResolvedValue(mockRecord);

      const { result } = renderHook(() => useTodayAttendance('emp-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockRecord);
      expect(attendanceService.getTodayRecord).toHaveBeenCalledWith('emp-1');
    });

    it('should not fetch when employeeId is empty', () => {
      const { result } = renderHook(() => useTodayAttendance(''), { wrapper });

      expect(result.current.isPending).toBe(true);
      expect(attendanceService.getTodayRecord).not.toHaveBeenCalled();
    });
  });

  describe('useClockIn', () => {
    it('should clock in successfully and show success toast', async () => {
      const clockInData = {
        employeeId: 'emp-1',
        clockInTime: new Date().toISOString(),
        location: { lat: -6.2, lng: 106.8 },
      };

      const mockResponse = { id: 'att-1', ...clockInData, status: 'present' };
      vi.mocked(attendanceService.clockIn).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useClockIn(), { wrapper });

      result.current.mutate(clockInData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(attendanceService.clockIn).toHaveBeenCalledWith(clockInData);
      expect(toast.success).toHaveBeenCalledWith('Clock in berhasil!', {
        description: expect.stringContaining('Anda clock in pada'),
      });
    });

    it('should show error toast on clock in failure', async () => {
      const error = new Error('Clock in failed');
      vi.mocked(attendanceService.clockIn).mockRejectedValue(error);

      const { result } = renderHook(() => useClockIn(), { wrapper });

      result.current.mutate({
        employeeId: 'emp-1',
        clockInTime: new Date().toISOString(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Gagal clock in', {
        description: 'Clock in failed',
      });
    });
  });

  describe('useClockOut', () => {
    it('should clock out successfully and show success toast', async () => {
      const clockOutData = {
        attendanceId: 'att-1',
        clockOutTime: new Date().toISOString(),
        location: { lat: -6.2, lng: 106.8 },
      };

      const mockResponse = {
        id: 'att-1',
        employeeId: 'emp-1',
        clockOutTime: clockOutData.clockOutTime,
        status: 'present',
      };
      vi.mocked(attendanceService.clockOut).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useClockOut(), { wrapper });

      result.current.mutate(clockOutData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(attendanceService.clockOut).toHaveBeenCalledWith(clockOutData);
      expect(toast.success).toHaveBeenCalledWith('Clock out berhasil!', {
        description: expect.stringContaining('Anda clock out pada'),
      });
    });

    it('should show error toast on clock out failure', async () => {
      const error = new Error('Clock out failed');
      vi.mocked(attendanceService.clockOut).mockRejectedValue(error);

      const { result } = renderHook(() => useClockOut(), { wrapper });

      result.current.mutate({
        attendanceId: 'att-1',
        clockOutTime: new Date().toISOString(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Gagal clock out', {
        description: 'Clock out failed',
      });
    });

    it('should handle clock out without employeeId', async () => {
      const mockResponse = {
        id: 'att-1',
        clockOutTime: new Date().toISOString(),
        status: 'present',
      };
      vi.mocked(attendanceService.clockOut).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useClockOut(), { wrapper });

      result.current.mutate({
        attendanceId: 'att-1',
        clockOutTime: new Date().toISOString(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(toast.success).toHaveBeenCalled();
    });
  });
});
