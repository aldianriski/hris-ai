/**
 * GET /api/v1/analytics/attendance
 * Get attendance analytics (attendance rate, trends, late arrivals, etc.)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';

const attendanceAnalyticsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  employeeId: z.string().uuid().optional(),
  department: z.string().optional(),
});

async function handler(request: NextRequest) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = attendanceAnalyticsSchema.parse(params);

  const supabase = await createClient();

  try {
    // Default to current month
    const endDate = validatedParams.endDate ? new Date(validatedParams.endDate) : new Date();
    const startDate = validatedParams.startDate
      ? new Date(validatedParams.startDate)
      : new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    // Build attendance query
    let attendanceQuery = supabase
      .from('attendance_records')
      .select('*')
      .eq('employer_id', userContext.companyId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    if (validatedParams.employeeId) {
      attendanceQuery = attendanceQuery.eq('employee_id', validatedParams.employeeId);
    }

    if (validatedParams.department) {
      attendanceQuery = attendanceQuery.eq('department', validatedParams.department);
    }

    const { data: attendanceRecords, error } = await attendanceQuery;

    if (error) {
      throw error;
    }

    // Get total active employees for the period
    let employeeQuery = supabase
      .from('employees')
      .select('id', { count: 'exact', head: true })
      .eq('employer_id', userContext.companyId)
      .eq('status', 'active');

    if (validatedParams.department) {
      employeeQuery = employeeQuery.eq('department', validatedParams.department);
    }

    const { count: totalEmployees } = await employeeQuery;

    // Calculate working days in the period (excluding weekends)
    const workingDays = getWorkingDays(startDate, endDate);

    // Calculate expected attendance
    const expectedAttendance = (totalEmployees || 0) * workingDays;

    // Calculate actual attendance
    const actualAttendance = attendanceRecords?.length || 0;

    // Calculate attendance rate
    const attendanceRate = expectedAttendance > 0
      ? Math.round((actualAttendance / expectedAttendance) * 100 * 10) / 10
      : 0;

    // Calculate late arrivals (clock_in after 09:00)
    const lateArrivals = attendanceRecords?.filter(record => {
      if (record.clock_in) {
        const clockInTime = new Date(record.clock_in);
        const hour = clockInTime.getHours();
        const minute = clockInTime.getMinutes();
        return hour > 9 || (hour === 9 && minute > 0);
      }
      return false;
    }).length || 0;

    // Calculate early departures (clock_out before 17:00)
    const earlyDepartures = attendanceRecords?.filter(record => {
      if (record.clock_out) {
        const clockOutTime = new Date(record.clock_out);
        const hour = clockOutTime.getHours();
        return hour < 17;
      }
      return false;
    }).length || 0;

    // Calculate average work hours
    const recordsWithHours = attendanceRecords?.filter(r => r.work_hours) || [];
    const totalHours = recordsWithHours.reduce((sum, r) => sum + (r.work_hours || 0), 0);
    const averageWorkHours = recordsWithHours.length > 0
      ? Math.round((totalHours / recordsWithHours.length) * 10) / 10
      : 0;

    // Daily attendance trend
    const dailyTrend: Record<string, number> = {};
    attendanceRecords?.forEach(record => {
      if (record.date) {
        dailyTrend[record.date] = (dailyTrend[record.date] || 0) + 1;
      }
    });

    const analytics = {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        workingDays,
      },
      overview: {
        totalEmployees: totalEmployees || 0,
        expectedAttendance,
        actualAttendance,
        attendanceRate: `${attendanceRate}%`,
      },
      punctuality: {
        lateArrivals,
        lateArrivalRate: actualAttendance > 0
          ? `${Math.round((lateArrivals / actualAttendance) * 100 * 10) / 10}%`
          : '0%',
        earlyDepartures,
      },
      workHours: {
        average: averageWorkHours,
        total: Math.round(totalHours * 10) / 10,
      },
      trends: {
        daily: dailyTrend,
      },
      lastUpdated: new Date().toISOString(),
    };

    return successResponse(analytics);
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch attendance analytics',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

// Helper function to calculate working days (excluding weekends)
function getWorkingDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

export const GET = withErrorHandler(handler);
