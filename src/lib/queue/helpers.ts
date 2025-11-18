/**
 * Queue Helper Functions
 * Convenient wrappers for queueing common tasks
 */

import { sendEvent, INNGEST_EVENTS } from './client';

/**
 * Queue payroll processing
 */
export async function queuePayrollProcessing(
  payrollPeriodId: string,
  companyId: string,
  initiatedBy: string
): Promise<{ success: boolean; error?: string }> {
  return sendEvent(INNGEST_EVENTS.PAYROLL_PROCESS, {
    payrollPeriodId,
    companyId,
    initiatedBy,
  });
}

/**
 * Queue email sending
 */
export async function queueEmail(
  type: string,
  to: string | string[],
  data: Record<string, any>,
  subject?: string
): Promise<{ success: boolean; error?: string }> {
  return sendEvent(INNGEST_EVENTS.EMAIL_SEND, {
    type,
    to,
    subject: subject || '',
    data,
  });
}

/**
 * Queue batch emails
 */
export async function queueBatchEmails(
  emails: Array<{ to: string; type: string; data: any }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { inngest } = await import('./client');

    await inngest.send({
      name: 'email/send-batch',
      data: { emails },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Queue integration token refresh
 */
export async function queueTokenRefresh(
  integrationId?: string,
  companyId?: string
): Promise<{ success: boolean; error?: string }> {
  return sendEvent(INNGEST_EVENTS.INTEGRATIONS_REFRESH_TOKENS, {
    integrationId,
    companyId,
  });
}

/**
 * Queue workflow execution
 */
export async function queueWorkflowExecution(
  workflowId: string,
  triggerId: string,
  payload: Record<string, any>,
  companyId: string
): Promise<{ success: boolean; error?: string }> {
  return sendEvent(INNGEST_EVENTS.WORKFLOW_EXECUTE, {
    workflowId,
    triggerId,
    payload,
    companyId,
  });
}

/**
 * Queue notification sending
 */
export async function queueNotification(
  userId: string,
  title: string,
  body: string,
  companyId: string,
  data?: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  return sendEvent(INNGEST_EVENTS.NOTIFICATIONS_SEND, {
    userId,
    title,
    body,
    data,
    companyId,
  });
}
