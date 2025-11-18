import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/di/container';
import { z } from 'zod';

const clockInSchema = z.object({
  employeeId: z.string().uuid(),
  employerId: z.string().uuid(),
  clockInTime: z.string().datetime(),
  clockInLocation: z.string().optional(),
  clockInGps: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  clockInNotes: z.string().optional(),
  shiftId: z.string().uuid().optional(),
});

/**
 * POST /api/v1/attendance/clock-in
 * Clock in an employee
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = clockInSchema.parse(body);

    const clockIn = await container.getClockInUseCase();
    const { employerId, employeeId, clockInGps } = validatedData;
    const record = await clockIn.execute(employerId, {
      employeeId,
      date: new Date(validatedData.clockInTime),
      locationLat: clockInGps?.latitude ?? 0,
      locationLng: clockInGps?.longitude ?? 0,
      locationAddress: validatedData.clockInLocation ?? null,
      photoUrl: null,
      deviceInfo: null,
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Failed to clock in:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to clock in', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
