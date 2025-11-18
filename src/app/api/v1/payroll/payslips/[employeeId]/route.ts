/**
 * GET /api/v1/payroll/payslips/:employeeId
 * Get payslips for an employee
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, paginatedResponse, notFoundResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth, checkEmployeeAccess } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';
import { PaginationSchema } from '@/lib/api/types';

const payslipListSchema = z.object({
  ...PaginationSchema.shape,
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  status: z.enum(['draft', 'approved', 'paid']).optional(),
});

async function handler(
  request: NextRequest,
  { params }: { params: { employeeId: string } }
) {
  await standardRateLimit(request);

  const userContext = await requireAuth(request);
  const { employeeId } = params;

  // Check if user can access this employee's payslips
  // Employees can only see their own, HR/Admin can see all
  if (!checkEmployeeAccess(userContext, employeeId)) {
    return errorResponse(
      'AUTH_1004',
      'You do not have permission to access this employee\'s payslips',
      403
    );
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params2 = Object.fromEntries(searchParams.entries());
  const validatedParams = payslipListSchema.parse(params2);

  const supabase = await createClient();

  // Verify employee belongs to company
  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('id, full_name, employer_id')
    .eq('id', employeeId)
    .single();

  if (employeeError || !employee) {
    return notFoundResponse('Employee');
  }

  if (employee.employer_id !== userContext.companyId) {
    return errorResponse(
      'AUTH_1004',
      'Employee does not belong to your company',
      403
    );
  }

  // Build query for payroll details
  let query = supabase
    .from('payroll_details')
    .select(`
      *,
      period:payroll_periods!period_id (
        id,
        period_start,
        period_end,
        month,
        year,
        status
      )
    `, { count: 'exact' })
    .eq('employee_id', employeeId);

  // Apply filters
  if (validatedParams.status) {
    query = query.eq('status', validatedParams.status);
  }

  // Filter by year and month if provided
  if (validatedParams.year || validatedParams.month) {
    // We need to join with periods table to filter by year/month
    const periodQuery = supabase
      .from('payroll_periods')
      .select('id')
      .eq('employer_id', userContext.companyId);

    if (validatedParams.year) {
      periodQuery.eq('year', validatedParams.year);
    }

    if (validatedParams.month) {
      periodQuery.eq('month', validatedParams.month);
    }

    const { data: periods } = await periodQuery;

    if (periods && periods.length > 0) {
      const periodIds = periods.map(p => p.id);
      query = query.in('period_id', periodIds);
    } else {
      // No matching periods, return empty result
      return paginatedResponse([], 0, validatedParams.page, validatedParams.limit);
    }
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
      'Failed to fetch payslips',
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

export const GET = withErrorHandler(handler);
