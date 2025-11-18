import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';
import { z } from 'zod';

/**
 * Validation schema for updating a platform user
 */
const updatePlatformUserSchema = z.object({
  fullName: z.string().min(1).optional(),
  role: z.enum(['super_admin', 'platform_admin', 'support_admin', 'billing_admin']).optional(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/platform/users/[id]
 * Get a single platform user
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify platform admin access
    await requirePlatformAdmin();

    const supabase = await createClient();

    const { data: user, error } = await supabase
      .from('platform_users')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Failed to get platform user:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to get platform user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/platform/users/[id]
 * Update a platform user (change role, activate/deactivate)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify platform admin access
    const currentUser = await requirePlatformAdmin();

    const supabase = await createClient();

    // Get current user's role
    const { data: adminUser } = await supabase
      .from('platform_users')
      .select('role')
      .eq('user_id', currentUser.id)
      .single();

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Forbidden: User not found' },
        { status: 403 }
      );
    }

    // Only super_admin and platform_admin can update users
    if (!['super_admin', 'platform_admin'].includes(adminUser.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only super admins and platform admins can update users' },
        { status: 403 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validatedData = updatePlatformUserSchema.parse(body);

    // Get the user being updated
    const { data: targetUser } = await supabase
      .from('platform_users')
      .select('role, user_id')
      .eq('id', params.id)
      .single();

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent modifying super_admin unless current user is super_admin
    if (targetUser.role === 'super_admin' && adminUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only super admins can modify other super admins' },
        { status: 403 }
      );
    }

    // Prevent setting role to super_admin unless current user is super_admin
    if (validatedData.role === 'super_admin' && adminUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only super admins can create other super admins' },
        { status: 403 }
      );
    }

    // Prevent users from deactivating themselves
    if (validatedData.isActive === false && targetUser.user_id === currentUser.id) {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (validatedData.fullName) updateData.full_name = validatedData.fullName;
    if (validatedData.role) updateData.role = validatedData.role;
    if (validatedData.isActive !== undefined) updateData.is_active = validatedData.isActive;

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('platform_users')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Create audit log
    await supabase.from('platform_audit_logs').insert({
      user_id: currentUser.id,
      action: 'platform_user.updated',
      resource_type: 'platform_user',
      resource_id: params.id,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      metadata: validatedData,
    });

    return NextResponse.json({
      user: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Failed to update platform user:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to update platform user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/platform/users/[id]
 * Delete a platform user (only super admin)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify platform admin access
    const currentUser = await requirePlatformAdmin();

    const supabase = await createClient();

    // Only super_admin can delete users
    const { data: adminUser } = await supabase
      .from('platform_users')
      .select('role')
      .eq('user_id', currentUser.id)
      .single();

    if (adminUser?.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only super admins can delete users' },
        { status: 403 }
      );
    }

    // Get the user being deleted
    const { data: targetUser } = await supabase
      .from('platform_users')
      .select('user_id, email')
      .eq('id', params.id)
      .single();

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent users from deleting themselves
    if (targetUser.user_id === currentUser.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Soft delete by setting is_active to false
    const { error: updateError } = await supabase
      .from('platform_users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (updateError) {
      throw updateError;
    }

    // Create audit log
    await supabase.from('platform_audit_logs').insert({
      user_id: currentUser.id,
      action: 'platform_user.deleted',
      resource_type: 'platform_user',
      resource_id: params.id,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      metadata: { email: targetUser.email },
    });

    return NextResponse.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete platform user:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to delete platform user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
