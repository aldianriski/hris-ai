/**
 * PATCH /api/v1/onboarding/workflows/:id/steps/:stepNumber - Update workflow step
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';

const updateStepSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'skipped']),
  notes: z.string().optional(),
  completedBy: z.string().optional(),
});

async function handler(
  request: NextRequest,
  { params }: { params: { id: string; stepNumber: string } }
) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);
  const workflowId = params.id;
  const stepNumber = parseInt(params.stepNumber);

  if (!workflowId || isNaN(stepNumber)) {
    return errorResponse('VAL_2001', 'Invalid workflow ID or step number', 400);
  }

  // Parse and validate request body
  const body = await request.json();
  const validatedData = updateStepSchema.parse(body);

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

  // Update the specific step
  const steps = workflow.steps as Array<{
    stepNumber: number;
    name: string;
    status: string;
    assignedTo: string;
    notes?: string;
    completedBy?: string;
    completedAt?: string;
  }>;

  const stepIndex = steps.findIndex(s => s.stepNumber === stepNumber);

  if (stepIndex === -1) {
    return errorResponse('VAL_2001', 'Step not found', 404);
  }

  // Update step
  steps[stepIndex].status = validatedData.status;
  if (validatedData.notes) {
    steps[stepIndex].notes = validatedData.notes;
  }
  if (validatedData.status === 'completed') {
    steps[stepIndex].completedBy = validatedData.completedBy || userContext.email;
    steps[stepIndex].completedAt = new Date().toISOString();
  }

  // Calculate overall workflow status
  const allCompleted = steps.every(s => s.status === 'completed' || s.status === 'skipped');
  const anyInProgress = steps.some(s => s.status === 'in_progress');
  const newWorkflowStatus = allCompleted
    ? 'completed'
    : anyInProgress
    ? 'in_progress'
    : 'pending';

  // Find current step (first non-completed step)
  const currentStepIndex = steps.findIndex(s => s.status !== 'completed' && s.status !== 'skipped');
  const newCurrentStep = currentStepIndex !== -1 ? steps[currentStepIndex].stepNumber : stepNumber;

  // Update workflow
  const { data: updatedWorkflow, error: updateError } = await supabase
    .from('onboarding_workflows')
    .update({
      steps,
      status: newWorkflowStatus,
      current_step: newCurrentStep,
      completed_at: allCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', workflowId)
    .eq('employer_id', userContext.companyId)
    .select()
    .single();

  if (updateError) {
    return errorResponse(
      'SRV_9002',
      'Failed to update workflow step',
      500,
      { details: updateError.message }
    );
  }

  return successResponse({ success: true, workflow: updatedWorkflow });
}

export const PATCH = withErrorHandler(handler);
