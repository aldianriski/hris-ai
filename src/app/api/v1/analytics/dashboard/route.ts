/**
 * GET /api/v1/analytics/dashboard
 * Get dashboard analytics with key metrics
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';

async function handler(request: NextRequest) {
  await standardRateLimit(request);

  const userContext = await requireAuth(request);
  const supabase = await createClient();

  try {
    // Get total employees
    const { count: totalEmployees } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', userContext.companyId)
      .eq('status', 'active');

    // Get total employees on leave today
    const today = new Date().toISOString().split('T')[0];
    const { count: employeesOnLeave } = await supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', userContext.companyId)
      .eq('status', 'approved')
      .lte('start_date', today)
      .gte('end_date', today);

    // Get pending leave requests
    const { count: pendingLeaveRequests } = await supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', userContext.companyId)
      .eq('status', 'pending');

    // Get attendance today
    const { count: attendanceToday } = await supabase
      .from('attendance_records')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', userContext.companyId)
      .eq('date', today);

    // Calculate attendance rate
    const attendanceRate = totalEmployees
      ? Math.round(((attendanceToday || 0) / (totalEmployees || 1)) * 100)
      : 0;

    // Get pending performance reviews
    const { count: pendingReviews } = await supabase
      .from('performance_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', userContext.companyId)
      .eq('status', 'draft');

    // Get current month payroll status
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const { data: currentPayroll } = await supabase
      .from('payroll_periods')
      .select('status, total_net_salary, total_employees')
      .eq('employer_id', userContext.companyId)
      .eq('year', currentYear)
      .eq('month', currentMonth)
      .single();

    // Get unverified documents count
    const { count: unverifiedDocuments } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', userContext.companyId)
      .eq('is_verified', false);

    // Get recent hires (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { count: recentHires } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', userContext.companyId)
      .gte('hire_date', thirtyDaysAgo.toISOString().split('T')[0]);

    const analytics = {
      employees: {
        total: totalEmployees || 0,
        active: totalEmployees || 0,
        onLeave: employeesOnLeave || 0,
        recentHires: recentHires || 0,
      },
      attendance: {
        todayCount: attendanceToday || 0,
        rate: attendanceRate,
      },
      leave: {
        pendingRequests: pendingLeaveRequests || 0,
      },
      performance: {
        pendingReviews: pendingReviews || 0,
      },
      payroll: {
        currentMonth: {
          status: currentPayroll?.status || 'draft',
          totalAmount: currentPayroll?.total_net_salary || 0,
          employeeCount: currentPayroll?.total_employees || 0,
        },
      },
      documents: {
        unverified: unverifiedDocuments || 0,
      },
      lastUpdated: new Date().toISOString(),
    };

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
