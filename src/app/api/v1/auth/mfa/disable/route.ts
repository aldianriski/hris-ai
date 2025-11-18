/**
 * POST /api/v1/auth/mfa/disable
 * Disable MFA for user account
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { logSecurityEvent } from '@/lib/utils/auditLog';

const disableSchema = z.object({
  password: z.string().min(1, 'Password is required for security'),
});

async function handler(request: NextRequest) {
  // Require authentication
  const userContext = await requireAuth(request);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = disableSchema.parse(body);

  const supabase = await createClient();

  // Verify password before disabling MFA
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: userContext.email,
    password: validatedData.password,
  });

  if (authError) {
    return errorResponse(
      'AUTH_1002',
      'Invalid password',
      401
    );
  }

  // Disable MFA
  const { error } = await supabase
    .from('user_mfa_settings')
    .update({
      mfa_enabled: false,
      totp_secret: null,
      backup_codes: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userContext.id);

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to disable MFA',
      500,
      { details: error.message }
    );
  }

  // Log MFA disabled event
  await logSecurityEvent(userContext, request, 'mfa_disabled', 'warning');

  return successResponse({
    message: 'MFA disabled successfully',
  });
}

export const POST = withErrorHandler(handler);
