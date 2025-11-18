/**
 * POST /api/v1/notifications/unregister
 * Unregister device token
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';
import { z } from 'zod';

const unregisterTokenSchema = z.object({
  token: z.string().min(1),
});

async function handler(request: NextRequest) {
  await standardRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = unregisterTokenSchema.parse(body);

  const supabase = await createClient();

  // Deactivate the token
  const { error } = await supabase
    .from('device_tokens')
    .update({ is_active: false })
    .eq('token', validatedData.token)
    .eq('user_id', userContext.id);

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to unregister device token',
      500,
      { details: error.message }
    );
  }

  return successResponse({
    message: 'Device token unregistered successfully',
  });
}

export const POST = withErrorHandler(handler);
