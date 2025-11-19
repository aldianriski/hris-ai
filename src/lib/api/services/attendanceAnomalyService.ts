import { apiClient } from '../client';

export interface AttendanceAnomaly {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  type: 'location_deviation' | 'time_deviation' | 'excessive_hours' | 'pattern_break' | 'impossible_travel';
  severity: 'high' | 'medium' | 'low';
  description: string;
  normalValue: string;
  anomalousValue: string;
  aiConfidence: number;
  status: 'pending' | 'approved' | 'rejected';
  location?: {
    normal: { lat: number; lng: number; address: string };
    anomalous: { lat: number; lng: number; address: string };
    distance: number;
  };
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface AnomalyFilters {
  status?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
}

export const attendanceAnomalyService = {
  /**
   * Get attendance anomalies
   */
  list: async (employerId: string, filters?: AnomalyFilters) => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.severity) params.severity = filters.severity;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;

    return apiClient.get<{ anomalies: AttendanceAnomaly[]; total: number }>(
      '/attendance/anomalies',
      params
    );
  },

  /**
   * Approve anomaly
   */
  approve: async (anomalyId: string, notes?: string) => {
    return apiClient.post<{ success: boolean }>(
      `/attendance/anomalies/${anomalyId}/approve`,
      notes ? { notes } : {}
    );
  },

  /**
   * Reject anomaly
   */
  reject: async (anomalyId: string, notes?: string) => {
    return apiClient.post<{ success: boolean }>(
      `/attendance/anomalies/${anomalyId}/reject`,
      notes ? { notes } : {}
    );
  },
};
