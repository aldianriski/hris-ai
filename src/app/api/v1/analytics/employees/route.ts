/**
 * GET /api/v1/analytics/employees
 * Get employee analytics (headcount, department distribution, turnover, etc.)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { getCached, analyticsKey, CacheTTL } from '@/lib/cache';

const employeeAnalyticsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  department: z.string().optional(),
});

async function handler(request: NextRequest) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = employeeAnalyticsSchema.parse(params);

  try {
    // Create cache key based on parameters
    const cacheKey = analyticsKey(
      userContext.companyId,
      'employees',
      JSON.stringify(validatedParams)
    );

    // Use cache for employee analytics (15 min TTL)
    const analytics = await getCached(
      cacheKey,
      async () => {
        const supabase = await createClient();

        // Base query
        let baseQuery = supabase
          .from('employees')
          .select('*')
          .eq('employer_id', userContext.companyId);

        if (validatedParams.department) {
          baseQuery = baseQuery.eq('department', validatedParams.department);
        }

        const { data: employees, error } = await baseQuery;

        if (error) {
          throw error;
        }

    // Calculate headcount by status
    const headcountByStatus = {
      active: employees?.filter(e => e.status === 'active').length || 0,
      inactive: employees?.filter(e => e.status === 'inactive').length || 0,
      terminated: employees?.filter(e => e.status === 'terminated').length || 0,
    };

    // Department distribution
    const departmentDistribution: Record<string, number> = {};
    employees?.forEach(emp => {
      if (emp.department) {
        departmentDistribution[emp.department] = (departmentDistribution[emp.department] || 0) + 1;
      }
    });

    // Position distribution
    const positionDistribution: Record<string, number> = {};
    employees?.forEach(emp => {
      if (emp.position) {
        positionDistribution[emp.position] = (positionDistribution[emp.position] || 0) + 1;
      }
    });

    // Calculate average tenure (in months)
    const activeEmployees = employees?.filter(e => e.status === 'active') || [];
    const totalTenure = activeEmployees.reduce((sum, emp) => {
      if (emp.hire_date) {
        const hireDate = new Date(emp.hire_date);
        const now = new Date();
        const months = (now.getFullYear() - hireDate.getFullYear()) * 12 + (now.getMonth() - hireDate.getMonth());
        return sum + months;
      }
      return sum;
    }, 0);
    const averageTenure = activeEmployees.length > 0 ? Math.round(totalTenure / activeEmployees.length) : 0;

    // Get new hires in the period (default last 3 months)
    const endDate = validatedParams.endDate ? new Date(validatedParams.endDate) : new Date();
    const startDate = validatedParams.startDate
      ? new Date(validatedParams.startDate)
      : new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

    const newHires = employees?.filter(emp => {
      if (emp.hire_date) {
        const hireDate = new Date(emp.hire_date);
        return hireDate >= startDate && hireDate <= endDate;
      }
      return false;
    }).length || 0;

    // Calculate terminations in the period
    const terminations = employees?.filter(emp => {
      if (emp.termination_date) {
        const termDate = new Date(emp.termination_date);
        return termDate >= startDate && termDate <= endDate;
      }
      return false;
    }).length || 0;

    // Calculate turnover rate (terminations / average employees * 100)
    const averageEmployees = (headcountByStatus.active + terminations) / 2;
    const turnoverRate = averageEmployees > 0
      ? Math.round((terminations / averageEmployees) * 100 * 10) / 10
      : 0;

        // Format department breakdown for frontend
        const departmentBreakdown = Object.entries(departmentDistribution).map(([department, count]) => ({
          department,
          count,
        }));

        // Calculate growth rate (net growth / starting headcount * 100)
        const startingHeadcount = headcountByStatus.active + terminations;
        const growthRate = startingHeadcount > 0
          ? Math.round(((newHires - terminations) / startingHeadcount) * 100 * 10) / 10
          : 0;

        return {
          totalEmployees: employees?.length || 0,
          activeEmployees: headcountByStatus.active,
          departmentBreakdown,
          growthRate,
        };
      },
      CacheTTL.MEDIUM // 15 minutes
    );

    return successResponse(analytics);
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch employee analytics',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

export const GET = withErrorHandler(handler);
