/**
 * Attendance Record Domain Entity
 * Represents a single clock in/out record with GPS tracking
 */
export class AttendanceRecord {
  constructor(
    public readonly id: string,
    public readonly employeeId: string,
    public readonly employerId: string,
    public readonly date: Date,
    public readonly clockIn: Date,
    public readonly clockOut: Date | null,
    public readonly locationLat: number,
    public readonly locationLng: number,
    public readonly locationAddress: string | null,
    public readonly clockInPhotoUrl: string | null,
    public readonly clockOutPhotoUrl: string | null,
    public readonly workHoursDecimal: number | null,
    public readonly breakHours: number,
    public readonly overtimeHours: number,
    public readonly shiftName: string | null,
    public readonly expectedClockIn: Date | null,
    public readonly expectedClockOut: Date | null,
    public readonly isAnomaly: boolean,
    public readonly anomalyType: 'location' | 'time' | 'hours' | 'impossible_travel' | null,
    public readonly anomalyReason: string | null,
    public readonly anomalyConfidence: number | null,
    public readonly approvedBy: string | null,
    public readonly approvedAt: Date | null,
    public readonly approvalNotes: string | null,
    public readonly deviceInfo: Record<string, unknown> | null,
    public readonly createdAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.clockOut && this.clockOut <= this.clockIn) {
      throw new Error('Clock out time must be after clock in time');
    }

    if (this.locationLat < -90 || this.locationLat > 90) {
      throw new Error('Invalid latitude');
    }

    if (this.locationLng < -180 || this.locationLng > 180) {
      throw new Error('Invalid longitude');
    }

    if (this.breakHours < 0) {
      throw new Error('Break hours cannot be negative');
    }

