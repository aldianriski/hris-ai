import type { EmploymentType, EmployeeStatus, PTKPStatus } from '@/config/constants';

/**
 * Employee Domain Entity
 * Core business object for employee management
 */
export class Employee {
  constructor(
    public readonly id: string,
    public readonly employerId: string,
    public readonly employeeNumber: string,
    public readonly fullName: string,
    public readonly email: string,
    public readonly phone: string | null,
    public readonly dateOfBirth: Date | null,
    public readonly gender: 'male' | 'female' | 'other' | null,
    public readonly maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | null,
    public readonly address: string | null,
    public readonly city: string | null,
    public readonly postalCode: string | null,
    public readonly idCardNumber: string | null,
    public readonly joinDate: Date,
    public readonly employmentType: EmploymentType,
    public readonly contractStartDate: Date | null,
    public readonly contractEndDate: Date | null,
    public readonly position: string,
    public readonly department: string,
    public readonly division: string | null,
    public readonly managerId: string | null,
    public readonly salaryBase: number,
    public readonly salaryComponents: {
      allowances: Array<{ name: string; amount: number; isTaxable: boolean }>;
      deductions: Array<{ name: string; amount: number }>;
    },
    public readonly bpjsKesehatanNumber: string | null,
    public readonly bpjsKetenagakerjaanNumber: string | null,
    public readonly npwp: string | null,
    public readonly ptkpStatus: PTKPStatus,
    public readonly bankName: string | null,
    public readonly bankAccountNumber: string | null,
    public readonly bankAccountHolder: string | null,
    public readonly status: EmployeeStatus,
    public readonly exitDate: Date | null,
    public readonly exitReason: string | null,
    public readonly photoUrl: string | null,
    public readonly notes: string | null,
    public readonly userId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  /**
   * Validate employee data
   */
  private validate(): void {
    if (!this.fullName || this.fullName.trim().length === 0) {
      throw new Error('Full name is required');
    }

    if (!this.email || !this.isValidEmail(this.email)) {
      throw new Error('Valid email is required');
    }

    if (this.salaryBase < 0) {
      throw new Error('Salary base must be non-negative');
    }

    if (this.contractEndDate && this.contractStartDate) {
      if (this.contractEndDate < this.contractStartDate) {
        throw new Error('Contract end date must be after start date');
      }
    }

    if (this.exitDate && this.exitDate < this.joinDate) {
      throw new Error('Exit date must be after join date');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Calculate total gross salary (base + allowances)
   */
  get totalGrossSalary(): number {
    const allowancesTotal = this.salaryComponents.allowances.reduce(
      (sum, allowance) => sum + allowance.amount,
      0
    );
    return this.salaryBase + allowancesTotal;
  }

  /**
   * Calculate taxable income
   */
  get taxableIncome(): number {
    const taxableAllowances = this.salaryComponents.allowances
      .filter((a) => a.isTaxable)
      .reduce((sum, a) => sum + a.amount, 0);
    return this.salaryBase + taxableAllowances;
  }

  /**
   * Check if employee is active
   */
  get isActive(): boolean {
    return this.status === 'active' || this.status === 'probation';
  }

  /**
   * Check if contract is expiring soon (within 30 days)
   */
  isContractExpiringSoon(days: number = 30): boolean {
    if (!this.contractEndDate) return false;

    const daysUntilExpiry = Math.ceil(
      (this.contractEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return daysUntilExpiry > 0 && daysUntilExpiry <= days;
  }

  /**
   * Check if employee is on probation
   */
  get isOnProbation(): boolean {
    return this.status === 'probation';
  }

  /**
   * Calculate years of service
   */
  get yearsOfService(): number {
    const endDate = this.exitDate || new Date();
    const years = (endDate.getTime() - this.joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return Math.floor(years * 10) / 10; // Round to 1 decimal
  }

  /**
   * Get number of dependents from PTKP status
   */
  get numberOfDependents(): number {
    // PTKP status format: TK/0, K/1, etc.
    const match = this.ptkpStatus.match(/\/(\d)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Create a copy with updated fields
   */
  update(updates: Partial<Omit<Employee, 'id' | 'employerId' | 'employeeNumber' | 'createdAt' | 'validate' | 'isValidEmail' | 'totalGrossSalary' | 'taxableIncome' | 'isActive' | 'isOnProbation' | 'yearsOfService' | 'update'>>): Employee {
    return new Employee(
      this.id,
      this.employerId,
      this.employeeNumber,
      updates.fullName ?? this.fullName,
      updates.email ?? this.email,
      updates.phone ?? this.phone,
      updates.dateOfBirth ?? this.dateOfBirth,
      updates.gender ?? this.gender,
      updates.maritalStatus ?? this.maritalStatus,
      updates.address ?? this.address,
      updates.city ?? this.city,
      updates.postalCode ?? this.postalCode,
      updates.idCardNumber ?? this.idCardNumber,
      updates.joinDate ?? this.joinDate,
      updates.employmentType ?? this.employmentType,
      updates.contractStartDate ?? this.contractStartDate,
      updates.contractEndDate ?? this.contractEndDate,
      updates.position ?? this.position,
      updates.department ?? this.department,
      updates.division ?? this.division,
      updates.managerId ?? this.managerId,
      updates.salaryBase ?? this.salaryBase,
      updates.salaryComponents ?? this.salaryComponents,
      updates.bpjsKesehatanNumber ?? this.bpjsKesehatanNumber,
      updates.bpjsKetenagakerjaanNumber ?? this.bpjsKetenagakerjaanNumber,
      updates.npwp ?? this.npwp,
      updates.ptkpStatus ?? this.ptkpStatus,
      updates.bankName ?? this.bankName,
      updates.bankAccountNumber ?? this.bankAccountNumber,
      updates.bankAccountHolder ?? this.bankAccountHolder,
      updates.status ?? this.status,
      updates.exitDate ?? this.exitDate,
      updates.exitReason ?? this.exitReason,
      updates.photoUrl ?? this.photoUrl,
      updates.notes ?? this.notes,
      updates.userId ?? this.userId,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Convert to plain object for serialization
   */
  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      employerId: this.employerId,
      employeeNumber: this.employeeNumber,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      dateOfBirth: this.dateOfBirth?.toISOString(),
      gender: this.gender,
      maritalStatus: this.maritalStatus,
      address: this.address,
      city: this.city,
      postalCode: this.postalCode,
      idCardNumber: this.idCardNumber,
      joinDate: this.joinDate.toISOString(),
      employmentType: this.employmentType,
      contractStartDate: this.contractStartDate?.toISOString(),
      contractEndDate: this.contractEndDate?.toISOString(),
      position: this.position,
      department: this.department,
      division: this.division,
      managerId: this.managerId,
      salaryBase: this.salaryBase,
      salaryComponents: this.salaryComponents,
      bpjsKesehatanNumber: this.bpjsKesehatanNumber,
      bpjsKetenagakerjaanNumber: this.bpjsKetenagakerjaanNumber,
      npwp: this.npwp,
      ptkpStatus: this.ptkpStatus,
      bankName: this.bankName,
      bankAccountNumber: this.bankAccountNumber,
      bankAccountHolder: this.bankAccountHolder,
      status: this.status,
      exitDate: this.exitDate?.toISOString(),
      exitReason: this.exitReason,
      photoUrl: this.photoUrl,
      notes: this.notes,
      userId: this.userId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      // Computed properties
      totalGrossSalary: this.totalGrossSalary,
      taxableIncome: this.taxableIncome,
      isActive: this.isActive,
      yearsOfService: this.yearsOfService,
    };
  }
}
