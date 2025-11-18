/**
 * Workflow Execution Job
 * Handles automated workflow execution
 */

import { inngest } from '@/lib/queue/client';
import { createClient } from '@/lib/supabase/server';
import { sendEvent, INNGEST_EVENTS } from '@/lib/queue/client';

/**
 * Execute workflow job
 */
export const executeWorkflowJob = inngest.createFunction(
  {
    id: 'execute-workflow',
    name: 'Execute Workflow',
    retries: 2,
  },
  { event: 'workflow/execute' },
  async ({ event, step }) => {
    const { workflowId, triggerId, payload, companyId } = event.data;

    // Step 1: Get workflow configuration
    const workflow = await step.run('get-workflow', async () => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .eq('employer_id', companyId)
        .single();

      if (error || !data) {
        throw new Error('Workflow not found');
      }

      if (!data.is_active) {
        throw new Error('Workflow is not active');
      }

      return data;
    });

    // Step 2: Get workflow steps
    const steps = await step.run('get-workflow-steps', async () => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', workflowId)
        .eq('is_active', true)
        .order('order', { ascending: true });

      if (error) {
        throw new Error(`Failed to get workflow steps: ${error.message}`);
      }

      return data || [];
    });

    // Step 3: Execute each workflow step in sequence
    const executionResults = [];

    for (const workflowStep of steps) {
      const stepResult = await step.run(`execute-step-${workflowStep.id}`, async () => {
        try {
          // Execute step based on action type
          switch (workflowStep.action_type) {
            case 'send_email':
              await sendEvent(INNGEST_EVENTS.EMAIL_SEND, {
                type: workflowStep.config.emailType || 'generic',
                to: workflowStep.config.to || payload.recipientEmail,
                subject: workflowStep.config.subject || 'Workflow Notification',
                data: {
                  ...payload,
                  ...workflowStep.config.data,
                },
              });
              break;

            case 'send_notification':
              await sendEvent(INNGEST_EVENTS.NOTIFICATIONS_SEND, {
                userId: workflowStep.config.userId || payload.userId,
                title: workflowStep.config.title || 'Notification',
                body: workflowStep.config.body || '',
                data: payload,
                companyId,
              });
              break;

            case 'update_status':
              const supabase = await createClient();
              await supabase
                .from(workflowStep.config.table)
                .update({
                  status: workflowStep.config.status,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', workflowStep.config.recordId || payload.recordId);
              break;

            case 'create_approval':
              // Create approval request logic
              const supabaseCreate = await createClient();
              await supabaseCreate
                .from('approval_requests')
                .insert({
                  workflow_id: workflowId,
                  approver_id: workflowStep.config.approverId,
                  entity_type: workflowStep.config.entityType,
                  entity_id: payload.entityId,
                  status: 'pending',
                  employer_id: companyId,
                });
              break;

            case 'wait':
              // Wait for specified duration (in seconds)
              const waitDuration = workflowStep.config.duration || 0;
              if (waitDuration > 0) {
                await new Promise((resolve) => setTimeout(resolve, waitDuration * 1000));
              }
              break;

            case 'webhook':
              // Call external webhook
              await fetch(workflowStep.config.url, {
                method: workflowStep.config.method || 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...workflowStep.config.headers,
                },
                body: JSON.stringify(payload),
              });
              break;

            default:
              throw new Error(`Unsupported action type: ${workflowStep.action_type}`);
          }

          return {
            stepId: workflowStep.id,
            success: true,
          };
        } catch (error) {
          return {
            stepId: workflowStep.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      executionResults.push(stepResult);

      // Stop execution if step failed and workflow doesn't allow continuing on error
      if (!stepResult.success && !workflow.continue_on_error) {
        break;
      }
    }

    // Step 4: Log workflow execution
    await step.run('log-execution', async () => {
      const supabase = await createClient();

      const successCount = executionResults.filter((r) => r.success).length;
      const failedCount = executionResults.filter((r) => !r.success).length;

      await supabase.from('workflow_executions').insert({
        workflow_id: workflowId,
        trigger_id: triggerId,
        status: failedCount === 0 ? 'completed' : 'failed',
        executed_at: new Date().toISOString(),
        steps_executed: executionResults.length,
        steps_success: successCount,
        steps_failed: failedCount,
        execution_data: executionResults,
      });
    });

    return {
      success: true,
      workflowId,
      stepsExecuted: executionResults.length,
      results: executionResults,
    };
  }
);
