import { BPJS_RATES } from '@/config/constants';

/**
 * BPJS Calculation Results
 */
export interface BPJSCalculationResult {
  // Kesehatan (Health Insurance)
  kesehatanEmployee: number;
  kesehatanEmployer: number;
  kesehatanTotal: number;

  // Ketenagakerjaan (Employment Insurance)
  jkkEmployer: number; // Jaminan Kecelakaan Kerja
  jkmEmployer: number; // Jaminan Kematian
  jhtEmployee: number; // Jaminan Hari Tua - Employee
  jhtEmployer: number; // Jaminan Hari Tua - Employer
  jhtTotal: number;
  jpEmployee: number; // Jaminan Pensiun - Employee
  jpEmployer: number; // Jaminan Pensiun - Employer
  jpTotal: number;

  ketenagakerjaanEmployee: number;
  ketenagakerjaanEmployer: number;
  ketenagakerjaanTotal: number;

  // Grand totals
  totalEmployee: number;
  totalEmployer: number;
  grandTotal: number;

  // Base salary used for calculation
  baseSalary: number;
  bpjsKesehatanBase: number;
  bpjsKetenagakerjaanBase: number;
}

/**
 * BPJS Calculator
 * Calculates Indonesian BPJS (social security) contributions
 * Based on 2025 rates and regulations
 */
export class BPJSCalculator {
  /**
   * Calculate all BPJS contributions for an employee
   *
   * @param baseSalary - Employee's base salary
   * @param additionalBpjsBase - Additional salary components included in BPJS calculation (allowances)
   * @param riskLevel - JKK risk level (1-5), default is 1 (very low)
   */
  calculate(
    baseSalary: number,
    additionalBpjsBase: number = 0,
    riskLevel: 1 | 2 | 3 | 4 | 5 = 1
  ): BPJSCalculationResult {
    // BPJS Kesehatan base (capped)
    const bpjsKesehatanBase = Math.min(
      baseSalary + additionalBpjsBase,
      BPJS_RATES.KESEHATAN.MAX_SALARY
    );

    // BPJS Ketenagakerjaan base (capped)
    const bpjsKetenagakerjaanBase = Math.min(
      baseSalary + additionalBpjsBase,
      BPJS_RATES.KETENAGAKERJAAN.MAX_SALARY
    );

    // === BPJS Kesehatan (Health Insurance) ===
    const kesehatanEmployee = Math.round(
      bpjsKesehatanBase * BPJS_RATES.KESEHATAN.EMPLOYEE_RATE
    );
    const kesehatanEmployer = Math.round(
      bpjsKesehatanBase * BPJS_RATES.KESEHATAN.EMPLOYER_RATE
    );
    const kesehatanTotal = kesehatanEmployee + kesehatanEmployer;

    // === BPJS Ketenagakerjaan (Employment Insurance) ===

    // JKK - Jaminan Kecelakaan Kerja (Work Accident Insurance) - Employer only
    const jkkRate = this.getJkkRate(riskLevel);
    const jkkEmployer = Math.round(bpjsKetenagakerjaanBase * jkkRate);

    // JKM - Jaminan Kematian (Death Insurance) - Employer only
    const jkmEmployer = Math.round(
      bpjsKetenagakerjaanBase * BPJS_RATES.KETENAGAKERJAAN.JKM_EMPLOYER_RATE
    );

    // JHT - Jaminan Hari Tua (Old Age Insurance) - Shared
    const jhtEmployee = Math.round(
      bpjsKetenagakerjaanBase * BPJS_RATES.KETENAGAKERJAAN.JHT_EMPLOYEE_RATE
    );
    const jhtEmployer = Math.round(
      bpjsKetenagakerjaanBase * BPJS_RATES.KETENAGAKERJAAN.JHT_EMPLOYER_RATE
    );
    const jhtTotal = jhtEmployee + jhtEmployer;

    // JP - Jaminan Pensiun (Pension Insurance) - Shared
    const jpEmployee = Math.round(
      bpjsKetenagakerjaanBase * BPJS_RATES.KETENAGAKERJAAN.JP_EMPLOYEE_RATE
    );
    const jpEmployer = Math.round(
      bpjsKetenagakerjaanBase * BPJS_RATES.KETENAGAKERJAAN.JP_EMPLOYER_RATE
    );
    const jpTotal = jpEmployee + jpEmployer;

    // Ketenagakerjaan totals
    const ketenagakerjaanEmployee = jhtEmployee + jpEmployee;
    const ketenagakerjaanEmployer = jkkEmployer + jkmEmployer + jhtEmployer + jpEmployer;
    const ketenagakerjaanTotal = ketenagakerjaanEmployee + ketenagakerjaanEmployer;

    // Grand totals
    const totalEmployee = kesehatanEmployee + ketenagakerjaanEmployee;
    const totalEmployer = kesehatanEmployer + ketenagakerjaanEmployer;
    const grandTotal = totalEmployee + totalEmployer;

    return {
      // Kesehatan
      kesehatanEmployee,
      kesehatanEmployer,
      kesehatanTotal,

      // Ketenagakerjaan
      jkkEmployer,
      jkmEmployer,
      jhtEmployee,
      jhtEmployer,
      jhtTotal,
      jpEmployee,
      jpEmployer,
      jpTotal,

      ketenagakerjaanEmployee,
      ketenagakerjaanEmployer,
      ketenagakerjaanTotal,

      // Totals
      totalEmployee,
      totalEmployer,
      grandTotal,

      // Base salaries
      baseSalary,
      bpjsKesehatanBase,
      bpjsKetenagakerjaanBase,
    };
  }

