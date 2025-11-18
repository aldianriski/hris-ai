/**
 * GET /api/v1/gamification/badges/earned
 * Get earned badges for a user
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth, checkEmployeeAccess } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';

const earnedBadgesSchema = z.object({
  employeeId: z.string().uuid().optional(),
});

async function handler(request: NextRequest) {
  await standardRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = earnedBadgesSchema.parse(params);

  const employeeId = validatedParams.employeeId || userContext.id;

  // Check access
  if (!checkEmployeeAccess(userContext, employeeId)) {
    return errorResponse(
      'AUTH_1004',
      'You do not have permission to access this employee\'s badges',
      403
    );
  }

  const supabase = await createClient();

  try {
    // Get earned badges
    const { data: earnedBadges, error } = await supabase
      .from('earned_badges')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('employer_id', userContext.companyId)
      .order('earned_at', { ascending: false });

    if (error) {
      throw error;
    }

    return successResponse(earnedBadges || []);
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch earned badges',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

export const GET = withErrorHandler(handler);
