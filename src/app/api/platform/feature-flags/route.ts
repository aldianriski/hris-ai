import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkPlatformAdminPermission } from '@/lib/auth/platform-permissions';

/**
 * GET /api/platform/feature-flags
 * List all feature flags with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check permissions
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
      'platform_admin',
    ]);

    if (permError || !user) {
      return NextResponse.json({ error: permError || 'Unauthorized' }, { status: 403 });
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const enabled = searchParams.get('enabled');
    const rolloutType = searchParams.get('rollout_type');
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('feature_flags')
      .select(`
        *,
        created_by_user:created_by(id, email, full_name),
        last_modified_by_user:last_modified_by(id, email, full_name)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (enabled !== null) {
      query = query.eq('enabled', enabled === 'true');
    }
    if (rolloutType) {
      query = query.eq('rollout_type', rolloutType);
    }
    if (search) {
      query = query.or(`key.ilike.%${search}%,name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching feature flags:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feature flags' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/feature-flags
 * Create a new feature flag
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check permissions (only super_admin can create feature flags)
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
    ]);

    if (permError || !user) {
      return NextResponse.json({ error: permError || 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      key,
      name,
      description,
      enabled = false,
      rollout_type = 'global',
      rollout_percentage = 0,
      tenant_whitelist = [],
      tenant_blacklist = [],
      enable_at,
      disable_at,
    } = body;

    // Validate required fields
    if (!key || !name) {
      return NextResponse.json(
        { error: 'Key and name are required' },
        { status: 400 }
      );
    }

    // Validate key format (lowercase, alphanumeric, underscores only)
    if (!/^[a-z0-9_]+$/.test(key)) {
      return NextResponse.json(
        { error: 'Key must be lowercase alphanumeric with underscores only' },
        { status: 400 }
      );
    }

    // Validate rollout_percentage
    if (rollout_percentage < 0 || rollout_percentage > 100) {
      return NextResponse.json(
        { error: 'Rollout percentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Create feature flag
    const { data, error } = await supabase
      .from('feature_flags')
      .insert({
        key,
        name,
        description,
        enabled,
        rollout_type,
        rollout_percentage,
        tenant_whitelist,
        tenant_blacklist,
        enable_at,
        disable_at,
        created_by: user.id,
        last_modified_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating feature flag:', error);
      if (error.code === '23505') {
        // Unique violation
        return NextResponse.json(
          { error: 'A feature flag with this key already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create feature flag' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
