import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';
import { z } from 'zod';

/**
 * Validation schema for ending impersonation
 */
const endImpersonationSchema = z.object({
  sessionId: z.string().uuid(),
});

/**
 * POST /api/platform/impersonate/end
 * End an active impersonation session
 */
export async function POST(request: NextRequest) {
  try {
    // Verify platform admin access
    const currentUser = await requirePlatformAdmin();

    const body = await request.json();
    const validatedData = endImpersonationSchema.parse(body);

    const supabase = await createClient();

    // Get the session
    const { data: session, error: sessionError } = await supabase
      .from('platform_impersonation_sessions')
      .select(`
        *,
        target_user:users!platform_impersonation_sessions_target_user_id_fkey(id, email, full_name),
        tenant:tenants!platform_impersonation_sessions_tenant_id_fkey(id, company_name)
      `)
      .eq('id', validatedData.sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Impersonation session not found' },
        { status: 404 }
      );
    }

    // Verify the session belongs to the current user
    if (session.platform_admin_id !== currentUser.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only end your own impersonation sessions' },
        { status: 403 }
      );
    }

    // Check if session is already ended
    if (session.status !== 'active') {
      return NextResponse.json(
        { error: `Session is already ${session.status}` },
        { status: 400 }
      );
    }

    // Update session to ended
    const endedAt = new Date();
    const { error: updateError } = await supabase
      .from('platform_impersonation_sessions')
      .update({
        status: 'ended',
        ended_at: endedAt.toISOString(),
      })
      .eq('id', validatedData.sessionId);

    if (updateError) {
      throw updateError;
    }

    // Calculate duration
    const startedAt = new Date(session.started_at);
    const durationMs = endedAt.getTime() - startedAt.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    const durationString = `${hours}h ${minutes}m ${seconds}s`;

    // Count actions during session
    const { count: actionsCount } = await supabase
      .from('platform_impersonation_actions')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', validatedData.sessionId);

    // Create audit log
    await supabase.from('platform_audit_logs').insert({
      user_id: currentUser.id,
      action: 'impersonation.ended',
      resource_type: 'impersonation_session',
      resource_id: validatedData.sessionId,
      ip_address:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      metadata: {
        target_user_id: session.target_user_id,
        target_user_email: session.target_user?.email,
        target_user_name: session.target_user?.full_name,
        tenant_id: session.tenant_id,
        tenant_name: session.tenant?.company_name,
        duration: durationString,
        actions_count: actionsCount || 0,
        started_at: session.started_at,
        ended_at: endedAt.toISOString(),
      },
    });

    return NextResponse.json({
      message: 'Impersonation session ended successfully',
      duration: durationString,
      actionsLogged: actionsCount || 0,
      session: {
        id: session.id,
        startedAt: session.started_at,
        endedAt: endedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to end impersonation:', error);

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
        error: 'Failed to end impersonation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
