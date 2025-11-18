import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';
import { z } from 'zod';

const updateAvailabilitySchema = z.object({
  status: z.enum(['online', 'away', 'busy', 'offline']),
  custom_status_message: z.string().max(500).optional(),
  accepts_new_chats: z.boolean().optional(),
});

/**
 * GET /api/platform/chat/agent-availability
 * Get all agent availability statuses
 */
export async function GET(request: NextRequest) {
  try {
    await requirePlatformAdmin();
    const supabase = await createClient();

    const { data: agents, error } = await supabase
      .from('chat_agent_availability')
      .select(`
        *,
        agent:users(id, email, full_name, avatar_url)
      `)
      .order('status', { ascending: false }); // online first

    if (error) {
      throw error;
    }

    return NextResponse.json({ agents: agents || [] });
  } catch (error) {
    console.error('Failed to fetch agent availability:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch agent availability',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/chat/agent-availability
 * Update own agent availability
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requirePlatformAdmin();
    const supabase = await createClient();

    const body = await request.json();
    const { status, custom_status_message, accepts_new_chats } =
      updateAvailabilitySchema.parse(body);

    // Upsert availability
    const { data: availability, error } = await supabase
      .from('chat_agent_availability')
      .upsert(
        {
          agent_id: user.id,
          status,
          custom_status_message,
          accepts_new_chats:
            accepts_new_chats !== undefined ? accepts_new_chats : status === 'online',
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'agent_id',
        }
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ availability });
  } catch (error) {
    console.error('Failed to update availability:', error);

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

    return NextResponse.json(
      {
        error: 'Failed to update availability',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
