/**
 * DELETE /api/v1/integrations/:provider/disconnect
 * Disconnect and revoke an integration
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';
import { INTEGRATION_PROVIDERS, type IntegrationProvider } from '@/lib/integrations/config';
import * as SlackOAuth from '@/lib/integrations/slack/oauth';
import * as GoogleOAuth from '@/lib/integrations/google/oauth';
import * as ZoomOAuth from '@/lib/integrations/zoom/oauth';

async function handler(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  await standardRateLimit(request);

  const userContext = await requireAuth(request);
  const { provider } = params;

  // Validate provider
  if (!Object.values(INTEGRATION_PROVIDERS).includes(provider as IntegrationProvider)) {
    return errorResponse(
      'VAL_2001',
      `Invalid provider: ${provider}`,
      400
    );
  }

  const supabase = await createClient();

  // Get the integration
  const { data: integration, error: fetchError } = await supabase
    .from('integrations')
    .select('*')
    .eq('employer_id', userContext.companyId)
    .eq('provider', provider)
    .single();

  if (fetchError || !integration) {
    return notFoundResponse('Integration');
  }

  // Revoke tokens with the provider
  let revokeResult: { success: boolean; error?: string } = { success: true };

  if (integration.access_token) {
    switch (provider) {
      case INTEGRATION_PROVIDERS.SLACK:
        revokeResult = await SlackOAuth.revokeToken(integration.access_token);
        break;

      case INTEGRATION_PROVIDERS.GOOGLE:
        revokeResult = await GoogleOAuth.revokeToken(integration.access_token);
        break;

      case INTEGRATION_PROVIDERS.ZOOM:
        revokeResult = await ZoomOAuth.revokeToken(integration.access_token);
        break;
    }

    if (!revokeResult.success) {
      console.error(`Failed to revoke ${provider} token:`, revokeResult.error);
      // Continue anyway to delete the integration from database
    }
  }

  // Delete the integration from database
  const { error: deleteError } = await supabase
    .from('integrations')
    .delete()
    .eq('id', integration.id);

  if (deleteError) {
    return errorResponse(
      'SRV_9002',
      'Failed to disconnect integration',
      500,
      { details: deleteError.message }
    );
  }

  return successResponse({
    message: `${provider} integration disconnected successfully`,
    provider,
  });
}

export const DELETE = withErrorHandler(handler);
