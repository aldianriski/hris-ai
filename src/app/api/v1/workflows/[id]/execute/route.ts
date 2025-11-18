/**
 * POST /api/v1/workflows/:id/execute
 * Execute a workflow manually
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';

const executeWorkflowSchema = z.object({
  context: z.record(z.any()).optional(), // Workflow execution context data
});

async function handler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await standardRateLimit(request);

  const userContext = await requireAuth(request);
  const { id } = params;

  // Parse request body
  const body = await request.json();
  const validatedData = executeWorkflowSchema.parse(body);

  const supabase = await createClient();

  // Get the workflow
  const { data: workflow, error: fetchError } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', id)
    .eq('employer_id', userContext.companyId)
    .single();

  if (fetchError || !workflow) {
    return notFoundResponse('Workflow');
  }

  // Check if workflow is active
  if (!workflow.is_active) {
    return errorResponse(
      'BIZ_4004',
      'Cannot execute inactive workflow',
      400
    );
  }

  // Evaluate conditions if any
  if (workflow.conditions && workflow.conditions.length > 0) {
    const conditionsMet = evaluateConditions(workflow.conditions, validatedData.context || {});
    if (!conditionsMet) {
      return successResponse({
        executed: false,
        reason: 'Workflow conditions not met',
        workflow: {
          id: workflow.id,
          name: workflow.name,
        },
      });
    }
  }

  // Execute workflow actions in order
  const executionResults = [];
  const sortedActions = [...workflow.actions].sort((a, b) => a.order - b.order);

  for (const action of sortedActions) {
    try {
      const result = await executeAction(action, validatedData.context || {}, userContext);
      executionResults.push({
        action: action.type,
        status: 'success',
        result,
      });
    } catch (error) {
      executionResults.push({
        action: action.type,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Continue with other actions even if one fails
    }
  }

  // Update workflow execution statistics
  const { error: updateError } = await supabase
    .from('workflows')
    .update({
      execution_count: (workflow.execution_count || 0) + 1,
      last_executed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    console.error('Failed to update workflow execution count:', updateError);
  }

  // Log workflow execution
  await supabase
    .from('workflow_executions')
    .insert({
      workflow_id: id,
      employer_id: userContext.companyId,
      executed_by: userContext.id,
      executed_by_email: userContext.email,
      trigger: 'manual',
      context: validatedData.context || {},
      results: executionResults,
      status: executionResults.some(r => r.status === 'failed') ? 'partial' : 'success',
    });

  return successResponse({
    executed: true,
    workflow: {
      id: workflow.id,
      name: workflow.name,
    },
    executionResults,
  });
}

// Helper function to evaluate workflow conditions
function evaluateConditions(conditions: any[], context: Record<string, any>): boolean {
  return conditions.every(condition => {
    const fieldValue = context[condition.field];
    const conditionValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'not_equals':
        return fieldValue !== conditionValue;
      case 'contains':
        return String(fieldValue).includes(String(conditionValue));
      case 'greater_than':
        return Number(fieldValue) > Number(conditionValue);
      case 'less_than':
        return Number(fieldValue) < Number(conditionValue);
      default:
        return false;
    }
  });
}

// Helper function to execute workflow action
async function executeAction(action: any, context: Record<string, any>, userContext: any): Promise<any> {
  switch (action.type) {
    case 'send_email':
      // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
      return { sent: true, to: action.config.to, subject: action.config.subject };

    case 'send_notification':
      // TODO: Create in-app notification
      return { created: true, userId: action.config.userId, message: action.config.message };

    case 'update_field':
      // TODO: Update field in specified table
      return { updated: true, table: action.config.table, field: action.config.field };

    case 'create_task':
      // TODO: Create task in task management system
      return { created: true, task: action.config.taskName };

    case 'webhook':
      // TODO: Send webhook to external URL
      return { sent: true, url: action.config.url };

    case 'slack_message':
      // TODO: Send Slack message via webhook
      return { sent: true, channel: action.config.channel };

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

export const POST = withErrorHandler(handler);
