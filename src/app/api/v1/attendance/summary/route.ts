/**
 * GET /api/v1/attendance/summary
 * Get attendance summary statistics
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';
import { DateRangeSchema } from '@/lib/api/types';

const summarySchema = z.object({
  ...DateRangeSchema.shape,
  employeeId: z.string().uuid().optional(),
});

async function handler(request: NextRequest) {
  await standardRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = summarySchema.parse(params);

  const supabase = await createClient();

  // Set default date range if not provided (current month)
  const startDate = validatedParams.startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const endDate = validatedParams.endDate || new Date().toISOString();

  // Build base query
  let query = supabase
    .from('attendance')
    .select('*')
    .eq('employer_id', userContext.companyId)
    .gte('date', startDate.split('T')[0])
    .lte('date', endDate.split('T')[0]);

  if (validatedParams.employeeId) {
    query = query.eq('employee_id', validatedParams.employeeId);
  }

  const { data: records, error } = await query;

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch attendance summary',
      500,
      { details: error.message }
    );
  }

  // Calculate summary statistics
  const totalRecords = records?.length || 0;
  const presentCount = records?.filter(r => r.status === 'present' || r.status === 'late').length || 0;
  const lateCount = records?.filter(r => r.status === 'late').length || 0;
  const absentCount = records?.filter(r => r.status === 'absent').length || 0;
  const leaveCount = records?.filter(r => r.status === 'leave').length || 0;

  // Calculate total work hours
  const totalWorkHours = records?.reduce((sum, r) => sum + (r.work_hours || 0), 0) || 0;
  const avgWorkHours = totalRecords > 0 ? totalWorkHours / totalRecords : 0;

  // Calculate attendance rate
  const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

  // Group by employee if no specific employee
  let byEmployee = null;
  if (!validatedParams.employeeId) {
    const employeeStats = new Map<string, any>();

    records?.forEach(record => {
      if (!employeeStats.has(record.employee_id)) {
        employeeStats.set(record.employee_id, {
          employeeId: record.employee_id,
          employeeName: record.employee_name,
          totalDays: 0,
          presentDays: 0,
          lateDays: 0,
          absentDays: 0,
          leaveDays: 0,
          totalWorkHours: 0,
        });
      }

      const stats = employeeStats.get(record.employee_id);
      stats.totalDays++;
      if (record.status === 'present' || record.status === 'late') stats.presentDays++;
      if (record.status === 'late') stats.lateDays++;
      if (record.status === 'absent') stats.absentDays++;
      if (record.status === 'leave') stats.leaveDays++;
      stats.totalWorkHours += record.work_hours || 0;
    });

    byEmployee = Array.from(employeeStats.values()).map(stats => ({
      ...stats,
      attendanceRate: stats.totalDays > 0 ? (stats.presentDays / stats.totalDays) * 100 : 0,
      avgWorkHours: stats.totalDays > 0 ? stats.totalWorkHours / stats.totalDays : 0,
    }));
  }

  const summary = {
    period: {
      startDate: startDate.split('T')[0],
      endDate: endDate.split('T')[0],
    },
    overall: {
      totalRecords,
      presentCount,
      lateCount,
      absentCount,
      leaveCount,
      totalWorkHours: Math.round(totalWorkHours * 100) / 100,
      avgWorkHours: Math.round(avgWorkHours * 100) / 100,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
    },
    byEmployee,
  };

  return successResponse(summary);
}

export const GET = withErrorHandler(handler);
