import type { IPayrollRepository } from '../../domain/repositories/IPayrollRepository';
import type { IEmployeeRepository } from '../../domain/repositories/IEmployeeRepository';
import type { IAttendanceRepository } from '../../domain/repositories/IAttendanceRepository';
import { PayrollSummary } from '../../domain/entities/PayrollSummary';
import { BPJSCalculator } from '../../infrastructure/services/BPJSCalculator';
import { PPh21Calculator } from '../../infrastructure/services/PPh21Calculator';
import { AIPayrollErrorDetector } from '../../infrastructure/services/AIPayrollErrorDetector';
import type { ProcessPayrollInput } from '../dto/PayrollDTO';

/**
 * Process Payroll Use Case
 * Calculates payroll for all employees in a period
 */
export class ProcessPayroll {
  constructor(
    private payrollRepository: IPayrollRepository,
    private employeeRepository: IEmployeeRepository,
    private attendanceRepository: IAttendanceRepository,
    private bpjsCalculator: BPJSCalculator,
    private pph21Calculator: PPh21Calculator,
    private aiErrorDetector: AIPayrollErrorDetector
  ) {}

  async execute(input: ProcessPayrollInput): Promise<{
    periodId: string;
    totalEmployees: number;
    summariesCreated: number;
    summariesWithErrors: number;
    totalGrossPay: number;
    totalNetPay: number;
    summaries: Array<{
      id: string;
      employeeId: string;
      employeeName: string;
      netPay: number;
      hasAnomalies: boolean;
    }>;
  }> {
    // 1. Get payroll period
    const period = await this.payrollRepository.findPeriodById(input.periodId);
    if (!period) {
      throw new Error('Payroll period not found');
    }

    if (!period.isDraft()) {
      throw new Error('Can only process draft payroll periods');
    }

    // 2. Get employees to process
    let employees;
    if (input.employeeIds && input.employeeIds.length > 0) {
      // Process specific employees
      employees = await Promise.all(
        input.employeeIds.map((id) => this.employeeRepository.findById(id))
      );
      employees = employees.filter((e) => e !== null);
    } else {
      // Process all active employees
      const result = await this.employeeRepository.findByEmployerId(input.employerId, {
        status: 'active',
        limit: 1000, // Process in batches if needed
      });
      employees = result.employees;
    }

    if (employees.length === 0) {
      throw new Error('No employees found to process');
    }

    // 3. Calculate payroll for each employee
    const summaries: PayrollSummary[] = [];
    let summariesWithErrors = 0;
    let totalGrossPay = 0;
    let totalNetPay = 0;

    for (const employee of employees) {
      try {
        // Get attendance data for the period
        const attendanceRecords = await this.attendanceRepository.findByEmployeeAndDateRange(
          employee.id,
          period.startDate,
          period.endDate
        );

        // Calculate attendance stats
        const presentDays = attendanceRecords.filter((r) => r.clockIn).length;
        const absentDays = period.startDate.getDate() - presentDays; // Simplified
        const lateDays = attendanceRecords.filter((r) => r.isLate()).length;
        const overtimeHours = attendanceRecords.reduce(
          (sum, r) => sum + (r.overtimeHours ?? 0),
          0
        );

        // Calculate working days in period
        const workingDays = this.calculateWorkingDays(period.startDate, period.endDate);

        // Calculate earnings
        const baseSalary = this.calculateBaseSalary(
          employee.salaryBase,
          presentDays,
          workingDays
        );
        const allowances = this.calculateAllowances(employee);
        const overtimePay = this.calculateOvertimePay(
          employee.salaryBase,
          overtimeHours,
          workingDays
        );
        const bonuses = 0; // Can be added manually later

        const totalEarnings = baseSalary + allowances + overtimePay + bonuses;

        // Calculate BPJS
        const bpjsResult = this.bpjsCalculator.calculate(
          employee.salaryBase,
          allowances,
          1 // Default risk level
        );

        // Calculate PPh21
        const pph21Result = this.pph21Calculator.calculate(
          totalEarnings,
          bpjsResult.totalEmployee,
          employee.maritalStatus === 'married',
          employee.numberOfDependents
        );

        // Calculate total deductions
        const bpjsEmployee = bpjsResult.totalEmployee;
        const pph21 = pph21Result.monthlyTax;
        const loans = 0; // Get from loan records if available
        const otherDeductions = 0;
        const totalDeductions = bpjsEmployee + pph21 + loans + otherDeductions;

        // Calculate net pay
        const netPay = totalEarnings - totalDeductions;

        // Create initial summary
        let summary = new PayrollSummary(
          crypto.randomUUID(),
          period.id,
          employee.id,
          employee.employerId,
          employee.employeeNumber,
          employee.fullName,
          employee.department,
          employee.position,
          workingDays,
          presentDays,
          absentDays,
          lateDays,
          overtimeHours,
          baseSalary,
          allowances,
          overtimePay,
          bonuses,
          totalEarnings,
          bpjsEmployee,
          bpjsResult.ketenagakerjaanEmployee,
          pph21,
          loans,
          otherDeductions,
          totalDeductions,
          netPay,
          bpjsResult.kesehatanEmployer,
          bpjsResult.ketenagakerjaanEmployer,
          totalEarnings + bpjsResult.totalEmployer,
          false,
          null,
          null,
          null,
          null,
          'draft',
          new Date(),
          new Date()
        );

        // Validate with AI if enabled
        if (input.validateWithAI) {
          try {
            const historicalStats = await this.payrollRepository.getEmployeeYearToDateStats(
              employee.id,
              period.periodYear
            );

            const validationResult = await this.aiErrorDetector.detectErrors({
              employee: {
                id: employee.id,
                name: employee.fullName,
                employeeNumber: employee.employeeNumber,
                baseSalary: employee.salaryBase,
                position: employee.position,
                employmentType: employee.employmentType,
                maritalStatus: employee.maritalStatus,
                dependents: employee.numberOfDependents,
              },
              period: {
                month: period.periodMonth,
                year: period.periodYear,
                workingDays,
              },
              attendance: {
                presentDays,
                absentDays,
                lateDays,
                overtimeHours,
              },
              earnings: {
                baseSalary,
                allowances,
                overtimePay,
                bonuses,
                total: totalEarnings,
              },
              deductions: {
                bpjsEmployee,
                pph21,
                loans,
                other: otherDeductions,
                total: totalDeductions,
              },
              netPay,
              bpjsCalculation: bpjsResult,
              pph21Calculation: pph21Result,
              historicalData:
                historicalStats.periodsProcessed >= 3
                  ? {
                      averageNetPay: historicalStats.totalNetPay / historicalStats.periodsProcessed,
                      averageGrossPay:
                        historicalStats.totalGrossPay / historicalStats.periodsProcessed,
                      lastMonthNetPay: historicalStats.totalNetPay, // Simplified
                      totalPayrollsProcessed: historicalStats.periodsProcessed,
                    }
                  : undefined,
            });

            // Flag anomalies if detected
            if (validationResult.hasErrors) {
              const anomalies = validationResult.errors.map((e) => ({
                type: e.type,
                description: e.description,
                severity: e.severity,
              }));

              summary = summary.flagAnomaly(
                anomalies,
                validationResult.confidence,
                validationResult.aiReview
              );

              summariesWithErrors++;
            }
          } catch (aiError) {
            console.error('AI validation failed for employee:', employee.id, aiError);
            // Continue without AI validation
          }
        }

        // Mark as calculated
        summary = summary.markCalculated();

        summaries.push(summary);
        totalGrossPay += totalEarnings;
        totalNetPay += netPay;
      } catch (error) {
        console.error('Failed to process payroll for employee:', employee.id, error);
        // Continue with other employees
      }
    }

    // 4. Save all summaries
    const createdSummaries = await this.payrollRepository.createSummaries(
      summaries.map((s) => ({
        periodId: s.periodId,
        employeeId: s.employeeId,
        employerId: s.employerId,
        employeeNumber: s.employeeNumber,
        employeeName: s.employeeName,
        department: s.department,
        position: s.position,
        workingDays: s.workingDays,
        presentDays: s.presentDays,
        absentDays: s.absentDays,
        lateDays: s.lateDays,
        overtimeHours: s.overtimeHours,
        baseSalary: s.baseSalary,
        allowances: s.allowances,
        overtimePay: s.overtimePay,
        bonuses: s.bonuses,
        totalEarnings: s.totalEarnings,
        bpjsKesehatanEmployee: s.bpjsKesehatanEmployee,
        bpjsKetenagakerjaanEmployee: s.bpjsKetenagakerjaanEmployee,
        pph21: s.pph21,
        loans: s.loans,
        otherDeductions: s.otherDeductions,
        totalDeductions: s.totalDeductions,
        netPay: s.netPay,
        bpjsKesehatanEmployer: s.bpjsKesehatanEmployer,
        bpjsKetenagakerjaanEmployer: s.bpjsKetenagakerjaanEmployer,
        totalEmployerCost: s.totalEmployerCost,
        hasAnomalies: s.hasAnomalies,
        anomalyDetails: s.anomalyDetails,
        aiConfidence: s.aiConfidence,
        aiReview: s.aiReview,
        notes: s.notes,
        status: s.status,
      }))
    );

    // 5. Update period status and totals
    const updatedPeriod = period
      .updateTotals({
        totalEmployees: summaries.length,
        totalGrossPay,
        totalDeductions: summaries.reduce((sum, s) => sum + s.totalDeductions, 0),
        totalNetPay,
        totalBpjsEmployer: summaries.reduce((sum, s) => sum + s.bpjsKesehatanEmployer, 0),
        totalBpjsEmployee: summaries.reduce((sum, s) => sum + s.bpjsKesehatanEmployee, 0),
        totalPph21: summaries.reduce((sum, s) => sum + s.pph21, 0),
      })
      .startProcessing();

    await this.payrollRepository.updatePeriod(period.id, updatedPeriod);

    return {
      periodId: period.id,
      totalEmployees: employees.length,
      summariesCreated: createdSummaries.length,
      summariesWithErrors,
      totalGrossPay,
      totalNetPay,
      summaries: createdSummaries.map((s) => ({
        id: s.id,
        employeeId: s.employeeId,
        employeeName: s.employeeName,
        netPay: s.netPay,
        hasAnomalies: s.hasAnomalies,
      })),
    };
  }

  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    // Simplified: assume all days are working days
    // In production, exclude weekends and holidays
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / oneDay)) + 1;
  }

  private calculateBaseSalary(
    monthlySalary: number,
    presentDays: number,
    workingDays: number
  ): number {
    // Prorate based on attendance
    return Math.round((monthlySalary / workingDays) * presentDays);
  }

  private calculateAllowances(employee: any): number {
    // Sum all allowances from employee record
    return (
      (employee.transportAllowance ?? 0) +
      (employee.mealAllowance ?? 0) +
      (employee.housingAllowance ?? 0) +
      (employee.otherAllowances ?? 0)
    );
  }

  private calculateOvertimePay(
    baseSalary: number,
    overtimeHours: number,
    workingDays: number
  ): number {
    // Indonesian overtime formula: 1/173 * base salary * overtime multiplier
    const hourlyRate = baseSalary / 173;

    // Simplified: use 1.5x for first 1 hour, 2x after
    // In production, calculate based on day type (weekday/weekend/holiday)
    const regularOvertimeHours = Math.min(overtimeHours, 1);
    const extraOvertimeHours = Math.max(0, overtimeHours - 1);

    const overtimePay =
      regularOvertimeHours * hourlyRate * 1.5 + extraOvertimeHours * hourlyRate * 2;

    return Math.round(overtimePay);
  }
}
