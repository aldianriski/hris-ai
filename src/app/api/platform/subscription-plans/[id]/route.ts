import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkPlatformAdminPermission } from '@/lib/auth/platform-permissions';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/platform/subscription-plans/[id]
 * Get a single subscription plan by ID or slug
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
      'billing_admin',
    ]);

    if (permError) {
      return NextResponse.json({ error: permError }, { status: 403 });
    }

    // Try to fetch by ID first, then by slug
    let query = supabase.from('subscription_plans').select('*');

    // Check if id is a UUID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUUID) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Subscription plan not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching subscription plan:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription plan' },
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
 * PATCH /api/platform/subscription-plans/[id]
 * Update a subscription plan
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check permissions (only super_admin can update plans)
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
    ]);

    if (permError) {
      return NextResponse.json({ error: permError }, { status: 403 });
    }

    const body = await request.json();

    // Build update object
    const updates: Record<string, unknown> = {
      last_modified_by: user.id,
      ...body,
    };

    // Don't allow updating slug or created_by
    delete updates.slug;
    delete updates.created_by;
    delete updates.created_at;

    // Update subscription plan
    const { data, error } = await supabase
      .from('subscription_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription plan:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Subscription plan not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update subscription plan' },
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
 * DELETE /api/platform/subscription-plans/[id]
 * Delete a subscription plan
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check permissions (only super_admin can delete plans)
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
    ]);

    if (permError) {
      return NextResponse.json({ error: permError }, { status: 403 });
    }

    // Check if any tenants are using this plan
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, company_name')
      .eq('subscription_plan', id)
      .limit(1);

    if (tenantsError) {
      console.error('Error checking plan usage:', tenantsError);
      return NextResponse.json(
        { error: 'Failed to check plan usage' },
        { status: 500 }
      );
    }

    if (tenants && tenants.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete plan that is in use by tenants',
          tenants: tenants.map(t => t.company_name),
        },
        { status: 400 }
      );
    }

    // Delete subscription plan
    const { error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting subscription plan:', error);
      return NextResponse.json(
        { error: 'Failed to delete subscription plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Subscription plan deleted successfully',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
