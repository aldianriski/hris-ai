import type { PayrollPeriod } from '../entities/PayrollPeriod';
import type { PayrollComponent } from '../entities/PayrollComponent';
import type { PayrollSummary } from '../entities/PayrollSummary';

export interface IPayrollRepository {
  // Payroll Periods
  findPeriodById(id: string): Promise<PayrollPeriod | null>;

  findPeriodsByEmployerId(
    employerId: string,
    options?: {
      year?: number;
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    periods: PayrollPeriod[];
    total: number;
  }>;

  findPeriodByMonthYear(
    employerId: string,
    month: number,
    year: number
  ): Promise<PayrollPeriod | null>;

  createPeriod(
    period: Omit<PayrollPeriod, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PayrollPeriod>;

  updatePeriod(id: string, updates: Partial<PayrollPeriod>): Promise<PayrollPeriod>;

  deletePeriod(id: string): Promise<void>;

  // Payroll Components
  findComponentById(id: string): Promise<PayrollComponent | null>;

  findComponentsByEmployerId(
    employerId: string,
    options?: {
      type?: 'earning' | 'deduction' | 'benefit';
      category?: string;
      isActive?: boolean;
    }
  ): Promise<PayrollComponent[]>;

  findComponentByCode(employerId: string, code: string): Promise<PayrollComponent | null>;

  createComponent(
    component: Omit<PayrollComponent, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PayrollComponent>;

  updateComponent(id: string, updates: Partial<PayrollComponent>): Promise<PayrollComponent>;

  deleteComponent(id: string): Promise<void>;

  // Payroll Summaries
  findSummaryById(id: string): Promise<PayrollSummary | null>;

  findSummariesByPeriodId(
    periodId: string,
    options?: {
      hasAnomalies?: boolean;
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    summaries: PayrollSummary[];
    total: number;
  }>;

  findSummaryByPeriodAndEmployee(
    periodId: string,
    employeeId: string
  ): Promise<PayrollSummary | null>;

  findSummariesByEmployeeId(
    employeeId: string,
    options?: {
      year?: number;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    summaries: PayrollSummary[];
    total: number;
  }>;

  createSummary(
    summary: Omit<PayrollSummary, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PayrollSummary>;

  updateSummary(id: string, updates: Partial<PayrollSummary>): Promise<PayrollSummary>;

  deleteSummary(id: string): Promise<void>;

  // Batch operations
  createSummaries(
    summaries: Array<Omit<PayrollSummary, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<PayrollSummary[]>;

  // Statistics
  getPeriodStats(periodId: string): Promise<{
    totalEmployees: number;
    totalGrossPay: number;
    totalDeductions: number;
    totalNetPay: number;
    totalBpjsEmployer: number;
    totalBpjsEmployee: number;
    totalPph21: number;
    employeesWithAnomalies: number;
  }>;

  getEmployeeYearToDateStats(employeeId: string, year: number): Promise<{
    totalGrossPay: number;
    totalNetPay: number;
    totalPph21: number;
    totalBpjs: number;
    periodsProcessed: number;
  }>;
}
