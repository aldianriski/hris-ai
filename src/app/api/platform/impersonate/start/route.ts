import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';
import { z } from 'zod';

/**
 * Validation schema for starting impersonation
 */
const startImpersonationSchema = z.object({
  targetUserId: z.string().uuid(),
  tenantId: z.string().uuid(),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

/**
 * POST /api/platform/impersonate/start
 * Start an impersonation session
 */
export async function POST(request: NextRequest) {
  try {
    // Verify platform admin access (only super_admin and platform_admin can impersonate)
    const currentUser = await requirePlatformAdmin();

    const body = await request.json();
    const validatedData = startImpersonationSchema.parse(body);

    const supabase = await createClient();

    // Get current user's platform role
    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('role')
      .eq('user_id', currentUser.id)
      .single();

    if (!platformUser || !['super_admin', 'platform_admin'].includes(platformUser.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only super admins and platform admins can impersonate users' },
        { status: 403 }
      );
    }

    // Check if admin already has an active impersonation session
    const { data: existingSession } = await supabase
      .from('platform_impersonation_sessions')
      .select('id')
      .eq('platform_admin_id', currentUser.id)
      .eq('status', 'active')
      .single();

    if (existingSession) {
      return NextResponse.json(
        {
          error: 'You already have an active impersonation session. Please end it first.',
          sessionId: existingSession.id,
        },
        { status: 400 }
      );
    }

    // Verify target user exists and belongs to the specified tenant
    const { data: targetUser, error: targetUserError } = await supabase
      .from('users')
      .select('id, email, full_name, tenant_id')
      .eq('id', validatedData.targetUserId)
      .single();

    if (targetUserError || !targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    if (targetUser.tenant_id !== validatedData.tenantId) {
      return NextResponse.json(
        { error: 'Target user does not belong to the specified tenant' },
        { status: 400 }
      );
    }

    // Verify target user is not a platform admin (can't impersonate other platform admins)
    const { data: targetPlatformUser } = await supabase
      .from('platform_users')
      .select('role')
      .eq('user_id', validatedData.targetUserId)
      .single();

    if (targetPlatformUser) {
      return NextResponse.json(
        { error: 'Cannot impersonate platform administrators' },
        { status: 403 }
      );
    }

    // Get target user's role within tenant
    const { data: targetTenantUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', validatedData.targetUserId)
      .single();

    // Get tenant information
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id, company_name, slug')
      .eq('id', validatedData.tenantId)
      .single();

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Create impersonation session (expires in 2 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    const { data: session, error: sessionError } = await supabase
      .from('platform_impersonation_sessions')
      .insert({
        platform_admin_id: currentUser.id,
        target_user_id: validatedData.targetUserId,
        tenant_id: validatedData.tenantId,
        reason: validatedData.reason,
        status: 'active',
        expires_at: expiresAt.toISOString(),
        ip_address:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      })
      .select('id, started_at, expires_at')
      .single();

    if (sessionError) {
      console.error('Failed to create impersonation session:', sessionError);
      throw sessionError;
    }

    // Create audit log in platform_audit_logs
    await supabase.from('platform_audit_logs').insert({
      user_id: currentUser.id,
      action: 'impersonation.started',
      resource_type: 'impersonation_session',
      resource_id: session.id,
      ip_address:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      metadata: {
        target_user_id: validatedData.targetUserId,
        target_user_email: targetUser.email,
        target_user_name: targetUser.full_name,
        tenant_id: validatedData.tenantId,
        tenant_name: tenant.company_name,
        reason: validatedData.reason,
        expires_at: expiresAt.toISOString(),
      },
    });

    // Determine redirect URL based on target user's role
    const redirectUrl = targetTenantUser?.role === 'employee'
      ? '/employee/dashboard'
      : '/dashboard';

    return NextResponse.json({
      sessionId: session.id,
      targetUser: {
        id: targetUser.id,
        email: targetUser.email,
        full_name: targetUser.full_name,
        role: targetTenantUser?.role || 'employee',
      },
      tenant: {
        id: tenant.id,
        company_name: tenant.company_name,
        slug: tenant.slug,
      },
      startedAt: session.started_at,
      expiresAt: session.expires_at,
      redirectUrl,
    });
  } catch (error) {
    console.error('Failed to start impersonation:', error);

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
        error: 'Failed to start impersonation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
