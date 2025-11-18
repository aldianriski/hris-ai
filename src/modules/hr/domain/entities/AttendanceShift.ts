/**
 * Attendance Shift Domain Entity
 * Represents a work shift schedule template
 */
export class AttendanceShift {
  constructor(
    public readonly id: string,
    public readonly employerId: string,
    public readonly shiftName: string,
    public readonly startTime: string, // HH:mm format
    public readonly endTime: string, // HH:mm format
    public readonly breakDurationMinutes: number,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.shiftName || this.shiftName.trim().length === 0) {
      throw new Error('Shift name is required');
    }

    if (!this.isValidTimeFormat(this.startTime)) {
      throw new Error('Invalid start time format. Use HH:mm');
    }

    if (!this.isValidTimeFormat(this.endTime)) {
      throw new Error('Invalid end time format. Use HH:mm');
    }

    if (this.breakDurationMinutes < 0) {
      throw new Error('Break duration cannot be negative');
    }
  }

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Calculate shift duration in hours
   */
  getShiftDurationHours(): number {
    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.endTime.split(':').map(Number);

    const startMinutes = (startHour ?? 0) * 60 + (startMinute ?? 0);
    let endMinutes = (endHour ?? 0) * 60 + (endMinute ?? 0);

    // Handle overnight shifts
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }

    const totalMinutes = endMinutes - startMinutes - this.breakDurationMinutes;
    return totalMinutes / 60;
  }

  /**
   * Get expected clock in time for a specific date
   */
  getExpectedClockIn(date: Date): Date {
    const [hour, minute] = this.startTime.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hour ?? 0, minute ?? 0, 0, 0);
    return result;
  }

  /**
   * Get expected clock out time for a specific date
   */
  getExpectedClockOut(date: Date): Date {
    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.endTime.split(':').map(Number);

    const result = new Date(date);
    result.setHours(endHour ?? 0, endMinute ?? 0, 0, 0);

    // Handle overnight shifts
    const startMinutes = (startHour ?? 0) * 60 + (startMinute ?? 0);
    const endMinutes = (endHour ?? 0) * 60 + (endMinute ?? 0);

    if (endMinutes <= startMinutes) {
      result.setDate(result.getDate() + 1);
    }

    return result;
  }

  /**
   * Activate shift
   */
  activate(): AttendanceShift {
    return new AttendanceShift(
      this.id,
      this.employerId,
      this.shiftName,
      this.startTime,
      this.endTime,
      this.breakDurationMinutes,
      true,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Deactivate shift
   */
  deactivate(): AttendanceShift {
    return new AttendanceShift(
      this.id,
      this.employerId,
      this.shiftName,
      this.startTime,
      this.endTime,
      this.breakDurationMinutes,
      false,
      this.createdAt,
      new Date()
    );
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      employerId: this.employerId,
      shiftName: this.shiftName,
      startTime: this.startTime,
      endTime: this.endTime,
      breakDurationMinutes: this.breakDurationMinutes,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      shiftDurationHours: this.getShiftDurationHours(),
    };
  }
}
