import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/platform/permissions/scenarios/[id]/run
 * Run a permission test scenario
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const currentUser = await requirePlatformAdmin();
    const supabase = await createClient();

    // Get scenario
    const { data: scenario, error: scenarioError } = await supabase
      .from('permission_test_scenarios')
      .select('*')
      .eq('id', id)
      .single();

    if (scenarioError || !scenario) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    // Determine which user to test
    let testUserId = scenario.test_user_id;

    // If no specific user, test with role
    if (!testUserId && scenario.test_role_id) {
      // Find a user with this role
      const { data: userWithRole } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role_id', scenario.test_role_id)
        .limit(1)
        .single();

      testUserId = userWithRole?.user_id;
    }

    if (!testUserId) {
      return NextResponse.json(
        { error: 'No user specified or found for testing' },
        { status: 400 }
      );
    }

    // Run tests
    const results = [];
    for (const permTest of scenario.permissions_to_test) {
      const { data: hasPermission, error } = await supabase.rpc('check_user_permission', {
        p_user_id: testUserId,
        p_permission: permTest.permission,
        p_tenant_id: scenario.test_tenant_id || null,
      });

      const passed = hasPermission === permTest.expected;

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

    // Save test result
    const { data: testResult, error: resultError } = await supabase
      .from('permission_test_results')
      .insert({
        scenario_id: id,
        test_user_id: testUserId,
        test_role_id: scenario.test_role_id,
        permissions_tested: summary.total,
        permissions_passed: summary.passed,
        permissions_failed: summary.failed,
        result_details: results,
        executed_by: currentUser.id,
      })
      .select()
      .single();

    if (resultError) {
      console.error('Failed to save test result:', resultError);
    }

    // Update scenario's last run
    await supabase
      .from('permission_test_scenarios')
      .update({
        last_run_at: new Date().toISOString(),
        last_run_result: summary,
      })
      .eq('id', id);

    return NextResponse.json({
      scenario_id: id,
      test_user_id: testUserId,
      results,
      summary,
      test_result_id: testResult?.id,
    });
  } catch (error) {
    console.error('Failed to run test scenario:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: 'Failed to run test scenario',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
