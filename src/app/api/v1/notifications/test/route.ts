/**
 * POST /api/v1/notifications/test
 * Send test notification
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';
import { sendGenericNotification } from '@/lib/notifications/sender';

async function handler(request: NextRequest) {
  await standardRateLimit(request);

  const userContext = await requireAuth(request);

  // Send test notification
  const result = await sendGenericNotification(
    userContext.id,
    'Test Notification',
    'This is a test notification from HRIS. If you see this, push notifications are working!',
    {
      testId: Date.now().toString(),
    },
    '/dashboard'
  );

  if (!result.success) {
    return errorResponse(
      'SRV_9002',
      result.error || 'Failed to send test notification',
      500
    );
  }

  return successResponse({
    message: 'Test notification sent successfully',
  });
}

export const POST = withErrorHandler(handler);
