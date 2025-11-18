import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MFAService } from '@/lib/services/mfaService';

/**
 * POST /api/auth/mfa/backup-codes
 * Generate new backup codes after verifying current code
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

    // Generate new backup codes
    const backupCodes = await MFAService.generateNewBackupCodes(user.id, code);

    if (!backupCodes) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        backupCodes,
      },
    });
  } catch (error) {
    console.error('Backup codes generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate backup codes' },
      { status: 500 }
    );
  }
}
