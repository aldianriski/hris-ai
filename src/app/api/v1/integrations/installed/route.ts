/**
 * GET /api/v1/integrations/installed
 * List installed integrations for the company
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { z } from 'zod';
import { PaginationSchema } from '@/lib/api/types';

const listInstalledSchema = z.object({
  ...PaginationSchema.shape,
  isActive: z.coerce.boolean().optional(),
});

async function handler(request: NextRequest) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = listInstalledSchema.parse(params);

  const supabase = await createClient();

  try {
    // Build query
    let query = supabase
      .from('installed_integrations')
      .select('*', { count: 'exact' })
      .eq('employer_id', userContext.companyId);

    // Apply filters
    if (validatedParams.isActive !== undefined) {
      query = query.eq('is_active', validatedParams.isActive);
    }

    // Apply sorting
    if (validatedParams.sortBy) {
      query = query.order(validatedParams.sortBy, { ascending: validatedParams.sortOrder === 'asc' });
    } else {
      query = query.order('installed_at', { ascending: false });
    }

    // Apply pagination
    const from = (validatedParams.page - 1) * validatedParams.limit;
    const to = from + validatedParams.limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    // Mask sensitive configuration data
    const maskedData = data?.map(integration => ({
      ...integration,
      config: maskSensitiveFields(integration.config),
    }));

    return paginatedResponse(
      maskedData || [],
      count || 0,
      validatedParams.page,
      validatedParams.limit
    );
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch installed integrations',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

// Helper function to mask sensitive fields
function maskSensitiveFields(config: Record<string, any>): Record<string, any> {
  const masked = { ...config };
  const sensitiveFields = ['apiKey', 'apiSecret', 'password', 'token', 'webhookUrl'];

  Object.keys(masked).forEach(key => {
    if (sensitiveFields.includes(key) && masked[key]) {
      masked[key] = '***';
    }
  });

  return masked;
}

export const GET = withErrorHandler(handler);
