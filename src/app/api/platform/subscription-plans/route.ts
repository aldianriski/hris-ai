import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkPlatformAdminPermission } from '@/lib/auth/platform-permissions';

/**
 * GET /api/platform/subscription-plans
 * List all subscription plans
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check permissions
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
      'platform_admin',
      'billing_admin',
    ]);

    if (permError) {
      return NextResponse.json({ error: permError }, { status: 403 });
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const isActive = searchParams.get('is_active');
    const isPublic = searchParams.get('is_public');

    // Build query
    let query = supabase
      .from('subscription_plans')
      .select('*')
      .order('sort_order', { ascending: true });

    // Apply filters
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }
    if (isPublic !== null) {
      query = query.eq('is_public', isPublic === 'true');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching subscription plans:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription plans' },
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
 * POST /api/platform/subscription-plans
 * Create a new subscription plan
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check permissions (only super_admin can create plans)
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
    ]);

    if (permError) {
      return NextResponse.json({ error: permError }, { status: 403 });
    }

    const body = await request.json();
    const {
      slug,
      name,
      description,
      pricing_monthly,
      pricing_annual,
      currency = 'IDR',
      per_employee = false,
      max_employees,
      max_admins = 5,
      max_storage_gb = 10,
      max_api_calls_per_month,
      features = [],
      enabled_modules = [],
      ai_features_enabled = false,
      ai_leave_approval = false,
      ai_anomaly_detection = false,
      ai_payroll_error_detection = false,
      custom_reports = false,
      api_access = false,
      sso_enabled = false,
      white_label_enabled = false,
      dedicated_support = false,
      sla_uptime,
      trial_days = 0,
      is_active = true,
      is_public = true,
      is_featured = false,
      sort_order = 0,
    } = body;

    // Validate required fields
    if (!slug || !name || pricing_monthly === undefined || pricing_annual === undefined) {
      return NextResponse.json(
        { error: 'Slug, name, and pricing are required' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9_-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must be lowercase alphanumeric with hyphens/underscores only' },
        { status: 400 }
      );
    }

    // Create subscription plan
    const { data, error } = await supabase
      .from('subscription_plans')
      .insert({
        slug,
        name,
        description,
        pricing_monthly,
        pricing_annual,
        currency,
        per_employee,
        max_employees,
        max_admins,
        max_storage_gb,
        max_api_calls_per_month,
        features,
        enabled_modules,
        ai_features_enabled,
        ai_leave_approval,
        ai_anomaly_detection,
        ai_payroll_error_detection,
        custom_reports,
        api_access,
        sso_enabled,
        white_label_enabled,
        dedicated_support,
        sla_uptime,
        trial_days,
        is_active,
        is_public,
        is_featured,
        sort_order,
        created_by: user.id,
        last_modified_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription plan:', error);
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A subscription plan with this slug already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create subscription plan' },
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
