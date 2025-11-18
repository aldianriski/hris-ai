import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/di/container';
import { z } from 'zod';

const createPositionSchema = z.object({
  employerId: z.string().uuid(),
  code: z.string().min(1),
  title: z.string().min(1),
  titleIndonesian: z.string().min(1),
  departmentId: z.string().uuid(),
  level: z.string().min(1),
  jobFamily: z.string().optional(),
  reportsTo: z.string().uuid().optional(),
  description: z.string().optional(),
  responsibilities: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  isActive: z.boolean().default(true),
  headcount: z.number().default(1),
  currentCount: z.number().default(0),
  displayOrder: z.number().default(0),
});

/**
 * GET /api/v1/positions
 * Get positions
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employerId = searchParams.get('employerId');
    const departmentId = searchParams.get('departmentId');

    const repository = await container.getOrganizationRepository();

    if (departmentId) {
      const positions = await repository.findPositionsByDepartment(departmentId);
      return NextResponse.json({ positions }, { status: 200 });
    }

    if (employerId) {
      const options = {
        departmentId: searchParams.get('departmentId') || undefined,
        level: searchParams.get('level') || undefined,
        jobFamily: searchParams.get('jobFamily') || undefined,
        isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
        hasOpenings: searchParams.get('hasOpenings') === 'true',
      };
      const positions = await repository.findPositionsByEmployerId(employerId, options);
      return NextResponse.json({ positions }, { status: 200 });
    }

    return NextResponse.json({ error: 'Either employerId or departmentId is required' }, { status: 400 });
  } catch (error) {
    console.error('Failed to get positions:', error);
    return NextResponse.json(
      { error: 'Failed to get positions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/positions
 * Create a new position
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPositionSchema.parse(body);

    const repository = await container.getOrganizationRepository();
    const position = await repository.createPosition(validatedData as any);

    return NextResponse.json(position, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Failed to create position:', error);
    return NextResponse.json(
      { error: 'Failed to create position', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
