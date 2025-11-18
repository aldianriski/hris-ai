/**
 * Department Domain Entity
 * Represents organizational departments and divisions
 */
export class Department {
  constructor(
    public readonly id: string,
    public readonly employerId: string,
    public readonly code: string,
    public readonly name: string,
    public readonly nameIndonesian: string,
    public readonly type: 'department' | 'division' | 'team' | 'unit',
    public readonly parentId: string | null,
    public readonly managerId: string | null,
    public readonly managerName: string | null,
    public readonly description: string | null,
    public readonly costCenter: string | null,
    public readonly budget: number | null,
    public readonly location: string | null,
    public readonly isActive: boolean,
    public readonly level: number, // Organizational level (0 = top, 1 = dept, 2 = div, etc.)
    public readonly displayOrder: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.code || this.code.trim().length === 0) {
      throw new Error('Department code is required');
    }

    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Department name is required');
    }

    if (this.level < 0) {
      throw new Error('Department level cannot be negative');
    }

    if (this.budget !== null && this.budget < 0) {
      throw new Error('Budget cannot be negative');
    }

    if (this.displayOrder < 0) {
      throw new Error('Display order cannot be negative');
    }
  }

  /**
   * Check if department is top-level (no parent)
   */
  isTopLevel(): boolean {
    return this.parentId === null;
  }

  /**
   * Check if department has a manager assigned
   */
  hasManager(): boolean {
    return this.managerId !== null;
  }

  /**
   * Deactivate department
   */
  deactivate(): Department {
    return new Department(
      this.id,
      this.employerId,
      this.code,
      this.name,
      this.nameIndonesian,
      this.type,
      this.parentId,
      this.managerId,
      this.managerName,
      this.description,
      this.costCenter,
      this.budget,
      this.location,
      false,
      this.level,
      this.displayOrder,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Activate department
   */
  activate(): Department {
    return new Department(
      this.id,
      this.employerId,
      this.code,
      this.name,
      this.nameIndonesian,
      this.type,
      this.parentId,
      this.managerId,
      this.managerName,
      this.description,
      this.costCenter,
      this.budget,
      this.location,
      true,
      this.level,
      this.displayOrder,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Assign manager
   */
  assignManager(managerId: string, managerName: string): Department {
    return new Department(
      this.id,
      this.employerId,
      this.code,
      this.name,
      this.nameIndonesian,
      this.type,
      this.parentId,
      managerId,
      managerName,
      this.description,
      this.costCenter,
      this.budget,
      this.location,
      this.isActive,
      this.level,
      this.displayOrder,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update department
   */
  update(updates: {
    name?: string;
    nameIndonesian?: string;
    description?: string | null;
    costCenter?: string | null;
    budget?: number | null;
    location?: string | null;
    displayOrder?: number;
  }): Department {
    return new Department(
      this.id,
      this.employerId,
      this.code,
      updates.name ?? this.name,
      updates.nameIndonesian ?? this.nameIndonesian,
      this.type,
      this.parentId,
      this.managerId,
      this.managerName,
      updates.description !== undefined ? updates.description : this.description,
      updates.costCenter !== undefined ? updates.costCenter : this.costCenter,
      updates.budget !== undefined ? updates.budget : this.budget,
      updates.location !== undefined ? updates.location : this.location,
      this.isActive,
      this.level,
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
      name: this.name,
      nameIndonesian: this.nameIndonesian,
      type: this.type,
      parentId: this.parentId,
      managerId: this.managerId,
      managerName: this.managerName,
      description: this.description,
      costCenter: this.costCenter,
      budget: this.budget,
      location: this.location,
      isActive: this.isActive,
      level: this.level,
      displayOrder: this.displayOrder,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      // Computed
      isTopLevel: this.isTopLevel(),
      hasManager: this.hasManager(),
    };
  }
}
