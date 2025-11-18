import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const sendMessageSchema = z.object({
  session_id: z.string().uuid(),
  content: z.string().min(1).optional(),
  message_type: z.enum(['text', 'file', 'image', 'system_notification']).default('text'),
  file_url: z.string().url().optional(),
  file_name: z.string().optional(),
  file_size: z.number().optional(),
  file_type: z.string().optional(),
});

/**
 * POST /api/platform/chat/messages
 * Send a message in a chat session
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
    const validatedData = sendMessageSchema.parse(body);

    // Verify user has access to this session
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('user_id, assigned_agent_id, status')
      .eq('id', validatedData.session_id)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status === 'closed') {
      return NextResponse.json({ error: 'Cannot send message to closed session' }, { status: 400 });
    }

    // Determine sender type
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role:platform_roles(slug)')
      .eq('user_id', user.id);

    const isPlatformAdmin = userRoles?.some((ur: any) =>
      ['super_admin', 'platform_admin', 'platform_support'].includes(ur.role?.slug)
    );

    const senderType = isPlatformAdmin ? 'agent' : 'user';

    // Verify user is either session owner or assigned agent
    const hasAccess =
      session.user_id === user.id ||
      session.assigned_agent_id === user.id ||
      isPlatformAdmin;

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create message
    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: validatedData.session_id,
        sender_id: user.id,
        sender_type: senderType,
        message_type: validatedData.message_type,
        content: validatedData.content,
        file_url: validatedData.file_url,
        file_name: validatedData.file_name,
        file_size: validatedData.file_size,
        file_type: validatedData.file_type,
      })
      .select(`
        *,
        sender:users(id, email, full_name, avatar_url)
      `)
      .single();

    if (error) {
      throw error;
    }

    // Update session's updated_at
    await supabase
      .from('chat_sessions')
      .update({
        updated_at: new Date().toISOString(),
        status: session.status === 'open' ? 'active' : session.status,
      })
      .eq('id', validatedData.session_id);

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Failed to send message:', error);

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
        error: 'Failed to send message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
