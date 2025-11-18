/**
 * Inngest Client Configuration
 * Serverless job queue for background tasks
 */

import { Inngest, EventSchemas } from 'inngest';

/**
 * Define event schemas for type safety
 */
type Events = {
  'payroll/process': {
    data: {
      payrollPeriodId: string;
      companyId: string;
      initiatedBy: string;
    };
  };
  'email/send': {
    data: {
      type: string;
      to: string | string[];
      subject: string;
      data: Record<string, any>;
      companyId?: string;
    };
  };
  'integrations/refresh-tokens': {
    data: {
      integrationId?: string;
      companyId?: string;
    };
  };
  'workflow/execute': {
    data: {
      workflowId: string;
      triggerId: string;
      payload: Record<string, any>;
      companyId: string;
    };
  };
  'cleanup/expired-tokens': {
    data: {
      olderThanDays?: number;
    };
  };
  'notifications/send': {
    data: {
      userId: string;
      title: string;
      body: string;
      data?: Record<string, any>;
      companyId: string;
    };
  };
};

/**
 * Create Inngest client
 */
export const inngest = new Inngest({
  id: 'hris-app',
  name: 'HRIS Application',
  schemas: new EventSchemas().fromRecord<Events>(),
  eventKey: process.env.INNGEST_EVENT_KEY,
  // Enable local development mode
  isDev: process.env.NODE_ENV === 'development',
});

/**
 * Event names for easy reference
 */
export const INNGEST_EVENTS = {
  PAYROLL_PROCESS: 'payroll/process',
  EMAIL_SEND: 'email/send',
  INTEGRATIONS_REFRESH_TOKENS: 'integrations/refresh-tokens',
  WORKFLOW_EXECUTE: 'workflow/execute',
  CLEANUP_EXPIRED_TOKENS: 'cleanup/expired-tokens',
  NOTIFICATIONS_SEND: 'notifications/send',
} as const;

/**
 * Helper to send events
 */
export async function sendEvent<K extends keyof Events>(
  name: K,
  data: Events[K]['data']
): Promise<{ success: boolean; error?: string }> {
  try {
    await inngest.send({
      name,
      data,
    });

    return { success: true };
  } catch (error) {
    console.error(`Failed to send event ${name}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
