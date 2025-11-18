import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkPlatformAdminPermission } from '@/lib/auth/platform-permissions';

/**
 * GET /api/platform/support
 * List all support tickets with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // Check permissions
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
      'platform_admin',
      'support_admin',
    ]);

    if (permError) {
      return NextResponse.json({ error: permError }, { status: 403 });
    }

    // Build query
    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        tenant:tenants(id, name),
        requester:requester_id(email),
        assignee:assigned_to(email)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    const status = searchParams.get('status');
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const priority = searchParams.get('priority');
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    const tenantId = searchParams.get('tenant_id');
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const assignedTo = searchParams.get('assigned_to');
    if (assignedTo && assignedTo !== 'all') {
      if (assignedTo === 'unassigned') {
        query = query.is('assigned_to', null);
      } else {
        query = query.eq('assigned_to', assignedTo);
      }
    }

    const search = searchParams.get('search');
    if (search) {
      query = query.or(`subject.ilike.%${search}%,ticket_number.ilike.%${search}%,requester_email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching support tickets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch support tickets' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, count });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/support
 * Create a new support ticket
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check permissions (support staff can create tickets)
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
      priority = 'medium',
      category,
      tenant_id,
      requester_email,
      requester_name,
      assigned_to,
    } = body;

    // Validate required fields
    if (!subject || !description || !tenant_id || !requester_email || !requester_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get requester user
    const { data: requesterUser } = await supabase
      .from('user_tenants')
      .select('user_id')
      .eq('tenant_id', tenant_id)
      .limit(1)
      .single();

    const requesterId = requesterUser?.user_id || user.id;

    // Create ticket
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        subject,
        description,
        priority,
        category,
        tenant_id,
        requester_id: requesterId,
        requester_email,
        requester_name,
        assigned_to: assigned_to || null,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating support ticket:', error);
      return NextResponse.json(
        { error: 'Failed to create support ticket' },
        { status: 500 }
      );
    }

    // Create initial system message
    await supabase.from('support_ticket_messages').insert({
      ticket_id: ticket.id,
      message: description,
      author_id: requesterId,
      author_name: requester_name,
      author_email: requester_email,
      is_system: false,
      is_internal: false,
    });

    return NextResponse.json({ data: ticket }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
