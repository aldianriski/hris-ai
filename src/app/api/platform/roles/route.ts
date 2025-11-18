import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkPlatformAdminPermission } from '@/lib/auth/platform-permissions';
import { isValidPermission } from '@/lib/permissions/definitions';

/**
 * GET /api/platform/roles
 * List all platform roles
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check permissions
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
      'platform_admin',
    ]);

    if (permError) {
      return NextResponse.json({ error: permError }, { status: 403 });
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'platform' or 'tenant'
    const isActive = searchParams.get('is_active');

    // Build query
    let query = supabase
      .from('platform_roles')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching roles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch roles' },
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
 * POST /api/platform/roles
 * Create a new platform role
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check permissions (only super_admin can create roles)
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
    ]);

    if (permError) {
      return NextResponse.json({ error: permError }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      type,
      permissions = [],
      scope = 'global',
      is_active = true,
    } = body;

    // Validate required fields
    if (!name || !slug || !type) {
      return NextResponse.json(
        { error: 'Name, slug, and type are required' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9_]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must be lowercase alphanumeric with underscores only' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['platform', 'tenant'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "platform" or "tenant"' },
        { status: 400 }
      );
    }

    // Validate permissions
    if (permissions.length > 0) {
      const invalidPermissions = permissions.filter((p: string) => !isValidPermission(p));
      if (invalidPermissions.length > 0) {
        return NextResponse.json(
          {
            error: 'Invalid permissions detected',
            invalidPermissions
          },
          { status: 400 }
        );
      }
    }

    // Create role
    const { data, error } = await supabase
      .from('platform_roles')
      .insert({
        name,
        slug,
        description,
        type,
        permissions,
        scope,
        is_active,
        is_system_role: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating role:', error);
      if (error.code === '23505') {
        // Unique violation
        return NextResponse.json(
          { error: 'A role with this slug already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create role' },
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
