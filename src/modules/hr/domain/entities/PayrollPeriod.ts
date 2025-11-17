/**
 * Payroll Period Domain Entity
 * Represents a payroll processing period (typically monthly)
 */
export class PayrollPeriod {
  constructor(
    public readonly id: string,
    public readonly employerId: string,
    public readonly periodMonth: number,
    public readonly periodYear: number,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly paymentDate: Date,
    public readonly status: 'draft' | 'processing' | 'approved' | 'paid' | 'cancelled',
    public readonly totalEmployees: number,
    public readonly totalGrossPay: number,
    public readonly totalDeductions: number,
    public readonly totalNetPay: number,
    public readonly totalBpjsEmployer: number,
    public readonly totalBpjsEmployee: number,
    public readonly totalPph21: number,
    public readonly processedAt: Date | null,
    public readonly approvedAt: Date | null,
    public readonly approvedBy: string | null,
    public readonly paidAt: Date | null,
    public readonly notes: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.periodMonth < 1 || this.periodMonth > 12) {
      throw new Error('Period month must be between 1 and 12');
    }

    if (this.periodYear < 2000 || this.periodYear > 2100) {
      throw new Error('Invalid period year');
    }

    if (this.endDate < this.startDate) {
      throw new Error('End date must be after or equal to start date');
    }

    if (this.paymentDate < this.endDate) {
      throw new Error('Payment date must be after or equal to end date');
    }

    if (this.totalEmployees < 0) {
      throw new Error('Total employees cannot be negative');
    }

    if (this.totalGrossPay < 0 || this.totalDeductions < 0 || this.totalNetPay < 0) {
      throw new Error('Payment amounts cannot be negative');
    }
  }

  /**
   * Get period name (e.g., "January 2024")
   */
  get periodName(): string {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `${monthNames[this.periodMonth - 1]} ${this.periodYear}`;
  }

  /**
   * Get period name in Indonesian
   */
  get periodNameIndonesian(): string {
    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    return `${monthNames[this.periodMonth - 1]} ${this.periodYear}`;
  }

  /**
   * Check if period is draft
   */
  isDraft(): boolean {
    return this.status === 'draft';
  }

  /**
   * Check if period is processing
   */
  isProcessing(): boolean {
    return this.status === 'processing';
  }

  /**
   * Check if period is approved
   */
  isApproved(): boolean {
    return this.status === 'approved';
  }

  /**
   * Check if period is paid
   */
  isPaid(): boolean {
    return this.status === 'paid';
  }

  /**
   * Check if period can be edited
   */
  canEdit(): boolean {
    return this.status === 'draft';
  }

  /**
   * Check if period can be approved
   */
  canApprove(): boolean {
    return this.status === 'processing';
  }

  /**
   * Check if period can be paid
   */
  canPay(): boolean {
    return this.status === 'approved';
  }

  /**
   * Start processing payroll
   */
  startProcessing(): PayrollPeriod {
    if (!this.isDraft()) {
      throw new Error('Can only process draft payroll periods');
    }

    return new PayrollPeriod(
      this.id,
      this.employerId,
      this.periodMonth,
      this.periodYear,
      this.startDate,
      this.endDate,
      this.paymentDate,
      'processing',
      this.totalEmployees,
      this.totalGrossPay,
      this.totalDeductions,
      this.totalNetPay,
      this.totalBpjsEmployer,
      this.totalBpjsEmployee,
      this.totalPph21,
      new Date(),
      this.approvedAt,
      this.approvedBy,
      this.paidAt,
      this.notes,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Approve payroll period
   */
  approve(approverId: string, notes?: string): PayrollPeriod {
    if (!this.isProcessing()) {
      throw new Error('Can only approve processing payroll periods');
    }

    return new PayrollPeriod(
      this.id,
      this.employerId,
      this.periodMonth,
      this.periodYear,
      this.startDate,
      this.endDate,
      this.paymentDate,
      'approved',
      this.totalEmployees,
      this.totalGrossPay,
      this.totalDeductions,
      this.totalNetPay,
      this.totalBpjsEmployer,
      this.totalBpjsEmployee,
      this.totalPph21,
      this.processedAt,
      new Date(),
      approverId,
      this.paidAt,
      notes ?? this.notes,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Mark as paid
   */
  markAsPaid(): PayrollPeriod {
    if (!this.isApproved()) {
      throw new Error('Can only mark approved payroll periods as paid');
    }

    return new PayrollPeriod(
      this.id,
      this.employerId,
      this.periodMonth,
      this.periodYear,
      this.startDate,
      this.endDate,
      this.paymentDate,
      'paid',
      this.totalEmployees,
      this.totalGrossPay,
      this.totalDeductions,
      this.totalNetPay,
      this.totalBpjsEmployer,
      this.totalBpjsEmployee,
      this.totalPph21,
      this.processedAt,
      this.approvedAt,
      this.approvedBy,
      new Date(),
      this.notes,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Cancel payroll period
   */
  cancel(notes: string): PayrollPeriod {
    if (this.isPaid()) {
      throw new Error('Cannot cancel paid payroll periods');
    }

    return new PayrollPeriod(
      this.id,
      this.employerId,
      this.periodMonth,
      this.periodYear,
      this.startDate,
      this.endDate,
      this.paymentDate,
      'cancelled',
      this.totalEmployees,
      this.totalGrossPay,
      this.totalDeductions,
      this.totalNetPay,
      this.totalBpjsEmployer,
      this.totalBpjsEmployee,
      this.totalPph21,
      this.processedAt,
      this.approvedAt,
      this.approvedBy,
      this.paidAt,
      notes,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update totals after processing
   */
  updateTotals(totals: {
    totalEmployees: number;
    totalGrossPay: number;
    totalDeductions: number;
    totalNetPay: number;
    totalBpjsEmployer: number;
    totalBpjsEmployee: number;
    totalPph21: number;
  }): PayrollPeriod {
    return new PayrollPeriod(
      this.id,
      this.employerId,
      this.periodMonth,
      this.periodYear,
      this.startDate,
      this.endDate,
      this.paymentDate,
      this.status,
      totals.totalEmployees,
      totals.totalGrossPay,
      totals.totalDeductions,
      totals.totalNetPay,
      totals.totalBpjsEmployer,
      totals.totalBpjsEmployee,
      totals.totalPph21,
      this.processedAt,
      this.approvedAt,
      this.approvedBy,
      this.paidAt,
      this.notes,
      this.createdAt,
      new Date()
    );
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      employerId: this.employerId,
      periodMonth: this.periodMonth,
      periodYear: this.periodYear,
      periodName: this.periodName,
      periodNameIndonesian: this.periodNameIndonesian,
      startDate: this.startDate.toISOString().split('T')[0],
      endDate: this.endDate.toISOString().split('T')[0],
      paymentDate: this.paymentDate.toISOString().split('T')[0],
      status: this.status,
      totalEmployees: this.totalEmployees,
      totalGrossPay: this.totalGrossPay,
      totalDeductions: this.totalDeductions,
      totalNetPay: this.totalNetPay,
      totalBpjsEmployer: this.totalBpjsEmployer,
      totalBpjsEmployee: this.totalBpjsEmployee,
      totalPph21: this.totalPph21,
      processedAt: this.processedAt?.toISOString() ?? null,
      approvedAt: this.approvedAt?.toISOString() ?? null,
      approvedBy: this.approvedBy,
      paidAt: this.paidAt?.toISOString() ?? null,
      notes: this.notes,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      // Computed
      canEdit: this.canEdit(),
      canApprove: this.canApprove(),
      canPay: this.canPay(),
    };
  }
}
