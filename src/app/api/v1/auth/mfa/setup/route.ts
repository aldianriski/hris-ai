/**
 * POST /api/v1/auth/mfa/setup
 * Set up MFA (TOTP) for user account
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as OTPAuth from 'otplib';
import { toDataURL } from 'qrcode';
import crypto from 'crypto';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';

// Configure TOTP
OTPAuth.authenticator.options = {
  window: 1,
};

async function handler(request: NextRequest) {
  // Require authentication
  const userContext = await requireAuth(request);

  const supabase = await createClient();

  // Check if MFA is already enabled
  const { data: existingMfa } = await supabase
    .from('user_mfa_settings')
    .select('mfa_enabled')
    .eq('user_id', userContext.id)
    .single();

  if (existingMfa?.mfa_enabled) {
    return errorResponse(
      'BIZ_4004',
      'MFA is already enabled for this account',
      409
    );
  }

  // Generate secret key
  const secret = OTPAuth.authenticator.generateSecret();

  // Generate backup codes (10 codes, 8 characters each)
  const backupCodes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    backupCodes.push(code);
  }

  // Hash backup codes before storing
  const hashedBackupCodes = backupCodes.map(code => 
    crypto.createHash('sha256').update(code).digest('hex')
  );

  // Generate OTP URL for QR code
  const otpUrl = OTPAuth.authenticator.keyuri(
    userContext.email,
    'Talixa HRIS',
    secret
  );

  // Generate QR code data URL
  const qrCodeDataUrl = await toDataURL(otpUrl);

  // Store MFA settings (not enabled yet, will be enabled after verification)
  const { error } = await supabase
    .from('user_mfa_settings')
    .upsert({
      user_id: userContext.id,
      mfa_enabled: false,
      mfa_method: 'totp',
      totp_secret: secret, // TODO: Encrypt with AES-256 in production
      backup_codes: hashedBackupCodes,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to set up MFA',
      500,
      { details: error.message }
    );
  }

  return successResponse({
    secret,
    qrCode: qrCodeDataUrl,
    backupCodes, // Only return once, user should save them
    message: 'Scan the QR code with your authenticator app and verify with a code to complete setup',
  });
}

export const POST = withErrorHandler(handler);
