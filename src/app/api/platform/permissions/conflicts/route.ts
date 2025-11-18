import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';

/**
 * GET /api/platform/permissions/conflicts
 * Detect permission conflicts for a user or all users
 */
export async function GET(request: NextRequest) {
  try {
    await requirePlatformAdmin();
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      // Get conflicts for specific user
      const { data: conflicts, error } = await supabase.rpc('detect_permission_conflicts', {
        p_user_id: userId,
      });

      if (error) {
        throw error;
      }

      // Get user details
      const { data: user } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single();

      return NextResponse.json({
        user: {
          id: userId,
          name: user?.full_name,
          email: user?.email,
        },
        conflicts: conflicts || [],
      });
    } else {
      // Get all logged conflicts
      const { data: conflicts, error } = await supabase
        .from('permission_conflicts')
        .select(`
          *,
          user:users!permission_conflicts_user_id_fkey(id, email, full_name),
          resolved_by_user:users!permission_conflicts_resolved_by_fkey(id, email, full_name)
        `)
        .order('detected_at', { ascending: false });

      if (error) {
        throw error;
      }

      return NextResponse.json({ conflicts: conflicts || [] });
    }
  } catch (error) {
    console.error('Failed to detect conflicts:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: 'Failed to detect permission conflicts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