    if (this.anomalyConfidence !== null && (this.anomalyConfidence < 0 || this.anomalyConfidence > 1)) {
      throw new Error('Anomaly confidence must be between 0 and 1');
    }
  }

  /**
   * Calculate work hours (excluding break)
   */
  calculateWorkHours(): number {
    if (!this.clockOut) return 0;

    const milliseconds = this.clockOut.getTime() - this.clockIn.getTime();
    const hours = milliseconds / (1000 * 60 * 60);
    return Math.max(0, hours - this.breakHours);
  }

  /**
   * Check if attendance is late
   */
  isLate(): boolean {
    if (!this.expectedClockIn) return false;
    return this.clockIn > this.expectedClockIn;
  }

  /**
   * Calculate late duration in minutes
   */
  getLateDurationMinutes(): number {
    if (!this.isLate() || !this.expectedClockIn) return 0;

    const milliseconds = this.clockIn.getTime() - this.expectedClockIn.getTime();
    return Math.floor(milliseconds / (1000 * 60));
  }

  /**
   * Check if attendance is early
   */
  isEarly(): boolean {
    if (!this.expectedClockIn) return false;
    return this.clockIn < this.expectedClockIn;
  }

  /**
   * Check if still clocked in (no clock out)
   */
  isClockedIn(): boolean {
    return this.clockOut === null;
  }

  /**
   * Check if attendance is approved
   */
  isApproved(): boolean {
    return this.approvedBy !== null && this.approvedAt !== null;
  }

  /**
   * Check if attendance needs approval (anomaly detected)
   */
  needsApproval(): boolean {
    return this.isAnomaly && !this.isApproved();
  }

  /**
   * Clock out
   */
  clockOutNow(
    clockOut: Date,
    locationLat: number,
    locationLng: number,
    photoUrl?: string
  ): AttendanceRecord {
    if (this.clockOut) {
      throw new Error('Already clocked out');
    }

    if (clockOut <= this.clockIn) {
      throw new Error('Clock out time must be after clock in time');
    }

    const workHours = this.calculateWorkHoursFromTimes(this.clockIn, clockOut);
    const overtime = Math.max(0, workHours - 8); // Standard 8 hours

    return new AttendanceRecord(
      this.id,
      this.employeeId,
      this.employerId,
      this.date,
      this.clockIn,
      clockOut,
      this.locationLat,
      this.locationLng,
      this.locationAddress,
      this.clockInPhotoUrl,
      photoUrl ?? null,
      workHours,
      this.breakHours,
      overtime,
      this.shiftName,
      this.expectedClockIn,
      this.expectedClockOut,
      this.isAnomaly,
      this.anomalyType,
      this.anomalyReason,
      this.anomalyConfidence,
      this.approvedBy,
      this.approvedAt,
      this.approvalNotes,
      this.deviceInfo,
      this.createdAt
    );
  }

  private calculateWorkHoursFromTimes(clockIn: Date, clockOut: Date): number {
    const milliseconds = clockOut.getTime() - clockIn.getTime();
    const hours = milliseconds / (1000 * 60 * 60);
    return Math.round((hours - this.breakHours) * 100) / 100; // Round to 2 decimals
  }

  /**
   * Approve attendance
   */
  approve(approvedBy: string, notes?: string): AttendanceRecord {
    return new AttendanceRecord(
      this.id,
      this.employeeId,
      this.employerId,
      this.date,
      this.clockIn,
      this.clockOut,
      this.locationLat,
      this.locationLng,
      this.locationAddress,
      this.clockInPhotoUrl,
      this.clockOutPhotoUrl,
      this.workHoursDecimal,
      this.breakHours,
      this.overtimeHours,
      this.shiftName,
      this.expectedClockIn,
      this.expectedClockOut,
      this.isAnomaly,
      this.anomalyType,
      this.anomalyReason,
      this.anomalyConfidence,
      approvedBy,
      new Date(),
      notes ?? null,
      this.deviceInfo,
      this.createdAt
    );
  }

  /**
   * Mark as anomaly
   */
  markAsAnomaly(
    type: 'location' | 'time' | 'hours' | 'impossible_travel',
    reason: string,
    confidence: number
  ): AttendanceRecord {
    return new AttendanceRecord(
      this.id,
      this.employeeId,
      this.employerId,
      this.date,
      this.clockIn,
      this.clockOut,
      this.locationLat,
      this.locationLng,
      this.locationAddress,
      this.clockInPhotoUrl,
      this.clockOutPhotoUrl,
      this.workHoursDecimal,
      this.breakHours,
      this.overtimeHours,
      this.shiftName,
      this.expectedClockIn,
      this.expectedClockOut,
      true,
      type,
      reason,
      confidence,
      this.approvedBy,
      this.approvedAt,
      this.approvalNotes,
      this.deviceInfo,
      this.createdAt
    );
  }

  /**
   * Convert to plain object
   */
  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      employeeId: this.employeeId,
      employerId: this.employerId,
      date: this.date.toISOString().split('T')[0],
      clockIn: this.clockIn.toISOString(),
      clockOut: this.clockOut?.toISOString() ?? null,
      locationLat: this.locationLat,
      locationLng: this.locationLng,
      locationAddress: this.locationAddress,
      clockInPhotoUrl: this.clockInPhotoUrl,
      clockOutPhotoUrl: this.clockOutPhotoUrl,
      workHoursDecimal: this.workHoursDecimal,
      breakHours: this.breakHours,
      overtimeHours: this.overtimeHours,
      shiftName: this.shiftName,
      expectedClockIn: this.expectedClockIn?.toISOString() ?? null,
      expectedClockOut: this.expectedClockOut?.toISOString() ?? null,
      isAnomaly: this.isAnomaly,
      anomalyType: this.anomalyType,
      anomalyReason: this.anomalyReason,
      anomalyConfidence: this.anomalyConfidence,
      approvedBy: this.approvedBy,
      approvedAt: this.approvedAt?.toISOString() ?? null,
      approvalNotes: this.approvalNotes,
      deviceInfo: this.deviceInfo,
      createdAt: this.createdAt.toISOString(),
      // Computed
      isLate: this.isLate(),
      lateDurationMinutes: this.getLateDurationMinutes(),
      isClockedIn: this.isClockedIn(),
      needsApproval: this.needsApproval(),
    };
  }
}
