/**
 * GET /api/v1/analytics/performance
 * Get performance analytics (review completion, ratings distribution, etc.)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireManager } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';

const performanceAnalyticsSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  department: z.string().optional(),
  reviewType: z.enum(['annual', 'probation', 'mid_year', 'project', 'other']).optional(),
});

async function handler(request: NextRequest) {
  await standardRateLimit(request);

  // Only managers and above can access performance analytics
  const userContext = await requireManager(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = performanceAnalyticsSchema.parse(params);

  const supabase = await createClient();

  try {
    const year = validatedParams.year || new Date().getFullYear();

    // Get performance reviews for the year
    let reviewQuery = supabase
      .from('performance_reviews')
      .select('*')
      .eq('employer_id', userContext.companyId)
      .eq('review_year', year);

    if (validatedParams.department) {
      reviewQuery = reviewQuery.eq('employee_department', validatedParams.department);
    }

    if (validatedParams.reviewType) {
      reviewQuery = reviewQuery.eq('review_type', validatedParams.reviewType);
    }

    const { data: reviews, error } = await reviewQuery;

    if (error) {
      throw error;
    }

    // Reviews by status
    const byStatus = {
      draft: reviews?.filter(r => r.status === 'draft').length || 0,
      submitted: reviews?.filter(r => r.status === 'submitted').length || 0,
      completed: reviews?.filter(r => r.status === 'completed').length || 0,
      cancelled: reviews?.filter(r => r.status === 'cancelled').length || 0,
    };

    // Reviews by type
    const byType: Record<string, number> = {};
    reviews?.forEach(review => {
      if (review.review_type) {
        byType[review.review_type] = (byType[review.review_type] || 0) + 1;
      }
    });

    // Ratings distribution (1-5 scale)
    const ratingsDistribution = {
      1: reviews?.filter(r => r.overall_rating === 1).length || 0,
      2: reviews?.filter(r => r.overall_rating === 2).length || 0,
      3: reviews?.filter(r => r.overall_rating === 3).length || 0,
      4: reviews?.filter(r => r.overall_rating === 4).length || 0,
      5: reviews?.filter(r => r.overall_rating === 5).length || 0,
    };

    // Calculate average rating
    const reviewsWithRating = reviews?.filter(r => r.overall_rating) || [];
    const totalRating = reviewsWithRating.reduce((sum, r) => sum + (r.overall_rating || 0), 0);
    const averageRating = reviewsWithRating.length > 0
      ? Math.round((totalRating / reviewsWithRating.length) * 10) / 10
      : 0;

    // Completion rate
    const totalReviews = reviews?.length || 0;
    const completedReviews = byStatus.submitted + byStatus.completed;
    const completionRate = totalReviews > 0
      ? Math.round((completedReviews / totalReviews) * 100 * 10) / 10
      : 0;

    // Department performance (if applicable)
    const byDepartment: Record<string, {
      count: number;
      averageRating: number;
      completed: number;
    }> = {};

    reviews?.forEach(review => {
      const dept = review.employee_department || 'Unknown';
      if (!byDepartment[dept]) {
        byDepartment[dept] = {
          count: 0,
          averageRating: 0,
          completed: 0,
        };
      }
      const deptData = byDepartment[dept];
      if (deptData) {
        deptData.count++;
        if (review.overall_rating) {
          deptData.averageRating += review.overall_rating;
        }
        if (review.status === 'submitted' || review.status === 'completed') {
          deptData.completed++;
        }
      }
    });

    // Calculate department averages
    Object.keys(byDepartment).forEach(dept => {
      const deptData = byDepartment[dept];
      if (deptData) {
        deptData.averageRating = deptData.count > 0
          ? Math.round((deptData.averageRating / deptData.count) * 10) / 10
          : 0;
      }
    });

    // Get active employees count for completion tracking
    const { count: totalEmployees } = await supabase
      .from('employees')
      .select('id', { count: 'exact', head: true })
      .eq('employer_id', userContext.companyId)
      .eq('status', 'active');

    const analytics = {
      year,
      overview: {
        totalReviews,
        completedReviews,
        completionRate: `${completionRate}%`,
        totalEmployees: totalEmployees || 0,
        reviewCoverage: totalEmployees && totalEmployees > 0
          ? `${Math.round((totalReviews / totalEmployees) * 100)}%`
          : '0%',
      },
      status: byStatus,
      types: byType,
      ratings: {
        distribution: ratingsDistribution,
        average: averageRating,
      },
      byDepartment,
      lastUpdated: new Date().toISOString(),
    };

    return successResponse(analytics);
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch performance analytics',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

export const GET = withErrorHandler(handler);
