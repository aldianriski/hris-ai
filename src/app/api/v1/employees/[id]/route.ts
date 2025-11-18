import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/di/container';
import { z } from 'zod';

// Validation schema for updating an employee
const updateEmployeeSchema = z.object({
  firstName: z.string().min(1).optional(),
  middleName: z.string().optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  nationality: z.string().optional(),
  nationalId: z.string().optional(),
  taxId: z.string().optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  province: z.string().min(1).optional(),
  postalCode: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  department: z.string().uuid().optional(),
  position: z.string().uuid().optional(),
  employmentType: z.enum(['permanent', 'contract', 'probation', 'intern', 'part_time']).optional(),
  employmentStatus: z.enum(['active', 'inactive', 'terminated', 'resigned']).optional(),
  joinDate: z.string().datetime().optional(),
  contractStartDate: z.string().datetime().optional(),
  contractEndDate: z.string().datetime().optional(),
  probationEndDate: z.string().datetime().optional(),
  terminationDate: z.string().datetime().optional(),
  terminationReason: z.string().optional(),
  manager: z.string().uuid().optional(),
  workLocation: z.string().min(1).optional(),
  workSchedule: z.string().min(1).optional(),
  salary: z.number().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountHolder: z.string().optional(),
  bpjsKesehatan: z.string().optional(),
  bpjsKetenagakerjaan: z.string().optional(),
});

/**
 * GET /api/v1/employees/[id]
 * Get employee by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const repository = await container.getEmployeeRepository();
    const employee = await repository.findById(id);

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(employee, { status: 200 });
  } catch (error) {
    console.error('Failed to get employee:', error);
    return NextResponse.json(
      { error: 'Failed to get employee', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/employees/[id]
 * Update employee
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateEmployeeSchema.parse(body);

    // Convert date strings to Date objects if present
    const updates: any = { ...validatedData };
    if (validatedData.dateOfBirth) updates.dateOfBirth = new Date(validatedData.dateOfBirth);
    if (validatedData.joinDate) updates.joinDate = new Date(validatedData.joinDate);
    if (validatedData.contractStartDate) updates.contractStartDate = new Date(validatedData.contractStartDate);
    if (validatedData.contractEndDate) updates.contractEndDate = new Date(validatedData.contractEndDate);
    if (validatedData.probationEndDate) updates.probationEndDate = new Date(validatedData.probationEndDate);
    if (validatedData.terminationDate) updates.terminationDate = new Date(validatedData.terminationDate);

    // Get existing employee to get employerId
    const repository = await container.getEmployeeRepository();
    const existing = await repository.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const updateEmployee = await container.getUpdateEmployeeUseCase();
    const employee = await updateEmployee.execute(id, existing.employerId, updates);

    return NextResponse.json(employee, { status: 200 });
  } catch (error) {
    console.error('Failed to update employee:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update employee', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/employees/[id]
 * Delete employee (soft delete by marking as inactive)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const repository = await container.getEmployeeRepository();
    await repository.delete(id);

    return NextResponse.json(
      { message: 'Employee deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
