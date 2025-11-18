/**
 * Notification Sender
 * High-level functions for sending notifications
 */

import { createClient } from '@/lib/supabase/server';
import { sendToDevice, sendToDevices } from './fcm';
import { NOTIFICATION_TYPES, type NotificationData } from './config';

/**
 * Get user device tokens
 */
async function getUserDeviceTokens(
  userId: string
): Promise<string[]> {
  const supabase = await createClient();

  const { data: tokens } = await supabase
    .from('device_tokens')
    .select('token')
    .eq('user_id', userId)
    .eq('is_active', true);

  return tokens?.map((t) => t.token) || [];
}

/**
 * Send leave approved notification
 */
export async function sendLeaveApprovedNotification(
  userId: string,
  data: {
    leaveType: string;
    startDate: string;
    endDate: string;
    approvedBy: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const tokens = await getUserDeviceTokens(userId);

  if (tokens.length === 0) {
    return { success: true }; // No tokens, but not an error
  }

  const notification: NotificationData = {
    title: '✅ Leave Request Approved',
    body: `Your ${data.leaveType} from ${data.startDate} to ${data.endDate} has been approved`,
    type: NOTIFICATION_TYPES.LEAVE_APPROVED,
    priority: 'high',
    data: {
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      approvedBy: data.approvedBy,
    },
    clickAction: '/dashboard/leave',
  };

  const result = await sendToDevices(tokens, notification);

  // Remove invalid tokens
  if (result.invalidTokens.length > 0) {
    await removeInvalidTokens(result.invalidTokens);
  }

  return {
    success: result.successCount > 0,
    error: result.failureCount > 0 ? 'Some notifications failed' : undefined,
  };
}

/**
 * Send leave rejected notification
 */
export async function sendLeaveRejectedNotification(
  userId: string,
  data: {
    leaveType: string;
    startDate: string;
    endDate: string;
    rejectedBy: string;
    reason?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const tokens = await getUserDeviceTokens(userId);

  if (tokens.length === 0) {
    return { success: true };
  }

  const notification: NotificationData = {
    title: '❌ Leave Request Rejected',
    body: data.reason
      ? `Your ${data.leaveType} was rejected: ${data.reason}`
      : `Your ${data.leaveType} from ${data.startDate} to ${data.endDate} was rejected`,
    type: NOTIFICATION_TYPES.LEAVE_REJECTED,
    priority: 'high',
    data: {
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      rejectedBy: data.rejectedBy,
      reason: data.reason || '',
    },
    clickAction: '/dashboard/leave',
  };

  const result = await sendToDevices(tokens, notification);

  if (result.invalidTokens.length > 0) {
    await removeInvalidTokens(result.invalidTokens);
  }

  return {
    success: result.successCount > 0,
    error: result.failureCount > 0 ? 'Some notifications failed' : undefined,
  };
}

/**
 * Send payslip ready notification
 */
export async function sendPayslipReadyNotification(
  userId: string,
  data: {
    month: string;
    year: number;
    netSalary: number;
  }
): Promise<{ success: boolean; error?: string }> {
  const tokens = await getUserDeviceTokens(userId);

  if (tokens.length === 0) {
    return { success: true };
  }

  const formattedSalary = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(data.netSalary);

  const notification: NotificationData = {
    title: '💰 Payslip Ready',
    body: `Your payslip for ${data.month} ${data.year} is ready. Net salary: ${formattedSalary}`,
    type: NOTIFICATION_TYPES.PAYSLIP_READY,
    priority: 'high',
    data: {
      month: data.month,
      year: data.year.toString(),
      netSalary: data.netSalary.toString(),
    },
    clickAction: '/dashboard/payslips',
  };

  const result = await sendToDevices(tokens, notification);

  if (result.invalidTokens.length > 0) {
    await removeInvalidTokens(result.invalidTokens);
  }

  return {
    success: result.successCount > 0,
    error: result.failureCount > 0 ? 'Some notifications failed' : undefined,
  };
}

/**
 * Send document verified notification
 */
export async function sendDocumentVerifiedNotification(
  userId: string,
  data: {
    documentType: string;
    documentName: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const tokens = await getUserDeviceTokens(userId);

  if (tokens.length === 0) {
    return { success: true };
  }

  const notification: NotificationData = {
    title: '✓ Document Verified',
    body: `Your ${data.documentType} "${data.documentName}" has been verified`,
    type: NOTIFICATION_TYPES.DOCUMENT_VERIFIED,
    priority: 'normal',
    data: {
      documentType: data.documentType,
      documentName: data.documentName,
    },
    clickAction: '/dashboard/documents',
  };

  const result = await sendToDevices(tokens, notification);

  if (result.invalidTokens.length > 0) {
    await removeInvalidTokens(result.invalidTokens);
  }

  return {
    success: result.successCount > 0,
    error: result.failureCount > 0 ? 'Some notifications failed' : undefined,
  };
}

/**
 * Send performance review notification
 */
export async function sendPerformanceReviewNotification(
  userId: string,
  data: {
    reviewerName: string;
    dueDate: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const tokens = await getUserDeviceTokens(userId);

  if (tokens.length === 0) {
    return { success: true };
  }

  const notification: NotificationData = {
    title: '📊 Performance Review Scheduled',
    body: `${data.reviewerName} has scheduled a performance review. Due: ${data.dueDate}`,
    type: NOTIFICATION_TYPES.PERFORMANCE_REVIEW,
    priority: 'high',
    data: {
      reviewerName: data.reviewerName,
      dueDate: data.dueDate,
    },
    clickAction: '/dashboard/reviews',
  };

  const result = await sendToDevices(tokens, notification);

  if (result.invalidTokens.length > 0) {
    await removeInvalidTokens(result.invalidTokens);
  }

  return {
    success: result.successCount > 0,
    error: result.failureCount > 0 ? 'Some notifications failed' : undefined,
  };
}

/**
 * Send announcement notification
 */
export async function sendAnnouncementNotification(
  userId: string,
  data: {
    title: string;
    message: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const tokens = await getUserDeviceTokens(userId);

  if (tokens.length === 0) {
    return { success: true };
  }

  const notification: NotificationData = {
    title: `📢 ${data.title}`,
    body: data.message,
    type: NOTIFICATION_TYPES.ANNOUNCEMENT,
    priority: 'normal',
    clickAction: '/dashboard/announcements',
  };

  const result = await sendToDevices(tokens, notification);

  if (result.invalidTokens.length > 0) {
    await removeInvalidTokens(result.invalidTokens);
  }

  return {
    success: result.successCount > 0,
    error: result.failureCount > 0 ? 'Some notifications failed' : undefined,
  };
}

/**
 * Send generic notification
 */
export async function sendGenericNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>,
  clickAction?: string
): Promise<{ success: boolean; error?: string }> {
  const tokens = await getUserDeviceTokens(userId);

  if (tokens.length === 0) {
    return { success: true };
  }

  const notification: NotificationData = {
    title,
    body,
    type: NOTIFICATION_TYPES.SYSTEM,
    priority: 'normal',
    data,
    clickAction,
  };

  const result = await sendToDevices(tokens, notification);

  if (result.invalidTokens.length > 0) {
    await removeInvalidTokens(result.invalidTokens);
  }

  return {
    success: result.successCount > 0,
    error: result.failureCount > 0 ? 'Some notifications failed' : undefined,
  };
}

/**
 * Remove invalid device tokens
 */
async function removeInvalidTokens(tokens: string[]): Promise<void> {
  if (tokens.length === 0) {
    return;
  }

  const supabase = await createClient();

  await supabase
    .from('device_tokens')
    .update({ is_active: false })
    .in('token', tokens);
}
