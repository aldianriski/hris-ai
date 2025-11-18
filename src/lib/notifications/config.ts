/**
 * Firebase Cloud Messaging Configuration
 */

export const FCM_CONFIG = {
  // Firebase project credentials (service account JSON)
  CREDENTIALS: process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : null,

  // Firebase project ID
  PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',

  // Web push certificate (VAPID key)
  WEB_PUSH_CERTIFICATE: process.env.FIREBASE_WEB_PUSH_CERTIFICATE || '',
} as const;

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  LEAVE_APPROVED: 'leave_approved',
  LEAVE_REJECTED: 'leave_rejected',
  PAYSLIP_READY: 'payslip_ready',
  DOCUMENT_VERIFIED: 'document_verified',
  PERFORMANCE_REVIEW: 'performance_review',
  ANNOUNCEMENT: 'announcement',
  REMINDER: 'reminder',
  SYSTEM: 'system',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

/**
 * Notification priority
 */
export type NotificationPriority = 'high' | 'normal' | 'low';

/**
 * Notification data structure
 */
export interface NotificationData {
  title: string;
  body: string;
  type: NotificationType;
  priority?: NotificationPriority;
  data?: Record<string, string>;
  imageUrl?: string;
  clickAction?: string;
  badge?: number;
}

/**
 * Device token structure
 */
export interface DeviceToken {
  id: string;
  user_id: string;
  token: string;
  device_type: 'web' | 'ios' | 'android';
  device_name?: string;
  created_at: string;
  last_used_at: string;
  is_active: boolean;
}

/**
 * Check if FCM is configured
 */
export function isFCMConfigured(): boolean {
  return !!(
    FCM_CONFIG.CREDENTIALS &&
    FCM_CONFIG.PROJECT_ID
  );
}
