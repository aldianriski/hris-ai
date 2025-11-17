/**
 * Employee Number Value Object
 * Format: EMP-YYYY-XXX (e.g., EMP-2024-001)
 */
export class EmployeeNumber {
  private readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = value;
  }

  private validate(value: string): void {
    const pattern = /^EMP-\d{4}-\d{3}$/;

    if (!pattern.test(value)) {
      throw new Error(
        'Invalid employee number format. Expected: EMP-YYYY-XXX (e.g., EMP-2024-001)'
      );
    }
  }

  /**
   * Get the string value
   */
  toString(): string {
    return this.value;
  }

  /**
   * Get the year from employee number
   */
  get year(): number {
    const parts = this.value.split('-');
    return parseInt(parts[1] ?? '0', 10);
  }

  /**
   * Get the sequence number
   */
  get sequence(): number {
    const parts = this.value.split('-');
    return parseInt(parts[2] ?? '0', 10);
  }

  /**
   * Check if two employee numbers are equal
   */
  equals(other: EmployeeNumber): boolean {
    return this.value === other.value;
  }

  /**
   * Generate next employee number for the same year
   */
  static generateNext(lastNumber: string | null, year?: number): string {
    const currentYear = year ?? new Date().getFullYear();

    if (!lastNumber) {
      return `EMP-${currentYear}-001`;
    }

    const lastEmployeeNumber = new EmployeeNumber(lastNumber);

    // If year changed, start from 001
    if (lastEmployeeNumber.year !== currentYear) {
      return `EMP-${currentYear}-001`;
    }

    // Increment sequence
    const nextSequence = lastEmployeeNumber.sequence + 1;
    return `EMP-${currentYear}-${String(nextSequence).padStart(3, '0')}`;
  }
}
