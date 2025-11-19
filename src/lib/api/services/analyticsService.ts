import { apiClient } from '../client';

export interface DashboardAnalytics {
  kpis: {
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
  };
  headcountTrend: Array<{ month: string; count: number; target?: number }>;
  turnoverData: Array<{ month: string; voluntary: number; involuntary: number }>;
  departmentDistribution: Array<{ name: string; value: number; color: string }>;
  costTrends: Array<{ month: string; salary: number; benefits: number; total: number }>;
}

export interface EmployeeAnalytics {
  totalEmployees: number;
  activeEmployees: number;
  departmentBreakdown: Array<{ department: string; count: number }>;
  growthRate: number;
}

export interface AttendanceAnalytics {
  averageAttendanceRate: number;
  lateArrivals: number;
  earlyDepartures: number;
  absences: number;
  trends: Array<{ date: string; rate: number }>;
}

export interface LeaveAnalytics {
  totalLeaveRequests: number;
  approvedLeaves: number;
  rejectedLeaves: number;
  pendingLeaves: number;
  leaveTypes: Array<{ type: string; count: number }>;
}

export interface PayrollAnalytics {
  totalPayroll: number;
  averageSalary: number;
  payrollByDepartment: Array<{ department: string; amount: number }>;
  monthlyTrend: Array<{ month: string; amount: number }>;
}

export interface PerformanceAnalytics {
  averageRating: number;
  completedReviews: number;
  pendingReviews: number;
  ratingDistribution: Array<{ rating: number; count: number }>;
}

export const analyticsService = {
  /**
   * Get dashboard analytics
   */
  getDashboard: async (employerId: string) => {
    return apiClient.get<DashboardAnalytics>('/analytics/dashboard');
  },

  /**
   * Get employee analytics
   */
  getEmployees: async (employerId: string) => {
    return apiClient.get<EmployeeAnalytics>('/analytics/employees');
  },

  /**
   * Get attendance analytics
   */
  getAttendance: async (employerId: string) => {
    return apiClient.get<AttendanceAnalytics>('/analytics/attendance');
  },

  /**
   * Get leave analytics
   */
  getLeave: async (employerId: string) => {
    return apiClient.get<LeaveAnalytics>('/analytics/leave');
  },

  /**
   * Get payroll analytics
   */
  getPayroll: async (employerId: string) => {
    return apiClient.get<PayrollAnalytics>('/analytics/payroll');
  },

  /**
   * Get performance analytics
   */
  getPerformance: async (employerId: string) => {
    return apiClient.get<PerformanceAnalytics>('/analytics/performance');
  },
};
