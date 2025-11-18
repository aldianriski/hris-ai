import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';
import { z } from 'zod';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * Validation schema for changing subscription
 */
const changeSubscriptionSchema = z.object({
  plan: z.enum(['trial', 'starter', 'professional', 'enterprise']),
});

const planLimits: Record<string, { employees: number; storage: number; apiCalls: number; price: number }> = {
  trial: { employees: 10, storage: 1, apiCalls: 1000, price: 0 },
  starter: { employees: 50, storage: 10, apiCalls: 10000, price: 149000 },
  professional: { employees: 200, storage: 50, apiCalls: 50000, price: 299000 },
  enterprise: { employees: 999999, storage: 500, apiCalls: 999999, price: 999000 },
};

/**
 * PATCH /api/platform/tenants/[id]/subscription
 * Change tenant subscription plan
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify platform admin access
    const currentUser = await requirePlatformAdmin();

    const body = await request.json();
    const validatedData = changeSubscriptionSchema.parse(body);

    const supabase = await createClient();

    // Get current tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', params.id)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const currentPlan = tenant.subscription_plan;
    const newPlan = validatedData.plan;

    // Don't allow changing to trial
    if (newPlan === 'trial') {
      return NextResponse.json(
        { error: 'Cannot change to trial plan' },
        { status: 400 }
      );
    }

    // Check if it's actually a change
    if (currentPlan === newPlan) {
      return NextResponse.json(
        { error: 'Already on this plan' },
        { status: 400 }
      );
    }

    const currentPlanLimits = planLimits[currentPlan];
    const newPlanLimits = planLimits[newPlan];

    if (!currentPlanLimits || !newPlanLimits) {
      return NextResponse.json(
        { error: 'Invalid plan configuration' },
        { status: 400 }
      );
    }

    const isUpgrade = newPlanLimits.price > currentPlanLimits.price;
    const limits = newPlanLimits;

    // Update tenant with new plan and limits
    const { error: updateError } = await supabase
      .from('tenants')
      .update({
        subscription_plan: newPlan,
        max_employees: limits.employees,
        max_storage_gb: limits.storage,
        max_api_calls_per_month: limits.apiCalls,
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (updateError) {
      throw updateError;
    }

    // Update subscription record
    const subscriptionStatus = isUpgrade ? 'active' : 'active'; // In real world, downgrade might be 'pending_downgrade'
    const effectiveDate = isUpgrade
      ? new Date() // Immediate for upgrades
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // End of period for downgrades

    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .update({
        plan_id: newPlan,
        status: subscriptionStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('tenant_id', params.id);

    if (subscriptionError) {
      console.error('Failed to update subscription record:', subscriptionError);
      // Don't fail the request if subscription update fails
    }

    // Create audit log
    await supabase.from('platform_audit_logs').insert({
      user_id: currentUser.id,
      action: isUpgrade ? 'subscription.upgraded' : 'subscription.downgraded',
      resource_type: 'subscription',
      resource_id: params.id,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      metadata: {
        from_plan: currentPlan,
        to_plan: newPlan,
        effective_date: effectiveDate.toISOString(),
      },
    });

    return NextResponse.json({
      message: `Subscription ${isUpgrade ? 'upgraded' : 'downgraded'} successfully`,
      plan: newPlan,
      isUpgrade,
      effectiveDate: effectiveDate.toISOString(),
    });
  } catch (error) {
    console.error('Failed to change subscription:', error);

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

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to change subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