  /**
   * Get JKK (Work Accident Insurance) rate based on risk level
   */
  private getJkkRate(riskLevel: 1 | 2 | 3 | 4 | 5): number {
    const rates = {
      1: 0.0024, // 0.24% - Very low risk (office work)
      2: 0.0054, // 0.54% - Low risk
      3: 0.0089, // 0.89% - Medium risk
      4: 0.0127, // 1.27% - High risk
      5: 0.0174, // 1.74% - Very high risk (construction, mining)
    };

    return rates[riskLevel];
  }

  /**
   * Calculate BPJS for proration (partial month)
   */
  calculateProrated(
    baseSalary: number,
    additionalBpjsBase: number = 0,
    workingDays: number,
    totalDaysInMonth: number,
    riskLevel: 1 | 2 | 3 | 4 | 5 = 1
  ): BPJSCalculationResult {
    const fullMonthResult = this.calculate(baseSalary, additionalBpjsBase, riskLevel);
    const prorationFactor = workingDays / totalDaysInMonth;

    return {
      kesehatanEmployee: Math.round(fullMonthResult.kesehatanEmployee * prorationFactor),
      kesehatanEmployer: Math.round(fullMonthResult.kesehatanEmployer * prorationFactor),
      kesehatanTotal: Math.round(fullMonthResult.kesehatanTotal * prorationFactor),

      jkkEmployer: Math.round(fullMonthResult.jkkEmployer * prorationFactor),
      jkmEmployer: Math.round(fullMonthResult.jkmEmployer * prorationFactor),
      jhtEmployee: Math.round(fullMonthResult.jhtEmployee * prorationFactor),
      jhtEmployer: Math.round(fullMonthResult.jhtEmployer * prorationFactor),
      jhtTotal: Math.round(fullMonthResult.jhtTotal * prorationFactor),
      jpEmployee: Math.round(fullMonthResult.jpEmployee * prorationFactor),
      jpEmployer: Math.round(fullMonthResult.jpEmployer * prorationFactor),
      jpTotal: Math.round(fullMonthResult.jpTotal * prorationFactor),

      ketenagakerjaanEmployee: Math.round(
        fullMonthResult.ketenagakerjaanEmployee * prorationFactor
      ),
      ketenagakerjaanEmployer: Math.round(
        fullMonthResult.ketenagakerjaanEmployer * prorationFactor
      ),
      ketenagakerjaanTotal: Math.round(
        fullMonthResult.ketenagakerjaanTotal * prorationFactor
      ),

      totalEmployee: Math.round(fullMonthResult.totalEmployee * prorationFactor),
      totalEmployer: Math.round(fullMonthResult.totalEmployer * prorationFactor),
      grandTotal: Math.round(fullMonthResult.grandTotal * prorationFactor),

      baseSalary: fullMonthResult.baseSalary,
      bpjsKesehatanBase: fullMonthResult.bpjsKesehatanBase,
      bpjsKetenagakerjaanBase: fullMonthResult.bpjsKetenagakerjaanBase,
    };
  }

  /**
   * Get breakdown description for payslip
   */
  getBreakdown(result: BPJSCalculationResult): {
    employee: Array<{ name: string; amount: number }>;
    employer: Array<{ name: string; amount: number }>;
  } {
    return {
      employee: [
        { name: 'BPJS Kesehatan (1%)', amount: result.kesehatanEmployee },
        { name: 'BPJS JHT (2%)', amount: result.jhtEmployee },
        { name: 'BPJS JP (1%)', amount: result.jpEmployee },
      ],
      employer: [
        { name: 'BPJS Kesehatan (4%)', amount: result.kesehatanEmployer },
        { name: 'BPJS JKK', amount: result.jkkEmployer },
        { name: 'BPJS JKM (0.3%)', amount: result.jkmEmployer },
        { name: 'BPJS JHT (3.7%)', amount: result.jhtEmployer },
        { name: 'BPJS JP (2%)', amount: result.jpEmployer },
      ],
    };
  }
}
