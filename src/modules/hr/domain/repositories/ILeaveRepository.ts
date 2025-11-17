import type { LeaveRequest } from '../entities/LeaveRequest';
import type { LeaveBalance } from '../entities/LeaveBalance';

export interface ILeaveRepository {
  // Leave Requests
  findRequestById(id: string): Promise<LeaveRequest | null>;

  findRequestsByEmployeeId(
    employeeId: string,
    options?: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    requests: LeaveRequest[];
    total: number;
  }>;

  findRequestsByEmployerId(
    employerId: string,
    options?: {
      status?: string;
      approverId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    requests: LeaveRequest[];
    total: number;
  }>;

  findPendingRequests(employerId: string): Promise<LeaveRequest[]>;

  findConflictingRequests(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    excludeRequestId?: string
  ): Promise<LeaveRequest[]>;

  findTeamLeaveOnDates(
    employerId: string,
    department: string,
    startDate: Date,
    endDate: Date
  ): Promise<LeaveRequest[]>;

  createRequest(request: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveRequest>;

  updateRequest(id: string, updates: Partial<LeaveRequest>): Promise<LeaveRequest>;

  deleteRequest(id: string): Promise<void>;

  // Leave Balances
  findBalanceByEmployeeAndYear(employeeId: string, year: number): Promise<LeaveBalance | null>;

  findBalancesByEmployerId(employerId: string, year: number): Promise<LeaveBalance[]>;

  createBalance(balance: LeaveBalance): Promise<LeaveBalance>;

  updateBalance(employeeId: string, year: number, updates: Partial<LeaveBalance>): Promise<LeaveBalance>;

  // Statistics
  getLeaveStatsByPeriod(
    employerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalRequests: number;
    approved: number;
    pending: number;
    rejected: number;
    totalDays: number;
  }>;
}
