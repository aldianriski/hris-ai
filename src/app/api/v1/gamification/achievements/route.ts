/**
 * GET /api/v1/gamification/achievements
 * Get employee achievements and milestones
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth, checkEmployeeAccess } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';

const achievementsSchema = z.object({
  employeeId: z.string().uuid().optional(),
});

async function handler(request: NextRequest) {
  await standardRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = achievementsSchema.parse(params);

  const employeeId = validatedParams.employeeId || userContext.id;

  // Check access
  if (!checkEmployeeAccess(userContext, employeeId)) {
    return errorResponse(
      'AUTH_1004',
      'You do not have permission to access this employee\'s achievements',
      403
    );
  }

  const supabase = await createClient();

  try {
    // Get employee data
    const { data: employee } = await supabase
      .from('employees')
      .select('hire_date, full_name')
      .eq('id', employeeId)
      .single();

    // Calculate tenure-based achievements
    const achievements = [];
    if (employee?.hire_date) {
      const hireDate = new Date(employee.hire_date);
      const now = new Date();
      const monthsEmployed = (now.getFullYear() - hireDate.getFullYear()) * 12 +
        (now.getMonth() - hireDate.getMonth());

      if (monthsEmployed >= 12) {
        achievements.push({
          id: 'anniversary-1',
          name: '1 Year Anniversary',
          description: 'Completed 1 year with the company',
          icon: '🎂',
          earnedAt: new Date(hireDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      if (monthsEmployed >= 24) {
        achievements.push({
          id: 'anniversary-2',
          name: '2 Year Anniversary',
          description: 'Completed 2 years with the company',
          icon: '🎉',
          earnedAt: new Date(hireDate.getTime() + 730 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      if (monthsEmployed >= 60) {
        achievements.push({
          id: 'anniversary-5',
          name: '5 Year Anniversary',
          description: 'Completed 5 years with the company',
          icon: '🏆',
          earnedAt: new Date(hireDate.getTime() + 1825 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    // Get attendance-based achievements
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: attendanceCount } = await supabase
      .from('attendance_records')
      .select('*', { count: 'exact', head: true })
      .eq('employee_id', employeeId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

    if (attendanceCount && attendanceCount >= 30) {
      achievements.push({
        id: 'perfect-attendance-30',
        name: 'Perfect Attendance (30 days)',
        description: '30 consecutive days of attendance',
        icon: '🏆',
        earnedAt: new Date().toISOString(),
      });
    }

    // Get performance-based achievements
    const { data: reviews } = await supabase
      .from('performance_reviews')
      .select('overall_rating, status')
      .eq('employee_id', employeeId)
      .eq('status', 'completed');

    const fiveStarReviews = reviews?.filter(r => r.overall_rating === 5).length || 0;
    if (fiveStarReviews >= 1) {
      achievements.push({
        id: 'top-performer',
        name: 'Top Performer',
        description: 'Received a 5-star performance review',
        icon: '⭐',
        earnedAt: new Date().toISOString(),
      });
    }

    // Get document-based achievements
    const { count: verifiedDocs } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('employee_id', employeeId)
      .eq('is_verified', true);

    if (verifiedDocs && verifiedDocs >= 5) {
      achievements.push({
        id: 'document-master',
        name: 'Document Master',
        description: 'Uploaded and verified 5+ documents',
        icon: '📋',
        earnedAt: new Date().toISOString(),
      });
    }

    return successResponse({
      employeeId,
      employeeName: employee?.full_name,
      achievements,
      totalAchievements: achievements.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch achievements',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

export const GET = withErrorHandler(handler);
