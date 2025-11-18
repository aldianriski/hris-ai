import type { IPayrollRepository } from '../../domain/repositories/IPayrollRepository';
import type { PayrollPeriod } from '../../domain/entities/PayrollPeriod';

/**
 * Approve Payroll Use Case
 * Approves a processed payroll period
 */
export class ApprovePayroll {
  constructor(private payrollRepository: IPayrollRepository) {}

  async execute(input: {
    periodId: string;
    approverId: string;
    notes?: string;
  }): Promise<PayrollPeriod> {
    // Get period
    const period = await this.payrollRepository.findPeriodById(input.periodId);
    if (!period) {
      throw new Error('Payroll period not found');
    }

    if (!period.canApprove()) {
      throw new Error('Payroll period is not in processing state');
    }

    // Check for critical anomalies
    const summaries = await this.payrollRepository.findSummariesByPeriodId(input.periodId, {
      hasAnomalies: true,
    });

    const hasCriticalAnomalies = summaries.summaries.some((s) => s.hasCriticalAnomalies());

    if (hasCriticalAnomalies) {
      throw new Error(
        'Cannot approve payroll with critical anomalies. Please review and fix errors first.'
      );
    }

    // Approve all summaries
    for (const summary of summaries.summaries) {
      if (summary.canApprove()) {
        const approvedSummary = summary.approve(input.notes);
        await this.payrollRepository.updateSummary(summary.id, approvedSummary);
      }
    }

    // Approve period
    const approvedPeriod = period.approve(input.approverId, input.notes);
    return this.payrollRepository.updatePeriod(period.id, approvedPeriod);
  }
}
