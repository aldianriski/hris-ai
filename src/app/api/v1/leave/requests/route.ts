import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/di/container';
import { z } from 'zod';

const createLeaveRequestSchema = z.object({
  employeeId: z.string().uuid(),
  employerId: z.string().uuid(),
  employeeName: z.string().min(1),
  leaveType: z.enum(['annual', 'sick', 'unpaid', 'maternity', 'paternity', 'compassionate', 'other']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  daysCount: z.number().positive(),
  reason: z.string().min(1),
});

/**
 * GET /api/v1/leave/requests
 * Get leave requests
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const employeeId = searchParams.get('employeeId');
    const employerId = searchParams.get('employerId');

    const repository = await container.getLeaveRepository();

    if (employeeId) {
      const options = {
        status: searchParams.get('status') || undefined,
        leaveType: searchParams.get('leaveType') || undefined,
        year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
        offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      };

      const result = await repository.findRequestsByEmployeeId(employeeId, options);
      return NextResponse.json(result, { status: 200 });
    }

    if (employerId) {
      const requests = await repository.findPendingRequests(employerId);
      return NextResponse.json({ requests }, { status: 200 });
    }

    return NextResponse.json(
      { error: 'Either employeeId or employerId is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to get leave requests:', error);
    return NextResponse.json(
      { error: 'Failed to get leave requests', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/leave/requests
 * Create a new leave request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createLeaveRequestSchema.parse(body);

    const { employerId, ...leaveData } = validatedData;
    const createLeaveRequest = await container.getCreateLeaveRequestUseCase();
    const leaveRequest = await createLeaveRequest.execute(employerId, {
      ...leaveData,
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
    } as any);

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    console.error('Failed to create leave request:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create leave request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
