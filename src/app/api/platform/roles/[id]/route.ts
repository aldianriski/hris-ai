import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkPlatformAdminPermission } from '@/lib/auth/platform-permissions';
import { isValidPermission } from '@/lib/permissions/definitions';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/platform/roles/[id]
 * Get a single role by ID or slug
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

    if (permError) {
      return NextResponse.json({ error: permError }, { status: 403 });
    }

    // Try to fetch by ID first, then by slug
    let query = supabase.from('platform_roles').select('*');

    // Check if id is a UUID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUUID) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Role not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching role:', error);
      return NextResponse.json(
        { error: 'Failed to fetch role' },
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
 * PATCH /api/platform/roles/[id]
 * Update a role
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check permissions (only super_admin can update roles)
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
    ]);

    if (permError) {
      return NextResponse.json({ error: permError }, { status: 403 });
    }

    // Check if role exists and is not a system role
    const { data: existingRole, error: fetchError } = await supabase
      .from('platform_roles')
      .select('id, is_system_role, slug')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    if (existingRole.is_system_role) {
      return NextResponse.json(
        { error: 'Cannot modify system roles' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      permissions,
      scope,
      is_active,
    } = body;

    // Build update object
    const updates: Record<string, unknown> = {};

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (scope !== undefined) updates.scope = scope;
    if (is_active !== undefined) updates.is_active = is_active;

    if (permissions !== undefined) {
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
      updates.permissions = permissions;
    }

    // Don't allow updating slug or type for existing roles
    // Update role
    const { data, error } = await supabase
      .from('platform_roles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating role:', error);
      return NextResponse.json(
        { error: 'Failed to update role' },
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
 * DELETE /api/platform/roles/[id]
 * Delete a role
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check permissions (only super_admin can delete roles)
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
    ]);

    if (permError) {
      return NextResponse.json({ error: permError }, { status: 403 });
    }

    // Check if role exists and is not a system role
    const { data: existingRole, error: fetchError } = await supabase
      .from('platform_roles')
      .select('id, is_system_role, slug, name')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    if (existingRole.is_system_role) {
      return NextResponse.json(
        { error: 'Cannot delete system roles' },
        { status: 403 }
      );
    }

    // Check if any users have this role
    const { data: usersWithRole, error: usersError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role_id', id)
      .limit(1);

    if (usersError) {
      console.error('Error checking role usage:', usersError);
      return NextResponse.json(
        { error: 'Failed to check role usage' },
        { status: 500 }
      );
    }

    if (usersWithRole && usersWithRole.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete role that is assigned to users',
          message: 'Please remove all users from this role before deleting it',
        },
        { status: 400 }
      );
    }

    // Delete role
    const { error } = await supabase
      .from('platform_roles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting role:', error);
      return NextResponse.json(
        { error: 'Failed to delete role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Role deleted successfully',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
