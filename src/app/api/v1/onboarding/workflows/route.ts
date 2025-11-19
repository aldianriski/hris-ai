/**
 * Onboarding/Offboarding Workflow Endpoints
 * GET /api/v1/onboarding/workflows - List workflows
 * POST /api/v1/onboarding/workflows - Create workflow instance
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';

// ============================================
// GET /api/v1/onboarding/workflows - List workflows
// ============================================

const listWorkflowsSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  workflowType: z.enum(['onboarding', 'offboarding']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

async function listHandler(request: NextRequest) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = listWorkflowsSchema.parse(params);

  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('onboarding_workflows')
    .select('*', { count: 'exact' })
    .eq('employer_id', userContext.companyId);

  // Apply filters
  if (validatedParams.status) {
    query = query.eq('status', validatedParams.status);
  }

  if (validatedParams.workflowType) {
    query = query.eq('workflow_type', validatedParams.workflowType);
  }

  // Apply sorting
  query = query.order('created_at', { ascending: false });

  // Apply pagination
  const from = (validatedParams.page - 1) * validatedParams.limit;
  const to = from + validatedParams.limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch workflows',
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
// POST /api/v1/onboarding/workflows - Create workflow
// ============================================

const createWorkflowSchema = z.object({
  employeeId: z.string().uuid(),
  workflowType: z.enum(['onboarding', 'offboarding']),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
});

async function createHandler(request: NextRequest) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = createWorkflowSchema.parse(body);

  const supabase = await createClient();

  // Verify employee exists
  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('id, full_name, position, department')
    .eq('id', validatedData.employeeId)
    .eq('employer_id', userContext.companyId)
    .single();

  if (employeeError || !employee) {
    return errorResponse(
      'VAL_2001',
      'Employee not found',
      404,
      { details: 'Employee does not exist or does not belong to your company' }
    );
  }

  // Define workflow steps based on type
  const steps = validatedData.workflowType === 'onboarding'
    ? [
        { stepNumber: 1, name: 'Send Welcome Email', status: 'pending', assignedTo: 'HR Team' },
        { stepNumber: 2, name: 'Prepare Workspace', status: 'pending', assignedTo: 'IT Team' },
        { stepNumber: 3, name: 'Setup Equipment', status: 'pending', assignedTo: 'IT Team' },
        { stepNumber: 4, name: 'Create System Accounts', status: 'pending', assignedTo: 'IT Team' },
        { stepNumber: 5, name: 'Schedule Orientation', status: 'pending', assignedTo: 'HR Team' },
        { stepNumber: 6, name: 'Assign Mentor', status: 'pending', assignedTo: 'Manager' },
        { stepNumber: 7, name: 'First Day Welcome', status: 'pending', assignedTo: 'Manager' },
      ]
    : [
        { stepNumber: 1, name: 'Exit Interview', status: 'pending', assignedTo: 'HR Team' },
        { stepNumber: 2, name: 'Collect Equipment', status: 'pending', assignedTo: 'IT Team' },
        { stepNumber: 3, name: 'Revoke System Access', status: 'pending', assignedTo: 'IT Team' },
        { stepNumber: 4, name: 'Final Payroll Processing', status: 'pending', assignedTo: 'Finance' },
        { stepNumber: 5, name: 'Knowledge Transfer', status: 'pending', assignedTo: 'Manager' },
        { stepNumber: 6, name: 'Update Records', status: 'pending', assignedTo: 'HR Team' },
      ];

  // Create workflow
  const workflowData = {
    employer_id: userContext.companyId,
    employee_id: validatedData.employeeId,
    employee_name: employee.full_name,
    workflow_type: validatedData.workflowType,
    status: 'pending',
    steps,
    current_step: 1,
    start_date: validatedData.startDate || new Date().toISOString(),
    due_date: validatedData.dueDate,
    created_by: userContext.id,
    created_by_email: userContext.email,
  };

  const { data: workflow, error } = await supabase
    .from('onboarding_workflows')
    .insert(workflowData)
    .select()
    .single();

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to create workflow',
      500,
      { details: error.message }
    );
  }

  return successResponse(workflow, 201);
}

export const GET = withErrorHandler(listHandler);
export const POST = withErrorHandler(createHandler);
