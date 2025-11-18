/**
 * GET /api/v1/gamification/points
 * Get user's gamification points
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth, checkEmployeeAccess } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';

const pointsSchema = z.object({
  employeeId: z.string().uuid().optional(),
});

async function handler(request: NextRequest) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = pointsSchema.parse(params);

  const employeeId = validatedParams.employeeId || userContext.id;

  // Check access
  if (!checkEmployeeAccess(userContext, employeeId)) {
    return errorResponse(
      'AUTH_1004',
      'You do not have permission to access this employee\'s points',
      403
    );
  }

  const supabase = await createClient();

  try {
    // Get or create gamification points record
    const { data: points, error: fetchError } = await supabase
      .from('gamification_points')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('employer_id', userContext.companyId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (!points) {
      // Create initial record
      const { data: employee } = await supabase
        .from('employees')
        .select('full_name')
        .eq('id', employeeId)
        .single();

      const { data: newPoints, error: createError } = await supabase
        .from('gamification_points')
        .insert({
          employee_id: employeeId,
          employer_id: userContext.companyId,
          employee_name: employee?.full_name || '',
          total_points: 0,
          badge_count: 0,
          achievement_count: 0,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return successResponse(newPoints);
    }

    return successResponse(points);
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch gamification points',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

export const GET = withErrorHandler(handler);
