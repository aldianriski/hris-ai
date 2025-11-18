/**
 * POST /api/v1/integrations/:id/install
 * Install an integration for the company
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';

const installIntegrationSchema = z.object({
  config: z.record(z.any()),
});

async function handler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await standardRateLimit(request);

  // Only admins can install integrations
  const userContext = await requireAdmin(request);
  const { id: integrationId } = params;

  // Parse request body
  const body = await request.json();
  const validatedData = installIntegrationSchema.parse(body);

  const supabase = await createClient();

  try {
    // Check if integration is already installed
    const { data: existing } = await supabase
      .from('installed_integrations')
      .select('id')
      .eq('employer_id', userContext.companyId)
      .eq('integration_id', integrationId)
      .single();

    if (existing) {
      return errorResponse(
        'RES_3002',
        'Integration is already installed',
        409
      );
    }

    // TODO: Validate configuration against integration schema
    // TODO: Test connection with provided credentials

    // Install the integration
    const installationData = {
      employer_id: userContext.companyId,
      integration_id: integrationId,
      config: validatedData.config,
      is_active: true,
      installed_by: userContext.id,
      installed_by_email: userContext.email,
      installed_at: new Date().toISOString(),
      last_sync_at: null,
      sync_status: 'pending',
    };

    const { data: installation, error } = await supabase
      .from('installed_integrations')
      .insert(installationData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // TODO: Trigger initial sync based on integration capabilities
    // TODO: Set up webhooks if required by integration

    return successResponse({
      ...installation,
      config: maskSensitiveFields(installation.config),
    }, 201);
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to install integration',
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

export const POST = withErrorHandler(handler);
