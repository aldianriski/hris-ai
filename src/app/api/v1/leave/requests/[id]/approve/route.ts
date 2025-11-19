/**
 * PATCH /api/v1/leave/requests/:id/approve
 * Approve a leave request
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireManager } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { logLeaveAction } from '@/lib/utils/auditLog';
import { sendLeaveApprovedEmail } from '@/lib/email/sender';
import { getAppUrl } from '@/lib/config/env';

const approveSchema = z.object({
  notes: z.string().optional(),
});

async function handler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await withRateLimit(request);

  // Only managers and above can approve leave
  const userContext = await requireManager(request);
  const { id } = params;

  // Parse request body
  const body = await request.json();
  const validatedData = approveSchema.parse(body);

  const supabase = await createClient();

  // Get the leave request
  const { data: leaveRequest, error: fetchError } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('id', id)
    .eq('employer_id', userContext.companyId)
    .single();

  if (fetchError || !leaveRequest) {
    return notFoundResponse('Leave request');
  }

  // Check if already approved or rejected
  if (leaveRequest.status !== 'pending') {
    return errorResponse(
      'BIZ_4004',
      `Leave request is already ${leaveRequest.status}`,
      400
    );
  }

  // Update leave request status
  const { data: updatedRequest, error } = await supabase
    .from('leave_requests')
    .update({
      status: 'approved',
      approved_by: userContext.id,
      approved_by_name: userContext.email,
      approved_at: new Date().toISOString(),
      approval_notes: validatedData.notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to approve leave request',
      500,
      { details: error.message }
    );
  }

  // Update leave balance for annual leave
  if (updatedRequest.leave_type === 'annual') {
    const year = new Date(updatedRequest.start_date).getFullYear();
    const { error: balanceError } = await supabase.rpc('increment', {
      table_name: 'leave_balances',
      row_id: updatedRequest.employee_id,
      column_name: 'annual_used',
      x: updatedRequest.days_count,
    });

    // If RPC doesn't work, update directly
    if (balanceError) {
      // Fetch current balance and update
      const { data: balance } = await supabase
        .from('leave_balances')
        .select('annual_used')
        .eq('employee_id', updatedRequest.employee_id)
        .eq('year', year)
        .single();

      if (balance) {
        await supabase
          .from('leave_balances')
          .update({
            annual_used: (balance.annual_used || 0) + updatedRequest.days_count,
          })
          .eq('employee_id', updatedRequest.employee_id)
          .eq('year', year);
      }
    }
  }

  // Log leave approval
  await logLeaveAction(
    userContext,
    request,
    'approved',
    updatedRequest.id,
    updatedRequest.employee_name,
    {
      approvedBy: userContext.email,
      approvalNotes: validatedData.notes,
    }
  );

  // Send email notification to employee
  if (updatedRequest.employee_email) {
    const emailResult = await sendLeaveApprovedEmail(updatedRequest.employee_email, {
      employeeName: updatedRequest.employee_name,
      leaveType: updatedRequest.leave_type,
      startDate: new Date(updatedRequest.start_date).toLocaleDateString('id-ID'),
      endDate: new Date(updatedRequest.end_date).toLocaleDateString('id-ID'),
      days: updatedRequest.days_count,
      approvedBy: userContext.email,
      notes: validatedData.notes,
      dashboardUrl: `${getAppUrl()}/dashboard`,
    });

    if (!emailResult.success) {
      console.error('Failed to send leave approval email:', emailResult.error);
      // Don't fail the request if email fails
    }
  }

  // TODO: Trigger leave.approved webhook

  return successResponse(updatedRequest);
}

export const PATCH = withErrorHandler(handler);
