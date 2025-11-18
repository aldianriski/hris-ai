import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';
import { z } from 'zod';

const permissionTestSchema = z.object({
  user_id: z.string().uuid(),
  permissions: z.array(
    z.object({
      permission: z.string(),
      expected: z.boolean().optional(),
    })
  ),
  tenant_id: z.string().uuid().optional(),
});

/**
 * POST /api/platform/permissions/test
 * Test if a user has specific permissions
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requirePlatformAdmin();
    const supabase = await createClient();

    const body = await request.json();
    const { user_id, permissions, tenant_id } = permissionTestSchema.parse(body);

    // Get user details
    const { data: user } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user_id)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's roles
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select(`
        role:platform_roles(id, name, slug, permissions)
      `)
      .eq('user_id', user_id);

    // Test each permission
    const results = [];
    for (const permTest of permissions) {
      const { data: hasPermission, error } = await supabase.rpc(
        'check_user_permission',
        {
          p_user_id: user_id,
          p_permission: permTest.permission,
          p_tenant_id: tenant_id || null,
        }
      );

      const passed = permTest.expected === undefined || hasPermission === permTest.expected;

      results.push({
        permission: permTest.permission,
        expected: permTest.expected,
        actual: hasPermission || false,
        passed,
        error: error?.message,
      });
    }

    const summary = {
      total: results.length,
      passed: results.filter((r) => r.passed).length,
      failed: results.filter((r) => !r.passed).length,
    };

    return NextResponse.json({
      user: {
        id: user_id,
        name: user.full_name,
        email: user.email,
      },
      roles: userRoles?.map((ur: any) => ur.role) || [],
      results,
      summary,
    });
  } catch (error) {
    console.error('Failed to test permissions:', error);

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
        error: 'Failed to test permissions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
