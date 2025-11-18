import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/di/container';

/**
 * GET /api/v1/leave/balances/[employeeId]
 * Get leave balance for an employee
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { employeeId: string } }
) {
  try {
    const { employeeId } = params;

    const repository = await container.getLeaveRepository();
    const balance = await repository.findBalanceByEmployeeId(employeeId);

    if (!balance) {
      return NextResponse.json(
        { error: 'Leave balance not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(balance, { status: 200 });
  } catch (error) {
    console.error('Failed to get leave balance:', error);
    return NextResponse.json(
      { error: 'Failed to get leave balance', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
