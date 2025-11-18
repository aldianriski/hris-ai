import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkPlatformAdminPermission } from '@/lib/auth/platform-permissions';

/**
 * GET /api/platform/analytics
 * Get platform-wide analytics and metrics
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check permissions
    const { user, error: permError } = await checkPlatformAdminPermission(supabase, [
      'super_admin',
      'platform_admin',
    ]);

    if (permError) {
      return NextResponse.json({ error: permError }, { status: 403 });
    }

    // Fetch all analytics data in parallel
    const [
      tenantsData,
      activeTenantsData,
      usersData,
      ticketsData,
      openTicketsData,
      invoicesData,
      pendingInvoicesData,
      flagsData,
      activeFlagsData,
      plansData,
    ] = await Promise.all([
      // Total tenants
      supabase.from('tenants').select('id', { count: 'exact', head: true }),
      // Active tenants (active subscription)
      supabase.from('tenants').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      // Total users across all tenants
      supabase.rpc('count_total_platform_users').catch(() => ({ count: 0 })),
      // Total support tickets
      supabase.from('support_tickets').select('id', { count: 'exact', head: true }),
      // Open support tickets
      supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      // Total invoices
      supabase.from('invoices').select('id, amount_total, status'),
      // Pending invoices
      supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      // Total feature flags
      supabase.from('feature_flags').select('id', { count: 'exact', head: true }),
      // Active feature flags
      supabase.from('feature_flags').select('id', { count: 'exact', head: true }).eq('enabled', true),
      // Subscription plans
      supabase.from('subscription_plans').select('id, name'),
    ]);

    // Calculate revenue metrics
    const totalRevenue = invoicesData.data?.reduce((sum, inv) => {
      if (inv.status === 'paid') {
        return sum + parseFloat(inv.amount_total?.toString() || '0');
      }
      return sum;
    }, 0) || 0;

    const pendingRevenue = invoicesData.data?.reduce((sum, inv) => {
      if (inv.status === 'pending' || inv.status === 'sent') {
        return sum + parseFloat(inv.amount_total?.toString() || '0');
      }
      return sum;
    }, 0) || 0;

    // Get recent tenants (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: newTenantsCount } = await supabase
      .from('tenants')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Get tenant growth data (last 12 months)
    const { data: tenantGrowthData } = await supabase
      .from('tenants')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    // Group by month
    const monthlyGrowth = (tenantGrowthData || []).reduce((acc: Record<string, number>, tenant) => {
      const month = new Date(tenant.created_at).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    // Get ticket resolution stats
    const { data: resolvedTickets } = await supabase
      .from('support_tickets')
      .select('created_at, resolved_at')
      .eq('status', 'resolved')
      .not('resolved_at', 'is', null)
      .limit(100);

    const avgResolutionTime = resolvedTickets?.reduce((sum, ticket) => {
      const created = new Date(ticket.created_at).getTime();
      const resolved = new Date(ticket.resolved_at!).getTime();
      return sum + (resolved - created);
    }, 0) || 0;

    const avgResolutionHours = resolvedTickets && resolvedTickets.length > 0
      ? Math.round((avgResolutionTime / resolvedTickets.length) / (1000 * 60 * 60))
      : 0;

    // Get top tenants by user count (if we had proper user_tenants data)
    const { data: topTenants } = await supabase
      .from('tenants')
      .select('id, name, status')
      .eq('status', 'active')
      .limit(10);

    const analytics = {
      overview: {
        totalTenants: tenantsData.count || 0,
        activeTenants: activeTenantsData.count || 0,
        totalUsers: usersData?.count || 0,
        newTenantsThisMonth: newTenantsCount || 0,
      },
      revenue: {
        totalRevenue: Math.round(totalRevenue),
        pendingRevenue: Math.round(pendingRevenue),
        paidInvoices: invoicesData.data?.filter(i => i.status === 'paid').length || 0,
        totalInvoices: invoicesData.data?.length || 0,
      },
      support: {
        totalTickets: ticketsData.count || 0,
        openTickets: openTicketsData.count || 0,
        avgResolutionHours,
        ticketResolutionRate: ticketsData.count && ticketsData.count > 0
          ? Math.round(((ticketsData.count - (openTicketsData.count || 0)) / ticketsData.count) * 100)
          : 0,
      },
      features: {
        totalFlags: flagsData.count || 0,
        activeFlags: activeFlagsData.count || 0,
        totalPlans: plansData.data?.length || 0,
      },
      growth: {
        monthlyTenants: monthlyGrowth,
        topTenants: topTenants || [],
      },
    };

    return NextResponse.json({ data: analytics });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
