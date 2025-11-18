/**
 * Salary Value Object
 * Represents monetary amounts with validation
 */
export class Salary {
  private readonly amount: number;
  private readonly currency: string;

  constructor(amount: number, currency: string = 'IDR') {
    this.validate(amount, currency);
    this.amount = amount;
    this.currency = currency;
  }

  private validate(amount: number, currency: string): void {
    if (amount < 0) {
      throw new Error('Salary amount cannot be negative');
    }

    if (!Number.isFinite(amount)) {
      throw new Error('Salary amount must be a valid number');
    }

    if (!currency || currency.length === 0) {
      throw new Error('Currency is required');
    }
  }

  /**
   * Get the amount
   */
  getAmount(): number {
    return this.amount;
  }

  /**
   * Get the currency
   */
  getCurrency(): string {
    return this.currency;
  }

  /**
   * Add salary
   */
  add(other: Salary): Salary {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add salaries with different currencies');
    }
    return new Salary(this.amount + other.amount, this.currency);
  }

  /**
   * Subtract salary
   */
  subtract(other: Salary): Salary {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract salaries with different currencies');
    }
    return new Salary(this.amount - other.amount, this.currency);
  }

  /**
   * Multiply by factor
   */
  multiply(factor: number): Salary {
    return new Salary(this.amount * factor, this.currency);
  }

  /**
   * Format as currency string
   */
  format(): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(this.amount);
  }

  /**
   * Check if equal to another salary
   */
  equals(other: Salary): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  /**
   * Check if greater than another salary
   */
  greaterThan(other: Salary): boolean {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare salaries with different currencies');
    }
    return this.amount > other.amount;
  }

  /**
   * Check if less than another salary
   */
  lessThan(other: Salary): boolean {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare salaries with different currencies');
    }
    return this.amount < other.amount;
  }

  /**
   * Convert to plain object
   */
  toObject(): { amount: number; currency: string } {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }
}
