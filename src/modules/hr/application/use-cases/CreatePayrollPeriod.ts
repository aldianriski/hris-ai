import type { IPayrollRepository } from '../../domain/repositories/IPayrollRepository';
import { PayrollPeriod } from '../../domain/entities/PayrollPeriod';
import type { CreatePayrollPeriodInput } from '../dto/PayrollDTO';

/**
 * Create Payroll Period Use Case
 */
export class CreatePayrollPeriod {
  constructor(private payrollRepository: IPayrollRepository) {}

  async execute(input: CreatePayrollPeriodInput): Promise<PayrollPeriod> {
    // Check if period already exists
    const existingPeriod = await this.payrollRepository.findPeriodByMonthYear(
      input.employerId,
      input.periodMonth,
      input.periodYear
    );

    if (existingPeriod) {
      throw new Error(
        `Payroll period for ${input.periodMonth}/${input.periodYear} already exists`
      );
    }

    // Parse dates
    const startDate = typeof input.startDate === 'string' ? new Date(input.startDate) : input.startDate;
    const endDate = typeof input.endDate === 'string' ? new Date(input.endDate) : input.endDate;
    const paymentDate = typeof input.paymentDate === 'string' ? new Date(input.paymentDate) : input.paymentDate;

    // Create new period
    const period = new PayrollPeriod(
      crypto.randomUUID(),
      input.employerId,
      input.periodMonth,
      input.periodYear,
      startDate,
      endDate,
      paymentDate,
      'draft',
      0, // totalEmployees
      0, // totalGrossPay
      0, // totalDeductions
      0, // totalNetPay
      0, // totalBpjsEmployer
      0, // totalBpjsEmployee
      0, // totalPph21
      null, // processedAt
      null, // approvedAt
      null, // approvedBy
      null, // paidAt
      input.notes ?? null,
      new Date(),
      new Date()
    );

    return this.payrollRepository.createPeriod(period);
  }
}
