import type { AttendanceRecord } from '../entities/AttendanceRecord';
import type { AttendanceShift } from '../entities/AttendanceShift';

export interface IAttendanceRepository {
  /**
   * Find attendance record by ID
   */
  findById(id: string): Promise<AttendanceRecord | null>;

  /**
   * Find attendance record for employee on specific date
   */
  findByEmployeeAndDate(employeeId: string, date: Date): Promise<AttendanceRecord | null>;

  /**
   * Find all attendance records for an employee
   */
  findByEmployeeId(
    employeeId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    records: AttendanceRecord[];
    total: number;
  }>;

  /**
   * Find all attendance records for an employer
   */
  findByEmployerId(
    employerId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      employeeId?: string;
      hasAnomaly?: boolean;
      needsApproval?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    records: AttendanceRecord[];
    total: number;
  }>;

  /**
   * Find pending anomalies (need approval)
   */
  findPendingAnomalies(employerId: string): Promise<AttendanceRecord[]>;

  /**
   * Create attendance record (clock in)
   */
  create(record: Omit<AttendanceRecord, 'id' | 'createdAt'>): Promise<AttendanceRecord>;

  /**
   * Update attendance record (clock out, approve, etc.)
   */
  update(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord>;

  /**
   * Delete attendance record
   */
  delete(id: string): Promise<void>;

  /**
   * Get attendance summary for employee
   */
  getEmployeeSummary(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalDays: number;
    presentDays: number;
    lateDays: number;
    totalWorkHours: number;
    totalOvertimeHours: number;
    averageClockIn: string;
  }>;

  /**
   * Get attendance statistics for employer
   */
  getEmployerStats(
    employerId: string,
    date: Date
  ): Promise<{
    totalEmployees: number;
    clockedIn: number;
    absent: number;
    late: number;
    anomalies: number;
  }>;

  // Shift Management
  findShiftById(id: string): Promise<AttendanceShift | null>;
  findShiftsByEmployerId(employerId: string): Promise<AttendanceShift[]>;
  createShift(shift: Omit<AttendanceShift, 'id' | 'createdAt' | 'updatedAt'>): Promise<AttendanceShift>;
  updateShift(id: string, updates: Partial<AttendanceShift>): Promise<AttendanceShift>;
  deleteShift(id: string): Promise<void>;
}
