/**
 * Payroll Summary Domain Entity
 * Represents individual employee payroll for a period
 */
export class PayrollSummary {
  constructor(
    public readonly id: string,
    public readonly periodId: string,
    public readonly employeeId: string,
    public readonly employerId: string,
    public readonly employeeNumber: string,
    public readonly employeeName: string,
    public readonly department: string | null,
    public readonly position: string | null,
    public readonly workingDays: number,
    public readonly presentDays: number,
    public readonly absentDays: number,
    public readonly lateDays: number,
    public readonly overtimeHours: number,
    public readonly baseSalary: number,
    public readonly allowances: number,
    public readonly overtimePay: number,
    public readonly bonuses: number,
    public readonly totalEarnings: number,
    public readonly bpjsKesehatanEmployee: number,
    public readonly bpjsKetenagakerjaanEmployee: number,
    public readonly pph21: number,
    public readonly loans: number,
    public readonly otherDeductions: number,
    public readonly totalDeductions: number,
    public readonly netPay: number,
    public readonly bpjsKesehatanEmployer: number,
    public readonly bpjsKetenagakerjaanEmployer: number,
    public readonly totalEmployerCost: number,
    public readonly hasAnomalies: boolean,
    public readonly anomalyDetails: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
    }> | null,
    public readonly aiConfidence: number | null,
    public readonly aiReview: string | null,
    public readonly notes: string | null,
    public readonly status: 'draft' | 'calculated' | 'approved' | 'paid',
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.workingDays < 0 || this.presentDays < 0 || this.absentDays < 0) {
      throw new Error('Working days cannot be negative');
    }

    if (this.presentDays > this.workingDays) {
      throw new Error('Present days cannot exceed working days');
    }

    if (this.baseSalary < 0) {
      throw new Error('Base salary cannot be negative');
    }

    if (this.netPay < 0) {
      throw new Error('Net pay cannot be negative');
    }

    if (this.aiConfidence !== null && (this.aiConfidence < 0 || this.aiConfidence > 1)) {
      throw new Error('AI confidence must be between 0 and 1');
    }
  }

  /**
   * Calculate attendance rate
   */
  get attendanceRate(): number {
    if (this.workingDays === 0) return 0;
    return (this.presentDays / this.workingDays) * 100;
  }

  /**
   * Get gross pay (before deductions)
   */
  get grossPay(): number {
    return this.totalEarnings;
  }

  /**
   * Check if has critical anomalies
   */
  hasCriticalAnomalies(): boolean {
    if (!this.hasAnomalies || !this.anomalyDetails) return false;
    return this.anomalyDetails.some((a) => a.severity === 'high');
  }

  /**
   * Check if calculation is suspicious
   */
  isSuspicious(): boolean {
    return (
      this.hasAnomalies ||
      (this.aiConfidence !== null && this.aiConfidence < 0.7) ||
      this.netPay > this.totalEarnings * 1.1 || // Net pay > earnings (invalid)
      this.totalDeductions > this.totalEarnings * 0.5 // Deductions > 50% of earnings
    );
  }

  /**
   * Check if ready for approval
   */
  canApprove(): boolean {
    return (
      this.status === 'calculated' &&
      !this.hasCriticalAnomalies() &&
      this.netPay >= 0 &&
      this.netPay <= this.totalEarnings
    );
  }

  /**
   * Mark as calculated
   */
  markCalculated(): PayrollSummary {
    if (this.status !== 'draft') {
      throw new Error('Can only mark draft payroll as calculated');
    }

    return new PayrollSummary(
      this.id,
      this.periodId,
      this.employeeId,
      this.employerId,
      this.employeeNumber,
      this.employeeName,
      this.department,
      this.position,
      this.workingDays,
      this.presentDays,
      this.absentDays,
      this.lateDays,
      this.overtimeHours,
      this.baseSalary,
      this.allowances,
      this.overtimePay,
      this.bonuses,
      this.totalEarnings,
      this.bpjsKesehatanEmployee,
      this.bpjsKetenagakerjaanEmployee,
      this.pph21,
      this.loans,
      this.otherDeductions,
      this.totalDeductions,
      this.netPay,
      this.bpjsKesehatanEmployer,
      this.bpjsKetenagakerjaanEmployer,
      this.totalEmployerCost,
      this.hasAnomalies,
      this.anomalyDetails,
      this.aiConfidence,
      this.aiReview,
      this.notes,
      'calculated',
      this.createdAt,
      new Date()
    );
  }

  /**
   * Approve payroll
   */
  approve(notes?: string): PayrollSummary {
    if (!this.canApprove()) {
      throw new Error(
        'Cannot approve: payroll not calculated or has critical anomalies'
      );
    }

    return new PayrollSummary(
      this.id,
      this.periodId,
      this.employeeId,
      this.employerId,
      this.employeeNumber,
      this.employeeName,
      this.department,
      this.position,
      this.workingDays,
      this.presentDays,
      this.absentDays,
      this.lateDays,
      this.overtimeHours,
      this.baseSalary,
      this.allowances,
      this.overtimePay,
      this.bonuses,
      this.totalEarnings,
      this.bpjsKesehatanEmployee,
      this.bpjsKetenagakerjaanEmployee,
      this.pph21,
      this.loans,
      this.otherDeductions,
      this.totalDeductions,
      this.netPay,
      this.bpjsKesehatanEmployer,
      this.bpjsKetenagakerjaanEmployer,
      this.totalEmployerCost,
      this.hasAnomalies,
      this.anomalyDetails,
      this.aiConfidence,
      this.aiReview,
      notes ?? this.notes,
      'approved',
      this.createdAt,
      new Date()
    );
  }

  /**
   * Mark as paid
   */
  markAsPaid(): PayrollSummary {
    if (this.status !== 'approved') {
      throw new Error('Can only mark approved payroll as paid');
    }

    return new PayrollSummary(
      this.id,
      this.periodId,
      this.employeeId,
      this.employerId,
      this.employeeNumber,
      this.employeeName,
      this.department,
      this.position,
      this.workingDays,
      this.presentDays,
      this.absentDays,
      this.lateDays,
      this.overtimeHours,
      this.baseSalary,
      this.allowances,
      this.overtimePay,
      this.bonuses,
      this.totalEarnings,
      this.bpjsKesehatanEmployee,
      this.bpjsKetenagakerjaanEmployee,
      this.pph21,
      this.loans,
      this.otherDeductions,
      this.totalDeductions,
      this.netPay,
      this.bpjsKesehatanEmployer,
      this.bpjsKetenagakerjaanEmployer,
      this.totalEmployerCost,
      this.hasAnomalies,
      this.anomalyDetails,
      this.aiConfidence,
      this.aiReview,
      this.notes,
      'paid',
      this.createdAt,
      new Date()
    );
  }

  /**
   * Flag anomaly
   */
  flagAnomaly(
    anomalies: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
    }>,
    aiConfidence: number,
    aiReview: string
  ): PayrollSummary {
    return new PayrollSummary(
      this.id,
      this.periodId,
      this.employeeId,
      this.employerId,
      this.employeeNumber,
      this.employeeName,
      this.department,
      this.position,
      this.workingDays,
      this.presentDays,
      this.absentDays,
      this.lateDays,
      this.overtimeHours,
      this.baseSalary,
      this.allowances,
      this.overtimePay,
      this.bonuses,
      this.totalEarnings,
      this.bpjsKesehatanEmployee,
      this.bpjsKetenagakerjaanEmployee,
      this.pph21,
      this.loans,
      this.otherDeductions,
      this.totalDeductions,
      this.netPay,
      this.bpjsKesehatanEmployer,
      this.bpjsKetenagakerjaanEmployer,
      this.totalEmployerCost,
      true,
      anomalies,
      aiConfidence,
      aiReview,
      this.notes,
      this.status,
      this.createdAt,
      new Date()
    );
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      periodId: this.periodId,
      employeeId: this.employeeId,
      employerId: this.employerId,
      employeeNumber: this.employeeNumber,
      employeeName: this.employeeName,
      department: this.department,
      position: this.position,
      workingDays: this.workingDays,
      presentDays: this.presentDays,
      absentDays: this.absentDays,
      lateDays: this.lateDays,
      overtimeHours: this.overtimeHours,
      attendanceRate: this.attendanceRate,
      baseSalary: this.baseSalary,
      allowances: this.allowances,
      overtimePay: this.overtimePay,
      bonuses: this.bonuses,
      totalEarnings: this.totalEarnings,
      grossPay: this.grossPay,
      bpjsKesehatanEmployee: this.bpjsKesehatanEmployee,
      bpjsKetenagakerjaanEmployee: this.bpjsKetenagakerjaanEmployee,
      pph21: this.pph21,
      loans: this.loans,
      otherDeductions: this.otherDeductions,
      totalDeductions: this.totalDeductions,
      netPay: this.netPay,
      bpjsKesehatanEmployer: this.bpjsKesehatanEmployer,
      bpjsKetenagakerjaanEmployer: this.bpjsKetenagakerjaanEmployer,
      totalEmployerCost: this.totalEmployerCost,
      hasAnomalies: this.hasAnomalies,
      anomalyDetails: this.anomalyDetails,
      aiConfidence: this.aiConfidence,
      aiReview: this.aiReview,
      notes: this.notes,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      // Computed
      hasCriticalAnomalies: this.hasCriticalAnomalies(),
      isSuspicious: this.isSuspicious(),
      canApprove: this.canApprove(),
    };
  }
}
