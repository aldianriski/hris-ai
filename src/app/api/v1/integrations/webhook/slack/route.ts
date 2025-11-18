/**
 * POST /api/v1/integrations/webhook/slack
 * Handle incoming webhooks from Slack
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { verifySlackSignature, handleSlackWebhook } from '@/lib/integrations/slack/webhook';

async function handler(request: NextRequest) {
  try {
    // Get request body as text for signature verification
    const body = await request.text();

    // Get Slack signature headers
    const signature = request.headers.get('x-slack-signature');
    const timestamp = request.headers.get('x-slack-request-timestamp');

    if (!signature || !timestamp) {
      return errorResponse(
        'VAL_2001',
        'Missing Slack signature headers',
        400
      );
    }

    // Verify signature
    const isValid = verifySlackSignature(signature, timestamp, body);
    if (!isValid) {
      return errorResponse(
        'AUTH_1003',
        'Invalid Slack signature',
        403
      );
    }

    // Parse body
    const payload = JSON.parse(body);

    // Handle webhook
    const result = await handleSlackWebhook(payload);

    if (!result.success) {
      return errorResponse(
        'INT_5003',
        result.error || 'Failed to handle webhook',
        500
      );
    }

    // Return challenge for URL verification
    if (result.response) {
      return new Response(
        JSON.stringify(result.response),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return successResponse({ message: 'Webhook processed' });
  } catch (error) {
    return errorResponse(
      'INT_5003',
      'Failed to process webhook',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

export const POST = withErrorHandler(handler);
