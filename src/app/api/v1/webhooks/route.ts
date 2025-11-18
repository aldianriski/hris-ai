/**
 * Webhook Management Endpoints
 * GET /api/v1/webhooks - List webhooks
 * POST /api/v1/webhooks - Create webhook
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
// GET /api/v1/webhooks - List webhooks
// ============================================

const listWebhooksSchema = z.object({
  ...PaginationSchema.shape,
  event: z.enum([
    'employee.created',
    'employee.updated',
    'employee.deleted',
    'leave.submitted',
    'leave.approved',
    'leave.rejected',
    'payroll.approved',
    'payroll.paid',
    'document.uploaded',
    'document.verified',
    'performance.review_submitted',
  ]).optional(),
  isActive: z.coerce.boolean().optional(),
});

async function listHandler(request: NextRequest) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = listWebhooksSchema.parse(params);

  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('webhooks')
    .select('*', { count: 'exact' })
    .eq('employer_id', userContext.companyId);

  // Apply filters
  if (validatedParams.event) {
    query = query.contains('events', [validatedParams.event]);
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
      'Failed to fetch webhooks',
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
// POST /api/v1/webhooks - Create webhook
// ============================================

const createWebhookSchema = z.object({
  url: z.string().url('Invalid webhook URL'),
  events: z.array(z.enum([
    'employee.created',
    'employee.updated',
    'employee.deleted',
    'leave.submitted',
    'leave.approved',
    'leave.rejected',
    'payroll.approved',
    'payroll.paid',
    'document.uploaded',
    'document.verified',
    'performance.review_submitted',
  ])).min(1, 'At least one event is required'),
  description: z.string().optional(),
  secret: z.string().min(16, 'Secret must be at least 16 characters').optional(),
  headers: z.record(z.string()).optional(),
  isActive: z.boolean().default(true),
});

async function createHandler(request: NextRequest) {
  await withRateLimit(request);

  // Only admins can create webhooks
  const userContext = await requireAdmin(request);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = createWebhookSchema.parse(body);

  const supabase = await createClient();

  // Generate a secret if not provided
  const secret = validatedData.secret || generateSecret();

  // Create webhook
  const webhookData = {
    employer_id: userContext.companyId,
    url: validatedData.url,
    events: validatedData.events,
    description: validatedData.description,
    secret,
    headers: validatedData.headers || {},
    is_active: validatedData.isActive,
    created_by: userContext.id,
    created_by_email: userContext.email,
    delivery_count: 0,
    failed_count: 0,
    last_delivery_at: null,
    last_status: null,
  };

  const { data: webhook, error } = await supabase
    .from('webhooks')
    .insert(webhookData)
    .select()
    .single();

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to create webhook',
      500,
      { details: error.message }
    );
  }

  return successResponse(webhook, 201);
}

// Helper function to generate a secure random secret
function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

export const GET = withErrorHandler(listHandler);
export const POST = withErrorHandler(createHandler);
