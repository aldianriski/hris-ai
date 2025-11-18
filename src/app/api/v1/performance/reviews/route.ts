/**
 * Performance Review Endpoints
 * GET /api/v1/performance/reviews - List performance reviews
 * POST /api/v1/performance/reviews - Create performance review
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth, requireManager } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';
import { PaginationSchema } from '@/lib/api/types';
import { logPerformanceAction } from '@/lib/utils/auditLog';

// ============================================
// GET /api/v1/performance/reviews - List reviews
// ============================================

const listReviewsSchema = z.object({
  ...PaginationSchema.shape,
  employeeId: z.string().uuid().optional(),
  reviewerId: z.string().uuid().optional(),
  status: z.enum(['draft', 'submitted', 'completed', 'cancelled']).optional(),
  reviewType: z.enum(['annual', 'probation', 'mid_year', 'project', 'other']).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

async function listHandler(request: NextRequest) {
  await standardRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = listReviewsSchema.parse(params);

  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('performance_reviews')
    .select('*', { count: 'exact' })
    .eq('employer_id', userContext.companyId);

  // Apply filters
  if (validatedParams.employeeId) {
    query = query.eq('employee_id', validatedParams.employeeId);
  }

  if (validatedParams.reviewerId) {
    query = query.eq('reviewer_id', validatedParams.reviewerId);
  }

  if (validatedParams.status) {
    query = query.eq('status', validatedParams.status);
  }

  if (validatedParams.reviewType) {
    query = query.eq('review_type', validatedParams.reviewType);
  }

  if (validatedParams.year) {
    query = query.eq('review_year', validatedParams.year);
  }

  // Apply sorting
  if (validatedParams.sortBy) {
    query = query.order(validatedParams.sortBy, { ascending: validatedParams.sortOrder === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  // Apply pagination
  const from = (validatedParams.page - 1) * validatedParams.limit;
  const to = from + validatedParams.limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch performance reviews',
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
// POST /api/v1/performance/reviews - Create review
// ============================================

const createReviewSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  reviewerId: z.string().uuid('Invalid reviewer ID'),
  reviewType: z.enum(['annual', 'probation', 'mid_year', 'project', 'other']),
  reviewYear: z.number().int().min(2000).max(2100),
  reviewPeriodStart: z.string().datetime('Invalid start date'),
  reviewPeriodEnd: z.string().datetime('Invalid end date'),
  goals: z.array(z.object({
    description: z.string().min(1),
    weight: z.number().min(0).max(100),
  })).optional(),
  notes: z.string().optional(),
});

async function createHandler(request: NextRequest) {
  await standardRateLimit(request);

  // Only managers and above can create performance reviews
  const userContext = await requireManager(request);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = createReviewSchema.parse(body);

  const supabase = await createClient();

  // Verify employee belongs to company
  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('id, full_name, employer_id, position, department')
    .eq('id', validatedData.employeeId)
    .single();

  if (employeeError || !employee) {
    return errorResponse(
      'RES_3001',
      'Employee not found',
      404
    );
  }

  if (employee.employer_id !== userContext.companyId) {
    return errorResponse(
      'AUTH_1004',
      'Employee does not belong to your company',
      403
    );
  }

  // Verify reviewer belongs to company
  const { data: reviewer, error: reviewerError } = await supabase
    .from('employees')
    .select('id, full_name, employer_id')
    .eq('id', validatedData.reviewerId)
    .single();

  if (reviewerError || !reviewer) {
    return errorResponse(
      'RES_3001',
      'Reviewer not found',
      404
    );
  }

  if (reviewer.employer_id !== userContext.companyId) {
    return errorResponse(
      'AUTH_1004',
      'Reviewer does not belong to your company',
      403
    );
  }

  // Validate date range
  const startDate = new Date(validatedData.reviewPeriodStart);
  const endDate = new Date(validatedData.reviewPeriodEnd);

  if (endDate < startDate) {
    return errorResponse(
      'BIZ_4003',
      'Review period end date must be after start date',
      400
    );
  }

  // Create performance review
  const reviewData = {
    employee_id: validatedData.employeeId,
    employer_id: employee.employer_id,
    employee_name: employee.full_name,
    employee_position: employee.position,
    employee_department: employee.department,
    reviewer_id: validatedData.reviewerId,
    reviewer_name: reviewer.full_name,
    review_type: validatedData.reviewType,
    review_year: validatedData.reviewYear,
    review_period_start: validatedData.reviewPeriodStart.split('T')[0],
    review_period_end: validatedData.reviewPeriodEnd.split('T')[0],
    status: 'draft',
    goals: validatedData.goals || [],
    notes: validatedData.notes,
    created_by: userContext.id,
  };

  const { data: review, error } = await supabase
    .from('performance_reviews')
    .insert(reviewData)
    .select()
    .single();

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to create performance review',
      500,
      { details: error.message }
    );
  }

  // Log review creation
  await logPerformanceAction(
    userContext,
    request,
    'review_created',
    review.id,
    employee.full_name,
    {
      reviewType: validatedData.reviewType,
      reviewYear: validatedData.reviewYear,
      reviewerName: reviewer.full_name,
    }
  );

  // TODO: Send notification to reviewer
  // TODO: Send notification to employee

  return successResponse(review, 201);
}

export const GET = withErrorHandler(listHandler);
export const POST = withErrorHandler(createHandler);
