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

    // Get the alert first to verify it exists
    const alert = await repository.findAlertById(alertId);

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    // Check if already resolved
    if (alert.status === 'resolved' || alert.status === 'dismissed') {
      return NextResponse.json(
        { error: `Alert already ${alert.status}` },
        { status: 400 }
      );
    }

    // Update alert to resolved
    const updatedAlert = await repository.updateAlert(alertId, {
      status: 'resolved',
      resolution: validatedData.resolution || '',
      resolvedAt: new Date(),
    });

    return NextResponse.json({ success: true, alert: updatedAlert }, { status: 200 });
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
