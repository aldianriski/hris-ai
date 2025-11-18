import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/di/container';

/**
 * GET /api/v1/performance/goals
 * Get performance goals
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json({ error: 'employeeId is required' }, { status: 400 });
    }

    const options = {
      status: searchParams.get('status') || undefined,
      goalType: searchParams.get('goalType') || undefined,
      year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
    };

    const repository = await container.getPerformanceRepository();
    const goals = await repository.findGoalsByEmployeeId(employeeId, options);

    return NextResponse.json({ goals }, { status: 200 });
  } catch (error) {
    console.error('Failed to get performance goals:', error);
    return NextResponse.json(
      { error: 'Failed to get performance goals', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
