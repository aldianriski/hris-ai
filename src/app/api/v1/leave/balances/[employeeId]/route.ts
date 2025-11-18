/**
 * GET /api/v1/leave/balances/:employeeId
 * Get leave balance for an employee
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth, checkEmployeeAccess } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';

const balanceSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

async function handler(
  request: NextRequest,
  { params }: { params: { employeeId: string } }
) {
  await standardRateLimit(request);

  const userContext = await requireAuth(request);
  const { employeeId } = params;

  // Check if user can access this employee's balance
  if (!checkEmployeeAccess(userContext, employeeId)) {
    return errorResponse(
      'AUTH_1004',
      'You do not have permission to access this employee\'s leave balance',
      403
    );
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params2 = Object.fromEntries(searchParams.entries());
  const validatedParams = balanceSchema.parse(params2);

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

  // Get leave balance
  const year = validatedParams.year || new Date().getFullYear();
  const { data: balance, error } = await supabase
    .from('leave_balances')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('year', year)
    .single();

  if (error || !balance) {
    // Create default balance if not found
    const defaultBalance = {
      employee_id: employeeId,
      employer_id: employee.employer_id,
      year,
      annual_quota: 12, // Default 12 days per year
      annual_used: 0,
      annual_carry_forward: 0,
      sick_used: 0,
      unpaid_used: 0,
    };

    const { data: newBalance, error: createError } = await supabase
      .from('leave_balances')
      .insert(defaultBalance)
      .select()
      .single();

    if (createError) {
      return errorResponse(
        'SRV_9002',
        'Failed to get leave balance',
        500,
        { details: createError.message }
      );
    }

    return successResponse(newBalance, 201);
  }

  // Calculate available balance
  const available = balance.annual_quota + balance.annual_carry_forward - balance.annual_used;

  return successResponse({
    ...balance,
    annual_available: Math.max(0, available),
  });
}

export const GET = withErrorHandler(handler);
