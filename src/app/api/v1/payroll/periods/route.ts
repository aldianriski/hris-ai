/**
 * Payroll Period Endpoints
 * GET /api/v1/payroll/periods - List payroll periods
 * POST /api/v1/payroll/periods - Create payroll period
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireHR } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { PaginationSchema } from '@/lib/api/types';
import { logPayrollAction } from '@/lib/utils/auditLog';

// ============================================
// GET /api/v1/payroll/periods - List payroll periods
// ============================================

const listPeriodsSchema = z.object({
  ...PaginationSchema.shape,
  status: z.enum(['draft', 'processing', 'approved', 'paid']).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

async function listHandler(request: NextRequest) {
  await withRateLimit(request);

  const userContext = await requireHR(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = listPeriodsSchema.parse(params);

  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('payroll_periods')
    .select('*', { count: 'exact' })
    .eq('employer_id', userContext.companyId);

  // Apply filters
  if (validatedParams.status) {
    query = query.eq('status', validatedParams.status);
  }

  if (validatedParams.year) {
    query = query.eq('year', validatedParams.year);
  }

  if (validatedParams.month) {
    query = query.eq('month', validatedParams.month);
  }

  // Apply sorting
  if (validatedParams.sortBy) {
    query = query.order(validatedParams.sortBy, { ascending: validatedParams.sortOrder === 'asc' });
  } else {
    query = query.order('year', { ascending: false }).order('month', { ascending: false });
  }

  // Apply pagination
  const from = (validatedParams.page - 1) * validatedParams.limit;
  const to = from + validatedParams.limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch payroll periods',
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

// ============================================
// POST /api/v1/payroll/periods - Create payroll period
// ============================================

const createPeriodSchema = z.object({
  periodStart: z.string().datetime('Invalid start date'),
  periodEnd: z.string().datetime('Invalid end date'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

async function createHandler(request: NextRequest) {
  await withRateLimit(request);

  // Only HR can create payroll periods
  const userContext = await requireHR(request);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = createPeriodSchema.parse(body);

  const supabase = await createClient();

  // Check if period already exists for this month/year
  const { data: existing } = await supabase
    .from('payroll_periods')
    .select('id')
    .eq('employer_id', userContext.companyId)
    .eq('year', validatedData.year)
    .eq('month', validatedData.month)
    .single();

  if (existing) {
    return errorResponse(
      'RES_3002',
      'Payroll period already exists for this month',
      409
    );
  }

  // Create payroll period
  const periodData = {
    employer_id: userContext.companyId,
    period_start: validatedData.periodStart.split('T')[0],
    period_end: validatedData.periodEnd.split('T')[0],
    month: validatedData.month,
    year: validatedData.year,
    status: 'draft',
    total_employees: 0,
    total_gross_salary: 0,
    total_deductions: 0,
    total_net_salary: 0,
  };

  const { data: period, error } = await supabase
    .from('payroll_periods')
    .insert(periodData)
    .select()
    .single();

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to create payroll period',
      500,
      { details: error.message }
    );
  }

  // Log payroll period creation
  await logPayrollAction(
    userContext,
    request,
    'created',
    period.id,
    {
      year: validatedData.year,
      month: validatedData.month,
    }
  );

  return successResponse(period, 201);
}

export const GET = withErrorHandler(listHandler);
export const POST = withErrorHandler(createHandler);
