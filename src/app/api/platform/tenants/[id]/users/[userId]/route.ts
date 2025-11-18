import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';
import { z } from 'zod';

interface RouteParams {
  params: {
    id: string;
    userId: string;
  };
}

/**
 * Validation schema for updating a tenant user
 */
const updateTenantUserSchema = z.object({
  fullName: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  role: z.enum(['company_admin', 'hr_admin', 'payroll_admin', 'manager', 'employee']).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/platform/tenants/[id]/users/[userId]
 * Get a single tenant user
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify platform admin access
    await requirePlatformAdmin();

    const supabase = await createClient();

    const { data: user, error } = await supabase
      .from('tenant_users')
      .select('*')
      .eq('id', params.userId)
      .eq('tenant_id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Failed to get tenant user:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to get tenant user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/platform/tenants/[id]/users/[userId]
 * Update a tenant user (change role, activate/deactivate)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify platform admin access
    const currentUser = await requirePlatformAdmin();

    const supabase = await createClient();

    // Validate request body
    const body = await request.json();
    const validatedData = updateTenantUserSchema.parse(body);

    // Get the user being updated
    const { data: targetUser } = await supabase
      .from('tenant_users')
      .select('role, user_id, tenant_id')
      .eq('id', params.userId)
      .eq('tenant_id', params.id)
      .single();

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (validatedData.fullName) updateData.full_name = validatedData.fullName;
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone;
    if (validatedData.role) updateData.role = validatedData.role;
    if (validatedData.isActive !== undefined) updateData.is_active = validatedData.isActive;

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('tenant_users')
      .update(updateData)
      .eq('id', params.userId)
      .eq('tenant_id', params.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Create audit log
    await supabase.from('platform_audit_logs').insert({
      user_id: currentUser.id,
      action: 'tenant_user.updated',
      resource_type: 'tenant_user',
      resource_id: params.userId,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      metadata: {
        tenantId: params.id,
        ...validatedData,
      },
    });

    return NextResponse.json({
      user: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Failed to update tenant user:', error);

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
        error: 'Failed to update tenant user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/platform/tenants/[id]/users/[userId]
 * Remove a user from a tenant (soft delete)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify platform admin access
    const currentUser = await requirePlatformAdmin();

    const supabase = await createClient();

    // Get the user being deleted
    const { data: targetUser } = await supabase
      .from('tenant_users')
      .select('user_id, email, tenant_id')
      .eq('id', params.userId)
      .eq('tenant_id', params.id)
      .single();

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Soft delete by setting is_active to false
    const { error: updateError } = await supabase
      .from('tenant_users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.userId)
      .eq('tenant_id', params.id);

    if (updateError) {
      throw updateError;
    }

    // Create audit log
    await supabase.from('platform_audit_logs').insert({
      user_id: currentUser.id,
      action: 'tenant_user.deleted',
      resource_type: 'tenant_user',
      resource_id: params.userId,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      metadata: {
        tenantId: params.id,
        email: targetUser.email,
      },
    });

    return NextResponse.json({
      message: 'User removed from tenant successfully',
    });
  } catch (error) {
    console.error('Failed to delete tenant user:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to delete tenant user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
