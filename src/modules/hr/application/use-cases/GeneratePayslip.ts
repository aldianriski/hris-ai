import type { IPayrollRepository } from '../../domain/repositories/IPayrollRepository';
import type { IEmployeeRepository } from '../../domain/repositories/IEmployeeRepository';
import { BPJSCalculator } from '../../infrastructure/services/BPJSCalculator';
import { PPh21Calculator } from '../../infrastructure/services/PPh21Calculator';
import type { GeneratePayslipInput } from '../dto/PayrollDTO';

/**
 * Payslip Data Structure
 */
export interface PayslipData {
  // Company info
  company: {
    name: string;
    address: string;
  };

  // Employee info
  employee: {
    employeeNumber: string;
    name: string;
    position: string;
    department: string;
    joinDate: string;
  };

  // Period info
  period: {
    month: number;
    year: number;
    periodName: string;
    paymentDate: string;
  };

  // Attendance
  attendance: {
    workingDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    overtimeHours: number;
    attendanceRate: number;
  };

  // Earnings
  earnings: Array<{
    code: string;
    name: string;
    amount: number;
  }>;
  totalEarnings: number;

  // Deductions
  deductions: Array<{
    code: string;
    name: string;
    amount: number;
    breakdown?: Array<{ name: string; amount: number }>;
  }>;
  totalDeductions: number;

  // Net pay
  netPay: number;

  // Employer costs (informational)
  employerCosts: Array<{
    name: string;
    amount: number;
  }>;
  totalEmployerCost: number;

  // Additional info
  notes?: string;
  generatedAt: string;
}

/**
 * Generate Payslip Use Case
 */
export class GeneratePayslip {
  constructor(
    private payrollRepository: IPayrollRepository,
    private employeeRepository: IEmployeeRepository,
    private bpjsCalculator: BPJSCalculator,
    private pph21Calculator: PPh21Calculator
  ) {}

  async execute(input: GeneratePayslipInput): Promise<PayslipData> {
    // Get payroll summary
    const summary = await this.payrollRepository.findSummaryById(input.summaryId);
    if (!summary) {
      throw new Error('Payroll summary not found');
    }

    // Get period
    const period = await this.payrollRepository.findPeriodById(summary.periodId);
    if (!period) {
      throw new Error('Payroll period not found');
    }

    // Get employee
    const employee = await this.employeeRepository.findById(summary.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Prepare earnings
    const earnings = [
      {
        code: 'BASIC',
        name: input.language === 'id' ? 'Gaji Pokok' : 'Basic Salary',
        amount: summary.baseSalary,
      },
    ];

    if (summary.allowances > 0) {
      earnings.push({
        code: 'ALLOW',
        name: input.language === 'id' ? 'Tunjangan' : 'Allowances',
        amount: summary.allowances,
      });
    }

    if (summary.overtimePay > 0) {
      earnings.push({
        code: 'OT',
        name: input.language === 'id' ? 'Lembur' : 'Overtime Pay',
        amount: summary.overtimePay,
      });
    }

    if (summary.bonuses > 0) {
      earnings.push({
        code: 'BONUS',
        name: input.language === 'id' ? 'Bonus' : 'Bonuses',
        amount: summary.bonuses,
      });
    }

    // Prepare deductions with breakdown
    const deductions = [];

    // BPJS breakdown
    if (summary.bpjsKesehatanEmployee + summary.bpjsKetenagakerjaanEmployee > 0) {
      const bpjsResult = this.bpjsCalculator.calculate(summary.baseSalary, summary.allowances);
      const breakdown = this.bpjsCalculator.getBreakdown(bpjsResult);

      deductions.push({
        code: 'BPJS',
        name: input.language === 'id' ? 'BPJS' : 'Social Security',
        amount: summary.bpjsKesehatanEmployee + summary.bpjsKetenagakerjaanEmployee,
        breakdown: breakdown.employee,
      });
    }

    // PPh21
    if (summary.pph21 > 0) {
      deductions.push({
        code: 'PPH21',
        name: input.language === 'id' ? 'Pajak Penghasilan (PPh21)' : 'Income Tax (PPh21)',
        amount: summary.pph21,
      });
    }

    // Loans
    if (summary.loans > 0) {
      deductions.push({
        code: 'LOAN',
        name: input.language === 'id' ? 'Pinjaman' : 'Loans',
        amount: summary.loans,
      });
    }

    // Other deductions
    if (summary.otherDeductions > 0) {
      deductions.push({
        code: 'OTHER',
        name: input.language === 'id' ? 'Potongan Lainnya' : 'Other Deductions',
        amount: summary.otherDeductions,
      });
    }

    // Employer costs
    const employerCosts = [];

    if (summary.bpjsKesehatanEmployer > 0 || summary.bpjsKetenagakerjaanEmployer > 0) {
      const bpjsResult = this.bpjsCalculator.calculate(summary.baseSalary, summary.allowances);
      const breakdown = this.bpjsCalculator.getBreakdown(bpjsResult);

      employerCosts.push(
        ...breakdown.employer.map((item) => ({
          name: item.name,
          amount: item.amount,
        }))
      );
    }

    // Build payslip data
    const payslipData: PayslipData = {
      company: {
        name: 'Company Name', // Should come from employer record
        address: 'Company Address', // Should come from employer record
      },
      employee: {
        employeeNumber: employee.employeeNumber,
        name: employee.fullName,
        position: employee.position,
        department: employee.department ?? '',
        joinDate: employee.joinDate.toISOString().split('T')[0],
      },
      period: {
        month: period.periodMonth,
        year: period.periodYear,
        periodName:
          input.language === 'id' ? period.periodNameIndonesian : period.periodName,
        paymentDate: period.paymentDate.toISOString().split('T')[0],
      },
      attendance: {
        workingDays: summary.workingDays,
        presentDays: summary.presentDays,
        absentDays: summary.absentDays,
        lateDays: summary.lateDays,
        overtimeHours: summary.overtimeHours,
        attendanceRate: summary.attendanceRate,
      },
      earnings,
      totalEarnings: summary.totalEarnings,
      deductions,
      totalDeductions: summary.totalDeductions,
      netPay: summary.netPay,
      employerCosts,
      totalEmployerCost: summary.totalEmployerCost,
      notes: summary.notes ?? undefined,
      generatedAt: new Date().toISOString(),
    };

    return payslipData;
  }
}
