/**
 * Firebase Cloud Messaging Client
 * Send push notifications to devices
 */

import * as admin from 'firebase-admin';
import { FCM_CONFIG, type NotificationData } from './config';

// Initialize Firebase Admin SDK (singleton)
let firebaseApp: admin.app.App | null = null;

function getFirebaseApp(): admin.app.App {
  if (firebaseApp) {
    return firebaseApp;
  }

  if (!FCM_CONFIG.CREDENTIALS || !FCM_CONFIG.PROJECT_ID) {
    throw new Error('Firebase credentials not configured');
  }

  try {
    // Check if app already exists
    firebaseApp = admin.app();
  } catch {
    // Initialize new app
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(FCM_CONFIG.CREDENTIALS),
      projectId: FCM_CONFIG.PROJECT_ID,
    });
  }

  return firebaseApp;
}

/**
 * Send notification to a single device
 */
export async function sendToDevice(
  token: string,
  notification: NotificationData
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const app = getFirebaseApp();
    const messaging = admin.messaging(app);

    const message: admin.messaging.Message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: {
        type: notification.type,
        ...(notification.data || {}),
      },
      webpush: notification.clickAction
        ? {
            fcmOptions: {
              link: notification.clickAction,
            },
            notification: {
              badge: notification.badge?.toString(),
            },
          }
        : undefined,
      android: {
        priority: notification.priority === 'high' ? 'high' : 'normal',
        notification: {
          channelId: 'hris_notifications',
          priority: notification.priority === 'high' ? 'high' : 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            badge: notification.badge,
            sound: 'default',
          },
        },
      },
    };

    const response = await messaging.send(message);

    return {
      success: true,
      messageId: response,
    };
  } catch (error) {
    // Handle invalid token errors
    if (error instanceof Error) {
      if (
        error.message.includes('not-found') ||
        error.message.includes('invalid-registration-token') ||
        error.message.includes('registration-token-not-registered')
      ) {
        return {
          success: false,
          error: 'INVALID_TOKEN',
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send notification to multiple devices
 */
export async function sendToDevices(
  tokens: string[],
  notification: NotificationData
): Promise<{
  success: boolean;
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
  errors: Array<{ token: string; error: string }>;
}> {
  if (tokens.length === 0) {
    return {
      success: true,
      successCount: 0,
      failureCount: 0,
      invalidTokens: [],
      errors: [],
    };
  }

  try {
    const app = getFirebaseApp();
    const messaging = admin.messaging(app);

    // FCM supports sending to max 500 devices at once
    const batchSize = 500;
    const batches: string[][] = [];

    for (let i = 0; i < tokens.length; i += batchSize) {
      batches.push(tokens.slice(i, i + batchSize));
    }

    let successCount = 0;
    let failureCount = 0;
    const invalidTokens: string[] = [];
    const errors: Array<{ token: string; error: string }> = [];

    for (const batch of batches) {
      const message: admin.messaging.MulticastMessage = {
        tokens: batch,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: {
          type: notification.type,
          ...(notification.data || {}),
        },
        webpush: notification.clickAction
          ? {
              fcmOptions: {
                link: notification.clickAction,
              },
            }
          : undefined,
        android: {
          priority: notification.priority === 'high' ? 'high' : 'normal',
        },
      };

      const response = await messaging.sendEachForMulticast(message);

      successCount += response.successCount;
      failureCount += response.failureCount;

      // Collect invalid tokens
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error) {
          const token = batch[idx];
          const errorCode = resp.error.code;

          if (
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(token);
          }

          errors.push({
            token,
            error: resp.error.message,
          });
        }
      });
    }

    return {
      success: true,
      successCount,
      failureCount,
      invalidTokens,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      successCount: 0,
      failureCount: tokens.length,
      invalidTokens: [],
      errors: [
        {
          token: 'all',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      ],
    };
  }
}

/**
 * Send notification to topic
 */
export async function sendToTopic(
  topic: string,
  notification: NotificationData
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const app = getFirebaseApp();
    const messaging = admin.messaging(app);

    const message: admin.messaging.Message = {
      topic,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: {
        type: notification.type,
        ...(notification.data || {}),
      },
      android: {
        priority: notification.priority === 'high' ? 'high' : 'normal',
      },
    };

    const response = await messaging.send(message);

    return {
      success: true,
      messageId: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Subscribe device to topic
 */
export async function subscribeToTopic(
  tokens: string | string[],
  topic: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const app = getFirebaseApp();
    const messaging = admin.messaging(app);

    const tokenArray = Array.isArray(tokens) ? tokens : [tokens];

    await messaging.subscribeToTopic(tokenArray, topic);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Unsubscribe device from topic
 */
export async function unsubscribeFromTopic(
  tokens: string | string[],
  topic: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const app = getFirebaseApp();
    const messaging = admin.messaging(app);

    const tokenArray = Array.isArray(tokens) ? tokens : [tokens];

    await messaging.unsubscribeFromTopic(tokenArray, topic);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
