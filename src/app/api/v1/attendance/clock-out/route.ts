/**
 * POST /api/v1/attendance/clock-out
 * Clock out an employee
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response';
import { withErrorHandler, ApiError } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { logAttendanceAction } from '@/lib/utils/auditLog';

const clockOutSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  clockOutTime: z.string().datetime().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  notes: z.string().optional(),
});

async function handler(request: NextRequest) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = clockOutSchema.parse(body);

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

  // Find today's attendance record that hasn't been clocked out
  const today = new Date().toISOString().split('T')[0];
  const { data: attendanceRecord, error: fetchError } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', validatedData.employeeId)
    .gte('date', today)
    .lt('date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .is('clock_out_time', null)
    .single();

  if (fetchError || !attendanceRecord) {
    throw new ApiError(
      'RES_3001',
      'No active clock-in record found for today. Please clock in first.',
      404
    );
  }

  const clockOutTime = validatedData.clockOutTime || new Date().toISOString();

  // Calculate work hours
  const clockInTime = new Date(attendanceRecord.clock_in_time);
  const clockOut = new Date(clockOutTime);
  const workHours = (clockOut.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

  // Update attendance record
  const updateData = {
    clock_out_time: clockOutTime,
    clock_out_location: validatedData.location ? `${validatedData.location.lat},${validatedData.location.lng}` : null,
    clock_out_gps: validatedData.location,
    work_hours: Math.round(workHours * 100) / 100, // Round to 2 decimals
    notes: validatedData.notes || attendanceRecord.notes,
    updated_at: new Date().toISOString(),
  };

  const { data: attendance, error } = await supabase
    .from('attendance')
    .update(updateData)
    .eq('id', attendanceRecord.id)
    .select()
    .single();

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to clock out',
      500,
      { details: error.message }
    );
  }

  // Log attendance action
  await logAttendanceAction(
    userContext,
    request,
    'clock_out',
    attendance.id,
    {
      employeeId: validatedData.employeeId,
      employeeName: employee.full_name,
      clockOutTime,
      workHours: attendance.work_hours,
    }
  );

  // TODO: Trigger attendance.clocked_out webhook

  return successResponse(attendance);
}

export const POST = withErrorHandler(handler);
