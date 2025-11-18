/**
 * POST /api/v1/performance/reviews/:id/submit
 * Submit performance review for employee acknowledgment
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireManager } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { logPerformanceAction } from '@/lib/utils/auditLog';

async function handler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await withRateLimit(request);

  // Only managers and above can submit reviews
  const userContext = await requireManager(request);
  const { id } = params;

  const supabase = await createClient();

  // Get the performance review
  const { data: review, error: fetchError } = await supabase
    .from('performance_reviews')
    .select('*')
    .eq('id', id)
    .eq('employer_id', userContext.companyId)
    .single();

  if (fetchError || !review) {
    return notFoundResponse('Performance review');
  }

  // Check if review is in draft status
  if (review.status !== 'draft') {
    return errorResponse(
      'BIZ_4004',
      `Cannot submit review in ${review.status} status. Only draft reviews can be submitted.`,
      400
    );
  }

  // Validate that required fields are filled
  if (!review.overall_rating) {
    return errorResponse(
      'BIZ_4003',
      'Overall rating is required before submitting the review',
      400
    );
  }

  if (!review.ratings || review.ratings.length === 0) {
    return errorResponse(
      'BIZ_4003',
      'At least one rating category is required before submitting the review',
      400
    );
  }

  // Update review status to submitted
  const { data: updatedReview, error } = await supabase
    .from('performance_reviews')
    .update({
      status: 'submitted',
      submitted_by: userContext.id,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to submit performance review',
      500,
      { details: error.message }
    );
  }

  // Log review submission
  await logPerformanceAction(
    userContext,
    request,
    'review_submitted',
    updatedReview.id,
    updatedReview.employee_name,
    {
      submittedBy: userContext.email,
      overallRating: updatedReview.overall_rating,
      reviewType: updatedReview.review_type,
      reviewYear: updatedReview.review_year,
    }
  );

  // TODO: Send notification to employee for acknowledgment
  // TODO: Trigger performance.review_submitted webhook

  return successResponse(updatedReview);
}

export const POST = withErrorHandler(handler);
