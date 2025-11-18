/**
 * GET /api/v1/gamification/leaderboard
 * Get points leaderboard
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';

const leaderboardSchema = z.object({
  period: z.enum(['all_time', 'monthly', 'weekly']).default('all_time'),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

async function handler(request: NextRequest) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = leaderboardSchema.parse(params);

  const supabase = await createClient();

  try {
    // Calculate date range based on period
    let startDate: string | null = null;
    const now = new Date();

    if (validatedParams.period === 'weekly') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = weekAgo.toISOString();
    } else if (validatedParams.period === 'monthly') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      startDate = monthAgo.toISOString();
    }

    // Get gamification points
    let query = supabase
      .from('gamification_points')
      .select('employee_id, employee_name, total_points, badge_count, last_activity_at')
      .eq('employer_id', userContext.companyId);

    if (startDate) {
      query = query.gte('last_activity_at', startDate);
    }

    const { data: pointsData, error } = await query
      .order('total_points', { ascending: false })
      .limit(validatedParams.limit);

    if (error) {
      throw error;
    }

    // Add rank to each entry
    const leaderboard = pointsData?.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    })) || [];

    return successResponse({
      period: validatedParams.period,
      leaderboard,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch leaderboard',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

export const GET = withErrorHandler(handler);
