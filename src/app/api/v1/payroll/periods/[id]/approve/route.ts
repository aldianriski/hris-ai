/**
 * POST /api/v1/payroll/periods/:id/approve
 * Approve payroll period (requires admin)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { logPayrollAction } from '@/lib/utils/auditLog';

async function handler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await withRateLimit(request);

  // Only admins can approve payroll
  const userContext = await requireAdmin(request);
  const { id } = params;

  const supabase = await createClient();

  // Get the payroll period
  const { data: period, error: fetchError } = await supabase
    .from('payroll_periods')
    .select('*')
    .eq('id', id)
    .eq('employer_id', userContext.companyId)
    .single();

  if (fetchError || !period) {
    return notFoundResponse('Payroll period');
  }

  if (period.status !== 'processing') {
    return errorResponse(
      'BIZ_4004',
      `Payroll period must be in processing status. Current status: ${period.status}`,
      400
    );
  }

  // Update period status to approved
  const { data: updatedPeriod, error: updateError } = await supabase
    .from('payroll_periods')
    .update({
      status: 'approved',
      approved_by: userContext.id,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return errorResponse(
      'SRV_9002',
      'Failed to approve payroll period',
      500,
      { details: updateError.message }
    );
  }

  // Update all payroll details to approved status
  const { error: detailsError } = await supabase
    .from('payroll_details')
    .update({
      status: 'approved',
      updated_at: new Date().toISOString(),
    })
    .eq('period_id', id);

  if (detailsError) {
    console.error('Failed to update payroll details:', detailsError);
  }

  // Log payroll approval
  await logPayrollAction(
    userContext,
    request,
    'approved',
    updatedPeriod.id,
    {
      approvedBy: userContext.email,
      totalEmployees: updatedPeriod.total_employees,
      totalAmount: updatedPeriod.total_net_salary,
    }
  );

  // TODO: Trigger payroll.approved webhook
  // TODO: Send notifications to employees

  return successResponse(updatedPeriod);
}

export const POST = withErrorHandler(handler);
