import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/di/container';
import { z } from 'zod';

const clockOutSchema = z.object({
  recordId: z.string().uuid(),
  clockOutTime: z.string().datetime(),
  clockOutLocation: z.string().optional(),
  clockOutGps: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  clockOutNotes: z.string().optional(),
});

/**
 * POST /api/v1/attendance/clock-out
 * Clock out an employee
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = clockOutSchema.parse(body);

    const clockOut = container.getClockOutUseCase();
    const record = await clockOut.execute({
      ...validatedData,
      clockOutTime: new Date(validatedData.clockOutTime),
    });

    return NextResponse.json(record, { status: 200 });
  } catch (error) {
    console.error('Failed to clock out:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to clock out', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
