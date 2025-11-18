/**
 * Payroll Component Domain Entity
 * Represents individual payroll components (earnings and deductions)
 */
export class PayrollComponent {
  constructor(
    public readonly id: string,
    public readonly employerId: string,
    public readonly code: string,
    public readonly name: string,
    public readonly nameIndonesian: string,
    public readonly type: 'earning' | 'deduction' | 'benefit',
    public readonly category:
      | 'basic_salary'
      | 'allowance'
      | 'overtime'
      | 'bonus'
      | 'bpjs'
      | 'tax'
      | 'loan'
      | 'other',
    public readonly isTaxable: boolean,
    public readonly isBpjsBase: boolean,
    public readonly isSystemComponent: boolean,
    public readonly calculationType: 'fixed' | 'percentage' | 'formula',
    public readonly calculationValue: number | null,
    public readonly calculationFormula: string | null,
    public readonly description: string | null,
    public readonly isActive: boolean,
    public readonly displayOrder: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.code || this.code.trim().length === 0) {
      throw new Error('Component code is required');
    }

    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Component name is required');
    }

    if (
      this.calculationType === 'percentage' &&
      this.calculationValue !== null &&
      (this.calculationValue < 0 || this.calculationValue > 100)
    ) {
      throw new Error('Percentage must be between 0 and 100');
    }

    if (this.displayOrder < 0) {
      throw new Error('Display order cannot be negative');
    }
  }

  /**
   * Check if component is earnings
   */
  isEarning(): boolean {
    return this.type === 'earning';
  }

  /**
   * Check if component is deduction
   */
  isDeduction(): boolean {
    return this.type === 'deduction';
  }

  /**
   * Check if component is BPJS related
   */
  isBpjsComponent(): boolean {
    return this.category === 'bpjs';
  }

  /**
   * Check if component is tax related
   */
  isTaxComponent(): boolean {
    return this.category === 'tax';
  }

  /**
   * Calculate component amount
   */
  calculateAmount(baseSalary: number, customValue?: number): number {
    if (customValue !== undefined) {
      return customValue;
    }

    if (this.calculationType === 'fixed' && this.calculationValue !== null) {
      return this.calculationValue;
    }

    if (this.calculationType === 'percentage' && this.calculationValue !== null) {
      return (baseSalary * this.calculationValue) / 100;
    }

    // Formula calculation would need a formula evaluator
    // For now, return 0 if no value provided
    return 0;
  }

  /**
   * Deactivate component
   */
  deactivate(): PayrollComponent {
    return new PayrollComponent(
      this.id,
      this.employerId,
      this.code,
      this.name,
      this.nameIndonesian,
      this.type,
      this.category,
      this.isTaxable,
      this.isBpjsBase,
      this.isSystemComponent,
      this.calculationType,
      this.calculationValue,
      this.calculationFormula,
      this.description,
      false,
      this.displayOrder,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Activate component
   */
  activate(): PayrollComponent {
    return new PayrollComponent(
      this.id,
      this.employerId,
      this.code,
      this.name,
      this.nameIndonesian,
      this.type,
      this.category,
      this.isTaxable,
      this.isBpjsBase,
      this.isSystemComponent,
      this.calculationType,
      this.calculationValue,
      this.calculationFormula,
      this.description,
      true,
      this.displayOrder,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update component
   */
  update(updates: {
    name?: string;
    nameIndonesian?: string;
    isTaxable?: boolean;
    isBpjsBase?: boolean;
    calculationType?: 'fixed' | 'percentage' | 'formula';
    calculationValue?: number | null;
    calculationFormula?: string | null;
    description?: string | null;
    displayOrder?: number;
  }): PayrollComponent {
    if (this.isSystemComponent) {
      throw new Error('Cannot update system components');
    }

    return new PayrollComponent(
      this.id,
      this.employerId,
      this.code,
      updates.name ?? this.name,
      updates.nameIndonesian ?? this.nameIndonesian,
      this.type,
      this.category,
      updates.isTaxable ?? this.isTaxable,
      updates.isBpjsBase ?? this.isBpjsBase,
      this.isSystemComponent,
      updates.calculationType ?? this.calculationType,
      updates.calculationValue !== undefined ? updates.calculationValue : this.calculationValue,
      updates.calculationFormula !== undefined
        ? updates.calculationFormula
        : this.calculationFormula,
      updates.description !== undefined ? updates.description : this.description,
      this.isActive,
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
      category: this.category,
      isTaxable: this.isTaxable,
      isBpjsBase: this.isBpjsBase,
      isSystemComponent: this.isSystemComponent,
      calculationType: this.calculationType,
      calculationValue: this.calculationValue,
      calculationFormula: this.calculationFormula,
      description: this.description,
      isActive: this.isActive,
      displayOrder: this.displayOrder,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
