/**
 * Cache Warming Strategies
 * Pre-populate cache with frequently accessed data
 */

import { createClient } from '@/lib/supabase/server';
import { setCache, getCached } from './utils';
import {
  employeeListKey,
  dashboardKey,
  analyticsKey,
  companySettingsKey,
} from './keys';
import { CacheTTL } from './redis';

/**
 * Warm employee list cache for a company
 */
export async function warmEmployeeCache(companyId: string): Promise<void> {
  try {
    const supabase = await createClient();

    const { data: employees } = await supabase
      .from('employees')
      .select('*')
      .eq('employer_id', companyId)
      .eq('status', 'active');

    if (employees) {
      await setCache(
        employeeListKey(companyId),
        employees,
        CacheTTL.MEDIUM
      );
      console.log(`[Cache Warming] Cached ${employees.length} employees for ${companyId}`);
    }
  } catch (error) {
    console.error('[Cache Warming] Failed to warm employee cache:', error);
  }
}

/**
 * Warm analytics cache for a company
 */
export async function warmAnalyticsCache(companyId: string): Promise<void> {
  try {
    const supabase = await createClient();

    // Warm headcount metric
    const { count: headcount } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', companyId)
      .eq('status', 'active');

    if (headcount !== null) {
      await setCache(
        analyticsKey(companyId, 'headcount'),
        { count: headcount, timestamp: new Date().toISOString() },
        CacheTTL.LONG
      );
    }

    // Warm leave requests metric
    const { count: pendingLeaves } = await supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', companyId)
      .eq('status', 'pending');

    if (pendingLeaves !== null) {
      await setCache(
        analyticsKey(companyId, 'pending_leaves'),
        { count: pendingLeaves, timestamp: new Date().toISOString() },
        CacheTTL.SHORT
      );
    }

    console.log(`[Cache Warming] Cached analytics for ${companyId}`);
  } catch (error) {
    console.error('[Cache Warming] Failed to warm analytics cache:', error);
  }
}

/**
 * Warm dashboard cache for a user
 */
export async function warmDashboardCache(
  companyId: string,
  userId: string
): Promise<void> {
  try {
    const supabase = await createClient();

    // Fetch dashboard data
    const [employeeData, leaveBalance, recentAttendance] = await Promise.all([
      supabase
        .from('employees')
        .select('*')
        .eq('user_id', userId)
        .single(),

      supabase
        .from('leave_balances')
        .select('*')
        .eq('employee_id', userId),

      supabase
        .from('attendances')
        .select('*')
        .eq('employee_id', userId)
        .order('date', { ascending: false })
        .limit(10),
    ]);

    const dashboardData = {
      employee: employeeData.data,
      leaveBalances: leaveBalance.data,
      recentAttendance: recentAttendance.data,
      timestamp: new Date().toISOString(),
    };

    await setCache(
      dashboardKey(companyId, userId),
      dashboardData,
      CacheTTL.SHORT
    );

    console.log(`[Cache Warming] Cached dashboard for user ${userId}`);
  } catch (error) {
    console.error('[Cache Warming] Failed to warm dashboard cache:', error);
  }
}

/**
 * Warm company settings cache
 */
export async function warmCompanySettingsCache(companyId: string): Promise<void> {
  try {
    const supabase = await createClient();

    const { data: settings } = await supabase
      .from('employers')
      .select('*')
      .eq('id', companyId)
      .single();

    if (settings) {
      await setCache(
        companySettingsKey(companyId),
        settings,
        CacheTTL.DAY
      );
      console.log(`[Cache Warming] Cached settings for ${companyId}`);
    }
  } catch (error) {
    console.error('[Cache Warming] Failed to warm company settings cache:', error);
  }
}

/**
 * Warm all common caches for a company
 * Call this during off-peak hours or after major updates
 */
export async function warmAllCompanyCache(companyId: string): Promise<void> {
  console.log(`[Cache Warming] Starting full cache warming for ${companyId}`);

  await Promise.all([
    warmEmployeeCache(companyId),
    warmAnalyticsCache(companyId),
    warmCompanySettingsCache(companyId),
  ]);

  console.log(`[Cache Warming] Completed full cache warming for ${companyId}`);
}

/**
 * Schedule cache warming (can be called from a cron job or Inngest function)
 */
export async function scheduledCacheWarming(): Promise<void> {
  try {
    const supabase = await createClient();

    // Get all active companies
    const { data: companies } = await supabase
      .from('employers')
      .select('id')
      .eq('status', 'active');

    if (!companies || companies.length === 0) {
      console.log('[Cache Warming] No active companies to warm');
      return;
    }

    console.log(`[Cache Warming] Warming cache for ${companies.length} companies`);

    // Warm caches for all companies (with some delay to avoid overload)
    for (const company of companies) {
      await warmAllCompanyCache(company.id);
      // Small delay between companies
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log('[Cache Warming] Scheduled cache warming completed');
  } catch (error) {
    console.error('[Cache Warming] Scheduled warming failed:', error);
  }
}
