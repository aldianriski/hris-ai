/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

async function handler(request: NextRequest) {
  // Parse and validate request body
  const body = await request.json();
  const validatedData = refreshSchema.parse(body);

  const supabase = await createClient();

  // Refresh the session
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: validatedData.refreshToken,
  });

  if (error || !data.session) {
    return errorResponse(
      'AUTH_1003',
      'Invalid or expired refresh token',
      401
    );
  }

  return successResponse({
    session: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    },
  });
}

export const POST = withErrorHandler(handler);
