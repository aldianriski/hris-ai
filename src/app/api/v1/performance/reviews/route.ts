import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/di/container';
import { z } from 'zod';

const createReviewSchema = z.object({
  employeeId: z.string().uuid(),
  employerId: z.string().uuid(),
  employeeName: z.string().min(1),
  reviewerId: z.string().uuid(),
  reviewerName: z.string().min(1),
  reviewPeriodStart: z.string().datetime(),
  reviewPeriodEnd: z.string().datetime(),
  reviewType: z.enum(['probation', 'annual', 'mid_year', 'project', 'promotion']),
  templateId: z.string().uuid().optional(),
});

/**
 * GET /api/v1/performance/reviews
 * Get performance reviews
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get('employeeId');
    const reviewerId = searchParams.get('reviewerId');

    const repository = container.getPerformanceRepository();

    if (employeeId) {
      const options = {
        status: searchParams.get('status') || undefined,
        reviewType: searchParams.get('reviewType') || undefined,
        year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
      };
      const reviews = await repository.findReviewsByEmployeeId(employeeId, options);
      return NextResponse.json({ reviews }, { status: 200 });
    }

    if (reviewerId) {
      const reviews = await repository.findReviewsByReviewerId(reviewerId);
      return NextResponse.json({ reviews }, { status: 200 });
    }

    return NextResponse.json({ error: 'Either employeeId or reviewerId is required' }, { status: 400 });
  } catch (error) {
    console.error('Failed to get performance reviews:', error);
    return NextResponse.json(
      { error: 'Failed to get performance reviews', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/performance/reviews
 * Create a new performance review
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createReviewSchema.parse(body);

    const reviewData = {
      ...validatedData,
      reviewPeriodStart: new Date(validatedData.reviewPeriodStart),
      reviewPeriodEnd: new Date(validatedData.reviewPeriodEnd),
      status: 'draft' as const,
    };

    const repository = container.getPerformanceRepository();
    const review = await repository.createReview(reviewData);

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Failed to create performance review:', error);
    return NextResponse.json(
      { error: 'Failed to create performance review', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
