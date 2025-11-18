/**
 * Slack API Client
 * Functions for sending messages and interacting with Slack API
 */

import { SLACK_CONFIG } from '../config';

export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: any[];
  attachments?: any[];
  thread_ts?: string;
  reply_broadcast?: boolean;
}

export interface SlackApiResponse {
  ok: boolean;
  error?: string;
  warning?: string;
  response_metadata?: any;
}

/**
 * Send message to Slack channel
 */
export async function sendMessage(
  accessToken: string,
  message: SlackMessage
): Promise<{ success: boolean; error?: string; ts?: string }> {
  try {
    const response = await fetch(`${SLACK_CONFIG.API_BASE_URL}/chat.postMessage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();

    if (!data.ok) {
      return {
        success: false,
        error: data.error || 'Failed to send message',
      };
    }

    return {
      success: true,
      ts: data.ts,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send notification for leave request
 */
export async function sendLeaveRequestNotification(
  accessToken: string,
  channel: string,
  data: {
    employeeName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    days: number;
    reason?: string;
    requestUrl: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📝 New Leave Request',
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Employee:*\n${data.employeeName}`,
        },
        {
          type: 'mrkdwn',
          text: `*Leave Type:*\n${data.leaveType}`,
        },
        {
          type: 'mrkdwn',
          text: `*Period:*\n${data.startDate} to ${data.endDate}`,
        },
        {
          type: 'mrkdwn',
          text: `*Duration:*\n${data.days} days`,
        },
      ],
    },
  ];

  if (data.reason) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Reason:*\n${data.reason}`,
      },
    } as any);
  }

  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Review Request',
        },
        url: data.requestUrl,
        style: 'primary',
      },
    ],
  } as any);

  return sendMessage(accessToken, {
    channel,
    text: `New leave request from ${data.employeeName}`,
    blocks,
  });
}

/**
 * Send notification for leave approval
 */
export async function sendLeaveApprovedNotification(
  accessToken: string,
  channel: string,
  data: {
    employeeName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    approvedBy: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '✅ Leave Request Approved',
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Employee:*\n${data.employeeName}`,
        },
        {
          type: 'mrkdwn',
          text: `*Leave Type:*\n${data.leaveType}`,
        },
        {
          type: 'mrkdwn',
          text: `*Period:*\n${data.startDate} to ${data.endDate}`,
        },
        {
          type: 'mrkdwn',
          text: `*Approved By:*\n${data.approvedBy}`,
        },
      ],
    },
  ];

  return sendMessage(accessToken, {
    channel,
    text: `Leave request approved for ${data.employeeName}`,
    blocks,
  });
}

/**
 * Send payslip notification
 */
export async function sendPayslipNotification(
  accessToken: string,
  channel: string,
  data: {
    month: string;
    year: number;
    employeeCount: number;
    dashboardUrl: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '💰 Payslips Generated',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Payslips for *${data.month} ${data.year}* have been generated for *${data.employeeCount}* employees.`,
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Dashboard',
          },
          url: data.dashboardUrl,
          style: 'primary',
        },
      ],
    },
  ];

  return sendMessage(accessToken, {
    channel,
    text: `Payslips generated for ${data.month} ${data.year}`,
    blocks,
  });
}

/**
 * List channels
 */
export async function listChannels(
  accessToken: string
): Promise<{ success: boolean; channels?: any[]; error?: string }> {
  try {
    const response = await fetch(`${SLACK_CONFIG.API_BASE_URL}/conversations.list`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        types: 'public_channel,private_channel',
        limit: 200,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      return {
        success: false,
        error: data.error || 'Failed to list channels',
      };
    }

    return {
      success: true,
      channels: data.channels,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
