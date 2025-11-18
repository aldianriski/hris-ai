/**
 * Tests for job queue helper functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Inngest client
vi.mock('@/lib/queue/client', () => ({
  sendEvent: vi.fn(),
  INNGEST_EVENTS: {
    PAYROLL_PROCESS: 'payroll/process',
    EMAIL_SEND: 'email/send',
    INTEGRATIONS_REFRESH_TOKENS: 'integrations/refresh-tokens',
    WORKFLOW_EXECUTE: 'workflow/execute',
    NOTIFICATIONS_SEND: 'notifications/send',
  },
}));

import {
  queuePayrollProcessing,
  queueEmail,
  queueTokenRefresh,
  queueWorkflowExecution,
  queueNotification,
} from '@/lib/queue/helpers';
import { sendEvent, INNGEST_EVENTS } from '@/lib/queue/client';

describe('Queue Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('queuePayrollProcessing', () => {
    it('should queue payroll processing with correct event data', async () => {
      (sendEvent as any).mockResolvedValue({ success: true });

      const result = await queuePayrollProcessing('period-123', 'company-456', 'user@example.com');

      expect(sendEvent).toHaveBeenCalledWith(INNGEST_EVENTS.PAYROLL_PROCESS, {
        payrollPeriodId: 'period-123',
        companyId: 'company-456',
        initiatedBy: 'user@example.com',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('queueEmail', () => {
    it('should queue email sending with correct data', async () => {
      (sendEvent as any).mockResolvedValue({ success: true });

      const result = await queueEmail('leave-approved', 'user@example.com', { name: 'John' });

      expect(sendEvent).toHaveBeenCalledWith(INNGEST_EVENTS.EMAIL_SEND, {
        type: 'leave-approved',
        to: 'user@example.com',
        subject: '',
        data: { name: 'John' },
      });
      expect(result.success).toBe(true);
    });

    it('should include subject when provided', async () => {
      (sendEvent as any).mockResolvedValue({ success: true });

      const result = await queueEmail('generic', 'user@example.com', {}, 'Test Subject');

      expect(sendEvent).toHaveBeenCalledWith(INNGEST_EVENTS.EMAIL_SEND, expect.objectContaining({
        subject: 'Test Subject',
      }));
      expect(result.success).toBe(true);
    });
  });

  describe('queueTokenRefresh', () => {
    it('should queue token refresh for specific integration', async () => {
      (sendEvent as any).mockResolvedValue({ success: true });

      const result = await queueTokenRefresh('integration-123');

      expect(sendEvent).toHaveBeenCalledWith(INNGEST_EVENTS.INTEGRATIONS_REFRESH_TOKENS, {
        integrationId: 'integration-123',
        companyId: undefined,
      });
      expect(result.success).toBe(true);
    });

    it('should queue token refresh for all integrations', async () => {
      (sendEvent as any).mockResolvedValue({ success: true });

      const result = await queueTokenRefresh();

      expect(sendEvent).toHaveBeenCalledWith(INNGEST_EVENTS.INTEGRATIONS_REFRESH_TOKENS, {
        integrationId: undefined,
        companyId: undefined,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('queueWorkflowExecution', () => {
    it('should queue workflow execution with correct data', async () => {
      (sendEvent as any).mockResolvedValue({ success: true });

      const payload = { userId: 'user-123' };
      const result = await queueWorkflowExecution(
        'workflow-456',
        'trigger-789',
        payload,
        'company-001'
      );

      expect(sendEvent).toHaveBeenCalledWith(INNGEST_EVENTS.WORKFLOW_EXECUTE, {
        workflowId: 'workflow-456',
        triggerId: 'trigger-789',
        payload,
        companyId: 'company-001',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('queueNotification', () => {
    it('should queue notification with correct data', async () => {
      (sendEvent as any).mockResolvedValue({ success: true });

      const result = await queueNotification(
        'user-123',
        'Test Notification',
        'This is a test',
        'company-456',
        { extra: 'data' }
      );

      expect(sendEvent).toHaveBeenCalledWith(INNGEST_EVENTS.NOTIFICATIONS_SEND, {
        userId: 'user-123',
        title: 'Test Notification',
        body: 'This is a test',
        data: { extra: 'data' },
        companyId: 'company-456',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should return error when sendEvent fails', async () => {
      (sendEvent as any).mockResolvedValue({ success: false, error: 'Network error' });

      const result = await queueEmail('test', 'user@example.com', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });
});
