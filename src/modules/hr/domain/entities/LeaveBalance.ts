/**
 * Leave Balance Domain Entity
 * Tracks employee leave quotas and usage per year
 */
export class LeaveBalance {
  constructor(
    public readonly employeeId: string,
    public readonly employerId: string,
    public readonly year: number,
    public readonly annualQuota: number,
    public readonly annualUsed: number,
    public readonly annualCarryForward: number,
    public readonly carryForwardExpiresAt: Date | null,
    public readonly sickUsed: number,
    public readonly unpaidUsed: number,
    public readonly customQuotas: Record<string, { quota: number; used: number }>
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.year < 2000 || this.year > 2100) {
      throw new Error('Invalid year');
    }

    if (this.annualQuota < 0 || this.annualUsed < 0 || this.annualCarryForward < 0) {
      throw new Error('Leave balance values cannot be negative');
    }

    if (this.sickUsed < 0 || this.unpaidUsed < 0) {
      throw new Error('Leave usage values cannot be negative');
    }
  }

  /**
   * Calculate total annual leave available (quota + carry forward)
   */
  get totalAnnualAvailable(): number {
    return this.annualQuota + this.annualCarryForward;
  }

  /**
   * Calculate annual leave remaining
   */
  get annualRemaining(): number {
    return Math.max(0, this.totalAnnualAvailable - this.annualUsed);
  }

  /**
   * Check if employee has sufficient annual leave
   */
  hasSufficientAnnualLeave(days: number): boolean {
    return this.annualRemaining >= days;
  }

  /**
   * Check if carry forward is expired
   */
  isCarryForwardExpired(): boolean {
    if (!this.carryForwardExpiresAt) return false;
    return new Date() > this.carryForwardExpiresAt;
  }

  /**
   * Deduct annual leave
   */
  deductAnnualLeave(days: number): LeaveBalance {
    if (!this.hasSufficientAnnualLeave(days)) {
      throw new Error(
        `Insufficient annual leave balance. Requested: ${days}, Available: ${this.annualRemaining}`
      );
    }

    return new LeaveBalance(
      this.employeeId,
      this.employerId,
      this.year,
      this.annualQuota,
      this.annualUsed + days,
      this.annualCarryForward,
      this.carryForwardExpiresAt,
      this.sickUsed,
      this.unpaidUsed,
      this.customQuotas
    );
  }

  /**
   * Deduct sick leave
   */
  deductSickLeave(days: number): LeaveBalance {
    return new LeaveBalance(
      this.employeeId,
      this.employerId,
      this.year,
      this.annualQuota,
      this.annualUsed,
      this.annualCarryForward,
      this.carryForwardExpiresAt,
      this.sickUsed + days,
      this.unpaidUsed,
      this.customQuotas
    );
  }

  /**
   * Deduct unpaid leave
   */
  deductUnpaidLeave(days: number): LeaveBalance {
    return new LeaveBalance(
      this.employeeId,
      this.employerId,
      this.year,
      this.annualQuota,
      this.annualUsed,
      this.annualCarryForward,
      this.carryForwardExpiresAt,
      this.sickUsed,
      this.unpaidUsed + days,
      this.customQuotas
    );
  }

  /**
   * Add carry forward from previous year
   */
  addCarryForward(days: number, expiresAt: Date): LeaveBalance {
    return new LeaveBalance(
      this.employeeId,
      this.employerId,
      this.year,
      this.annualQuota,
      this.annualUsed,
      this.annualCarryForward + days,
      expiresAt,
      this.sickUsed,
      this.unpaidUsed,
      this.customQuotas
    );
  }

  toObject(): Record<string, unknown> {
    return {
      employeeId: this.employeeId,
      employerId: this.employerId,
      year: this.year,
      annualQuota: this.annualQuota,
      annualUsed: this.annualUsed,
      annualCarryForward: this.annualCarryForward,
      carryForwardExpiresAt: this.carryForwardExpiresAt?.toISOString() ?? null,
      sickUsed: this.sickUsed,
      unpaidUsed: this.unpaidUsed,
      customQuotas: this.customQuotas,
      // Computed
      totalAnnualAvailable: this.totalAnnualAvailable,
      annualRemaining: this.annualRemaining,
      isCarryForwardExpired: this.isCarryForwardExpired(),
    };
  }
}
