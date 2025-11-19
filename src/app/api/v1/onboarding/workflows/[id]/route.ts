/**
 * GET /api/v1/onboarding/workflows/:id - Get single workflow
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';

async function handler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);
  const workflowId = params.id;

  if (!workflowId) {
    return errorResponse('VAL_2001', 'Workflow ID is required', 400);
  }

  const supabase = await createClient();

  const { data: workflow, error } = await supabase
    .from('onboarding_workflows')
    .select('*')
    .eq('id', workflowId)
    .eq('employer_id', userContext.companyId)
    .single();

  if (error || !workflow) {
    return errorResponse(
      'SRV_9002',
      'Workflow not found',
      404,
      { details: error?.message || 'Workflow does not exist' }
    );
  }

  return successResponse(workflow);
}

export const GET = withErrorHandler(handler);
