import type { IAttendanceRepository } from '../../domain/repositories/IAttendanceRepository';
import type { ClockInDTO } from '../dto/AttendanceDTO';
import { AttendanceRecord } from '../../domain/entities/AttendanceRecord';

export class ClockInUseCase {
  constructor(private readonly attendanceRepository: IAttendanceRepository) {}

  async execute(
    employerId: string,
    dto: ClockInDTO
  ): Promise<AttendanceRecord> {
    const date = dto.date ?? new Date();
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);

    // Check if already clocked in today
    const existing = await this.attendanceRepository.findByEmployeeAndDate(
      dto.employeeId,
      today
    );

    if (existing) {
      throw new Error('Already clocked in today');
    }

    // Create attendance record
    const record = new AttendanceRecord(
      crypto.randomUUID(), // Temporary ID
      dto.employeeId,
      employerId,
      today,
      new Date(), // Clock in time
      null, // Clock out
      dto.locationLat,
      dto.locationLng,
      dto.locationAddress ?? null,
      dto.photoUrl ?? null,
      null, // Clock out photo
      null, // Work hours (calculated on clock out)
      0, // Break hours (default)
      0, // Overtime hours
      null, // Shift name (can be set later)
      null, // Expected clock in
      null, // Expected clock out
      false, // Is anomaly (will be detected)
      null, // Anomaly type
      null, // Anomaly reason
      null, // Anomaly confidence
      null, // Approved by
      null, // Approved at
      null, // Approval notes
      dto.deviceInfo ?? null,
      new Date()
    );

    return await this.attendanceRepository.create(record);
  }
}
