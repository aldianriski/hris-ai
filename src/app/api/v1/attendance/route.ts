/**
 * GET /api/v1/attendance
 * List attendance records with filtering and pagination
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { paginatedResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';
import { PaginationSchema, DateRangeSchema } from '@/lib/api/types';

const listAttendanceSchema = z.object({
  ...PaginationSchema.shape,
  ...DateRangeSchema.shape,
  employeeId: z.string().uuid().optional(),
  status: z.enum(['present', 'late', 'absent', 'leave', 'holiday']).optional(),
  date: z.string().optional(), // Specific date (YYYY-MM-DD)
});

async function handler(request: NextRequest) {
  await standardRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = listAttendanceSchema.parse(params);

  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('attendance')
    .select('*', { count: 'exact' })
    .eq('employer_id', userContext.companyId);

  // Apply filters
  if (validatedParams.employeeId) {
    query = query.eq('employee_id', validatedParams.employeeId);
  }

  if (validatedParams.status) {
    query = query.eq('status', validatedParams.status);
  }

  if (validatedParams.date) {
    query = query.eq('date', validatedParams.date);
  } else {
    // Apply date range if no specific date
    if (validatedParams.startDate) {
      query = query.gte('date', validatedParams.startDate.split('T')[0]);
    }
    if (validatedParams.endDate) {
      query = query.lte('date', validatedParams.endDate.split('T')[0]);
    }
  }

  // Apply sorting
  if (validatedParams.sortBy) {
    query = query.order(validatedParams.sortBy, { ascending: validatedParams.sortOrder === 'asc' });
  } else {
    query = query.order('date', { ascending: false }).order('clock_in_time', { ascending: false });
  }

  // Apply pagination
  const from = (validatedParams.page - 1) * validatedParams.limit;
  const to = from + validatedParams.limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch attendance records',
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
