import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const updateSessionSchema = z.object({
  status: z.enum(['open', 'active', 'waiting', 'resolved', 'closed']).optional(),
  assigned_agent_id: z.string().uuid().nullable().optional(),
  satisfaction_rating: z.number().min(1).max(5).optional(),
  feedback: z.string().optional(),
});

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/platform/chat/sessions/[id]
 * Get session details with messages
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select(`
        *,
        user:users!chat_sessions_user_id_fkey(id, email, full_name, avatar_url),
        agent:users!chat_sessions_assigned_agent_id_fkey(id, email, full_name, avatar_url),
        tenant:tenants(id, company_name, subscription_plan)
      `)
      .eq('id', id)
      .single();

    if (sessionError) {
      throw sessionError;
    }

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:users(id, email, full_name, avatar_url)
      `)
      .eq('session_id', id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      throw messagesError;
    }

    // Mark messages as read for current user
    await supabase
      .from('chat_messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('session_id', id)
      .neq('sender_id', user.id)
      .eq('is_read', false);

    return NextResponse.json({
      session,
      messages: messages || [],
    });
  } catch (error) {
    console.error('Failed to fetch chat session:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch chat session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/platform/chat/sessions/[id]
 * Update session (close, assign agent, rate, etc.)
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updates = updateSessionSchema.parse(body);

    // Check permissions
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('user_id, assigned_agent_id, status')
      .eq('id', id)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if user is platform admin or session owner
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role:platform_roles(slug)')
      .eq('user_id', user.id);

    const isPlatformAdmin = userRoles?.some((ur: any) =>
      ['super_admin', 'platform_admin', 'platform_support'].includes(ur.role?.slug)
    );

    const isSessionOwner = session.user_id === user.id;

    if (!isPlatformAdmin && !isSessionOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData: any = {};

    if (updates.status) {
      updateData.status = updates.status;

      if (updates.status === 'closed' && !session.closed_at) {
        updateData.closed_at = new Date().toISOString();
        updateData.resolution_time_seconds = Math.floor(
          (new Date().getTime() - new Date(session.created_at).getTime()) / 1000
        );

        // Decrement agent's active chat count
        if (session.assigned_agent_id) {
          await supabase.rpc('decrement', {
            table_name: 'chat_agent_availability',
            column_name: 'current_active_chats',
            row_id: session.assigned_agent_id,
          });
        }
      }
    }

    if (updates.assigned_agent_id !== undefined) {
      // Only platform admins can reassign
      if (!isPlatformAdmin) {
        return NextResponse.json(
          { error: 'Only platform admins can assign agents' },
          { status: 403 }
        );
      }
      updateData.assigned_agent_id = updates.assigned_agent_id;

      // Update agent counts
      if (session.assigned_agent_id) {
        await supabase
          .from('chat_agent_availability')
          .update({ current_active_chats: supabase.raw('current_active_chats - 1') })
          .eq('agent_id', session.assigned_agent_id);
      }

      if (updates.assigned_agent_id) {
        await supabase
          .from('chat_agent_availability')
          .update({ current_active_chats: supabase.raw('current_active_chats + 1') })
          .eq('agent_id', updates.assigned_agent_id);
      }
    }

    if (updates.satisfaction_rating !== undefined) {
      // Only session owner can rate
      if (!isSessionOwner) {
        return NextResponse.json(
          { error: 'Only session owner can rate' },
          { status: 403 }
        );
      }
      updateData.satisfaction_rating = updates.satisfaction_rating;
    }

    if (updates.feedback) {
      updateData.feedback = updates.feedback;
    }

    updateData.updated_at = new Date().toISOString();

    // Update session
    const { data: updated, error } = await supabase
      .from('chat_sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ session: updated });
  } catch (error) {
    console.error('Failed to update chat session:', error);

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
        error: 'Failed to update chat session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
