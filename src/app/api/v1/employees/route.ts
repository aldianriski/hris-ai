/**
 * Employee Management Endpoints
 * GET /api/v1/employees - List all employees
 * POST /api/v1/employees - Create new employee
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth, requireHR } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';
import { PaginationSchema } from '@/lib/api/types';
import { logEmployeeAction } from '@/lib/utils/auditLog';

// ============================================
// GET /api/v1/employees - List employees
// ============================================

const listEmployeesSchema = z.object({
  ...PaginationSchema.shape,
  status: z.enum(['active', 'inactive', 'terminated', 'resigned']).optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  employmentType: z.enum(['permanent', 'contract', 'probation', 'intern', 'part_time']).optional(),
  search: z.string().optional(),
});

async function listHandler(request: NextRequest) {
  await standardRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = listEmployeesSchema.parse(params);

  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('employees')
    .select('*', { count: 'exact' })
    .eq('employer_id', userContext.companyId);

  // Apply filters
  if (validatedParams.status) {
    query = query.eq('employment_status', validatedParams.status);
  }

  if (validatedParams.department) {
    query = query.eq('department', validatedParams.department);
  }

  if (validatedParams.position) {
    query = query.eq('position', validatedParams.position);
  }

  if (validatedParams.employmentType) {
    query = query.eq('employment_type', validatedParams.employmentType);
  }

  if (validatedParams.search) {
    const searchPattern = `%${validatedParams.search}%`;
    query = query.or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},email.ilike.${searchPattern},employee_number.ilike.${searchPattern}`);
  }

  // Apply sorting
  if (validatedParams.sortBy) {
    query = query.order(validatedParams.sortBy, { ascending: validatedParams.sortOrder === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  // Apply pagination
  const from = (validatedParams.page - 1) * validatedParams.limit;
  const to = from + validatedParams.limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch employees',
      500,
      { details: error.message }
    );
  }

  return paginatedResponse(
    data || [],
    count || 0,
    validatedParams.page,
    validatedParams.limit
  );
}

// ============================================
// POST /api/v1/employees - Create employee
// ============================================

const createEmployeeSchema = z.object({
  employeeNumber: z.string().min(1, 'Employee number is required'),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  dateOfBirth: z.string().datetime('Invalid date format'),
  gender: z.enum(['male', 'female', 'other']),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  nationality: z.string().min(1, 'Nationality is required'),
  nationalId: z.string().optional(),
  taxId: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  postalCode: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  employmentType: z.enum(['permanent', 'contract', 'probation', 'intern', 'part_time']),
  joinDate: z.string().datetime('Invalid date format'),
  manager: z.string().optional(),
  workLocation: z.string().min(1, 'Work location is required'),
  workSchedule: z.string().min(1, 'Work schedule is required'),
  salary: z.number().positive().optional(),
});

async function createHandler(request: NextRequest) {
  await standardRateLimit(request);

  // Only HR can create employees
  const userContext = await requireHR(request);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = createEmployeeSchema.parse(body);

  const supabase = await createClient();

  // Check if employee number already exists
  const { data: existing } = await supabase
    .from('employees')
    .select('id')
    .eq('employer_id', userContext.companyId)
    .eq('employee_number', validatedData.employeeNumber)
    .single();

  if (existing) {
    return errorResponse(
      'RES_3002',
      'Employee number already exists',
      409
    );
  }

  // Create full name
  const fullName = [
    validatedData.firstName,
    validatedData.middleName,
    validatedData.lastName
  ].filter(Boolean).join(' ');

  // Create employee record
  const employeeData = {
    employer_id: userContext.companyId,
    employee_number: validatedData.employeeNumber,
    first_name: validatedData.firstName,
    middle_name: validatedData.middleName,
    last_name: validatedData.lastName,
    full_name: fullName,
    email: validatedData.email,
    phone: validatedData.phone,
    date_of_birth: validatedData.dateOfBirth,
    gender: validatedData.gender,
    marital_status: validatedData.maritalStatus,
    nationality: validatedData.nationality,
    national_id: validatedData.nationalId,
    tax_id: validatedData.taxId,
    address: validatedData.address,
    city: validatedData.city,
    province: validatedData.province,
    postal_code: validatedData.postalCode,
    department: validatedData.department,
    position: validatedData.position,
    employment_type: validatedData.employmentType,
    employment_status: 'active',
    join_date: validatedData.joinDate,
    manager: validatedData.manager,
    work_location: validatedData.workLocation,
    work_schedule: validatedData.workSchedule,
    salary: validatedData.salary,
  };

  const { data: employee, error } = await supabase
    .from('employees')
    .insert(employeeData)
    .select()
    .single();

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to create employee',
      500,
      { details: error.message }
    );
  }

  // Log employee creation
  await logEmployeeAction(
    userContext,
    request,
    'created',
    employee.id,
    employee.full_name,
    {
      before: {},
      after: employee,
    }
  );

  // TODO: Trigger employee.created webhook

  return successResponse(employee, 201);
}

export const GET = withErrorHandler(listHandler);
export const POST = withErrorHandler(createHandler);
