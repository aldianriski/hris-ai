import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/di/container';
import { z } from 'zod';

const createDepartmentSchema = z.object({
  employerId: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(1),
  nameIndonesian: z.string().min(1),
  type: z.enum(['operational', 'support', 'strategic', 'project']),
  parentId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
  managerName: z.string().optional(),
  description: z.string().optional(),
  costCenter: z.string().optional(),
  budget: z.number().optional(),
  location: z.string().optional(),
  isActive: z.boolean().default(true),
  level: z.number().default(1),
  displayOrder: z.number().default(0),
});

/**
 * GET /api/v1/departments
 * Get departments
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employerId = searchParams.get('employerId');

    if (!employerId) {
      return NextResponse.json({ error: 'employerId is required' }, { status: 400 });
    }

    const options = {
      type: searchParams.get('type') || undefined,
      isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
      parentId: searchParams.get('parentId') || undefined,
    };

    const repository = container.getOrganizationRepository();
    const departments = await repository.findDepartmentsByEmployerId(employerId, options);

    return NextResponse.json({ departments }, { status: 200 });
  } catch (error) {
    console.error('Failed to get departments:', error);
    return NextResponse.json(
      { error: 'Failed to get departments', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/departments
 * Create a new department
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createDepartmentSchema.parse(body);

    const repository = container.getOrganizationRepository();
    const department = await repository.createDepartment(validatedData);

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Failed to create department:', error);
    return NextResponse.json(
      { error: 'Failed to create department', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
