import { useQuery } from '@tanstack/react-query';

export interface DashboardMetrics {
  totalHeadcount: number;
  headcountGrowth: number;
  turnoverRate: number;
  turnoverTrend: number;
  avgTimeToHire: number;
  timeToHireTrend: number;
  costPerHire: number;
  costTrend: number;
  absenteeismRate: number;
  absenteeismTrend: number;
  overtimeHours: number;
  overtimeTrend: number;
}

export interface HeadcountTrend {
  month: string;
  count: number;
  target?: number;
}

export interface TurnoverData {
  month: string;
  voluntary: number;
  involuntary: number;
}

export interface DepartmentDistribution {
  name: string;
  value: number;
  color: string;
}

export interface CostTrend {
  month: string;
  salary: number;
  benefits: number;
  total: number;
}

export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: (employerId: string) => [...analyticsKeys.all, 'dashboard', employerId] as const,
  employees: (employerId: string, filters?: any) => [...analyticsKeys.all, 'employees', employerId, filters] as const,
  attendance: (employerId: string, filters?: any) => [...analyticsKeys.all, 'attendance', employerId, filters] as const,
  leave: (employerId: string, filters?: any) => [...analyticsKeys.all, 'leave', employerId, filters] as const,
  payroll: (employerId: string, filters?: any) => [...analyticsKeys.all, 'payroll', employerId, filters] as const,
  performance: (employerId: string, filters?: any) => [...analyticsKeys.all, 'performance', employerId, filters] as const,
};

/**
 * Fetch dashboard KPIs and metrics
 */
export function useDashboardAnalytics(employerId: string | null) {
  return useQuery({
    queryKey: analyticsKeys.dashboard(employerId!),
    queryFn: async () => {
      const response = await fetch(`/api/v1/analytics/dashboard?employerId=${employerId}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard analytics');
      return response.json() as Promise<{
        kpis: DashboardMetrics;
        headcountTrend: HeadcountTrend[];
        turnoverData: TurnoverData[];
        departmentDistribution: DepartmentDistribution[];
        costTrends: CostTrend[];
      }>;
    },
    enabled: !!employerId,
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

/**
 * Fetch employee analytics
 */
export function useEmployeeAnalytics(
  employerId: string | null,
  filters?: { startDate?: string; endDate?: string; department?: string }
) {
  return useQuery({
    queryKey: analyticsKeys.employees(employerId!, filters),
    queryFn: async () => {
      const params = new URLSearchParams({ employerId: employerId! });
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.department) params.append('department', filters.department);

      const response = await fetch(`/api/v1/analytics/employees?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch employee analytics');
      return response.json();
    },
    enabled: !!employerId,
  });
}

/**
 * Fetch attendance analytics
 */
export function useAttendanceAnalytics(
  employerId: string | null,
  filters?: { startDate?: string; endDate?: string; department?: string }
) {
  return useQuery({
    queryKey: analyticsKeys.attendance(employerId!, filters),
    queryFn: async () => {
      const params = new URLSearchParams({ employerId: employerId! });
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.department) params.append('department', filters.department);

      const response = await fetch(`/api/v1/analytics/attendance?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch attendance analytics');
      return response.json();
    },
    enabled: !!employerId,
  });
}

/**
 * Fetch leave analytics
 */
export function useLeaveAnalytics(
  employerId: string | null,
  filters?: { startDate?: string; endDate?: string; department?: string }
) {
  return useQuery({
    queryKey: analyticsKeys.leave(employerId!, filters),
    queryFn: async () => {
      const params = new URLSearchParams({ employerId: employerId! });
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.department) params.append('department', filters.department);

      const response = await fetch(`/api/v1/analytics/leave?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch leave analytics');
      return response.json();
    },
    enabled: !!employerId,
  });
}

/**
 * Fetch payroll analytics
 */
export function usePayrollAnalytics(
  employerId: string | null,
  filters?: { startDate?: string; endDate?: string; department?: string }
) {
  return useQuery({
    queryKey: analyticsKeys.payroll(employerId!, filters),
    queryFn: async () => {
      const params = new URLSearchParams({ employerId: employerId! });
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.department) params.append('department', filters.department);

      const response = await fetch(`/api/v1/analytics/payroll?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch payroll analytics');
      return response.json();
    },
    enabled: !!employerId,
  });
}

/**
 * Fetch performance analytics
 */
export function usePerformanceAnalytics(
  employerId: string | null,
  filters?: { startDate?: string; endDate?: string; department?: string }
) {
  return useQuery({
    queryKey: analyticsKeys.performance(employerId!, filters),
    queryFn: async () => {
      const params = new URLSearchParams({ employerId: employerId! });
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.department) params.append('department', filters.department);

      const response = await fetch(`/api/v1/analytics/performance?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch performance analytics');
      return response.json();
    },
    enabled: !!employerId,
  });
}
