/**
 * POST /api/v1/attendance/clock-in
 * Clock in an employee
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler, ApiError } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { logAttendanceAction } from '@/lib/utils/auditLog';

const clockInSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  clockInTime: z.string().datetime().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  workMode: z.enum(['office', 'remote', 'hybrid']).default('office'),
  notes: z.string().optional(),
});

async function handler(request: NextRequest) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = clockInSchema.parse(body);

  const supabase = await createClient();

  // Check if employee belongs to the same company
  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('id, full_name, employer_id')
    .eq('id', validatedData.employeeId)
    .single();

  if (employeeError || !employee) {
    return errorResponse(
      'RES_3001',
      'Employee not found',
      404
    );
  }

  if (employee.employer_id !== userContext.companyId) {
    return errorResponse(
      'AUTH_1004',
      'Employee does not belong to your company',
      403
    );
  }

  // Check if already clocked in today
  const today = new Date().toISOString().split('T')[0];
  const { data: existingRecord } = await supabase
    .from('attendance')
    .select('id, clock_out_time')
    .eq('employee_id', validatedData.employeeId)
    .gte('date', today)
    .lt('date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .single();

  if (existingRecord && !existingRecord.clock_out_time) {
    throw new ApiError(
      'BIZ_4001',
      'Already clocked in today. Please clock out first.',
      400
    );
  }

  const clockInTime = validatedData.clockInTime || new Date().toISOString();

  // Create attendance record
  const attendanceData = {
    employee_id: validatedData.employeeId,
    employer_id: employee.employer_id,
    employee_name: employee.full_name,
    date: clockInTime.split('T')[0],
    clock_in_time: clockInTime,
    clock_in_location: validatedData.location ? `${validatedData.location.lat},${validatedData.location.lng}` : null,
    clock_in_gps: validatedData.location,
    work_mode: validatedData.workMode,
    notes: validatedData.notes,
    status: 'present',
  };

  const { data: attendance, error } = await supabase
    .from('attendance')
    .insert(attendanceData)
    .select()
    .single();

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to clock in',
      500,
      { details: error.message }
    );
  }

  // Log attendance action
  await logAttendanceAction(
    userContext,
    request,
    'clock_in',
    attendance.id,
    {
      employeeId: validatedData.employeeId,
      employeeName: employee.full_name,
      clockInTime,
      workMode: validatedData.workMode,
    }
  );

  // TODO: Trigger attendance.clocked_in webhook

  return successResponse(attendance, 201);
}

export const POST = withErrorHandler(handler);
