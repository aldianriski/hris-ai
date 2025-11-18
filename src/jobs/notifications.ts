/**
 * Notification Sending Job
 * Handles async notification delivery
 */

import { inngest } from '@/lib/queue/client';
import {
  sendLeaveApprovedNotification,
  sendLeaveRejectedNotification,
  sendPayslipReadyNotification,
  sendDocumentVerifiedNotification,
  sendPerformanceReviewNotification,
  sendAnnouncementNotification,
  sendGenericNotification,
} from '@/lib/notifications/sender';

/**
 * Send notification job
 */
export const sendNotificationJob = inngest.createFunction(
  {
    id: 'send-notification',
    name: 'Send Push Notification',
    retries: 2,
  },
  { event: 'notifications/send' },
  async ({ event, step }) => {
    const { userId, title, body, data, companyId } = event.data;

    // Determine notification type from data
    const notificationType = data?.type || 'generic';

    const result = await step.run('send-notification', async () => {
      switch (notificationType) {
        case 'leave-approved':
          return await sendLeaveApprovedNotification(userId, data as any);

        case 'leave-rejected':
          return await sendLeaveRejectedNotification(userId, data as any);

        case 'payslip-ready':
          return await sendPayslipReadyNotification(userId, data as any);

        case 'document-verified':
          return await sendDocumentVerifiedNotification(userId, data as any);

        case 'performance-review':
          return await sendPerformanceReviewNotification(userId, data as any);

        case 'announcement':
          return await sendAnnouncementNotification(userId, data as any);

        default:
          return await sendGenericNotification(
            userId,
            title,
            body,
            data as Record<string, string>,
            data?.clickAction
          );
      }
    });

    if (!result.success) {
      throw new Error(`Notification sending failed: ${result.error}`);
    }

    return {
      success: true,
      userId,
      notificationType,
    };
  }
);
