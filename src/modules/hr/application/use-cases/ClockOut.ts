import type { IAttendanceRepository } from '../../domain/repositories/IAttendanceRepository';
import type { ClockOutDTO } from '../dto/AttendanceDTO';
import type { AttendanceRecord } from '../../domain/entities/AttendanceRecord';

export class ClockOutUseCase {
  constructor(private readonly attendanceRepository: IAttendanceRepository) {}

  async execute(dto: ClockOutDTO): Promise<AttendanceRecord> {
    // Get existing attendance record
    const existing = await this.attendanceRepository.findById(dto.attendanceId);

    if (!existing) {
      throw new Error(`Attendance record ${dto.attendanceId} not found`);
    }

    if (existing.clockOut) {
      throw new Error('Already clocked out');
    }

    // Clock out
    const updated = existing.clockOutNow(
      new Date(),
      dto.locationLat,
      dto.locationLng,
      dto.photoUrl ?? undefined
    );

    return await this.attendanceRepository.update(existing.id, {
      clockOut: updated.clockOut,
      workHoursDecimal: updated.workHoursDecimal,
      overtimeHours: updated.overtimeHours,
      clockOutPhotoUrl: updated.clockOutPhotoUrl,
    });
  }
}
