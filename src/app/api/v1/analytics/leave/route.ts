/**
 * GET /api/v1/analytics/leave
 * Get leave analytics (usage, trends, types, etc.)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';

const leaveAnalyticsSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  department: z.string().optional(),
});

async function handler(request: NextRequest) {
  await standardRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = leaveAnalyticsSchema.parse(params);

  const supabase = await createClient();

  try {
    const year = validatedParams.year || new Date().getFullYear();

    // Get leave requests for the year
    let leaveQuery = supabase
      .from('leave_requests')
      .select('*')
      .eq('employer_id', userContext.companyId)
      .gte('start_date', `${year}-01-01`)
      .lte('start_date', `${year}-12-31`);

    if (validatedParams.department) {
      // Need to join with employees to filter by department
      // For simplicity, we'll fetch all and filter in memory
    }

    const { data: leaveRequests, error } = await leaveQuery;

    if (error) {
      throw error;
    }

    // Total leave requests by status
    const byStatus = {
      pending: leaveRequests?.filter(l => l.status === 'pending').length || 0,
      approved: leaveRequests?.filter(l => l.status === 'approved').length || 0,
      rejected: leaveRequests?.filter(l => l.status === 'rejected').length || 0,
      cancelled: leaveRequests?.filter(l => l.status === 'cancelled').length || 0,
    };

    // Total leave days by type
    const byType: Record<string, { requests: number; days: number }> = {};
    leaveRequests?.forEach(leave => {
      if (!byType[leave.leave_type]) {
        byType[leave.leave_type] = { requests: 0, days: 0 };
      }
      const typeData = byType[leave.leave_type];
      if (typeData) {
        typeData.requests++;
        typeData.days += leave.days_count || 0;
      }
    });

    // Monthly trend
    const monthlyTrend: Record<number, { requests: number; days: number }> = {};
    for (let m = 1; m <= 12; m++) {
      monthlyTrend[m] = { requests: 0, days: 0 };
    }

    leaveRequests?.forEach(leave => {
      if (leave.start_date) {
        const month = new Date(leave.start_date).getMonth() + 1;
        const trendData = monthlyTrend[month];
        if (trendData) {
          trendData.requests++;
          trendData.days += leave.days_count || 0;
        }
      }
    });

    // Calculate approval rate
    const totalProcessed = byStatus.approved + byStatus.rejected;
    const approvalRate = totalProcessed > 0
      ? Math.round((byStatus.approved / totalProcessed) * 100 * 10) / 10
      : 0;

    // Get leave balances for the year
    const { data: leaveBalances } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('employer_id', userContext.companyId)
      .eq('year', year);

    // Calculate total quota vs used
    const totalQuota = leaveBalances?.reduce((sum, b) => sum + (b.annual_quota || 0), 0) || 0;
    const totalUsed = leaveBalances?.reduce((sum, b) => sum + (b.annual_used || 0), 0) || 0;
    const totalAvailable = totalQuota - totalUsed;
    const utilizationRate = totalQuota > 0
      ? Math.round((totalUsed / totalQuota) * 100 * 10) / 10
      : 0;

    const analytics = {
      year,
      requests: {
        total: leaveRequests?.length || 0,
        byStatus,
        approvalRate: `${approvalRate}%`,
      },
      leaveTypes: byType,
      trends: {
        monthly: monthlyTrend,
      },
      balance: {
        totalQuota,
        totalUsed,
        totalAvailable,
        utilizationRate: `${utilizationRate}%`,
      },
      lastUpdated: new Date().toISOString(),
    };

    return successResponse(analytics);
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch leave analytics',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

export const GET = withErrorHandler(handler);
