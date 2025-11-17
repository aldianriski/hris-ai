import { TAX_BRACKETS, PTKP_VALUES } from '@/config/constants';

/**
 * PPh21 Calculation Results
 */
export interface PPh21CalculationResult {
  // Income
  grossIncome: number; // Total taxable income
  annualGrossIncome: number; // Gross income x 12

  // Deductions
  bpjsDeduction: number; // BPJS employee contributions (max 5%)
  occupationalDeduction: number; // Biaya jabatan (5%, max 500k/month)
  totalDeductions: number;

  // Taxable income
  netIncome: number; // Gross - deductions (per month)
  annualNetIncome: number; // Net income x 12
  ptkp: number; // Non-taxable income (PTKP)
  taxableIncome: number; // Annual net - PTKP
  taxableIncomeRounded: number; // Rounded down to nearest 1000

  // Tax calculation
  taxBreakdown: Array<{
    bracket: number;
    rate: number;
    amount: number;
    tax: number;
  }>;
  annualTax: number; // Total annual tax
  monthlyTax: number; // Tax per month (annual / 12)

  // PTKP details
  ptkpStatus: string;
  ptkpDetails: {
    self: number;
    married: number;
    dependents: number;
  };
}

/**
 * PPh21 Calculator
 * Calculates Indonesian Income Tax (PPh21)
 * Based on 2025 tax brackets and PTKP values
 */
export class PPh21Calculator {
  /**
   * Calculate PPh21 for monthly salary
   *
   * @param monthlyGrossIncome - Monthly gross taxable income
   * @param monthlyBpjsEmployee - Monthly BPJS employee contributions
   * @param isMarried - Marital status
   * @param dependents - Number of dependents (max 3)
   */
  calculate(
    monthlyGrossIncome: number,
    monthlyBpjsEmployee: number,
    isMarried: boolean = false,
    dependents: number = 0
  ): PPh21CalculationResult {
    // Ensure dependents is between 0 and 3
    const validDependents = Math.min(Math.max(0, dependents), 3);

    // Calculate PTKP
    const ptkp = this.calculatePTKP(isMarried, validDependents);
    const ptkpStatus = this.getPTKPStatus(isMarried, validDependents);

    // Annual gross income
    const annualGrossIncome = monthlyGrossIncome * 12;

    // Calculate deductions
    const bpjsDeduction = Math.min(monthlyBpjsEmployee, monthlyGrossIncome * 0.05); // Max 5%
    const occupationalDeduction = Math.min(monthlyGrossIncome * 0.05, 500000); // Max 500k
    const totalDeductions = bpjsDeduction + occupationalDeduction;

    // Net income
    const netIncome = monthlyGrossIncome - totalDeductions;
    const annualNetIncome = netIncome * 12;

    // Taxable income
    const taxableIncome = Math.max(0, annualNetIncome - ptkp);
    const taxableIncomeRounded = Math.floor(taxableIncome / 1000) * 1000; // Round down to nearest 1000

    // Calculate progressive tax
    const { taxBreakdown, annualTax } = this.calculateProgressiveTax(taxableIncomeRounded);
    const monthlyTax = Math.round(annualTax / 12);

    return {
      grossIncome: monthlyGrossIncome,
      annualGrossIncome,

      bpjsDeduction,
      occupationalDeduction,
      totalDeductions,

      netIncome,
      annualNetIncome,
      ptkp,
      taxableIncome,
      taxableIncomeRounded,

      taxBreakdown,
      annualTax,
      monthlyTax,

      ptkpStatus,
      ptkpDetails: {
        self: PTKP_VALUES.SELF,
        married: isMarried ? PTKP_VALUES.MARRIED : 0,
        dependents: validDependents * PTKP_VALUES.DEPENDENT,
      },
    };
  }

  /**
   * Calculate PTKP (Penghasilan Tidak Kena Pajak - Non-Taxable Income)
   */
  private calculatePTKP(isMarried: boolean, dependents: number): number {
    let ptkp = PTKP_VALUES.SELF; // Self

    if (isMarried) {
      ptkp += PTKP_VALUES.MARRIED; // Married
    }

    // Dependents (max 3)
    const validDependents = Math.min(Math.max(0, dependents), 3);
    ptkp += validDependents * PTKP_VALUES.DEPENDENT;

    return ptkp;
  }

  /**
   * Get PTKP status code (TK/0, K/0, K/1, K/2, K/3)
   */
  private getPTKPStatus(isMarried: boolean, dependents: number): string {
    const validDependents = Math.min(Math.max(0, dependents), 3);

    if (!isMarried) {
      return `TK/${validDependents}`; // TK = Tidak Kawin (Single)
    }

    return `K/${validDependents}`; // K = Kawin (Married)
  }

  /**
   * Calculate progressive tax using 2025 tax brackets
   */
  private calculateProgressiveTax(
    taxableIncome: number
  ): {
    taxBreakdown: Array<{ bracket: number; rate: number; amount: number; tax: number }>;
    annualTax: number;
  } {
    const breakdown: Array<{ bracket: number; rate: number; amount: number; tax: number }> = [];
    let remainingIncome = taxableIncome;
    let totalTax = 0;

    for (let i = 0; i < TAX_BRACKETS.length; i++) {
      const bracket = TAX_BRACKETS[i];

      if (remainingIncome <= 0) break;

      // Determine taxable amount in this bracket
      let bracketAmount = 0;

      if (i === 0) {
        // First bracket: 0 - bracket.max
        bracketAmount = Math.min(remainingIncome, bracket.max);
      } else if (bracket.max === Infinity) {
        // Last bracket: all remaining income
        bracketAmount = remainingIncome;
      } else {
        // Middle brackets: previous max - current max
        const previousMax = TAX_BRACKETS[i - 1].max;
        const bracketSize = bracket.max - previousMax;
        bracketAmount = Math.min(remainingIncome, bracketSize);
      }

      const bracketTax = Math.round(bracketAmount * bracket.rate);

      breakdown.push({
        bracket: i + 1,
        rate: bracket.rate,
        amount: bracketAmount,
        tax: bracketTax,
      });

      totalTax += bracketTax;
      remainingIncome -= bracketAmount;
    }

    return {
      taxBreakdown: breakdown,
      annualTax: totalTax,
    };
  }

