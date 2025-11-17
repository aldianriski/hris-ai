import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/di/container';

/**
 * GET /api/v1/attendance
 * Get attendance records with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const employeeId = searchParams.get('employeeId');
    const employerId = searchParams.get('employerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const repository = container.getAttendanceRepository();

    // If employeeId and date range provided, get records for that employee
    if (employeeId && startDate && endDate) {
      const records = await repository.findByEmployeeAndDateRange(
        employeeId,
        new Date(startDate),
        new Date(endDate)
      );
      return NextResponse.json({ records }, { status: 200 });
    }

    // If employerId provided, get records for the organization
    if (employerId) {
      const date = searchParams.get('date');
      if (!date) {
        return NextResponse.json(
          { error: 'date parameter is required when filtering by employerId' },
          { status: 400 }
        );
      }

      const records = await repository.findByEmployerAndDate(
        employerId,
        new Date(date)
      );
      return NextResponse.json({ records }, { status: 200 });
    }

    return NextResponse.json(
      { error: 'Either employeeId with date range, or employerId with date is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to get attendance records:', error);
    return NextResponse.json(
      { error: 'Failed to get attendance records', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
