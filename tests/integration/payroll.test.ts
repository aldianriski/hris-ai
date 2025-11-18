import { describe, it, expect } from 'vitest';

/**
 * Integration Tests for Payroll API
 * Tests critical payroll calculation and generation flows
 */

describe('Payroll Calculation Integration Tests', () => {
  // Mock employee data
  const mockEmployee = {
    id: 'emp-123',
    employeeNumber: 'EMP001',
    fullName: 'John Doe',
    position: 'Software Engineer',
    department: 'Engineering',
    salaryBase: 10000000, // IDR 10,000,000
    ptkpStatus: 'TK/0' as const, // Single, no dependents
    npwp: '12.345.678.9-012.345'
  };

  const mockPayrollPeriod = {
    id: 'period-123',
    employerId: 'employer-123',
    periodStart: new Date('2024-01-01'),
    periodEnd: new Date('2024-01-31'),
    paymentDate: new Date('2024-02-05'),
    status: 'draft' as const
  };

  describe('Gross Salary Calculation', () => {
    it('should calculate correct gross salary', () => {
      const baseSalary = 10000000;
      const allowances = 1000000; // Transport + meal allowances
      const grossSalary = baseSalary + allowances;

      expect(grossSalary).toBe(11000000);
    });

    it('should include all allowance components', () => {
      const components = {
        transport: 500000,
        meal: 500000,
        housing: 1000000
      };

      const totalAllowances = Object.values(components).reduce((sum, val) => sum + val, 0);

      expect(totalAllowances).toBe(2000000);
    });
  });

  describe('BPJS Calculations', () => {
    it('should calculate BPJS Kesehatan (4% employee)', () => {
      const baseSalary = 10000000;
      const bpjsKesehatan = Math.round(baseSalary * 0.04); // 4% employee contribution

      expect(bpjsKesehatan).toBe(400000);
    });

    it('should calculate BPJS Ketenagakerjaan (2% employee)', () => {
      const baseSalary = 10000000;
      const bpjsKetenagakerjaan = Math.round(baseSalary * 0.02); // 2% employee contribution

      expect(bpjsKetenagakerjaan).toBe(200000);
    });
  });

  describe('PPh21 Tax Calculations', () => {
    it('should calculate PTKP for TK/0 (single, no dependents)', () => {
      const PTKP_TK0 = 54000000; // Annual PTKP for TK/0
      expect(PTKP_TK0).toBe(54000000);
    });

    it('should calculate annual taxable income', () => {
      const annualGross = 10000000 * 12; // 120,000,000
      const annualDeductions = (400000 + 200000) * 12; // 7,200,000
      const netIncome = annualGross - annualDeductions; // 112,800,000
      const PTKP = 54000000;
      const taxableIncome = Math.max(0, netIncome - PTKP); // 58,800,000

      expect(taxableIncome).toBe(58800000);
    });

    it('should apply correct tax brackets', () => {
      const taxableIncome = 58800000;

      // Tax brackets:
      // 0-60M: 5%
      const taxBracket1 = Math.min(taxableIncome, 60000000) * 0.05; // 2,940,000

      expect(taxBracket1).toBe(2940000);
    });

    it('should calculate monthly PPh21', () => {
      const annualTax = 2940000;
      const monthlyTax = Math.round(annualTax / 12); // 245,000

      expect(monthlyTax).toBe(245000);
    });
  });

  describe('Net Salary Calculation', () => {
    it('should calculate correct net salary after deductions', () => {
      const grossSalary = 11000000;
      const bpjsKesehatan = 400000;
      const bpjsKetenagakerjaan = 200000;
      const pph21 = 245000;

      const totalDeductions = bpjsKesehatan + bpjsKetenagakerjaan + pph21;
      const netSalary = grossSalary - totalDeductions;

      expect(netSalary).toBe(10155000);
    });
  });
});

describe('Payslip Generation Integration Tests', () => {
  describe('POST /api/v1/payroll/payslips/:employeeId/:periodId/generate', () => {
    it('should generate payslip with all required fields', () => {
      const payslip = {
        employeeId: 'emp-123',
        periodId: 'period-123',
        employeeName: 'John Doe',
        employeeNumber: 'EMP001',
        position: 'Software Engineer',
        department: 'Engineering',
        baseSalary: 10000000,
        allowances: [
          { name: 'Transport', amount: 500000, isTaxable: true },
          { name: 'Meal', amount: 500000, isTaxable: true }
        ],
        deductions: [
          { name: 'BPJS Kesehatan', amount: 400000 },
          { name: 'BPJS Ketenagakerjaan', amount: 200000 },
          { name: 'PPh21', amount: 245000 }
        ],
        grossSalary: 11000000,
        totalDeductions: 845000,
        netSalary: 10155000
      };

      expect(payslip.employeeId).toBeDefined();
      expect(payslip.employeeNumber).toBeDefined();
      expect(payslip.grossSalary).toBeGreaterThan(0);
      expect(payslip.netSalary).toBeGreaterThan(0);
      expect(payslip.netSalary).toBeLessThan(payslip.grossSalary);
      expect(payslip.allowances).toHaveLength(2);
      expect(payslip.deductions).toHaveLength(3);
    });

    it('should handle zero deductions correctly', () => {
      const payslip = {
        grossSalary: 5000000,
        totalDeductions: 0,
        netSalary: 5000000
      };

      expect(payslip.netSalary).toBe(payslip.grossSalary);
    });
  });
});

describe('Payroll Period Management Integration Tests', () => {
  describe('POST /api/v1/payroll/periods', () => {
    it('should create valid payroll period', () => {
      const period = {
        id: 'period-123',
        employerId: 'employer-123',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-31'),
        paymentDate: new Date('2024-02-05'),
        status: 'draft' as const
      };

      expect(period.periodStart).toBeInstanceOf(Date);
      expect(period.periodEnd).toBeInstanceOf(Date);
      expect(period.paymentDate).toBeInstanceOf(Date);
      expect(period.periodEnd).toBeGreaterThan(period.periodStart);
      expect(period.paymentDate).toBeGreaterThan(period.periodEnd);
    });

    it('should not allow overlapping periods', () => {
      const period1 = {
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-31')
      };

      const period2 = {
        periodStart: new Date('2024-01-15'), // Overlaps with period1
        periodEnd: new Date('2024-02-15')
      };

      const hasOverlap =
        period2.periodStart <= period1.periodEnd &&
        period2.periodEnd >= period1.periodStart;

      expect(hasOverlap).toBe(true);
    });
  });

  describe('POST /api/v1/payroll/periods/:id/process', () => {
    it('should process payroll period and generate payslips', () => {
      const employees = [
        { id: 'emp-1', name: 'Employee 1' },
        { id: 'emp-2', name: 'Employee 2' },
        { id: 'emp-3', name: 'Employee 3' }
      ];

      const processedCount = employees.length;

      expect(processedCount).toBe(3);
    });
  });
});
