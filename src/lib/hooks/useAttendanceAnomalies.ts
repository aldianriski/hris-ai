import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
  createdAt: string;
}

export const attendanceAnomalyKeys = {
  all: ['attendance-anomalies'] as const,
  lists: () => [...attendanceAnomalyKeys.all, 'list'] as const,
  list: (employerId: string, filters?: any) => [...attendanceAnomalyKeys.lists(), employerId, filters] as const,
};

/**
 * Fetch attendance anomalies
 */
export function useAttendanceAnomalies(
  employerId: string | null,
  filters?: { status?: 'pending' | 'approved' | 'rejected'; severity?: string; startDate?: string; endDate?: string }
) {
  return useQuery({
    queryKey: attendanceAnomalyKeys.list(employerId!, filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.severity) params.append('severity', filters.severity);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      // Note: This endpoint may need to be created in the backend
      const response = await fetch(`/api/v1/attendance/anomalies?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch attendance anomalies');
      return response.json() as Promise<{ anomalies: AttendanceAnomaly[]; total: number }>;
    },
    enabled: !!employerId,
    refetchInterval: 120000, // Refetch every 2 minutes
  });
}

/**
 * Approve attendance anomaly
 */
export function useApproveAnomaly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ anomalyId, notes }: { anomalyId: string; notes?: string }) => {
      const response = await fetch(`/api/v1/attendance/anomalies/${anomalyId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!response.ok) throw new Error('Failed to approve anomaly');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceAnomalyKeys.lists() });
      toast.success('Anomaly approved successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to approve anomaly', {
        description: error.message,
      });
    },
  });
}

/**
 * Reject attendance anomaly
 */
export function useRejectAnomaly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ anomalyId, notes }: { anomalyId: string; notes?: string }) => {
      const response = await fetch(`/api/v1/attendance/anomalies/${anomalyId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!response.ok) throw new Error('Failed to reject anomaly');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceAnomalyKeys.lists() });
      toast.success('Anomaly rejected successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to reject anomaly', {
        description: error.message,
      });
    },
  });
}
