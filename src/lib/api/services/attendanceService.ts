import { apiClient } from '../client';
import type { AttendanceRecord, ClockInRequest, ClockOutRequest } from '../types';

export const attendanceService = {
  /**
   * Clock in
   */
  clockIn: async (data: ClockInRequest): Promise<AttendanceRecord> => {
    return apiClient.post('/attendance/clock-in', data);
  },

  /**
   * Clock out
   */
  clockOut: async (data: ClockOutRequest): Promise<AttendanceRecord> => {
    return apiClient.post('/attendance/clock-out', data);
  },

  /**
   * Get attendance records by employee and date range
   */
  getByEmployeeAndDateRange: async (
    employeeId: string,
    startDate: string,
    endDate: string
  ): Promise<{ records: AttendanceRecord[] }> => {
    return apiClient.get('/attendance', {
      employeeId,
      startDate,
      endDate,
    });
  },

  /**
   * Get attendance records by employer and date
   */
  getByEmployerAndDate: async (
    employerId: string,
    date: string
  ): Promise<{ records: AttendanceRecord[] }> => {
    return apiClient.get('/attendance', {
      employerId,
      date,
    });
  },

  /**
   * Get today's attendance record for employee
   */
  getTodayRecord: async (employeeId: string): Promise<AttendanceRecord | null> => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const response = await apiClient.get<{ records: AttendanceRecord[] }>('/attendance', {
      employeeId,
      startDate: today,
      endDate: tomorrow,
    });

    return response.records.length > 0 ? response.records[0] : null;
  },
};
