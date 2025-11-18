/**
 * Employee Detail Endpoints
 * GET /api/v1/employees/[id] - Get employee details
 * PATCH /api/v1/employees/[id] - Update employee
 * DELETE /api/v1/employees/[id] - Delete employee (soft delete)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth, requireHR, checkEmployeeAccess } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { logEmployeeAction } from '@/lib/utils/auditLog';

// ============================================
// GET /api/v1/employees/[id] - Get employee
// ============================================

async function getHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);
  const { id } = params;

  // Check if user can access this employee
  if (!checkEmployeeAccess(userContext, id)) {
    return errorResponse(
      'AUTH_1004',
      'You do not have permission to access this employee',
      403
    );
  }

  const supabase = await createClient();

  const { data: employee, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .eq('employer_id', userContext.companyId)
    .single();

  if (error || !employee) {
    return notFoundResponse('Employee');
  }

  return successResponse(employee);
}

// ============================================
// PATCH /api/v1/employees/[id] - Update employee
// ============================================

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
  department: z.string().optional(),
  position: z.string().optional(),
  employmentType: z.enum(['permanent', 'contract', 'probation', 'intern', 'part_time']).optional(),
  employmentStatus: z.enum(['active', 'inactive', 'terminated', 'resigned']).optional(),
  manager: z.string().optional(),
  workLocation: z.string().min(1).optional(),
  workSchedule: z.string().min(1).optional(),
  salary: z.number().positive().optional(),
});

async function updateHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await withRateLimit(request);

  // Only HR can update employees
  const userContext = await requireHR(request);
  const { id } = params;

  // Parse and validate request body
  const body = await request.json();
  const validatedData = updateEmployeeSchema.parse(body);

  const supabase = await createClient();

  // Get existing employee
  const { data: existing, error: fetchError } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .eq('employer_id', userContext.companyId)
    .single();

  if (fetchError || !existing) {
    return notFoundResponse('Employee');
  }

  // Build update data
  const updateData: any = {};
  if (validatedData.firstName) updateData.first_name = validatedData.firstName;
  if (validatedData.middleName !== undefined) updateData.middle_name = validatedData.middleName;
  if (validatedData.lastName) updateData.last_name = validatedData.lastName;
  if (validatedData.email) updateData.email = validatedData.email;
  if (validatedData.phone) updateData.phone = validatedData.phone;
  if (validatedData.dateOfBirth) updateData.date_of_birth = validatedData.dateOfBirth;
  if (validatedData.gender) updateData.gender = validatedData.gender;
  if (validatedData.maritalStatus) updateData.marital_status = validatedData.maritalStatus;
  if (validatedData.nationality) updateData.nationality = validatedData.nationality;
  if (validatedData.nationalId !== undefined) updateData.national_id = validatedData.nationalId;
  if (validatedData.taxId !== undefined) updateData.tax_id = validatedData.taxId;
  if (validatedData.address) updateData.address = validatedData.address;
  if (validatedData.city) updateData.city = validatedData.city;
  if (validatedData.province) updateData.province = validatedData.province;
  if (validatedData.postalCode !== undefined) updateData.postal_code = validatedData.postalCode;
  if (validatedData.department) updateData.department = validatedData.department;
  if (validatedData.position) updateData.position = validatedData.position;
  if (validatedData.employmentType) updateData.employment_type = validatedData.employmentType;
  if (validatedData.employmentStatus) updateData.employment_status = validatedData.employmentStatus;
  if (validatedData.manager !== undefined) updateData.manager = validatedData.manager;
  if (validatedData.workLocation) updateData.work_location = validatedData.workLocation;
  if (validatedData.workSchedule) updateData.work_schedule = validatedData.workSchedule;
  if (validatedData.salary !== undefined) updateData.salary = validatedData.salary;

  // Update full name if name fields changed
  if (validatedData.firstName || validatedData.middleName !== undefined || validatedData.lastName) {
    const fullName = [
      validatedData.firstName || existing.first_name,
      validatedData.middleName !== undefined ? validatedData.middleName : existing.middle_name,
      validatedData.lastName || existing.last_name
    ].filter(Boolean).join(' ');
    updateData.full_name = fullName;
  }

  // Update timestamp
  updateData.updated_at = new Date().toISOString();

  // Perform update
  const { data: employee, error } = await supabase
    .from('employees')
    .update(updateData)
    .eq('id', id)
    .eq('employer_id', userContext.companyId)
    .select()
    .single();

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to update employee',
      500,
      { details: error.message }
    );
  }

  // Log employee update
  await logEmployeeAction(
    userContext,
    request,
    'updated',
    employee.id,
    employee.full_name,
    {
      before: existing,
      after: employee,
    }
  );

  // TODO: Trigger employee.updated webhook

  return successResponse(employee);
}

// ============================================
// DELETE /api/v1/employees/[id] - Delete employee
// ============================================

async function deleteHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await withRateLimit(request);

  // Only HR can delete employees
  const userContext = await requireHR(request);
  const { id } = params;

  const supabase = await createClient();

  // Get existing employee
  const { data: existing, error: fetchError } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .eq('employer_id', userContext.companyId)
    .single();

  if (fetchError || !existing) {
    return notFoundResponse('Employee');
  }

  // Soft delete: mark as inactive
  const { error } = await supabase
    .from('employees')
    .update({
      employment_status: 'inactive',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('employer_id', userContext.companyId);

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to delete employee',
      500,
      { details: error.message }
    );
  }

  // Log employee deletion
  await logEmployeeAction(
    userContext,
    request,
    'deleted',
    existing.id,
    existing.full_name
  );

  // TODO: Trigger employee.deleted webhook

  return successResponse({
    message: 'Employee deleted successfully',
  });
}

export const GET = withErrorHandler(getHandler);
export const PATCH = withErrorHandler(updateHandler);
export const DELETE = withErrorHandler(deleteHandler);
