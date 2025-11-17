/**
 * Position Domain Entity
 * Represents job positions/titles in the organization
 */
export class Position {
  constructor(
    public readonly id: string,
    public readonly employerId: string,
    public readonly code: string,
    public readonly title: string,
    public readonly titleIndonesian: string,
    public readonly departmentId: string | null,
    public readonly level:
      | 'executive'
      | 'senior_management'
      | 'middle_management'
      | 'supervisor'
      | 'staff'
      | 'entry',
    public readonly jobFamily: string | null, // e.g., "Engineering", "Sales", "Finance"
    public readonly reportsTo: string | null, // Position ID
    public readonly description: string | null,
    public readonly responsibilities: string[] | null,
    public readonly requirements: string[] | null,
    public readonly minSalary: number | null,
    public readonly maxSalary: number | null,
    public readonly isActive: boolean,
    public readonly headcount: number, // How many people can fill this position
    public readonly currentCount: number, // How many people currently in this position
    public readonly displayOrder: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.code || this.code.trim().length === 0) {
      throw new Error('Position code is required');
    }

    if (!this.title || this.title.trim().length === 0) {
      throw new Error('Position title is required');
    }

    if (this.headcount < 0) {
      throw new Error('Headcount cannot be negative');
    }

    if (this.currentCount < 0) {
      throw new Error('Current count cannot be negative');
    }

    if (this.currentCount > this.headcount) {
      throw new Error('Current count cannot exceed headcount');
    }

    if (
      this.minSalary !== null &&
      this.maxSalary !== null &&
      this.minSalary > this.maxSalary
    ) {
      throw new Error('Min salary cannot exceed max salary');
    }

    if (this.displayOrder < 0) {
      throw new Error('Display order cannot be negative');
    }
  }

  /**
   * Check if position has openings
   */
  hasOpenings(): boolean {
    return this.currentCount < this.headcount;
  }

  /**
   * Get number of openings
   */
  get openings(): number {
    return Math.max(0, this.headcount - this.currentCount);
  }

  /**
   * Check if position is full
   */
  isFull(): boolean {
    return this.currentCount >= this.headcount;
  }

  /**
   * Check if salary is defined
   */
  hasSalaryRange(): boolean {
    return this.minSalary !== null && this.maxSalary !== null;
  }

  /**
   * Get salary range midpoint
   */
  get salaryMidpoint(): number | null {
    if (!this.hasSalaryRange()) return null;
    return ((this.minSalary ?? 0) + (this.maxSalary ?? 0)) / 2;
  }

  /**
   * Increment current count (when employee assigned)
   */
  incrementCount(): Position {
    if (this.isFull()) {
      throw new Error('Position is already full');
    }

    return new Position(
      this.id,
      this.employerId,
      this.code,
      this.title,
      this.titleIndonesian,
      this.departmentId,
      this.level,
      this.jobFamily,
      this.reportsTo,
      this.description,
      this.responsibilities,
      this.requirements,
      this.minSalary,
      this.maxSalary,
      this.isActive,
      this.headcount,
      this.currentCount + 1,
      this.displayOrder,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Decrement current count (when employee unassigned)
   */
  decrementCount(): Position {
    if (this.currentCount === 0) {
      throw new Error('Current count is already 0');
    }

    return new Position(
      this.id,
      this.employerId,
      this.code,
      this.title,
      this.titleIndonesian,
      this.departmentId,
      this.level,
      this.jobFamily,
      this.reportsTo,
      this.description,
      this.responsibilities,
      this.requirements,
      this.minSalary,
      this.maxSalary,
      this.isActive,
      this.headcount,
      this.currentCount - 1,
      this.displayOrder,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update headcount
   */
  updateHeadcount(headcount: number): Position {
    if (headcount < this.currentCount) {
      throw new Error('Cannot set headcount below current count');
    }

    return new Position(
      this.id,
      this.employerId,
      this.code,
      this.title,
      this.titleIndonesian,
      this.departmentId,
      this.level,
      this.jobFamily,
      this.reportsTo,
      this.description,
      this.responsibilities,
      this.requirements,
      this.minSalary,
      this.maxSalary,
      this.isActive,
      headcount,
      this.currentCount,
      this.displayOrder,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Deactivate position
   */
  deactivate(): Position {
    return new Position(
      this.id,
      this.employerId,
      this.code,
      this.title,
      this.titleIndonesian,
      this.departmentId,
      this.level,
      this.jobFamily,
      this.reportsTo,
      this.description,
      this.responsibilities,
      this.requirements,
      this.minSalary,
      this.maxSalary,
      false,
      this.headcount,
      this.currentCount,
      this.displayOrder,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Activate position
   */
  activate(): Position {
    return new Position(
      this.id,
      this.employerId,
      this.code,
      this.title,
      this.titleIndonesian,
      this.departmentId,
      this.level,
      this.jobFamily,
      this.reportsTo,
      this.description,
      this.responsibilities,
      this.requirements,
      this.minSalary,
      this.maxSalary,
      true,
      this.headcount,
      this.currentCount,
      this.displayOrder,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update position
   */
  update(updates: {
    title?: string;
    titleIndonesian?: string;
    departmentId?: string | null;
    level?:
      | 'executive'
      | 'senior_management'
      | 'middle_management'
      | 'supervisor'
      | 'staff'
      | 'entry';
    jobFamily?: string | null;
    reportsTo?: string | null;
    description?: string | null;
    responsibilities?: string[] | null;
    requirements?: string[] | null;
    minSalary?: number | null;
    maxSalary?: number | null;
    displayOrder?: number;
  }): Position {
    return new Position(
      this.id,
      this.employerId,
      this.code,
      updates.title ?? this.title,
      updates.titleIndonesian ?? this.titleIndonesian,
      updates.departmentId !== undefined ? updates.departmentId : this.departmentId,
      updates.level ?? this.level,
      updates.jobFamily !== undefined ? updates.jobFamily : this.jobFamily,
      updates.reportsTo !== undefined ? updates.reportsTo : this.reportsTo,
      updates.description !== undefined ? updates.description : this.description,
      updates.responsibilities !== undefined
        ? updates.responsibilities
        : this.responsibilities,
      updates.requirements !== undefined ? updates.requirements : this.requirements,
      updates.minSalary !== undefined ? updates.minSalary : this.minSalary,
      updates.maxSalary !== undefined ? updates.maxSalary : this.maxSalary,
      this.isActive,
      this.headcount,
      this.currentCount,
      updates.displayOrder ?? this.displayOrder,
      this.createdAt,
      new Date()
    );
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      employerId: this.employerId,
      code: this.code,
      title: this.title,
      titleIndonesian: this.titleIndonesian,
      departmentId: this.departmentId,
      level: this.level,
      jobFamily: this.jobFamily,
      reportsTo: this.reportsTo,
      description: this.description,
      responsibilities: this.responsibilities,
      requirements: this.requirements,
      minSalary: this.minSalary,
      maxSalary: this.maxSalary,
      salaryMidpoint: this.salaryMidpoint,
      isActive: this.isActive,
      headcount: this.headcount,
      currentCount: this.currentCount,
      openings: this.openings,
      displayOrder: this.displayOrder,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      // Computed
      hasOpenings: this.hasOpenings(),
      isFull: this.isFull(),
      hasSalaryRange: this.hasSalaryRange(),
    };
  }
}
