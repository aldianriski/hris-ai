/**
 * GET /api/v1/integrations/callback/:provider
 * OAuth callback handler for third-party integrations
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { INTEGRATION_PROVIDERS, type IntegrationProvider, validateIntegrationConfig } from '@/lib/integrations/config';
import * as SlackOAuth from '@/lib/integrations/slack/oauth';
import * as GoogleOAuth from '@/lib/integrations/google/oauth';
import * as ZoomOAuth from '@/lib/integrations/zoom/oauth';

async function handler(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { provider } = params;
  const { searchParams } = new URL(request.url);

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth error from provider
  if (error) {
    const errorDescription = searchParams.get('error_description');
    return errorResponse(
      'INT_5001',
      `OAuth failed: ${errorDescription || error}`,
      400
    );
  }

  // Validate required parameters
  if (!code || !state) {
    return errorResponse(
      'VAL_2001',
      'Missing required parameters: code and state',
      400
    );
  }

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

  // Parse state to get user context
  let stateData: { userId: string; companyId: string };
  try {
    stateData = JSON.parse(Buffer.from(state, 'base64').toString());
  } catch {
    return errorResponse(
      'VAL_2001',
      'Invalid state parameter',
      400
    );
  }

  // Exchange code for tokens
  let tokenResult: { success: boolean; tokens?: any; error?: string };

  switch (provider) {
    case INTEGRATION_PROVIDERS.SLACK:
      tokenResult = await SlackOAuth.exchangeCodeForToken(code);
      break;

    case INTEGRATION_PROVIDERS.GOOGLE:
      tokenResult = await GoogleOAuth.exchangeCodeForToken(code);
      break;

    case INTEGRATION_PROVIDERS.ZOOM:
      tokenResult = await ZoomOAuth.exchangeCodeForToken(code);
      break;

    default:
      return errorResponse(
        'VAL_2001',
        `Unsupported provider: ${provider}`,
        400
      );
  }

  if (!tokenResult.success || !tokenResult.tokens) {
    return errorResponse(
      'INT_5002',
      `Failed to exchange OAuth code: ${tokenResult.error}`,
      400
    );
  }

  // Store integration in database
  const supabase = await createClient();

  // Check if integration already exists
  const { data: existingIntegration } = await supabase
    .from('integrations')
    .select('*')
    .eq('employer_id', stateData.companyId)
    .eq('provider', provider)
    .single();

  const integrationData = {
    employer_id: stateData.companyId,
    provider,
    access_token: tokenResult.tokens.access_token,
    refresh_token: tokenResult.tokens.refresh_token || null,
    expires_at: tokenResult.tokens.expires_at || null,
    scope: tokenResult.tokens.scope || null,
    status: 'active',
    installed_by: stateData.userId,
    installed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  let integration;

  if (existingIntegration) {
    // Update existing integration
    const { data, error } = await supabase
      .from('integrations')
      .update(integrationData)
      .eq('id', existingIntegration.id)
      .select()
      .single();

    if (error) {
      return errorResponse(
        'SRV_9002',
        'Failed to update integration',
        500,
        { details: error.message }
      );
    }

    integration = data;
  } else {
    // Create new integration
    const { data, error } = await supabase
      .from('integrations')
      .insert(integrationData)
      .select()
      .single();

    if (error) {
      return errorResponse(
        'SRV_9002',
        'Failed to create integration',
        500,
        { details: error.message }
      );
    }

    integration = data;
  }

  // Test the connection
  let testResult: { success: boolean; error?: string } = { success: true };

  switch (provider) {
    case INTEGRATION_PROVIDERS.SLACK:
      testResult = await SlackOAuth.testConnection(tokenResult.tokens.access_token);
      break;

    case INTEGRATION_PROVIDERS.GOOGLE:
      // Google Calendar doesn't have a dedicated test endpoint
      // We'll verify during first calendar operation
      break;

    case INTEGRATION_PROVIDERS.ZOOM:
      // Zoom doesn't have a dedicated test endpoint
      // We'll verify during first meeting creation
      break;
  }

  if (!testResult.success) {
    console.error(`Integration test failed for ${provider}:`, testResult.error);
    // Don't fail the request, just log the error
  }

  // Redirect to success page
  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/integrations?success=true&provider=${provider}`;

  return Response.redirect(redirectUrl, 302);
}

export const GET = withErrorHandler(handler);
