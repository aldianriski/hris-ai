import type { SupabaseClient } from '@supabase/supabase-js';
import type { ILeaveRepository } from '../../domain/repositories/ILeaveRepository';
import { LeaveRequest } from '../../domain/entities/LeaveRequest';
import { LeaveBalance } from '../../domain/entities/LeaveBalance';

export class SupabaseLeaveRepository implements ILeaveRepository {
  constructor(private supabase: SupabaseClient) {}

  // Leave Requests
  async findRequestById(id: string): Promise<LeaveRequest | null> {
    const { data, error } = await this.supabase
      .from('leave_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find leave request: ${error.message}`);
    }

    return this.mapRequestToEntity(data);
  }

  async findRequestsByEmployeeId(
    employeeId: string,
    options?: {
      status?: string;
      leaveType?: string;
      year?: number;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    requests: LeaveRequest[];
    total: number;
  }> {
    let query = this.supabase
      .from('leave_requests')
      .select('*', { count: 'exact' })
      .eq('employee_id', employeeId);

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.leaveType) {
      query = query.eq('leave_type', options.leaveType);
    }

    if (options?.year) {
      const startDate = `${options.year}-01-01`;
      const endDate = `${options.year}-12-31`;
      query = query.gte('start_date', startDate).lte('start_date', endDate);
    }

    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    query = query.range(offset, offset + limit - 1);
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to find leave requests: ${error.message}`);
    }

    return {
      requests: (data || []).map((row) => this.mapRequestToEntity(row)),
      total: count ?? 0,
    };
  }

  async findPendingRequests(employerId: string): Promise<LeaveRequest[]> {
    const { data, error } = await this.supabase
      .from('leave_requests')
      .select('*')
      .eq('employer_id', employerId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to find pending requests: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRequestToEntity(row));
  }

  async findConflictingRequests(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string
  ): Promise<LeaveRequest[]> {
    let query = this.supabase
      .from('leave_requests')
      .select('*')
      .eq('employee_id', employeeId)
      .in('status', ['pending', 'approved'])
      .or(
        `and(start_date.lte.${endDate.toISOString().split('T')[0]},end_date.gte.${startDate.toISOString().split('T')[0]})`
      );

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to find conflicting requests: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRequestToEntity(row));
  }

  async createRequest(
    request: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<LeaveRequest> {
    const { data, error } = await this.supabase
      .from('leave_requests')
      .insert([this.mapRequestToDatabase(request)])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create leave request: ${error.message}`);
    }

    return this.mapRequestToEntity(data);
  }

  async updateRequest(
    id: string,
    updates: Partial<LeaveRequest>
  ): Promise<LeaveRequest> {
    const { data, error } = await this.supabase
      .from('leave_requests')
      .update({
        ...this.mapRequestToDatabase(updates),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update leave request: ${error.message}`);
    }

    return this.mapRequestToEntity(data);
  }

  async deleteRequest(id: string): Promise<void> {
    const { error } = await this.supabase.from('leave_requests').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete leave request: ${error.message}`);
    }
  }

  // Leave Balances
  async findBalanceByEmployeeId(employeeId: string): Promise<LeaveBalance | null> {
    const { data, error } = await this.supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', employeeId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find leave balance: ${error.message}`);
    }

    return this.mapBalanceToEntity(data);
  }

  async createBalance(
    balance: Omit<LeaveBalance, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<LeaveBalance> {
    const { data, error } = await this.supabase
      .from('leave_balances')
      .insert([this.mapBalanceToDatabase(balance)])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create leave balance: ${error.message}`);
    }

    return this.mapBalanceToEntity(data);
  }

  async updateBalance(
    employeeId: string,
    updates: Partial<LeaveBalance>
  ): Promise<LeaveBalance> {
    const { data, error } = await this.supabase
      .from('leave_balances')
      .update({
        ...this.mapBalanceToDatabase(updates),
        updated_at: new Date().toISOString(),
      })
      .eq('employee_id', employeeId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update leave balance: ${error.message}`);
    }

    return this.mapBalanceToEntity(data);
  }

  // Statistics
  async getLeaveStats(employerId: string, year: number): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    totalDaysUsed: number;
    averageDaysPerEmployee: number;
  }> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    // Total requests
    const { count: totalCount } = await this.supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .gte('start_date', startDate)
      .lte('start_date', endDate);

    // Pending
    const { count: pendingCount } = await this.supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .eq('status', 'pending')
      .gte('start_date', startDate)
      .lte('start_date', endDate);

    // Approved
    const { count: approvedCount } = await this.supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .eq('status', 'approved')
      .gte('start_date', startDate)
      .lte('start_date', endDate);

    // Rejected
    const { count: rejectedCount } = await this.supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .eq('status', 'rejected')
      .gte('start_date', startDate)
      .lte('start_date', endDate);

    // Total days used (approved only)
    const { data: approvedRequests } = await this.supabase
      .from('leave_requests')
      .select('days_count')
      .eq('employer_id', employerId)
      .eq('status', 'approved')
      .gte('start_date', startDate)
      .lte('start_date', endDate);

    let totalDaysUsed = 0;
    if (approvedRequests) {
      totalDaysUsed = approvedRequests.reduce((sum, r) => sum + (r.days_count || 0), 0);
    }

    // Count unique employees
    const { data: uniqueEmployees } = await this.supabase
      .from('leave_requests')
      .select('employee_id')
      .eq('employer_id', employerId)
      .gte('start_date', startDate)
      .lte('start_date', endDate);

    const uniqueEmployeeIds = new Set(uniqueEmployees?.map((r) => r.employee_id) || []);
    const averageDaysPerEmployee =
      uniqueEmployeeIds.size > 0 ? totalDaysUsed / uniqueEmployeeIds.size : 0;

    return {
      totalRequests: totalCount ?? 0,
      pendingRequests: pendingCount ?? 0,
      approvedRequests: approvedCount ?? 0,
      rejectedRequests: rejectedCount ?? 0,
      totalDaysUsed,
      averageDaysPerEmployee,
    };
  }

  private mapRequestToEntity(row: any): LeaveRequest {
    return new LeaveRequest(
      row.id,
      row.employee_id,
      row.employer_id,
      row.employee_name,
      row.leave_type,
      new Date(row.start_date),
      new Date(row.end_date),
      row.days_count,
      row.reason,
      row.status,
      row.approved_by,
      row.approved_by_name,
      row.approved_at ? new Date(row.approved_at) : null,
      row.approval_notes,
      row.is_auto_approved,
      row.ai_confidence,
      row.ai_review,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

  private mapRequestToDatabase(request: Partial<LeaveRequest>): any {
    const db: any = {};

    if (request.id) db.id = request.id;
    if (request.employeeId) db.employee_id = request.employeeId;
    if (request.employerId) db.employer_id = request.employerId;
    if (request.employeeName) db.employee_name = request.employeeName;
    if (request.leaveType) db.leave_type = request.leaveType;
    if (request.startDate) db.start_date = request.startDate.toISOString().split('T')[0];
    if (request.endDate) db.end_date = request.endDate.toISOString().split('T')[0];
    if (request.daysCount !== undefined) db.days_count = request.daysCount;
    if (request.reason) db.reason = request.reason;
    if (request.status) db.status = request.status;
    if (request.approvedBy !== undefined) db.approved_by = request.approvedBy;
    if (request.approvedByName !== undefined) db.approved_by_name = request.approvedByName;
    if (request.approvedAt) db.approved_at = request.approvedAt?.toISOString() ?? null;
    if (request.approvalNotes !== undefined) db.approval_notes = request.approvalNotes;
    if (request.isAutoApproved !== undefined) db.is_auto_approved = request.isAutoApproved;
    if (request.aiConfidence !== undefined) db.ai_confidence = request.aiConfidence;
    if (request.aiReview !== undefined) db.ai_review = request.aiReview;
    if (request.createdAt) db.created_at = request.createdAt.toISOString();
    if (request.updatedAt) db.updated_at = request.updatedAt.toISOString();

    return db;
  }

  private mapBalanceToEntity(row: any): LeaveBalance {
    return new LeaveBalance(
      row.id,
      row.employee_id,
      row.employer_id,
      row.year,
      row.annual_quota,
      row.annual_used,
      row.annual_carry_forward,
      row.sick_used,
      row.unpaid_used,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

  private mapBalanceToDatabase(balance: Partial<LeaveBalance>): any {
    const db: any = {};

    if (balance.id) db.id = balance.id;
    if (balance.employeeId) db.employee_id = balance.employeeId;
    if (balance.employerId) db.employer_id = balance.employerId;
    if (balance.year !== undefined) db.year = balance.year;
    if (balance.annualQuota !== undefined) db.annual_quota = balance.annualQuota;
    if (balance.annualUsed !== undefined) db.annual_used = balance.annualUsed;
    if (balance.annualCarryForward !== undefined)
      db.annual_carry_forward = balance.annualCarryForward;
    if (balance.sickUsed !== undefined) db.sick_used = balance.sickUsed;
    if (balance.unpaidUsed !== undefined) db.unpaid_used = balance.unpaidUsed;
    if (balance.createdAt) db.created_at = balance.createdAt.toISOString();
    if (balance.updatedAt) db.updated_at = balance.updatedAt.toISOString();

    return db;
  }
}
