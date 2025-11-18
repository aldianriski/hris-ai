/**
 * POST /api/v1/auth/forgot-password
 * Send password reset email
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { withRateLimit } from '@/lib/ratelimit/middleware';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

async function handler(request: NextRequest) {
  // Apply strict rate limiting
  await withRateLimit(request);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = forgotPasswordSchema.parse(body);

  const supabase = await createClient();

  // Send password reset email
  // Note: Supabase doesn't return error even if email doesn't exist (security best practice)
  const { error } = await supabase.auth.resetPasswordForEmail(
    validatedData.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    }
  );

  if (error) {
    console.error('Forgot password error:', error);
  }

  // Always return success to prevent email enumeration
  return successResponse({
    message: 'If an account exists with this email, you will receive password reset instructions.',
  });
}

export const POST = withErrorHandler(handler);
