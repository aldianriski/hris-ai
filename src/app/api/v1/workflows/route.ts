/**
 * Workflow Endpoints
 * GET /api/v1/workflows - List workflows
 * POST /api/v1/workflows - Create workflow
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth, requireAdmin } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { PaginationSchema } from '@/lib/api/types';

// ============================================
// GET /api/v1/workflows - List workflows
// ============================================

const listWorkflowsSchema = z.object({
  ...PaginationSchema.shape,
  trigger: z.enum(['manual', 'employee_created', 'employee_updated', 'leave_approved', 'payroll_approved', 'document_uploaded']).optional(),
  isActive: z.coerce.boolean().optional(),
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
    .from('workflows')
    .select('*', { count: 'exact' })
    .eq('employer_id', userContext.companyId);

  // Apply filters
  if (validatedParams.trigger) {
    query = query.eq('trigger', validatedParams.trigger);
  }

  if (validatedParams.isActive !== undefined) {
    query = query.eq('is_active', validatedParams.isActive);
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
// POST /api/v1/workflows - Create workflow
// ============================================

const createWorkflowSchema = z.object({
  name: z.string().min(1, 'Workflow name is required'),
  description: z.string().optional(),
  trigger: z.enum(['manual', 'employee_created', 'employee_updated', 'leave_approved', 'payroll_approved', 'document_uploaded']),
  actions: z.array(z.object({
    type: z.enum(['send_email', 'send_notification', 'update_field', 'create_task', 'webhook', 'slack_message']),
    config: z.record(z.any()),
    order: z.number().int().min(0),
  })).min(1, 'At least one action is required'),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than']),
    value: z.any(),
  })).optional(),
  isActive: z.boolean().default(true),
});

async function createHandler(request: NextRequest) {
  await withRateLimit(request);

  // Only admins can create workflows
  const userContext = await requireAdmin(request);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = createWorkflowSchema.parse(body);

  const supabase = await createClient();

  // Create workflow
  const workflowData = {
    employer_id: userContext.companyId,
    name: validatedData.name,
    description: validatedData.description,
    trigger: validatedData.trigger,
    actions: validatedData.actions,
    conditions: validatedData.conditions || [],
    is_active: validatedData.isActive,
    created_by: userContext.id,
    created_by_email: userContext.email,
    execution_count: 0,
    last_executed_at: null,
  };

  const { data: workflow, error } = await supabase
    .from('workflows')
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

  // TODO: Register workflow trigger with event system
  // TODO: Validate webhook URLs if webhook action is present

  return successResponse(workflow, 201);
}

export const GET = withErrorHandler(listHandler);
export const POST = withErrorHandler(createHandler);
