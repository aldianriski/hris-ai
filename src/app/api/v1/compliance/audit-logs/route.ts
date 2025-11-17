import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/di/container';

/**
 * GET /api/v1/compliance/audit-logs
 * Get audit logs
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employerId = searchParams.get('employerId');

    if (!employerId) {
      return NextResponse.json({ error: 'employerId is required' }, { status: 400 });
    }

    const options = {
      userId: searchParams.get('userId') || undefined,
      action: searchParams.get('action') || undefined,
      entityType: searchParams.get('entityType') || undefined,
      entityId: searchParams.get('entityId') || undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    const repository = container.getComplianceRepository();
    const result = await repository.findAuditLogsByEmployerId(employerId, options);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to get audit logs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
