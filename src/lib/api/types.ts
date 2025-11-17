/**
 * API Types and Interfaces
 */

// Employee Types
export interface Employee {
  id: string;
  employerId: string;
  employeeNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  nationality: string;
  nationalId?: string;
  taxId?: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  department: string;
  position: string;
  employmentType: 'permanent' | 'contract' | 'probation' | 'intern' | 'part_time';
  employmentStatus: 'active' | 'inactive' | 'terminated' | 'resigned';
  joinDate: string;
  manager?: string;
  workLocation: string;
  workSchedule: string;
  salary?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListEmployeesParams {
  employerId: string;
  status?: string;
  department?: string;
  position?: string;
  employmentType?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ListEmployeesResponse {
  employees: Employee[];
  total: number;
}

// Attendance Types
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employerId: string;
  employeeName: string;
  date: string;
  shiftId?: string;
  clockInTime?: string;
  clockOutTime?: string;
  clockInLocation?: string;
  clockOutLocation?: string;
  clockInGps?: { latitude: number; longitude: number };
  clockOutGps?: { latitude: number; longitude: number };
  workHours?: number;
  overtimeHours?: number;
  status: 'present' | 'late' | 'absent' | 'leave' | 'holiday';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClockInRequest {
  employeeId: string;
  employerId: string;
  clockInTime: string;
  clockInLocation?: string;
  clockInGps?: { latitude: number; longitude: number };
  clockInNotes?: string;
  shiftId?: string;
}

export interface ClockOutRequest {
  recordId: string;
  clockOutTime: string;
  clockOutLocation?: string;
  clockOutGps?: { latitude: number; longitude: number };
  clockOutNotes?: string;
}

// Leave Types
export interface LeaveRequest {
  id: string;
  employeeId: string;
  employerId: string;
  employeeName: string;
  leaveType: 'annual' | 'sick' | 'unpaid' | 'maternity' | 'paternity' | 'compassionate' | 'other';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  approvalNotes?: string;
  isAutoApproved: boolean;
  aiConfidence?: number;
  aiReview?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  employerId: string;
  year: number;
  annualQuota: number;
  annualUsed: number;
  annualCarryForward: number;
  sickUsed: number;
  unpaidUsed: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequestData {
  employeeId: string;
  employerId: string;
  employeeName: string;
  leaveType: 'annual' | 'sick' | 'unpaid' | 'maternity' | 'paternity' | 'compassionate' | 'other';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
}

export interface ListLeaveRequestsParams {
  employeeId?: string;
  employerId?: string;
  status?: string;
  leaveType?: string;
  year?: number;
  limit?: number;
  offset?: number;
}

export interface ListLeaveRequestsResponse {
  requests: LeaveRequest[];
  total: number;
}

// Dashboard Types
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  onLeaveToday: number;
  pendingLeaveRequests: number;
  expiringDocuments: number;
}
