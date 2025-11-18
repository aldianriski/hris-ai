import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/di/container';

/**
 * GET /api/v1/payroll/summaries
 * Get payroll summaries
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const periodId = searchParams.get('periodId');
    const employeeId = searchParams.get('employeeId');

    const repository = await container.getPayrollRepository();

    if (periodId) {
      const summaries = await repository.findSummariesByPeriodId(periodId);
      return NextResponse.json({ summaries }, { status: 200 });
    }

    if (employeeId) {
      const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();
      const summaries = await repository.findSummariesByEmployeeId(employeeId, { year });
      return NextResponse.json({ summaries }, { status: 200 });
    }

    return NextResponse.json({ error: 'Either periodId or employeeId is required' }, { status: 400 });
  } catch (error) {
    console.error('Failed to get payroll summaries:', error);
    return NextResponse.json(
      { error: 'Failed to get payroll summaries', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
