import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MFAService } from '@/lib/services/mfaService';

/**
 * POST /api/auth/mfa/disable
 * Disable MFA after verifying current code
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

    const { code } = await request.json();

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Disable MFA
    const success = await MFAService.disableMFA(user.id, code);

    if (!success) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'MFA disabled successfully',
    });
  } catch (error) {
    console.error('MFA disable error:', error);
    return NextResponse.json(
      { error: 'Failed to disable MFA' },
      { status: 500 }
    );
  }
}
