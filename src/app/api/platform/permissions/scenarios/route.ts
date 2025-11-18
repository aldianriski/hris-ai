import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';
import { z } from 'zod';

const scenarioSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  test_user_id: z.string().uuid().optional(),
  test_role_id: z.string().uuid().optional(),
  test_tenant_id: z.string().uuid().optional(),
  permissions_to_test: z.array(
    z.object({
      permission: z.string(),
      expected: z.boolean(),
    })
  ),
  is_active: z.boolean().optional(),
});

/**
 * GET /api/platform/permissions/scenarios
 * List all permission test scenarios
 */
export async function GET(request: NextRequest) {
  try {
    await requirePlatformAdmin();
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');

    let query = supabase
      .from('permission_test_scenarios')
      .select(`
        *,
        test_user:users!permission_test_scenarios_test_user_id_fkey(id, email, full_name),
        test_role:platform_roles!permission_test_scenarios_test_role_id_fkey(id, name, slug),
        test_tenant:tenants!permission_test_scenarios_test_tenant_id_fkey(id, company_name)
      `)
      .order('created_at', { ascending: false });

    if (active !== null) {
      query = query.eq('is_active', active === 'true');
    }

    const { data: scenarios, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ scenarios: scenarios || [] });
  } catch (error) {
    console.error('Failed to fetch scenarios:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch test scenarios',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/permissions/scenarios
 * Create a new test scenario
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requirePlatformAdmin();
    const supabase = await createClient();

    const body = await request.json();
    const validatedData = scenarioSchema.parse(body);

    const { data: scenario, error } = await supabase
      .from('permission_test_scenarios')
      .insert({
        ...validatedData,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ scenario }, { status: 201 });
  } catch (error) {
    console.error('Failed to create scenario:', error);

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
        error: 'Failed to create test scenario',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
