import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';

/**
 * GET /api/platform/impersonate/sessions
 * List all impersonation sessions with filters
 */
export async function GET(request: NextRequest) {
  try {
    // Verify platform admin access
    const currentUser = await requirePlatformAdmin();

    const supabase = await createClient();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const targetUserId = searchParams.get('targetUserId');
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build query
    let query = supabase
      .from('platform_impersonation_sessions')
      .select(`
        id,
        platform_admin_id,
        target_user_id,
        tenant_id,
        reason,
        status,
        started_at,
        ended_at,
        expires_at,
        ip_address,
        platform_admin:users!platform_impersonation_sessions_platform_admin_id_fkey(id, full_name, email),
        target_user:users!platform_impersonation_sessions_target_user_id_fkey(id, full_name, email, role),
        tenant:tenants!platform_impersonation_sessions_tenant_id_fkey(id, company_name, slug)
      `, { count: 'exact' })
      .order('started_at', { ascending: false });

    // Apply filters
    if (adminId) {
      query = query.eq('platform_admin_id', adminId);
    }

    if (targetUserId) {
      query = query.eq('target_user_id', targetUserId);
    }

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: sessions, error: sessionsError, count } = await query;

    if (sessionsError) {
      throw sessionsError;
    }

    // Get action counts for each session
    const sessionsWithCounts = await Promise.all(
      (sessions || []).map(async (session) => {
        const { count: actionsCount } = await supabase
          .from('platform_impersonation_actions')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.id);

        // Calculate duration
        let duration = null;
        if (session.ended_at) {
          const startedAt = new Date(session.started_at);
          const endedAt = new Date(session.ended_at);
          const durationMs = endedAt.getTime() - startedAt.getTime();
          const hours = Math.floor(durationMs / (1000 * 60 * 60));
          const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
          duration = `${hours}h ${minutes}m ${seconds}s`;
        }

        return {
          id: session.id,
          platformAdmin: {
            id: session.platform_admin?.id,
            full_name: session.platform_admin?.full_name,
            email: session.platform_admin?.email,
          },
          targetUser: {
            id: session.target_user?.id,
            full_name: session.target_user?.full_name,
            email: session.target_user?.email,
            role: session.target_user?.role || 'employee',
          },
          tenant: {
            id: session.tenant?.id,
            company_name: session.tenant?.company_name,
            slug: session.tenant?.slug,
          },
          reason: session.reason,
          status: session.status,
          startedAt: session.started_at,
          endedAt: session.ended_at,
          expiresAt: session.expires_at,
          duration,
          actionsCount: actionsCount || 0,
          ipAddress: session.ip_address,
        };
      })
    );

    return NextResponse.json({
      data: sessionsWithCounts,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false,
      },
    });
  } catch (error) {
    console.error('Failed to list impersonation sessions:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to list impersonation sessions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
