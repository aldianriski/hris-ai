import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/platform/tenants/[id]/audit-logs
 * Get audit logs for a specific tenant
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify platform admin access
    await requirePlatformAdmin();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const action = searchParams.get('action') || '';
    const severity = searchParams.get('severity') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('audit_logs')
      .select('*, actor:users!actor_id(full_name, email)', { count: 'exact' })
      .eq('tenant_id', params.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (search) {
      query = query.or(`action.ilike.%${search}%,resource_name.ilike.%${search}%,actor_email.ilike.%${search}%`);
    }

    if (action) {
      query = query.eq('action', action);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      data,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false,
      },
    });
  } catch (error) {
    console.error('Failed to fetch tenant audit logs:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch tenant audit logs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
