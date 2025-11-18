/**
 * POST /api/v1/integrations/:provider/install
 * Initiate OAuth flow for integration installation
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { standardRateLimit } from '@/lib/middleware/rateLimit';
import { INTEGRATION_PROVIDERS, type IntegrationProvider, getOAuthUrl, validateIntegrationConfig } from '@/lib/integrations/config';

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

  // Validate provider configuration
  const configValidation = validateIntegrationConfig(provider as IntegrationProvider);
  if (!configValidation.valid) {
    return errorResponse(
      'CFG_6001',
      configValidation.error || 'Provider not configured',
      500
    );
  }

  // Generate state parameter with user context
  const state = Buffer.from(JSON.stringify({
    userId: userContext.id,
    companyId: userContext.companyId,
    timestamp: Date.now(),
  })).toString('base64');

  // Get OAuth URL
  const oauthUrl = getOAuthUrl(provider as IntegrationProvider, state);

  return successResponse({
    authUrl: oauthUrl,
    provider,
    message: 'Redirect user to authUrl to complete OAuth flow',
  });
}

export const POST = withErrorHandler(handler);
