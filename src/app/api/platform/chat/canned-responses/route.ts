import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';
import { z } from 'zod';

const cannedResponseSchema = z.object({
  shortcut: z.string().min(1).max(50).regex(/^\/[a-z]+$/),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  category: z.string().max(100).optional(),
  is_active: z.boolean().optional(),
});

/**
 * GET /api/platform/chat/canned-responses
 * List all canned responses
 */
export async function GET(request: NextRequest) {
  try {
    await requirePlatformAdmin();
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const active = searchParams.get('active');

    let query = supabase
      .from('chat_canned_responses')
      .select('*')
      .order('category', { ascending: true })
      .order('title', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    if (active !== null) {
      query = query.eq('is_active', active === 'true');
    }

    const { data: responses, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ responses: responses || [] });
  } catch (error) {
    console.error('Failed to fetch canned responses:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch canned responses',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/chat/canned-responses
 * Create a new canned response
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requirePlatformAdmin();
    const supabase = await createClient();

    const body = await request.json();
    const validatedData = cannedResponseSchema.parse(body);

    const { data: response, error } = await supabase
      .from('chat_canned_responses')
      .insert({
        ...validatedData,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ response }, { status: 201 });
  } catch (error) {
    console.error('Failed to create canned response:', error);

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
        error: 'Failed to create canned response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
