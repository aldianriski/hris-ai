import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkPlatformAdminPermission } from '@/lib/auth/platform-permissions';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/platform/support/[id]/messages
 * Add a message/comment to a ticket
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: ticketId } = await context.params;
    const supabase = await createClient();

    // Check permissions
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
      'platform_admin',
      'support_admin',
    ]);

    if (permError) {
      return NextResponse.json({ error: permError }, { status: 403 });
    }

    const body = await request.json();
    const { message, is_internal = false, attachments = [] } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user info
    const { data: userData } = await supabase.auth.getUser();
    const authorEmail = userData.user?.email || 'support@hris.com';

    // Create message
    const { data, error } = await supabase
      .from('support_ticket_messages')
      .insert({
        ticket_id: ticketId,
        message: message.trim(),
        is_internal,
        is_system: false,
        author_id: user.id,
        author_name: authorEmail.split('@')[0],
        author_email: authorEmail,
        attachments,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return NextResponse.json(
        { error: 'Failed to create message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
