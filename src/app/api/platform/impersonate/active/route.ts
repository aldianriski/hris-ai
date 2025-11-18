import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';

/**
 * GET /api/platform/impersonate/active
 * Get the current active impersonation session for the logged-in admin
 */
export async function GET(request: NextRequest) {
  try {
    // Verify platform admin access
    const currentUser = await requirePlatformAdmin();

    const supabase = await createClient();

    // Get active session for current user
    const { data: session, error: sessionError } = await supabase
      .from('platform_impersonation_sessions')
      .select(`
        id,
        target_user_id,
        tenant_id,
        reason,
        started_at,
        expires_at,
        target_user:users!platform_impersonation_sessions_target_user_id_fkey(id, email, full_name, role),
        tenant:tenants!platform_impersonation_sessions_tenant_id_fkey(id, company_name, slug)
      `)
      .eq('platform_admin_id', currentUser.id)
      .eq('status', 'active')
      .single();

    // No active session
    if (sessionError || !session) {
      return NextResponse.json({
        isImpersonating: false,
        session: null,
      });
    }

    // Check if session has expired
    const now = new Date();
    const expiresAt = new Date(session.expires_at);

    if (now > expiresAt) {
      // Auto-expire the session
      await supabase
        .from('platform_impersonation_sessions')
        .update({
          status: 'expired',
          ended_at: expiresAt.toISOString(),
        })
        .eq('id', session.id);

      return NextResponse.json({
        isImpersonating: false,
        session: null,
        expired: true,
      });
    }

    return NextResponse.json({
      isImpersonating: true,
      session: {
        id: session.id,
        targetUser: {
          id: session.target_user?.id,
          email: session.target_user?.email,
          full_name: session.target_user?.full_name,
          role: session.target_user?.role || 'employee',
        },
        tenant: {
          id: session.tenant?.id,
          company_name: session.tenant?.company_name,
          slug: session.tenant?.slug,
        },
        startedAt: session.started_at,
        expiresAt: session.expires_at,
        reason: session.reason,
      },
    });
  } catch (error) {
    console.error('Failed to get active impersonation session:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to get active session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
