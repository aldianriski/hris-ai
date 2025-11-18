import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createSessionSchema = z.object({
  subject: z.string().optional(),
  category: z.enum(['technical', 'billing', 'general']).optional(),
  initialMessage: z.string().min(1),
});

/**
 * GET /api/platform/chat/sessions
 * List chat sessions (user sees their own, admins see all)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tenantId = searchParams.get('tenantId');
    const agentId = searchParams.get('agentId');

    // Check if user is platform admin
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role:platform_roles(slug)')
      .eq('user_id', user.id);

    const isPlatformAdmin = userRoles?.some((ur: any) =>
      ['super_admin', 'platform_admin', 'platform_support'].includes(ur.role?.slug)
    );

    let query = supabase
      .from('chat_sessions')
      .select(`
        *,
        user:users!chat_sessions_user_id_fkey(id, email, full_name),
        agent:users!chat_sessions_assigned_agent_id_fkey(id, email, full_name),
        tenant:tenants(id, company_name, subscription_plan),
        unread_count:chat_messages(count)
      `)
      .eq('chat_messages.is_read', false)
      .order('updated_at', { ascending: false });

    // Filter based on user role
    if (!isPlatformAdmin) {
      query = query.eq('user_id', user.id);
    } else {
      // Platform admin filters
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      if (agentId) {
        query = query.eq('assigned_agent_id', agentId);
      }
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: sessions, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ sessions: sessions || [] });
  } catch (error) {
    console.error('Failed to fetch chat sessions:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch chat sessions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/chat/sessions
 * Create a new chat session
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, category, initialMessage } = createSessionSchema.parse(body);

    // Get user's tenant
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'User not associated with a tenant' }, { status: 400 });
    }

    // Get tenant plan for routing
    const { data: tenant } = await supabase
      .from('tenants')
      .select('subscription_plan')
      .eq('id', profile.tenant_id)
      .single();

    // Create chat session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert({
        tenant_id: profile.tenant_id,
        user_id: user.id,
        subject: subject || 'Support Chat',
        category: category || 'general',
        tenant_plan: tenant?.subscription_plan || 'starter',
        status: 'open',
      })
      .select()
      .single();

    if (sessionError) {
      throw sessionError;
    }

    // Send initial message
    const { error: messageError } = await supabase.from('chat_messages').insert({
      session_id: session.id,
      sender_id: user.id,
      sender_type: 'user',
      message_type: 'text',
      content: initialMessage,
    });

    if (messageError) {
      throw messageError;
    }

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('Failed to create chat session:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create chat session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
