import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/di/container';
import { z } from 'zod';

const updateLeaveRequestSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
  approvedBy: z.string().uuid().optional(),
  approvedByName: z.string().optional(),
  approvalNotes: z.string().optional(),
});

/**
 * GET /api/v1/leave/requests/[id]
 * Get leave request by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const repository = await container.getLeaveRepository();
    const leaveRequest = await repository.findRequestById(id);

    if (!leaveRequest) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(leaveRequest, { status: 200 });
  } catch (error) {
    console.error('Failed to get leave request:', error);
    return NextResponse.json(
      { error: 'Failed to get leave request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/leave/requests/[id]
 * Update leave request (approve/reject)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateLeaveRequestSchema.parse(body);

    const repository = await container.getLeaveRepository();

    // Add approval timestamp if status is approved or rejected
    const updates: any = { ...validatedData };
    if (validatedData.status === 'approved' || validatedData.status === 'rejected') {
      updates.approvedAt = new Date();
    }

    const leaveRequest = await repository.updateRequest(id, updates);

    return NextResponse.json(leaveRequest, { status: 200 });
  } catch (error) {
    console.error('Failed to update leave request:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update leave request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/leave/requests/[id]
 * Delete leave request
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const repository = await container.getLeaveRepository();
    await repository.deleteRequest(id);

    return NextResponse.json(
      { message: 'Leave request deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete leave request:', error);
    return NextResponse.json(
      { error: 'Failed to delete leave request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
