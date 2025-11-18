/**
 * POST /api/v1/gamification/points/award
 * Award points to an employee
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireManager } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';

const awardPointsSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  points: z.number().int().min(1).max(1000),
  reason: z.string().min(1, 'Reason is required'),
  category: z.enum(['attendance', 'performance', 'documentation', 'milestone', 'other']).default('other'),
});

async function handler(request: NextRequest) {
  await standardRateLimit(request);

  // Only managers and above can award points
  const userContext = await requireManager(request);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = awardPointsSchema.parse(body);

  const supabase = await createClient();

  try {
    // Verify employee belongs to company
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

    // Get or create gamification points record
    const { data: existingPoints } = await supabase
      .from('gamification_points')
      .select('*')
      .eq('employee_id', validatedData.employeeId)
      .eq('employer_id', userContext.companyId)
      .single();

    if (!existingPoints) {
      // Create initial record
      await supabase
        .from('gamification_points')
        .insert({
          employee_id: validatedData.employeeId,
          employer_id: userContext.companyId,
          employee_name: employee.full_name,
          total_points: 0,
          badge_count: 0,
          achievement_count: 0,
        });
    }

    // Award points
    const { data: updatedPoints, error: updateError } = await supabase
      .from('gamification_points')
      .update({
        total_points: (existingPoints?.total_points || 0) + validatedData.points,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('employee_id', validatedData.employeeId)
      .eq('employer_id', userContext.companyId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Log the point award
    await supabase
      .from('point_transactions')
      .insert({
        employee_id: validatedData.employeeId,
        employer_id: userContext.companyId,
        points: validatedData.points,
        reason: validatedData.reason,
        category: validatedData.category,
        awarded_by: userContext.id,
        awarded_by_email: userContext.email,
      });

    // TODO: Send notification to employee about points awarded
    // TODO: Check if employee qualifies for new badges based on total points

    return successResponse({
      ...updatedPoints,
      awarded: validatedData.points,
      reason: validatedData.reason,
    });
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to award points',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

export const POST = withErrorHandler(handler);
