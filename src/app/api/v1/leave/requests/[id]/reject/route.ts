/**
 * PATCH /api/v1/leave/requests/:id/reject
 * Reject a leave request
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireManager } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';
import { logLeaveAction } from '@/lib/utils/auditLog';

const rejectSchema = z.object({
  notes: z.string().min(1, 'Rejection reason is required'),
});

async function handler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await standardRateLimit(request);

  // Only managers and above can reject leave
  const userContext = await requireManager(request);
  const { id } = params;

  // Parse request body
  const body = await request.json();
  const validatedData = rejectSchema.parse(body);

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
      status: 'rejected',
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
      'Failed to reject leave request',
      500,
      { details: error.message }
    );
  }

  // Log leave rejection
  await logLeaveAction(
    userContext,
    request,
    'rejected',
    updatedRequest.id,
    updatedRequest.employee_name,
    {
      rejectedBy: userContext.email,
      rejectionReason: validatedData.notes,
    }
  );

  // TODO: Trigger leave.rejected webhook
  // TODO: Send notification to employee

  return successResponse(updatedRequest);
}

export const PATCH = withErrorHandler(handler);
