/**
 * POST /api/v1/notifications/register
 * Register device token for push notifications
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';
import { z } from 'zod';

const registerTokenSchema = z.object({
  token: z.string().min(1),
  deviceType: z.enum(['web', 'ios', 'android']),
  deviceName: z.string().optional(),
});

async function handler(request: NextRequest) {
  await standardRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = registerTokenSchema.parse(body);

  const supabase = await createClient();

  // Check if token already exists
  const { data: existingToken } = await supabase
    .from('device_tokens')
    .select('*')
    .eq('token', validatedData.token)
    .eq('user_id', userContext.id)
    .single();

  if (existingToken) {
    // Update existing token
    const { data: updatedToken, error } = await supabase
      .from('device_tokens')
      .update({
        is_active: true,
        last_used_at: new Date().toISOString(),
        device_name: validatedData.deviceName,
      })
      .eq('id', existingToken.id)
      .select()
      .single();

    if (error) {
      return errorResponse(
        'SRV_9002',
        'Failed to update device token',
        500,
        { details: error.message }
      );
    }

    return successResponse({
      message: 'Device token updated',
      token: {
        id: updatedToken.id,
        deviceType: updatedToken.device_type,
        deviceName: updatedToken.device_name,
      },
    });
  }

  // Create new token
  const { data: newToken, error } = await supabase
    .from('device_tokens')
    .insert({
      user_id: userContext.id,
      token: validatedData.token,
      device_type: validatedData.deviceType,
      device_name: validatedData.deviceName,
      is_active: true,
      last_used_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to register device token',
      500,
      { details: error.message }
    );
  }

  return successResponse(
    {
      message: 'Device token registered successfully',
      token: {
        id: newToken.id,
        deviceType: newToken.device_type,
        deviceName: newToken.device_name,
      },
    },
    201
  );
}

export const POST = withErrorHandler(handler);
