import type { IAttendanceRepository } from '../../domain/repositories/IAttendanceRepository';
import type { AttendanceRecord } from '../../domain/entities/AttendanceRecord';
import type { AttendanceFilterDTO, AttendanceSummaryDTO, AttendanceStatsDTO } from '../dto/AttendanceDTO';

export interface ListAttendanceResult {
  records: AttendanceRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class GetAttendanceUseCase {
  constructor(private readonly attendanceRepository: IAttendanceRepository) {}

  async getById(id: string): Promise<AttendanceRecord> {
    const record = await this.attendanceRepository.findById(id);

    if (!record) {
      throw new Error(`Attendance record ${id} not found`);
    }

    return record;
  }

  async getTodayAttendance(employeeId: string): Promise<AttendanceRecord | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.attendanceRepository.findByEmployeeAndDate(employeeId, today);
  }

  async listByEmployee(
    employeeId: string,
    filter: AttendanceFilterDTO
  ): Promise<ListAttendanceResult> {
    const { records, total } = await this.attendanceRepository.findByEmployeeId(employeeId, {
      startDate: filter.startDate,
      endDate: filter.endDate,
      limit: filter.limit,
      offset: filter.offset,
    });

    const pageSize = filter.limit ?? 20;
    const page = Math.floor((filter.offset ?? 0) / pageSize) + 1;
    const totalPages = Math.ceil(total / pageSize);

    return {
      records,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async listByEmployer(
    employerId: string,
    filter: AttendanceFilterDTO
  ): Promise<ListAttendanceResult> {
    const { records, total } = await this.attendanceRepository.findByEmployerId(employerId, {
      startDate: filter.startDate,
      endDate: filter.endDate,
      employeeId: filter.employeeId,
      hasAnomaly: filter.hasAnomaly,
      needsApproval: filter.needsApproval,
      limit: filter.limit,
      offset: filter.offset,
    });

    const pageSize = filter.limit ?? 20;
    const page = Math.floor((filter.offset ?? 0) / pageSize) + 1;
    const totalPages = Math.ceil(total / pageSize);

    return {
      records,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getPendingAnomalies(employerId: string): Promise<AttendanceRecord[]> {
    return await this.attendanceRepository.findPendingAnomalies(employerId);
  }

  async getEmployeeSummary(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AttendanceSummaryDTO> {
    const summary = await this.attendanceRepository.getEmployeeSummary(
      employeeId,
      startDate,
      endDate
    );

    return {
      employeeId,
      startDate: startDate.toISOString().split('T')[0] ?? '',
      endDate: endDate.toISOString().split('T')[0] ?? '',
      ...summary,
    };
  }

  async getEmployerStats(employerId: string, date: Date): Promise<AttendanceStatsDTO> {
    const stats = await this.attendanceRepository.getEmployerStats(employerId, date);

    const attendanceRate =
      stats.totalEmployees > 0
        ? Math.round((stats.clockedIn / stats.totalEmployees) * 100)
        : 0;

    return {
      date: date.toISOString().split('T')[0] ?? '',
      ...stats,
      attendanceRate,
    };
  }
}
