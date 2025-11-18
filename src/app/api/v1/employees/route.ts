import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/di/container';
import { z } from 'zod';

// Validation schema for creating an employee
const createEmployeeSchema = z.object({
  employerId: z.string().uuid(),
  firstName: z.string().min(1),
  middleName: z.string().optional(),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  dateOfBirth: z.string().datetime(),
  gender: z.enum(['male', 'female', 'other']),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  nationality: z.string().default('Indonesian'),
  nationalId: z.string().optional(),
  taxId: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  province: z.string().min(1),
  postalCode: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  department: z.string().uuid(),
  position: z.string().uuid(),
  employmentType: z.enum(['permanent', 'contract', 'probation', 'intern', 'part_time']),
  employmentStatus: z.enum(['active', 'inactive', 'terminated', 'resigned']).default('active'),
  joinDate: z.string().datetime(),
  contractStartDate: z.string().datetime().optional(),
  contractEndDate: z.string().datetime().optional(),
  probationEndDate: z.string().datetime().optional(),
  manager: z.string().uuid().optional(),
  workLocation: z.string().min(1),
  workSchedule: z.string().min(1),
  salary: z.number().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountHolder: z.string().optional(),
  bpjsKesehatan: z.string().optional(),
  bpjsKetenagakerjaan: z.string().optional(),
});

/**
 * GET /api/v1/employees
 * List employees with filtering, search, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const employerId = searchParams.get('employerId');
    if (!employerId) {
      return NextResponse.json(
        { error: 'employerId is required' },
        { status: 400 }
      );
    }

    const options = {
      status: searchParams.get('status') || undefined,
      department: searchParams.get('department') || undefined,
      position: searchParams.get('position') || undefined,
      employmentType: searchParams.get('employmentType') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'fullName',
      sortOrder: (searchParams.get('sortOrder') as any) || 'asc',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    const listEmployees = await container.getListEmployeesUseCase();
    const result = await listEmployees.execute(employerId, options as any);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Failed to list employees:', error);
    return NextResponse.json(
      { error: 'Failed to list employees', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/employees
 * Create a new employee
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createEmployeeSchema.parse(body);

    // Extract employerId and convert date strings to Date objects
    const { employerId, ...rest } = validatedData;
    const employeeData = {
      ...rest,
      dateOfBirth: new Date(validatedData.dateOfBirth),
      joinDate: new Date(validatedData.joinDate),
      contractStartDate: validatedData.contractStartDate ? new Date(validatedData.contractStartDate) : undefined,
      contractEndDate: validatedData.contractEndDate ? new Date(validatedData.contractEndDate) : undefined,
      probationEndDate: validatedData.probationEndDate ? new Date(validatedData.probationEndDate) : undefined,
    };

    const createEmployee = await container.getCreateEmployeeUseCase();
    const employee = await createEmployee.execute(employerId, employeeData as any);

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('Failed to create employee:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create employee', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
