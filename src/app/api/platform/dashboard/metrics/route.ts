import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/lib/auth/server-permissions';

/**
 * GET /api/platform/dashboard/metrics
 * Get comprehensive dashboard metrics for platform admin
 */
export async function GET() {
  try {
    // Verify platform admin access
    await requirePlatformAdmin();

    const supabase = await createClient();

    // Get current date boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. TENANT METRICS
    const { data: allTenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, status, subscription_plan, created_at');

    if (tenantsError) throw tenantsError;

    const tenantMetrics = {
      total: allTenants?.length || 0,
      active: allTenants?.filter(t => t.status === 'active').length || 0,
      trial: allTenants?.filter(t => t.subscription_plan === 'trial').length || 0,
      paused: allTenants?.filter(t => t.status === 'suspended').length || 0,
      churned: allTenants?.filter(t => t.status === 'cancelled').length || 0,
      newThisMonth: allTenants?.filter(t =>
        new Date(t.created_at) >= startOfMonth
      ).length || 0,
    };

    // 2. USER METRICS
    const { count: totalUsers, error: totalUsersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (totalUsersError) throw totalUsersError;

    // Active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: activeUsers, error: activeUsersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', thirtyDaysAgo.toISOString());

    if (activeUsersError) throw activeUsersError;

    // New users today
    const { count: newUsersToday, error: newUsersTodayError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfToday.toISOString());

    if (newUsersTodayError) throw newUsersTodayError;

    const userMetrics = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      newUsersToday: newUsersToday || 0,
    };

    // 3. REVENUE METRICS
    // Calculate based on subscription plans
    const planPricing: Record<string, number> = {
      trial: 0,
      starter: 99000,      // IDR 99,000/month
      professional: 299000, // IDR 299,000/month
      enterprise: 999000,   // IDR 999,000/month
    };

    let mrr = 0;
    allTenants?.forEach(tenant => {
      if (tenant.status === 'active') {
        mrr += planPricing[tenant.subscription_plan] || 0;
      }
    });

    const arr = mrr * 12;
    const churnRate = tenantMetrics.total > 0
      ? (tenantMetrics.churned / tenantMetrics.total) * 100
      : 0;
    const averageRevenuePerTenant = tenantMetrics.active > 0
      ? mrr / tenantMetrics.active
      : 0;

    const revenueMetrics = {
      mrr,
      arr,
      churnRate: parseFloat(churnRate.toFixed(2)),
      averageRevenuePerTenant: parseFloat(averageRevenuePerTenant.toFixed(2)),
    };

    // 4. SYSTEM HEALTH (mock for now - can be replaced with real monitoring)
    const systemHealth = {
      uptime: 99.9,
      apiLatency: 45,
      errorRate: 0.1,
      dbConnections: 12,
    };

    // 5. RECENT ACTIVITY
    // Get recent tenant creations, status changes, and upgrades
    const { data: recentTenants, error: recentTenantsError } = await supabase
      .from('tenants')
      .select('id, company_name, status, subscription_plan, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentTenantsError) throw recentTenantsError;

    const recentActivity = recentTenants?.slice(0, 5).map(tenant => {
      const isNew = new Date(tenant.created_at) > thirtyDaysAgo;
      const type = isNew
        ? 'new_tenant'
        : tenant.status === 'cancelled'
          ? 'churn'
          : tenant.subscription_plan === 'enterprise'
            ? 'upgrade'
            : 'payment';

      return {
        id: tenant.id,
        type,
        tenantName: tenant.company_name,
        description: isNew
          ? `New ${tenant.subscription_plan} tenant registered`
          : tenant.status === 'cancelled'
            ? 'Tenant cancelled subscription'
            : `Updated to ${tenant.subscription_plan} plan`,
        timestamp: tenant.created_at,
      };
    }) || [];

    // 6. GROWTH DATA (last 6 months)
    const growthData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthName = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });

      const totalInMonth = allTenants?.filter(t =>
        new Date(t.created_at) < nextMonthDate
      ).length || 0;

      const newInMonth = allTenants?.filter(t => {
        const createdAt = new Date(t.created_at);
        return createdAt >= monthDate && createdAt < nextMonthDate;
      }).length || 0;

      const churnedInMonth = allTenants?.filter(t => {
        const createdAt = new Date(t.created_at);
        return t.status === 'cancelled' && createdAt >= monthDate && createdAt < nextMonthDate;
      }).length || 0;

      growthData.push({
        month: monthName,
        total: totalInMonth,
        new: newInMonth,
        churned: churnedInMonth,
      });
    }

    // 7. REVENUE DATA (last 6 months)
    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthName = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });

      // Calculate MRR for tenants active at end of month
      let monthMrr = 0;
      allTenants?.forEach(tenant => {
        const createdAt = new Date(tenant.created_at);
        // If tenant was created before end of this month and is active
        if (createdAt < nextMonthDate && tenant.status === 'active') {
          monthMrr += planPricing[tenant.subscription_plan] || 0;
        }
      });

      revenueData.push({
        month: monthName,
        mrr: monthMrr,
        arr: monthMrr * 12,
      });
    }

    // Return all metrics
    return NextResponse.json({
      tenantMetrics,
      userMetrics,
      revenueMetrics,
      systemHealth,
      recentActivity,
      growthData,
      revenueData,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch dashboard metrics:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
