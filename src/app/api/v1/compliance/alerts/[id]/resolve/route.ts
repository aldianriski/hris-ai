import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/di/container';
import { z } from 'zod';

const resolveAlertSchema = z.object({
  resolution: z.string().optional(),
});

/**
 * POST /api/v1/compliance/alerts/:id/resolve
 * Resolve a compliance alert
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alertId = params.id;

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const validatedData = resolveAlertSchema.parse(body);

    const repository = await container.getComplianceRepository();

    // Get the alert first to verify it exists and get employer_id
    const alerts = await repository.findAlertsByEmployerId('', {
      limit: 1,
      offset: 0,
    });

    // In a real implementation, we'd have a method to get alert by ID
    // For now, we'll update the status directly
    const result = await repository.updateAlertStatus(
      alertId,
      'resolved',
      validatedData.resolution
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Alert not found or already resolved' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to resolve compliance alert:', error);
    return NextResponse.json(
      {
        error: 'Failed to resolve compliance alert',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
