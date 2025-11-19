/**
 * POST /api/v1/attendance/anomalies/:id/reject - Reject attendance anomaly
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';

const rejectAnomalySchema = z.object({
  notes: z.string().optional(),
});

async function handler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);
  const anomalyId = params.id;

  if (!anomalyId) {
    return errorResponse('VAL_2001', 'Anomaly ID is required', 400);
  }

  // Parse request body
  const body = await request.json().catch(() => ({}));
  const validatedData = rejectAnomalySchema.parse(body);

  const supabase = await createClient();

  // Get anomaly to verify it exists
  const { data: anomaly, error: fetchError } = await supabase
    .from('attendance_anomalies')
    .select('*')
    .eq('id', anomalyId)
    .eq('employer_id', userContext.companyId)
    .single();

  if (fetchError || !anomaly) {
    return errorResponse(
      'SRV_9002',
      'Anomaly not found',
      404,
      { details: fetchError?.message || 'Anomaly does not exist' }
    );
  }

  // Check if already processed
  if (anomaly.status !== 'pending') {
    return errorResponse(
      'VAL_2002',
      'Anomaly already processed',
      400,
      { details: `Anomaly is already ${anomaly.status}` }
    );
  }

  // Update anomaly to rejected
  const { data: updatedAnomaly, error: updateError } = await supabase
    .from('attendance_anomalies')
    .update({
      status: 'rejected',
      reviewed_by: userContext.id,
      reviewed_by_email: userContext.email,
      reviewed_at: new Date().toISOString(),
      review_notes: validatedData.notes,
    })
    .eq('id', anomalyId)
    .eq('employer_id', userContext.companyId)
    .select()
    .single();

  if (updateError) {
    return errorResponse(
      'SRV_9002',
      'Failed to reject anomaly',
      500,
      { details: updateError.message }
    );
  }

  // TODO: Keep original attendance record unchanged
  // TODO: Send notification to employee about rejected correction
  // TODO: Log audit trail

  return successResponse({
    success: true,
    message: 'Anomaly rejected successfully',
    anomaly: updatedAnomaly,
  });
}

export const POST = withErrorHandler(handler);
