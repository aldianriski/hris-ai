/**
 * Slack Webhook Handler
 * Handles incoming webhook events from Slack
 */

import crypto from 'crypto';

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET || '';

/**
 * Verify Slack webhook signature
 * https://api.slack.com/authentication/verifying-requests-from-slack
 */
export function verifySlackSignature(
  signature: string,
  timestamp: string,
  body: string
): boolean {
  if (!SLACK_SIGNING_SECRET) {
    console.error('SLACK_SIGNING_SECRET not configured');
    return false;
  }

  // Check timestamp to prevent replay attacks (within 5 minutes)
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
    console.error('Slack webhook timestamp too old');
    return false;
  }

  // Compute signature
  const sigBasestring = `v0:${timestamp}:${body}`;
  const expectedSignature = 'v0=' + crypto
    .createHmac('sha256', SLACK_SIGNING_SECRET)
    .update(sigBasestring)
    .digest('hex');

  // Use timingSafeEqual to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );
  } catch (error) {
    return false;
  }
}

/**
 * Handle Slack webhook event
 */
export async function handleSlackWebhook(
  payload: any
): Promise<{ success: boolean; response?: any; error?: string }> {
  try {
    // Handle URL verification challenge
    if (payload.type === 'url_verification') {
      return {
        success: true,
        response: { challenge: payload.challenge },
      };
    }

    // Handle events
    if (payload.type === 'event_callback') {
      const event = payload.event;

      switch (event.type) {
        case 'app_mention':
          // Handle @mention of the app
          console.log('App mentioned:', event);
          break;

        case 'message':
          // Handle direct message
          console.log('Message received:', event);
          break;

        default:
          console.log('Unhandled event type:', event.type);
      }

      return { success: true };
    }

    // Handle interactive components (buttons, actions)
    if (payload.type === 'block_actions' || payload.type === 'interactive_message') {
      console.log('Interactive action:', payload);
      return { success: true };
    }

    return {
      success: false,
      error: `Unhandled webhook type: ${payload.type}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
