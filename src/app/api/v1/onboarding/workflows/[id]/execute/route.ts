/**
 * POST /api/v1/onboarding/workflows/:id/execute - Execute/start workflow
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

  // Get current workflow
  const { data: workflow, error: fetchError } = await supabase
    .from('onboarding_workflows')
    .select('*')
    .eq('id', workflowId)
    .eq('employer_id', userContext.companyId)
    .single();

  if (fetchError || !workflow) {
    return errorResponse(
      'SRV_9002',
      'Workflow not found',
      404,
      { details: fetchError?.message || 'Workflow does not exist' }
    );
  }

  // Check if already completed
  if (workflow.status === 'completed') {
    return errorResponse(
      'VAL_2002',
      'Workflow already completed',
      400,
      { details: 'Cannot execute a completed workflow' }
    );
  }

  // Update workflow to in_progress and set first step to in_progress
  const steps = workflow.steps as Array<{
    stepNumber: number;
    name: string;
    status: string;
    assignedTo: string;
  }>;

  if (steps.length > 0 && steps[0].status === 'pending') {
    steps[0].status = 'in_progress';
  }

  const { data: updatedWorkflow, error: updateError } = await supabase
    .from('onboarding_workflows')
    .update({
      status: 'in_progress',
      steps,
      started_at: workflow.started_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', workflowId)
    .eq('employer_id', userContext.companyId)
    .select()
    .single();

  if (updateError) {
    return errorResponse(
      'SRV_9002',
      'Failed to execute workflow',
      500,
      { details: updateError.message }
    );
  }

  // TODO: Trigger notifications to assignees
  // TODO: Send welcome email for onboarding
  // TODO: Create tasks in task management system

  return successResponse({
    success: true,
    message: `${workflow.workflow_type === 'onboarding' ? 'Onboarding' : 'Offboarding'} workflow started`,
    workflow: updatedWorkflow,
  });
}

export const POST = withErrorHandler(handler);
