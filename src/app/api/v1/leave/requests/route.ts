/**
 * Leave Request Endpoints
 * GET /api/v1/leave/requests - List leave requests
 * POST /api/v1/leave/requests - Submit new leave request
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler, ApiError } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';
import { PaginationSchema } from '@/lib/api/types';
import { logLeaveAction } from '@/lib/utils/auditLog';

// ============================================
// GET /api/v1/leave/requests - List leave requests
// ============================================

const listLeaveSchema = z.object({
  ...PaginationSchema.shape,
  employeeId: z.string().uuid().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
  leaveType: z.enum(['annual', 'sick', 'unpaid', 'maternity', 'paternity', 'compassionate', 'other']).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

async function listHandler(request: NextRequest) {
  await standardRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = listLeaveSchema.parse(params);

  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('leave_requests')
    .select('*', { count: 'exact' })
    .eq('employer_id', userContext.companyId);

  // Apply filters
  if (validatedParams.employeeId) {
    query = query.eq('employee_id', validatedParams.employeeId);
  }

  if (validatedParams.status) {
    query = query.eq('status', validatedParams.status);
  }

  if (validatedParams.leaveType) {
    query = query.eq('leave_type', validatedParams.leaveType);
  }

  if (validatedParams.year) {
    const startDate = `${validatedParams.year}-01-01`;
    const endDate = `${validatedParams.year}-12-31`;
    query = query.gte('start_date', startDate).lte('start_date', endDate);
  }

  // Apply sorting
  if (validatedParams.sortBy) {
    query = query.order(validatedParams.sortBy, { ascending: validatedParams.sortOrder === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  // Apply pagination
  const from = (validatedParams.page - 1) * validatedParams.limit;
  const to = from + validatedParams.limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch leave requests',
      500,
      { details: error.message }
    );
  }

  return paginatedResponse(
    data || [],
    count || 0,
    validatedParams.page,
    validatedParams.limit
  );
}

// ============================================
// POST /api/v1/leave/requests - Submit leave request
// ============================================

const createLeaveSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  leaveType: z.enum(['annual', 'sick', 'unpaid', 'maternity', 'paternity', 'compassionate', 'other']),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  reason: z.string().min(1, 'Reason is required'),
  attachmentUrl: z.string().url().optional(),
});

async function createHandler(request: NextRequest) {
  await standardRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = createLeaveSchema.parse(body);

  const supabase = await createClient();

  // Verify employee belongs to company
  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('id, full_name, employer_id')
    .eq('id', validatedData.employeeId)
    .single();

  if (employeeError || !employee) {
    return errorResponse(
      'RES_3001',
      'Employee not found',
      404
    );
  }

  if (employee.employer_id !== userContext.companyId) {
    return errorResponse(
      'AUTH_1004',
      'Employee does not belong to your company',
      403
    );
  }

  // Validate date range
  const startDate = new Date(validatedData.startDate);
  const endDate = new Date(validatedData.endDate);

  if (endDate < startDate) {
    throw new ApiError(
      'BIZ_4003',
      'End date must be after start date',
      400
    );
  }

  // Calculate days count (excluding weekends for simplicity)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Check leave balance for annual leave
  if (validatedData.leaveType === 'annual') {
    const year = startDate.getFullYear();
    const { data: balance } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', validatedData.employeeId)
      .eq('year', year)
      .single();

    if (balance) {
      const available = balance.annual_quota + balance.annual_carry_forward - balance.annual_used;
      if (available < diffDays) {
        throw new ApiError(
          'BIZ_4002',
          `Insufficient leave balance. Available: ${available} days, Requested: ${diffDays} days`,
          400
        );
      }
    }
  }

  // Create leave request
  const leaveData = {
    employee_id: validatedData.employeeId,
    employer_id: employee.employer_id,
    employee_name: employee.full_name,
    leave_type: validatedData.leaveType,
    start_date: validatedData.startDate.split('T')[0],
    end_date: validatedData.endDate.split('T')[0],
    days_count: diffDays,
    reason: validatedData.reason,
    attachment_url: validatedData.attachmentUrl,
    status: 'pending',
    is_auto_approved: false,
  };

  const { data: leaveRequest, error } = await supabase
    .from('leave_requests')
    .insert(leaveData)
    .select()
    .single();

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to create leave request',
      500,
      { details: error.message }
    );
  }

  // Log leave request submission
  await logLeaveAction(
    userContext,
    request,
    'submitted',
    leaveRequest.id,
    employee.full_name,
    {
      leaveType: validatedData.leaveType,
      startDate: validatedData.startDate.split('T')[0],
      endDate: validatedData.endDate.split('T')[0],
      daysCount: diffDays,
    }
  );

  // TODO: Trigger leave.submitted webhook
  // TODO: Send notification to manager

  return successResponse(leaveRequest, 201);
}

export const GET = withErrorHandler(listHandler);
export const POST = withErrorHandler(createHandler);
