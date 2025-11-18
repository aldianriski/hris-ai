import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';
import { z } from 'zod';

/**
 * Validation schema for updating a tenant
 */
const updateTenantSchema = z.object({
  companyName: z.string().min(1).optional(),
  companyEmail: z.string().email().optional(),
  industry: z.string().optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  status: z.enum(['active', 'suspended', 'cancelled']).optional(),
  maxEmployees: z.number().int().positive().optional(),
  settings: z.record(z.any()).optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/platform/tenants/[id]
 * Get a single tenant with all related data
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify platform admin access
    await requirePlatformAdmin();

    const supabase = await createClient();

    // Get tenant with subscription and users
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select(`
        *,
        subscriptions (*),
        tenant_users (
          id,
          email,
          full_name,
          phone,
          role,
          is_active,
          created_at
        )
      `)
      .eq('id', params.id)
      .single();

    if (tenantError) {
      if (tenantError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      }
      throw tenantError;
    }

    // Get usage statistics
    const { data: usageStats } = await supabase
      .from('tenant_usage')
      .select('*')
      .eq('tenant_id', params.id)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    // Get recent audit logs
    const { data: auditLogs } = await supabase
      .from('tenant_audit_logs')
      .select('*')
      .eq('tenant_id', params.id)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      tenant,
      usage: usageStats,
      auditLogs: auditLogs || [],
    });
  } catch (error) {
    console.error('Failed to get tenant:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to get tenant',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/platform/tenants/[id]
 * Update a tenant
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify platform admin access
    const user = await requirePlatformAdmin();

    const body = await request.json();
    const validatedData = updateTenantSchema.parse(body);

    const supabase = await createClient();

    // Update tenant
    const updateData: any = {};
    if (validatedData.companyName) updateData.company_name = validatedData.companyName;
    if (validatedData.companyEmail) updateData.company_email = validatedData.companyEmail;
    if (validatedData.industry) updateData.industry = validatedData.industry;
    if (validatedData.companySize) updateData.company_size = validatedData.companySize;
    if (validatedData.country) updateData.country = validatedData.country;
    if (validatedData.timezone) updateData.timezone = validatedData.timezone;
    if (validatedData.currency) updateData.currency = validatedData.currency;
    if (validatedData.status) updateData.status = validatedData.status;
    if (validatedData.maxEmployees) updateData.max_employees = validatedData.maxEmployees;
    if (validatedData.settings) updateData.settings = validatedData.settings;
    updateData.updated_at = new Date().toISOString();

    const { data: tenant, error: updateError } = await supabase
      .from('tenants')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Create audit log
    await supabase.from('platform_audit_logs').insert({
      user_id: user.id,
      action: 'tenant.updated',
      resource_type: 'tenant',
      resource_id: params.id,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      metadata: validatedData,
    });

    return NextResponse.json({
      tenant,
      message: 'Tenant updated successfully',
    });
  } catch (error) {
    console.error('Failed to update tenant:', error);

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
        error: 'Failed to update tenant',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/platform/tenants/[id]
 * Delete a tenant (soft delete by setting status to cancelled)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify platform admin access (require super_admin for deletion)
    const user = await requirePlatformAdmin();

    const supabase = await createClient();

    // Check if user is super_admin
    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (platformUser?.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only super admins can delete tenants' },
        { status: 403 }
      );
    }

    // Soft delete by setting status to cancelled
    const { data: tenant, error: deleteError } = await supabase
      .from('tenants')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (deleteError) {
      throw deleteError;
    }

    // Also cancel subscription
    await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('tenant_id', params.id);

    // Create audit log
    await supabase.from('platform_audit_logs').insert({
      user_id: user.id,
      action: 'tenant.deleted',
      resource_type: 'tenant',
      resource_id: params.id,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      metadata: { tenantName: tenant.company_name },
    });

    return NextResponse.json({
      message: 'Tenant deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete tenant:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to delete tenant',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
