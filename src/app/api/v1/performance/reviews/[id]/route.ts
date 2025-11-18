/**
 * Performance Review Detail Endpoints
 * GET /api/v1/performance/reviews/:id - Get review details
 * PUT /api/v1/performance/reviews/:id - Update review
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth, requireManager } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { logPerformanceAction } from '@/lib/utils/auditLog';

// ============================================
// GET /api/v1/performance/reviews/:id - Get review details
// ============================================

async function getHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);
  const { id } = params;

  const supabase = await createClient();

  // Get the performance review
  const { data: review, error } = await supabase
    .from('performance_reviews')
    .select('*')
    .eq('id', id)
    .eq('employer_id', userContext.companyId)
    .single();

  if (error || !review) {
    return notFoundResponse('Performance review');
  }

  return successResponse(review);
}

// ============================================
// PUT /api/v1/performance/reviews/:id - Update review
// ============================================

const updateReviewSchema = z.object({
  reviewType: z.enum(['annual', 'probation', 'mid_year', 'project', 'other']).optional(),
  reviewYear: z.number().int().min(2000).max(2100).optional(),
  reviewPeriodStart: z.string().datetime('Invalid start date').optional(),
  reviewPeriodEnd: z.string().datetime('Invalid end date').optional(),
  goals: z.array(z.object({
    description: z.string().min(1),
    weight: z.number().min(0).max(100),
  })).optional(),
  ratings: z.array(z.object({
    category: z.string().min(1),
    score: z.number().min(1).max(5),
    comments: z.string().optional(),
  })).optional(),
  strengths: z.string().optional(),
  areasForImprovement: z.string().optional(),
  overallRating: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
});

async function updateHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await withRateLimit(request);

  // Only managers and above can update performance reviews
  const userContext = await requireManager(request);
  const { id } = params;

  // Parse and validate request body
  const body = await request.json();
  const validatedData = updateReviewSchema.parse(body);

  const supabase = await createClient();

  // Get existing review
  const { data: existingReview, error: fetchError } = await supabase
    .from('performance_reviews')
    .select('*')
    .eq('id', id)
    .eq('employer_id', userContext.companyId)
    .single();

  if (fetchError || !existingReview) {
    return notFoundResponse('Performance review');
  }

  // Check if review is in draft status (only draft reviews can be updated)
  if (existingReview.status !== 'draft') {
    return errorResponse(
      'BIZ_4004',
      `Cannot update review in ${existingReview.status} status. Only draft reviews can be updated.`,
      400
    );
  }

  // Validate date range if provided
  if (validatedData.reviewPeriodStart && validatedData.reviewPeriodEnd) {
    const startDate = new Date(validatedData.reviewPeriodStart);
    const endDate = new Date(validatedData.reviewPeriodEnd);

    if (endDate < startDate) {
      return errorResponse(
        'BIZ_4003',
        'Review period end date must be after start date',
        400
      );
    }
  }

  // Prepare update data
  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (validatedData.reviewType) updateData.review_type = validatedData.reviewType;
  if (validatedData.reviewYear) updateData.review_year = validatedData.reviewYear;
  if (validatedData.reviewPeriodStart) updateData.review_period_start = validatedData.reviewPeriodStart.split('T')[0];
  if (validatedData.reviewPeriodEnd) updateData.review_period_end = validatedData.reviewPeriodEnd.split('T')[0];
  if (validatedData.goals) updateData.goals = validatedData.goals;
  if (validatedData.ratings) updateData.ratings = validatedData.ratings;
  if (validatedData.strengths) updateData.strengths = validatedData.strengths;
  if (validatedData.areasForImprovement) updateData.areas_for_improvement = validatedData.areasForImprovement;
  if (validatedData.overallRating) updateData.overall_rating = validatedData.overallRating;
  if (validatedData.notes) updateData.notes = validatedData.notes;

  // Update review
  const { data: updatedReview, error } = await supabase
    .from('performance_reviews')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to update performance review',
      500,
      { details: error.message }
    );
  }

  // Log review update
  await logPerformanceAction(
    userContext,
    request,
    'review_updated',
    updatedReview.id,
    updatedReview.employee_name,
    {
      updatedFields: Object.keys(updateData).filter(k => k !== 'updated_at'),
    }
  );

  return successResponse(updatedReview);
}

export const GET = withErrorHandler(getHandler);
export const PUT = withErrorHandler(updateHandler);
