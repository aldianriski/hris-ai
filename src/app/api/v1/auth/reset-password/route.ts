/**
 * POST /api/v1/auth/reset-password
 * Reset password with token from email
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { logSecurityEvent } from '@/lib/utils/auditLog';
import { requireAuth } from '@/lib/middleware/auth';

const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

async function handler(request: NextRequest) {
  // User must be authenticated (via reset token)
  const userContext = await requireAuth(request);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = resetPasswordSchema.parse(body);

  const supabase = await createClient();

  // Update password
  const { error } = await supabase.auth.updateUser({
    password: validatedData.newPassword,
  });

  if (error) {
    return errorResponse(
      'AUTH_1002',
      'Failed to reset password',
      400,
      { details: error.message }
    );
  }

  // Log password reset event
  await logSecurityEvent(userContext, request, 'password_reset', 'info');

  return successResponse({
    message: 'Password reset successfully',
  });
}

export const POST = withErrorHandler(handler);
