/**
 * Webhook Detail Endpoints
 * GET /api/v1/webhooks/:id - Get webhook details
 * PUT /api/v1/webhooks/:id - Update webhook
 * DELETE /api/v1/webhooks/:id - Delete webhook
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth, requireAdmin } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';

// ============================================
// GET /api/v1/webhooks/:id - Get webhook details
// ============================================

async function getHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);
  const { id } = params;

  const supabase = await createClient();

  // Get the webhook
  const { data: webhook, error } = await supabase
    .from('webhooks')
    .select('*')
    .eq('id', id)
    .eq('employer_id', userContext.companyId)
    .single();

  if (error || !webhook) {
    return notFoundResponse('Webhook');
  }

  return successResponse(webhook);
}

// ============================================
// PUT /api/v1/webhooks/:id - Update webhook
// ============================================

const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
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
  ])).min(1).optional(),
  description: z.string().optional(),
  secret: z.string().min(16).optional(),
  headers: z.record(z.string()).optional(),
  isActive: z.boolean().optional(),
});

async function updateHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await withRateLimit(request);

  // Only admins can update webhooks
  const userContext = await requireAdmin(request);
  const { id } = params;

  // Parse and validate request body
  const body = await request.json();
  const validatedData = updateWebhookSchema.parse(body);

  const supabase = await createClient();

  // Get existing webhook
  const { data: existingWebhook, error: fetchError } = await supabase
    .from('webhooks')
    .select('*')
    .eq('id', id)
    .eq('employer_id', userContext.companyId)
    .single();

  if (fetchError || !existingWebhook) {
    return notFoundResponse('Webhook');
  }

  // Prepare update data
  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (validatedData.url) updateData.url = validatedData.url;
  if (validatedData.events) updateData.events = validatedData.events;
  if (validatedData.description !== undefined) updateData.description = validatedData.description;
  if (validatedData.secret) updateData.secret = validatedData.secret;
  if (validatedData.headers) updateData.headers = validatedData.headers;
  if (validatedData.isActive !== undefined) updateData.is_active = validatedData.isActive;

  // Update webhook
  const { data: updatedWebhook, error } = await supabase
    .from('webhooks')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to update webhook',
      500,
      { details: error.message }
    );
  }

  return successResponse(updatedWebhook);
}

// ============================================
// DELETE /api/v1/webhooks/:id - Delete webhook
// ============================================

async function deleteHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await withRateLimit(request);

  // Only admins can delete webhooks
  const userContext = await requireAdmin(request);
  const { id } = params;

  const supabase = await createClient();

  // Get the webhook first
  const { data: webhook, error: fetchError } = await supabase
    .from('webhooks')
    .select('*')
    .eq('id', id)
    .eq('employer_id', userContext.companyId)
    .single();

  if (fetchError || !webhook) {
    return notFoundResponse('Webhook');
  }

  // Delete webhook
  const { error } = await supabase
    .from('webhooks')
    .delete()
    .eq('id', id);

  if (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to delete webhook',
      500,
      { details: error.message }
    );
  }

  return successResponse({ message: 'Webhook deleted successfully' });
}

export const GET = withErrorHandler(getHandler);
export const PUT = withErrorHandler(updateHandler);
export const DELETE = withErrorHandler(deleteHandler);
