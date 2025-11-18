/**
 * POST /api/v1/auth/mfa/verify
 * Verify TOTP code to enable MFA or complete login
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as OTPAuth from 'otplib';
import { z } from 'zod';
import crypto from 'crypto';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { mfaRateLimit } from '@/lib/middleware/rateLimit';
import { logSecurityEvent } from '@/lib/utils/auditLog';

const verifySchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
  enableMfa: z.boolean().optional().default(false),
});

async function handler(request: NextRequest) {
  // Apply MFA rate limiting
  await mfaRateLimit(request);

  // Require authentication
  const userContext = await requireAuth(request);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = verifySchema.parse(body);

  const supabase = await createClient();

  // Get MFA settings
  const { data: mfaSettings, error: fetchError } = await supabase
    .from('user_mfa_settings')
    .select('*')
    .eq('user_id', userContext.id)
    .single();

  if (fetchError || !mfaSettings) {
    return errorResponse(
      'RES_3001',
      'MFA is not set up for this account',
      404
    );
  }

  let isValid = false;

  // Try TOTP verification
  if (mfaSettings.totp_secret) {
    isValid = OTPAuth.authenticator.verify({
      token: validatedData.code,
      secret: mfaSettings.totp_secret,
    });
  }

  // If TOTP fails, try backup codes
  if (!isValid && mfaSettings.backup_codes) {
    const hashedCode = crypto.createHash('sha256').update(validatedData.code).digest('hex');
    isValid = mfaSettings.backup_codes.includes(hashedCode);

    if (isValid) {
      // Remove used backup code
      const updatedBackupCodes = mfaSettings.backup_codes.filter((code: string) => code !== hashedCode);
      await supabase
        .from('user_mfa_settings')
        .update({ backup_codes: updatedBackupCodes })
        .eq('user_id', userContext.id);
    }
  }

  // Record verification attempt
  await supabase
    .from('mfa_verification_attempts')
    .insert({
      user_id: userContext.id,
      is_successful: isValid,
      method: 'totp',
    });

  if (!isValid) {
    return errorResponse(
      'AUTH_1006',
      'Invalid verification code',
      401
    );
  }

  // If this is to enable MFA after setup
  if (validatedData.enableMfa && !mfaSettings.mfa_enabled) {
    const { error: enableError } = await supabase
      .from('user_mfa_settings')
      .update({ 
        mfa_enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userContext.id);

    if (enableError) {
      return errorResponse(
        'SRV_9002',
        'Failed to enable MFA',
        500
      );
    }

    // Log MFA enabled event
    await logSecurityEvent(userContext, request, 'mfa_enabled', 'info');

    return successResponse({
      message: 'MFA enabled successfully',
      mfaEnabled: true,
    });
  }

  // Regular MFA verification for login
  return successResponse({
    message: 'MFA verification successful',
    verified: true,
  });
}

export const POST = withErrorHandler(handler);
