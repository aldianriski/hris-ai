/**
 * GET /api/v1/analytics/dashboard
 * Get dashboard analytics with key metrics
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { getCached, dashboardKey, CacheTTL } from '@/lib/cache';

async function handler(request: NextRequest) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);

  try {
    // Use cache for dashboard analytics (5 min TTL)
    const analytics = await getCached(
      dashboardKey(userContext.companyId, userContext.id),
      async () => {
        const supabase = await createClient();
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;

        // Get all employees with dates for trend analysis
        const { data: allEmployees } = await supabase
          .from('employees')
          .select('id, status, hire_date, termination_date, department, base_salary')
          .eq('employer_id', userContext.companyId);

        const activeEmployees = allEmployees?.filter(e => e.status === 'active') || [];
        const totalHeadcount = activeEmployees.length;

        // Calculate headcount growth (vs 30 days ago)
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const headcountThirtyDaysAgo = allEmployees?.filter(emp => {
          const hired = emp.hire_date ? new Date(emp.hire_date) <= thirtyDaysAgo : false;
          const notTerminated = !emp.termination_date || new Date(emp.termination_date) > thirtyDaysAgo;
          return hired && notTerminated;
        }).length || 0;
        const headcountGrowth = headcountThirtyDaysAgo > 0
          ? Math.round(((totalHeadcount - headcountThirtyDaysAgo) / headcountThirtyDaysAgo) * 100 * 10) / 10
          : 0;

        // Calculate turnover rate (last 90 days)
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const terminations = allEmployees?.filter(emp => {
          if (emp.termination_date) {
            const termDate = new Date(emp.termination_date);
            return termDate >= ninetyDaysAgo && termDate <= today;
          }
          return false;
        }).length || 0;
        const avgHeadcount = (totalHeadcount + terminations) / 2;
        const turnoverRate = avgHeadcount > 0
          ? Math.round((terminations / avgHeadcount) * 100 * 10) / 10
          : 0;

        // Get attendance data for absenteeism
        const { data: attendanceRecords } = await supabase
          .from('attendance_records')
          .select('date, employee_id, status')
          .eq('employer_id', userContext.companyId)
          .gte('date', ninetyDaysAgo.toISOString().split('T')[0]);

        // Calculate absenteeism rate
        const workingDays = 60; // approx working days in 90 days
        const expectedAttendance = totalHeadcount * workingDays;
        const actualAttendance = attendanceRecords?.length || 0;
        const absenteeismRate = expectedAttendance > 0
          ? Math.round((1 - actualAttendance / expectedAttendance) * 100 * 10) / 10
          : 0;

        // Calculate overtime hours
        const { data: overtimeRecords } = await supabase
          .from('attendance_records')
          .select('overtime_hours')
          .eq('employer_id', userContext.companyId)
          .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
          .not('overtime_hours', 'is', null);
        const overtimeHours = overtimeRecords?.reduce((sum, r) => sum + (r.overtime_hours || 0), 0) || 0;

        // Build headcount trend (last 6 months)
        const headcountTrend = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(currentYear, currentMonth - 1 - i, 1);
          const monthStr = monthDate.toLocaleDateString('en-US', { month: 'short' });
          const count = allEmployees?.filter(emp => {
            const hired = emp.hire_date ? new Date(emp.hire_date) <= monthDate : false;
            const notTerminated = !emp.termination_date || new Date(emp.termination_date) > monthDate;
            return hired && notTerminated && emp.status === 'active';
          }).length || 0;
          headcountTrend.push({ month: monthStr, count });
        }

        // Build turnover data (last 6 months)
        const turnoverData = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(currentYear, currentMonth - 1 - i, 1);
          const monthStr = monthDate.toLocaleDateString('en-US', { month: 'short' });
          const voluntary = 0; // Would need termination_reason field
          const involuntary = allEmployees?.filter(emp => {
            if (emp.termination_date) {
              const termDate = new Date(emp.termination_date);
              return termDate.getMonth() === monthDate.getMonth() &&
                     termDate.getFullYear() === monthDate.getFullYear();
            }
            return false;
          }).length || 0;
          turnoverData.push({ month: monthStr, voluntary, involuntary });
        }

        // Department distribution
        const deptCounts: Record<string, number> = {};
        activeEmployees.forEach(emp => {
          const dept = emp.department || 'Unassigned';
          deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        });
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
        const departmentDistribution = Object.entries(deptCounts).map(([name, value], idx) => ({
          name,
          value,
          color: colors[idx % colors.length],
        }));

        // Cost trends (last 6 months)
        const { data: payrollPeriods } = await supabase
          .from('payroll_periods')
          .select('month, year, total_gross_salary, total_deductions')
          .eq('employer_id', userContext.companyId)
          .gte('year', currentMonth <= 6 ? currentYear - 1 : currentYear);

        const costTrends = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(currentYear, currentMonth - 1 - i, 1);
          const monthStr = monthDate.toLocaleDateString('en-US', { month: 'short' });
          const payroll = payrollPeriods?.find(p =>
            p.month === (monthDate.getMonth() + 1) && p.year === monthDate.getFullYear()
          );
          const salary = payroll?.total_gross_salary || 0;
          const benefits = (payroll?.total_deductions || 0) * 0.3; // Estimate
          costTrends.push({ month: monthStr, salary, benefits, total: salary + benefits });
        }

        return {
          kpis: {
            totalHeadcount,
            headcountGrowth,
            turnoverRate,
            turnoverTrend: 0, // Would need historical comparison
            avgTimeToHire: 14, // Default - would need recruitment data
            timeToHireTrend: 0,
            costPerHire: 5000000, // Default - would need recruitment cost data
            costTrend: 0,
            absenteeismRate,
            absenteeismTrend: 0,
            overtimeHours,
            overtimeTrend: 0,
          },
          headcountTrend,
          turnoverData,
          departmentDistribution,
          costTrends,
        };
      },
      CacheTTL.SHORT // 5 minutes
    );

    return successResponse(analytics);
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch dashboard analytics',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

export const GET = withErrorHandler(handler);