  /**
   * Calculate PPh21 for bonus (one-time payment)
   * Uses gross-up method
   */
  calculateBonus(
    bonusAmount: number,
    regularMonthlyGross: number,
    monthlyBpjsEmployee: number,
    isMarried: boolean = false,
    dependents: number = 0
  ): {
    bonusAmount: number;
    bonusTax: number;
    bonusNetAmount: number;
    effectiveTaxRate: number;
  } {
    // Calculate regular monthly tax
    const regularResult = this.calculate(
      regularMonthlyGross,
      monthlyBpjsEmployee,
      isMarried,
      dependents
    );

    // Calculate tax with bonus included (bonus is not regular, so we add it to one month)
    const monthWithBonusGross = regularMonthlyGross + bonusAmount;
    const annualGrossWithBonus = regularMonthlyGross * 12 + bonusAmount;

    // Recalculate with bonus
    const occupationalDeduction = Math.min(monthWithBonusGross * 0.05, 500000);
    const bpjsDeduction = Math.min(monthlyBpjsEmployee, monthWithBonusGross * 0.05);
    const netIncomeWithBonus = monthWithBonusGross - occupationalDeduction - bpjsDeduction;
    const annualNetIncomeWithBonus = regularResult.netIncome * 12 + bonusAmount - (occupationalDeduction - regularResult.occupationalDeduction);

    const taxableIncomeWithBonus = Math.max(0, annualNetIncomeWithBonus - regularResult.ptkp);
    const taxableIncomeRounded = Math.floor(taxableIncomeWithBonus / 1000) * 1000;

    const { annualTax: annualTaxWithBonus } = this.calculateProgressiveTax(taxableIncomeRounded);

    // Bonus tax = difference between tax with bonus and regular tax
    const bonusTax = Math.max(0, annualTaxWithBonus - regularResult.annualTax);
    const bonusNetAmount = bonusAmount - bonusTax;
    const effectiveTaxRate = bonusAmount > 0 ? bonusTax / bonusAmount : 0;

    return {
      bonusAmount,
      bonusTax,
      bonusNetAmount,
      effectiveTaxRate,
    };
  }

  /**
   * Calculate PPh21 for severance pay
   * Different rules apply for severance
   */
  calculateSeverance(severanceAmount: number): {
    severanceAmount: number;
    severanceTax: number;
    severanceNetAmount: number;
    taxBreakdown: Array<{ bracket: number; rate: number; amount: number; tax: number }>;
  } {
    // Severance tax brackets (different from regular income)
    // 0% for first 50 million
    // 5% for 50-100 million
    // 15% for 100-500 million
    // 25% for above 500 million

    const severanceBrackets = [
      { max: 50_000_000, rate: 0 },
      { max: 100_000_000, rate: 0.05 },
      { max: 500_000_000, rate: 0.15 },
      { max: Infinity, rate: 0.25 },
    ];

    const breakdown: Array<{ bracket: number; rate: number; amount: number; tax: number }> = [];
    let remainingAmount = severanceAmount;
    let totalTax = 0;

    for (let i = 0; i < severanceBrackets.length; i++) {
      const bracket = severanceBrackets[i];

      if (remainingAmount <= 0) break;

      let bracketAmount = 0;

      if (i === 0) {
        bracketAmount = Math.min(remainingAmount, bracket.max);
      } else if (bracket.max === Infinity) {
        bracketAmount = remainingAmount;
      } else {
        const previousMax = severanceBrackets[i - 1].max;
        const bracketSize = bracket.max - previousMax;
        bracketAmount = Math.min(remainingAmount, bracketSize);
      }

      const bracketTax = Math.round(bracketAmount * bracket.rate);

      breakdown.push({
        bracket: i + 1,
        rate: bracket.rate,
        amount: bracketAmount,
        tax: bracketTax,
      });

      totalTax += bracketTax;
      remainingAmount -= bracketAmount;
    }

    return {
      severanceAmount,
      severanceTax: totalTax,
      severanceNetAmount: severanceAmount - totalTax,
      taxBreakdown: breakdown,
    };
  }

  /**
   * Get tax summary for payslip
   */
  getSummary(result: PPh21CalculationResult): {
    description: string;
    items: Array<{ label: string; value: number | string }>;
  } {
    return {
      description: `PPh21 calculation for ${result.ptkpStatus} status`,
      items: [
        { label: 'Gross Income (Monthly)', value: result.grossIncome },
        { label: 'BPJS Deduction', value: result.bpjsDeduction },
        { label: 'Occupational Deduction (5%)', value: result.occupationalDeduction },
        { label: 'Net Income (Monthly)', value: result.netIncome },
        { label: 'Annual Net Income', value: result.annualNetIncome },
        { label: 'PTKP', value: result.ptkp },
        { label: 'Taxable Income', value: result.taxableIncomeRounded },
        { label: 'Annual Tax', value: result.annualTax },
        { label: 'Monthly Tax', value: result.monthlyTax },
      ],
    };
  }
}
