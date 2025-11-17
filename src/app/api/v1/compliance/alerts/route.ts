import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/di/container';

/**
 * GET /api/v1/compliance/alerts
 * Get compliance alerts
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employerId = searchParams.get('employerId');

    if (!employerId) {
      return NextResponse.json({ error: 'employerId is required' }, { status: 400 });
    }

    const options = {
      alertType: searchParams.get('alertType') || undefined,
      severity: searchParams.get('severity') || undefined,
      status: searchParams.get('status') || undefined,
      assignedTo: searchParams.get('assignedTo') || undefined,
      isOverdue: searchParams.get('isOverdue') === 'true',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    const repository = container.getComplianceRepository();
    const result = await repository.findAlertsByEmployerId(employerId, options);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Failed to get compliance alerts:', error);
    return NextResponse.json(
      { error: 'Failed to get compliance alerts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
