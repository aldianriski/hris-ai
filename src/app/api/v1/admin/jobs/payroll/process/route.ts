/**
 * POST /api/v1/admin/jobs/payroll/process
 * Queue payroll processing job
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { createClient } from '@/lib/supabase/server';
import { queuePayrollProcessing } from '@/lib/queue/helpers';
import { z } from 'zod';

const processPayrollSchema = z.object({
  payrollPeriodId: z.string().uuid(),
});

async function handler(request: NextRequest) {
  await withRateLimit(request);

  const userContext = await requireAuth(request, { requireRole: 'hr' });

  // Parse and validate request body
  const body = await request.json();
  const validatedData = processPayrollSchema.parse(body);

  const supabase = await createClient();

  // Verify payroll period exists and belongs to company
  const { data: period, error: periodError } = await supabase
    .from('payroll_periods')
    .select('*')
    .eq('id', validatedData.payrollPeriodId)
    .eq('employer_id', userContext.companyId)
    .single();

  if (periodError || !period) {
    return notFoundResponse('Payroll period');
  }

  // Check if period is in draft status
  if (period.status !== 'draft') {
    return errorResponse(
      'BIZ_4002',
      'Payroll period must be in draft status to process',
      400,
      { currentStatus: period.status }
    );
  }

  // Queue payroll processing job
  const result = await queuePayrollProcessing(
    validatedData.payrollPeriodId,
    userContext.companyId,
    userContext.email
  );

  if (!result.success) {
    return errorResponse(
      'SRV_9002',
      'Failed to queue payroll processing',
      500,
      { error: result.error }
    );
  }

  // Update period status to processing
  await supabase
    .from('payroll_periods')
    .update({
      status: 'processing',
      updated_at: new Date().toISOString(),
    })
    .eq('id', validatedData.payrollPeriodId);

  return successResponse(
    {
      message: 'Payroll processing queued successfully',
      payrollPeriodId: validatedData.payrollPeriodId,
      status: 'processing',
    },
    202 // Accepted
  );
}

export const POST = withErrorHandler(handler);
