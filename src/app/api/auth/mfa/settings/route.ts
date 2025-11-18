import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MFAService } from '@/lib/services/mfaService';

/**
 * GET /api/auth/mfa/settings
 * Get current user's MFA settings
 */
export async function GET(request: NextRequest) {
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

    // Get MFA settings
    const settings = await MFAService.getMFASettings(user.id);

    return NextResponse.json({
      success: true,
      data: settings || {
        mfa_enabled: false,
        mfa_method: null,
      },
    });
  } catch (error) {
    console.error('Get MFA settings error:', error);
    return NextResponse.json(
      { error: 'Failed to get MFA settings' },
      { status: 500 }
    );
  }
}
