import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MFAService } from '@/lib/services/mfaService';

/**
 * POST /api/auth/mfa/setup
 * Generate TOTP secret and QR code for MFA setup
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if MFA is already enabled
    const existingSettings = await MFAService.getMFASettings(user.id);
    if (existingSettings?.mfa_enabled) {
      return NextResponse.json(
        { error: 'MFA is already enabled. Disable it first to re-configure.' },
        { status: 400 }
      );
    }

    // Generate TOTP setup
    const setup = await MFAService.generateTOTPSetup(user.id, user.email!);

    return NextResponse.json({
      success: true,
      data: {
        qrCodeUrl: setup.qrCodeUrl,
        secret: setup.secret, // For manual entry
        backupCodes: setup.backupCodes,
      },
    });
  } catch (error) {
    console.error('MFA setup error:', error);
    return NextResponse.json(
      { error: 'Failed to generate MFA setup' },
      { status: 500 }
    );
  }
}
