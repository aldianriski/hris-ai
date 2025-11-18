/**
 * DELETE /api/v1/integrations/:id/uninstall
 * Uninstall an integration
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAdmin } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';

async function handler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await withRateLimit(request);

  // Only admins can uninstall integrations
  const userContext = await requireAdmin(request);
  const { id: integrationId } = params;

  const supabase = await createClient();

  try {
    // Find the installed integration
    const { data: installation, error: fetchError } = await supabase
      .from('installed_integrations')
      .select('*')
      .eq('employer_id', userContext.companyId)
      .eq('integration_id', integrationId)
      .single();

    if (fetchError || !installation) {
      return notFoundResponse('Installed integration');
    }

    // Delete the installation
    const { error: deleteError } = await supabase
      .from('installed_integrations')
      .delete()
      .eq('id', installation.id);

    if (deleteError) {
      throw deleteError;
    }

    // TODO: Clean up integration-specific data (webhooks, sync jobs, etc.)
    // TODO: Revoke API tokens/credentials if possible
    // TODO: Remove scheduled sync jobs

    return successResponse({
      message: 'Integration uninstalled successfully',
      integration_id: integrationId,
      uninstalled_at: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to uninstall integration',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

export const DELETE = withErrorHandler(handler);
