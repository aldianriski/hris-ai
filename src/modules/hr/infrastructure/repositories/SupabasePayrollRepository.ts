import type { SupabaseClient } from '@supabase/supabase-js';
import type { IPayrollRepository } from '../../domain/repositories/IPayrollRepository';
import { PayrollPeriod } from '../../domain/entities/PayrollPeriod';
import { PayrollComponent } from '../../domain/entities/PayrollComponent';
import { PayrollSummary } from '../../domain/entities/PayrollSummary';

export class SupabasePayrollRepository implements IPayrollRepository {
  constructor(private supabase: SupabaseClient) {}

  // Payroll Periods
  async findPeriodById(id: string): Promise<PayrollPeriod | null> {
    const { data, error } = await this.supabase
      .from('payroll_periods')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find payroll period: ${error.message}`);
    }

    return this.mapPeriodToEntity(data);
  }

  async findPeriodsByEmployerId(
    employerId: string,
    options?: { year?: number; status?: string; limit?: number; offset?: number }
  ): Promise<{ periods: PayrollPeriod[]; total: number }> {
    let query = this.supabase
      .from('payroll_periods')
      .select('*', { count: 'exact' })
      .eq('employer_id', employerId);

    if (options?.year) {
      query = query.eq('period_year', options.year);
    }

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    query = query.range(offset, offset + limit - 1);
    query = query.order('period_year', { ascending: false }).order('period_month', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to find payroll periods: ${error.message}`);
    }

    return {
      periods: (data || []).map((row) => this.mapPeriodToEntity(row)),
      total: count ?? 0,
    };
  }

  async findPeriodByMonthYear(
    employerId: string,
    month: number,
    year: number
  ): Promise<PayrollPeriod | null> {
    const { data, error } = await this.supabase
      .from('payroll_periods')
      .select('*')
      .eq('employer_id', employerId)
      .eq('period_month', month)
      .eq('period_year', year)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find payroll period by month/year: ${error.message}`);
    }

    return this.mapPeriodToEntity(data);
  }

  async createPeriod(period: Omit<PayrollPeriod, 'id' | 'createdAt' | 'updatedAt'>): Promise<PayrollPeriod> {
    const { data, error } = await this.supabase
      .from('payroll_periods')
      .insert([this.mapPeriodToDatabase(period)])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create payroll period: ${error.message}`);
    }

    return this.mapPeriodToEntity(data);
  }

  async updatePeriod(id: string, updates: Partial<PayrollPeriod>): Promise<PayrollPeriod> {
    const { data, error } = await this.supabase
      .from('payroll_periods')
      .update({
        ...this.mapPeriodToDatabase(updates),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update payroll period: ${error.message}`);
    }

    return this.mapPeriodToEntity(data);
  }

  async deletePeriod(id: string): Promise<void> {
    const { error } = await this.supabase.from('payroll_periods').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete payroll period: ${error.message}`);
    }
  }

  // Payroll Components
  async findComponentById(id: string): Promise<PayrollComponent | null> {
    const { data, error } = await this.supabase
      .from('payroll_components')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find payroll component: ${error.message}`);
    }

    return this.mapComponentToEntity(data);
  }

  async findComponentsByEmployerId(
    employerId: string,
    options?: { type?: string; category?: string; isActive?: boolean }
  ): Promise<PayrollComponent[]> {
    let query = this.supabase
      .from('payroll_components')
      .select('*')
      .eq('employer_id', employerId);

    if (options?.type) {
      query = query.eq('type', options.type);
    }

    if (options?.category) {
      query = query.eq('category', options.category);
    }

    if (options?.isActive !== undefined) {
      query = query.eq('is_active', options.isActive);
    }

    query = query.order('display_order', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to find payroll components: ${error.message}`);
    }

    return (data || []).map((row) => this.mapComponentToEntity(row));
  }

  async findComponentByCode(employerId: string, code: string): Promise<PayrollComponent | null> {
    const { data, error } = await this.supabase
      .from('payroll_components')
      .select('*')
      .eq('employer_id', employerId)
      .eq('code', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find payroll component by code: ${error.message}`);
    }

    return this.mapComponentToEntity(data);
  }

  async createComponent(component: Omit<PayrollComponent, 'id' | 'createdAt' | 'updatedAt'>): Promise<PayrollComponent> {
    const { data, error } = await this.supabase
      .from('payroll_components')
      .insert([this.mapComponentToDatabase(component)])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create payroll component: ${error.message}`);
    }

    return this.mapComponentToEntity(data);
  }

  async updateComponent(id: string, updates: Partial<PayrollComponent>): Promise<PayrollComponent> {
    const { data, error } = await this.supabase
      .from('payroll_components')
      .update({
        ...this.mapComponentToDatabase(updates),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update payroll component: ${error.message}`);
    }

    return this.mapComponentToEntity(data);
  }

  async deleteComponent(id: string): Promise<void> {
    const { error } = await this.supabase.from('payroll_components').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete payroll component: ${error.message}`);
    }
  }

  // Payroll Summaries
  async findSummaryById(id: string): Promise<PayrollSummary | null> {
    const { data, error } = await this.supabase
      .from('payroll_summaries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find payroll summary: ${error.message}`);
    }

    return this.mapSummaryToEntity(data);
  }

  async findSummariesByPeriodId(
    periodId: string,
    options?: { hasAnomalies?: boolean; status?: string; limit?: number; offset?: number }
  ): Promise<{ summaries: PayrollSummary[]; total: number }> {
    let query = this.supabase
      .from('payroll_summaries')
      .select('*', { count: 'exact' })
      .eq('period_id', periodId);

    if (options?.hasAnomalies !== undefined) {
      query = query.eq('has_anomalies', options.hasAnomalies);
    }

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;
    query = query.range(offset, offset + limit - 1);
    query = query.order('employee_name', { ascending: true });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to find payroll summaries: ${error.message}`);
    }

    return {
      summaries: (data || []).map((row) => this.mapSummaryToEntity(row)),
      total: count ?? 0,
    };
  }

  async findSummaryByPeriodAndEmployee(periodId: string, employeeId: string): Promise<PayrollSummary | null> {
    const { data, error } = await this.supabase
      .from('payroll_summaries')
      .select('*')
      .eq('period_id', periodId)
      .eq('employee_id', employeeId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find payroll summary: ${error.message}`);
    }

    return this.mapSummaryToEntity(data);
  }

  async findSummariesByEmployeeId(
    employeeId: string,
    options?: { year?: number; limit?: number; offset?: number }
  ): Promise<{ summaries: PayrollSummary[]; total: number }> {
    let query = this.supabase
      .from('payroll_summaries')
      .select('*, payroll_periods!inner(period_year, period_month)', { count: 'exact' })
      .eq('employee_id', employeeId);

    if (options?.year) {
      query = query.eq('payroll_periods.period_year', options.year);
    }

    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to find employee payroll summaries: ${error.message}`);
    }

    return {
      summaries: (data || []).map((row) => this.mapSummaryToEntity(row)),
      total: count ?? 0,
    };
  }

  async createSummary(summary: Omit<PayrollSummary, 'id' | 'createdAt' | 'updatedAt'>): Promise<PayrollSummary> {
    const { data, error } = await this.supabase
      .from('payroll_summaries')
      .insert([this.mapSummaryToDatabase(summary)])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create payroll summary: ${error.message}`);
    }

    return this.mapSummaryToEntity(data);
  }

  async updateSummary(id: string, updates: Partial<PayrollSummary>): Promise<PayrollSummary> {
    const { data, error } = await this.supabase
      .from('payroll_summaries')
      .update({
        ...this.mapSummaryToDatabase(updates),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update payroll summary: ${error.message}`);
    }

    return this.mapSummaryToEntity(data);
  }

  async deleteSummary(id: string): Promise<void> {
    const { error } = await this.supabase.from('payroll_summaries').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete payroll summary: ${error.message}`);
    }
  }

  async createSummaries(summaries: Array<Omit<PayrollSummary, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PayrollSummary[]> {
    const { data, error } = await this.supabase
      .from('payroll_summaries')
      .insert(summaries.map((s) => this.mapSummaryToDatabase(s)))
      .select();

    if (error) {
      throw new Error(`Failed to create payroll summaries: ${error.message}`);
    }

    return (data || []).map((row) => this.mapSummaryToEntity(row));
  }

  async getPeriodStats(periodId: string): Promise<{
    totalEmployees: number;
    totalGrossPay: number;
    totalDeductions: number;
    totalNetPay: number;
    totalBpjsEmployer: number;
    totalBpjsEmployee: number;
    totalPph21: number;
    employeesWithAnomalies: number;
  }> {
    const { data, error } = await this.supabase
      .from('payroll_summaries')
      .select('total_earnings, total_deductions, net_pay, bpjs_kesehatan_employee, bpjs_ketenagakerjaan_employee, bpjs_kesehatan_employer, bpjs_ketenagakerjaan_employer, pph21, has_anomalies')
      .eq('period_id', periodId);

    if (error) {
      throw new Error(`Failed to get period stats: ${error.message}`);
    }

    let totalGrossPay = 0;
    let totalDeductions = 0;
    let totalNetPay = 0;
    let totalBpjsEmployee = 0;
    let totalBpjsEmployer = 0;
    let totalPph21 = 0;
    let employeesWithAnomalies = 0;

    (data || []).forEach((row) => {
      totalGrossPay += row.total_earnings || 0;
      totalDeductions += row.total_deductions || 0;
      totalNetPay += row.net_pay || 0;
      totalBpjsEmployee += (row.bpjs_kesehatan_employee || 0) + (row.bpjs_ketenagakerjaan_employee || 0);
      totalBpjsEmployer += (row.bpjs_kesehatan_employer || 0) + (row.bpjs_ketenagakerjaan_employer || 0);
      totalPph21 += row.pph21 || 0;
      if (row.has_anomalies) employeesWithAnomalies++;
    });

    return {
      totalEmployees: data?.length || 0,
      totalGrossPay,
      totalDeductions,
      totalNetPay,
      totalBpjsEmployer,
      totalBpjsEmployee,
      totalPph21,
      employeesWithAnomalies,
    };
  }

  async getEmployeeYearToDateStats(employeeId: string, year: number): Promise<{
    totalGrossPay: number;
    totalNetPay: number;
    totalPph21: number;
    totalBpjs: number;
    periodsProcessed: number;
  }> {
    const { data, error } = await this.supabase
      .from('payroll_summaries')
      .select('total_earnings, net_pay, pph21, bpjs_kesehatan_employee, bpjs_ketenagakerjaan_employee, payroll_periods!inner(period_year)')
      .eq('employee_id', employeeId)
      .eq('payroll_periods.period_year', year);

    if (error) {
      throw new Error(`Failed to get YTD stats: ${error.message}`);
    }

    let totalGrossPay = 0;
    let totalNetPay = 0;
    let totalPph21 = 0;
    let totalBpjs = 0;

    (data || []).forEach((row) => {
      totalGrossPay += row.total_earnings || 0;
      totalNetPay += row.net_pay || 0;
      totalPph21 += row.pph21 || 0;
      totalBpjs += (row.bpjs_kesehatan_employee || 0) + (row.bpjs_ketenagakerjaan_employee || 0);
    });

    return {
      totalGrossPay,
      totalNetPay,
      totalPph21,
      totalBpjs,
      periodsProcessed: data?.length || 0,
    };
  }

  private mapPeriodToEntity(row: any): PayrollPeriod {
    return new PayrollPeriod(
      row.id,
      row.employer_id,
      row.period_month,
      row.period_year,
      new Date(row.start_date),
      new Date(row.end_date),
      new Date(row.payment_date),
      row.status,
      row.total_employees,
      row.total_gross_pay,
      row.total_deductions,
      row.total_net_pay,
      row.total_bpjs_employer,
      row.total_bpjs_employee,
      row.total_pph21,
      row.processed_at ? new Date(row.processed_at) : null,
      row.approved_at ? new Date(row.approved_at) : null,
      row.approved_by,
      row.paid_at ? new Date(row.paid_at) : null,
      row.notes,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

  private mapPeriodToDatabase(period: Partial<PayrollPeriod>): any {
    const db: any = {};
    if (period.id) db.id = period.id;
    if (period.employerId) db.employer_id = period.employerId;
    if (period.periodMonth !== undefined) db.period_month = period.periodMonth;
    if (period.periodYear !== undefined) db.period_year = period.periodYear;
    if (period.startDate) db.start_date = period.startDate.toISOString().split('T')[0];
    if (period.endDate) db.end_date = period.endDate.toISOString().split('T')[0];
    if (period.paymentDate) db.payment_date = period.paymentDate.toISOString().split('T')[0];
    if (period.status) db.status = period.status;
    if (period.totalEmployees !== undefined) db.total_employees = period.totalEmployees;
    if (period.totalGrossPay !== undefined) db.total_gross_pay = period.totalGrossPay;
    if (period.totalDeductions !== undefined) db.total_deductions = period.totalDeductions;
    if (period.totalNetPay !== undefined) db.total_net_pay = period.totalNetPay;
    if (period.totalBpjsEmployer !== undefined) db.total_bpjs_employer = period.totalBpjsEmployer;
    if (period.totalBpjsEmployee !== undefined) db.total_bpjs_employee = period.totalBpjsEmployee;
    if (period.totalPph21 !== undefined) db.total_pph21 = period.totalPph21;
    if (period.processedAt) db.processed_at = period.processedAt?.toISOString() ?? null;
    if (period.approvedAt) db.approved_at = period.approvedAt?.toISOString() ?? null;
    if (period.approvedBy !== undefined) db.approved_by = period.approvedBy;
    if (period.paidAt) db.paid_at = period.paidAt?.toISOString() ?? null;
    if (period.notes !== undefined) db.notes = period.notes;
    if (period.createdAt) db.created_at = period.createdAt.toISOString();
    if (period.updatedAt) db.updated_at = period.updatedAt.toISOString();
    return db;
  }

  private mapComponentToEntity(row: any): PayrollComponent {
    return new PayrollComponent(
      row.id,
      row.employer_id,
      row.code,
      row.name,
      row.name_indonesian,
      row.type,
      row.category,
      row.is_taxable,
      row.is_bpjs_base,
      row.is_system_component,
      row.calculation_type,
      row.calculation_value,
      row.calculation_formula,
      row.description,
      row.is_active,
      row.display_order,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

  private mapComponentToDatabase(component: Partial<PayrollComponent>): any {
    const db: any = {};
    if (component.id) db.id = component.id;
    if (component.employerId) db.employer_id = component.employerId;
    if (component.code) db.code = component.code;
    if (component.name) db.name = component.name;
    if (component.nameIndonesian) db.name_indonesian = component.nameIndonesian;
    if (component.type) db.type = component.type;
    if (component.category) db.category = component.category;
    if (component.isTaxable !== undefined) db.is_taxable = component.isTaxable;
    if (component.isBpjsBase !== undefined) db.is_bpjs_base = component.isBpjsBase;
    if (component.isSystemComponent !== undefined) db.is_system_component = component.isSystemComponent;
    if (component.calculationType) db.calculation_type = component.calculationType;
    if (component.calculationValue !== undefined) db.calculation_value = component.calculationValue;
    if (component.calculationFormula !== undefined) db.calculation_formula = component.calculationFormula;
    if (component.description !== undefined) db.description = component.description;
    if (component.isActive !== undefined) db.is_active = component.isActive;
    if (component.displayOrder !== undefined) db.display_order = component.displayOrder;
    if (component.createdAt) db.created_at = component.createdAt.toISOString();
    if (component.updatedAt) db.updated_at = component.updatedAt.toISOString();
    return db;
  }

  private mapSummaryToEntity(row: any): PayrollSummary {
    return new PayrollSummary(
      row.id,
      row.period_id,
      row.employee_id,
      row.employer_id,
      row.employee_number,
      row.employee_name,
      row.department,
      row.position,
      row.working_days,
      row.present_days,
      row.absent_days,
      row.late_days,
      row.overtime_hours,
      row.base_salary,
      row.allowances,
      row.overtime_pay,
      row.bonuses,
      row.total_earnings,
      row.bpjs_kesehatan_employee,
      row.bpjs_ketenagakerjaan_employee,
      row.pph21,
      row.loans,
      row.other_deductions,
      row.total_deductions,
      row.net_pay,
      row.bpjs_kesehatan_employer,
      row.bpjs_ketenagakerjaan_employer,
      row.total_employer_cost,
      row.has_anomalies,
      row.anomaly_details,
      row.ai_confidence,
      row.ai_review,
      row.notes,
      row.status,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

  private mapSummaryToDatabase(summary: Partial<PayrollSummary>): any {
    const db: any = {};
    if (summary.id) db.id = summary.id;
    if (summary.periodId) db.period_id = summary.periodId;
    if (summary.employeeId) db.employee_id = summary.employeeId;
    if (summary.employerId) db.employer_id = summary.employerId;
    if (summary.employeeNumber) db.employee_number = summary.employeeNumber;
    if (summary.employeeName) db.employee_name = summary.employeeName;
    if (summary.department !== undefined) db.department = summary.department;
    if (summary.position !== undefined) db.position = summary.position;
    if (summary.workingDays !== undefined) db.working_days = summary.workingDays;
    if (summary.presentDays !== undefined) db.present_days = summary.presentDays;
    if (summary.absentDays !== undefined) db.absent_days = summary.absentDays;
    if (summary.lateDays !== undefined) db.late_days = summary.lateDays;
    if (summary.overtimeHours !== undefined) db.overtime_hours = summary.overtimeHours;
    if (summary.baseSalary !== undefined) db.base_salary = summary.baseSalary;
    if (summary.allowances !== undefined) db.allowances = summary.allowances;
    if (summary.overtimePay !== undefined) db.overtime_pay = summary.overtimePay;
    if (summary.bonuses !== undefined) db.bonuses = summary.bonuses;
    if (summary.totalEarnings !== undefined) db.total_earnings = summary.totalEarnings;
    if (summary.bpjsKesehatanEmployee !== undefined) db.bpjs_kesehatan_employee = summary.bpjsKesehatanEmployee;
    if (summary.bpjsKetenagakerjaanEmployee !== undefined) db.bpjs_ketenagakerjaan_employee = summary.bpjsKetenagakerjaanEmployee;
    if (summary.pph21 !== undefined) db.pph21 = summary.pph21;
    if (summary.loans !== undefined) db.loans = summary.loans;
    if (summary.otherDeductions !== undefined) db.other_deductions = summary.otherDeductions;
    if (summary.totalDeductions !== undefined) db.total_deductions = summary.totalDeductions;
    if (summary.netPay !== undefined) db.net_pay = summary.netPay;
    if (summary.bpjsKesehatanEmployer !== undefined) db.bpjs_kesehatan_employer = summary.bpjsKesehatanEmployer;
    if (summary.bpjsKetenagakerjaanEmployer !== undefined) db.bpjs_ketenagakerjaan_employer = summary.bpjsKetenagakerjaanEmployer;
    if (summary.totalEmployerCost !== undefined) db.total_employer_cost = summary.totalEmployerCost;
    if (summary.hasAnomalies !== undefined) db.has_anomalies = summary.hasAnomalies;
    if (summary.anomalyDetails !== undefined) db.anomaly_details = summary.anomalyDetails;
    if (summary.aiConfidence !== undefined) db.ai_confidence = summary.aiConfidence;
    if (summary.aiReview !== undefined) db.ai_review = summary.aiReview;
    if (summary.notes !== undefined) db.notes = summary.notes;
    if (summary.status) db.status = summary.status;
    if (summary.createdAt) db.created_at = summary.createdAt.toISOString();
    if (summary.updatedAt) db.updated_at = summary.updatedAt.toISOString();
    return db;
  }
}
