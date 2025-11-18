import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';
import { z } from 'zod';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * Validation schema for changing tenant status
 */
const changeTenantStatusSchema = z.object({
  status: z.enum(['active', 'suspended']),
  reason: z.string().optional(),
});

/**
 * PATCH /api/platform/tenants/[id]/status
 * Suspend or activate a tenant
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify platform admin access
    const currentUser = await requirePlatformAdmin();

    const body = await request.json();
    const validatedData = changeTenantStatusSchema.parse(body);

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

    // Only super_admin and platform_admin can change status
    if (!['super_admin', 'platform_admin'].includes(adminUser.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only super admins and platform admins can change tenant status' },
        { status: 403 }
      );
    }

    // Get current tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('status, company_name')
      .eq('id', params.id)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Check if it's actually a change
    if (tenant.status === validatedData.status) {
      return NextResponse.json(
        { error: `Tenant is already ${validatedData.status}` },
        { status: 400 }
      );
    }

    // Update tenant status
    const updateData: any = {
      status: validatedData.status,
      subscription_status: validatedData.status === 'suspended' ? 'suspended' : 'active',
      updated_at: new Date().toISOString(),
    };

    if (validatedData.status === 'suspended') {
      updateData.suspended_at = new Date().toISOString();
      updateData.suspended_reason = validatedData.reason || 'Suspended by platform admin';
    } else {
      updateData.suspended_at = null;
      updateData.suspended_reason = null;
    }

    const { error: updateError } = await supabase
      .from('tenants')
      .update(updateData)
      .eq('id', params.id);

    if (updateError) {
      throw updateError;
    }

    // Create audit log
    await supabase.from('platform_audit_logs').insert({
      user_id: currentUser.id,
      action: validatedData.status === 'suspended' ? 'tenant.suspended' : 'tenant.activated',
      resource_type: 'tenant',
      resource_id: params.id,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      metadata: {
        company_name: tenant.company_name,
        previous_status: tenant.status,
        new_status: validatedData.status,
        reason: validatedData.reason,
      },
    });

    // If suspending, also update all active user sessions (TODO: implement session invalidation)
    // This would require invalidating JWT tokens or sessions for all tenant users

    return NextResponse.json({
      message: `Tenant ${validatedData.status === 'suspended' ? 'suspended' : 'activated'} successfully`,
      status: validatedData.status,
    });
  } catch (error) {
    console.error('Failed to change tenant status:', error);

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
        error: 'Failed to change tenant status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
