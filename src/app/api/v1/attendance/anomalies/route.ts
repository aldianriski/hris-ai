/**
 * GET /api/v1/attendance/anomalies - List attendance anomalies
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';

const listAnomaliesSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

async function handler(request: NextRequest) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = listAnomaliesSchema.parse(params);

  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('attendance_anomalies')
    .select('*', { count: 'exact' })
    .eq('employer_id', userContext.companyId);

  // Apply filters
  if (validatedParams.status) {
    query = query.eq('status', validatedParams.status);
  }

  if (validatedParams.severity) {
    query = query.eq('severity', validatedParams.severity);
  }

  if (validatedParams.startDate) {
    query = query.gte('detected_at', validatedParams.startDate);
  }

  if (validatedParams.endDate) {
    query = query.lte('detected_at', validatedParams.endDate);
  }

  // Apply sorting - newest first
  query = query.order('detected_at', { ascending: false });

  // Apply pagination
  const from = (validatedParams.page - 1) * validatedParams.limit;
  const to = from + validatedParams.limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch attendance anomalies',
      500,
      { details: error.message }
    );
  }

  return paginatedResponse(
    data || [],
    count || 0,
    validatedParams.page,
    validatedParams.limit
  );
}

export const GET = withErrorHandler(handler);
