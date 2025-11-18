import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkPlatformAdminPermission } from '@/lib/auth/platform-permissions';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/platform/feature-flags/[id]
 * Get a single feature flag by ID
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check permissions
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
      'platform_admin',
    ]);

    if (permError || !user) {
      return NextResponse.json({ error: permError || 'Unauthorized' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('feature_flags')
      .select(`
        *,
        created_by_user:created_by(id, email, full_name),
        last_modified_by_user:last_modified_by(id, email, full_name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Feature flag not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching feature flag:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feature flag' },
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
 * PATCH /api/platform/feature-flags/[id]
 * Update a feature flag
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check permissions
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
      'platform_admin',
    ]);

    if (permError || !user) {
      return NextResponse.json({ error: permError || 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      enabled,
      rollout_type,
      rollout_percentage,
      tenant_whitelist,
      tenant_blacklist,
      enable_at,
      disable_at,
    } = body;

    // Build update object (only include provided fields)
    const updates: Record<string, unknown> = {
      last_modified_by: user.id,
    };

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (enabled !== undefined) updates.enabled = enabled;
    if (rollout_type !== undefined) updates.rollout_type = rollout_type;
    if (rollout_percentage !== undefined) {
      if (rollout_percentage < 0 || rollout_percentage > 100) {
        return NextResponse.json(
          { error: 'Rollout percentage must be between 0 and 100' },
          { status: 400 }
        );
      }
      updates.rollout_percentage = rollout_percentage;
    }
    if (tenant_whitelist !== undefined) updates.tenant_whitelist = tenant_whitelist;
    if (tenant_blacklist !== undefined) updates.tenant_blacklist = tenant_blacklist;
    if (enable_at !== undefined) updates.enable_at = enable_at;
    if (disable_at !== undefined) updates.disable_at = disable_at;

    // Update feature flag
    const { data, error } = await supabase
      .from('feature_flags')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating feature flag:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Feature flag not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update feature flag' },
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
 * DELETE /api/platform/feature-flags/[id]
 * Delete a feature flag
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check permissions (only super_admin can delete feature flags)
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
    ]);

    if (permError || !user) {
      return NextResponse.json({ error: permError || 'Unauthorized' }, { status: 403 });
    }

    const { error } = await supabase
      .from('feature_flags')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting feature flag:', error);
      return NextResponse.json(
        { error: 'Failed to delete feature flag' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Feature flag deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
