import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkPlatformAdminPermission } from '@/lib/auth/platform-permissions';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/platform/support/[id]
 * Get ticket details with messages
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
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

    // Fetch ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select(`
        *,
        tenant:tenants(id, name, slug),
        requester:requester_id(email),
        assignee:assigned_to(email),
        escalated_user:escalated_to(email)
      `)
      .eq('id', id)
      .single();

    if (ticketError) {
      if (ticketError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Ticket not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching ticket:', ticketError);
      return NextResponse.json(
        { error: 'Failed to fetch ticket' },
        { status: 500 }
      );
    }

    // Fetch messages
    const { data: messages, error: messagesError } = await supabase
      .from('support_ticket_messages')
      .select(`
        *,
        author:author_id(email)
      `)
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
    }

    return NextResponse.json({
      data: {
        ...ticket,
        messages: messages || [],
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/platform/support/[id]
 * Update a ticket
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
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
    const {
      subject,
      description,
      status,
      priority,
      category,
      assigned_to,
      is_escalated,
      escalated_to,
      internal_notes,
      satisfaction_rating,
      satisfaction_comment,
    } = body;

    // Build update object
    const updates: Record<string, unknown> = {};

    if (subject !== undefined) updates.subject = subject;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (category !== undefined) updates.category = category;
    if (assigned_to !== undefined) updates.assigned_to = assigned_to;
    if (internal_notes !== undefined) updates.internal_notes = internal_notes;
    if (satisfaction_rating !== undefined) updates.satisfaction_rating = satisfaction_rating;
    if (satisfaction_comment !== undefined) updates.satisfaction_comment = satisfaction_comment;

    if (is_escalated !== undefined) {
      updates.is_escalated = is_escalated;
      if (is_escalated) {
        updates.escalated_at = new Date().toISOString();
        if (escalated_to) updates.escalated_to = escalated_to;
      } else {
        updates.escalated_at = null;
        updates.escalated_to = null;
      }
    }

    // Update ticket
    const { data, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating ticket:', error);
      return NextResponse.json(
        { error: 'Failed to update ticket' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/platform/support/[id]
 * Delete a ticket
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check permissions (only super admins can delete tickets)
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
    ]);

    if (permError) {
      return NextResponse.json({ error: permError }, { status: 403 });
    }

    // Delete ticket (will cascade delete messages)
    const { error } = await supabase
      .from('support_tickets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting ticket:', error);
      return NextResponse.json(
        { error: 'Failed to delete ticket' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Ticket deleted successfully',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
