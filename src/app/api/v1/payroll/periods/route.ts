import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/di/container';
import { z } from 'zod';

const createPeriodSchema = z.object({
  employerId: z.string().uuid(),
  periodName: z.string().min(1),
  periodType: z.enum(['monthly', 'biweekly', 'weekly']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  paymentDate: z.string().datetime(),
  status: z.enum(['draft', 'processing', 'review', 'approved', 'paid']).default('draft'),
});

/**
 * GET /api/v1/payroll/periods
 * Get payroll periods
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employerId = searchParams.get('employerId');

    if (!employerId) {
      return NextResponse.json({ error: 'employerId is required' }, { status: 400 });
    }

    const options = {
      status: searchParams.get('status') || undefined,
      year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    const repository = await container.getPayrollRepository();
    const result = await repository.findPeriodsByEmployerId(employerId, options);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Failed to get payroll periods:', error);
    return NextResponse.json(
      { error: 'Failed to get payroll periods', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/payroll/periods
 * Create a new payroll period
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPeriodSchema.parse(body);

    const periodData = {
      ...validatedData,
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
      paymentDate: new Date(validatedData.paymentDate),
    };

    const repository = await container.getPayrollRepository();
    const period = await repository.createPeriod(periodData as any);

    return NextResponse.json(period, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Failed to create payroll period:', error);
    return NextResponse.json(
      { error: 'Failed to create payroll period', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
