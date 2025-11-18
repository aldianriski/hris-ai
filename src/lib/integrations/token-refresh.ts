/**
 * Token Refresh Utilities
 * Handles automatic token refresh for OAuth integrations
 */

import { createClient } from '@/lib/supabase/server';
import { INTEGRATION_PROVIDERS, type IntegrationProvider } from './config';
import * as GoogleOAuth from './google/oauth';
import * as ZoomOAuth from './zoom/oauth';

export interface TokenRefreshResult {
  success: boolean;
  updated?: boolean;
  error?: string;
}

/**
 * Refresh tokens for a specific integration
 */
export async function refreshIntegrationTokens(
  integrationId: string
): Promise<TokenRefreshResult> {
  try {
    const supabase = await createClient();

    // Get the integration
    const { data: integration, error: fetchError } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', integrationId)
      .single();

    if (fetchError || !integration) {
      return {
        success: false,
        error: 'Integration not found',
      };
    }

    // Slack tokens don't expire, so no refresh needed
    if (integration.provider === INTEGRATION_PROVIDERS.SLACK) {
      return {
        success: true,
        updated: false,
      };
    }

    // Check if refresh is needed
    const needsRefresh =
      (integration.provider === INTEGRATION_PROVIDERS.GOOGLE && GoogleOAuth.needsRefresh(integration.expires_at)) ||
      (integration.provider === INTEGRATION_PROVIDERS.ZOOM && ZoomOAuth.needsRefresh(integration.expires_at));

    if (!needsRefresh) {
      return {
        success: true,
        updated: false,
      };
    }

    // Check if refresh token exists
    if (!integration.refresh_token) {
      return {
        success: false,
        error: 'No refresh token available',
      };
    }

    // Refresh the token
    let tokenResult: { success: boolean; tokens?: any; error?: string };

    switch (integration.provider) {
      case INTEGRATION_PROVIDERS.GOOGLE:
        tokenResult = await GoogleOAuth.refreshAccessToken(integration.refresh_token);
        break;

      case INTEGRATION_PROVIDERS.ZOOM:
        tokenResult = await ZoomOAuth.refreshAccessToken(integration.refresh_token);
        break;

      default:
        return {
          success: false,
          error: `Token refresh not supported for provider: ${integration.provider}`,
        };
    }

    if (!tokenResult.success || !tokenResult.tokens) {
      return {
        success: false,
        error: tokenResult.error || 'Failed to refresh token',
      };
    }

    // Update the integration with new tokens
    const { error: updateError } = await supabase
      .from('integrations')
      .update({
        access_token: tokenResult.tokens.access_token,
        refresh_token: tokenResult.tokens.refresh_token || integration.refresh_token,
        expires_at: tokenResult.tokens.expires_at,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integrationId);

    if (updateError) {
      return {
        success: false,
        error: `Failed to update tokens: ${updateError.message}`,
      };
    }

    return {
      success: true,
      updated: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Refresh tokens for all expiring integrations
 * This should be called periodically by a background job (P1.2)
 */
export async function refreshAllExpiringTokens(): Promise<{
  success: boolean;
  refreshed: number;
  failed: number;
  errors: Array<{ integrationId: string; error: string }>;
}> {
  try {
    const supabase = await createClient();

    // Get all active integrations with tokens that expire soon (within 10 minutes)
    const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { data: integrations, error: fetchError } = await supabase
      .from('integrations')
      .select('id, provider, expires_at')
      .eq('status', 'active')
      .not('refresh_token', 'is', null)
      .lt('expires_at', tenMinutesFromNow);

    if (fetchError) {
      return {
        success: false,
        refreshed: 0,
        failed: 0,
        errors: [{ integrationId: 'all', error: fetchError.message }],
      };
    }

    if (!integrations || integrations.length === 0) {
      return {
        success: true,
        refreshed: 0,
        failed: 0,
        errors: [],
      };
    }

    // Refresh each integration
    let refreshed = 0;
    let failed = 0;
    const errors: Array<{ integrationId: string; error: string }> = [];

    for (const integration of integrations) {
      const result = await refreshIntegrationTokens(integration.id);

      if (result.success && result.updated) {
        refreshed++;
      } else if (!result.success) {
        failed++;
        errors.push({
          integrationId: integration.id,
          error: result.error || 'Unknown error',
        });
      }
    }

    return {
      success: true,
      refreshed,
      failed,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      refreshed: 0,
      failed: 0,
      errors: [{
        integrationId: 'all',
        error: error instanceof Error ? error.message : 'Unknown error'
      }],
    };
  }
}

/**
 * Get valid access token for an integration (refresh if needed)
 */
export async function getValidAccessToken(
  integrationId: string
): Promise<{ success: boolean; accessToken?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Get the integration
    const { data: integration, error: fetchError } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', integrationId)
      .single();

    if (fetchError || !integration) {
      return {
        success: false,
        error: 'Integration not found',
      };
    }

    // Check if token needs refresh
    const needsRefresh =
      (integration.provider === INTEGRATION_PROVIDERS.GOOGLE && GoogleOAuth.needsRefresh(integration.expires_at)) ||
      (integration.provider === INTEGRATION_PROVIDERS.ZOOM && ZoomOAuth.needsRefresh(integration.expires_at));

    if (needsRefresh) {
      // Refresh the token
      const refreshResult = await refreshIntegrationTokens(integrationId);

      if (!refreshResult.success) {
        return {
          success: false,
          error: refreshResult.error || 'Failed to refresh token',
        };
      }

      // Get the updated integration
      const { data: updatedIntegration } = await supabase
        .from('integrations')
        .select('access_token')
        .eq('id', integrationId)
        .single();

      if (!updatedIntegration) {
        return {
          success: false,
          error: 'Failed to get updated token',
        };
      }

      return {
        success: true,
        accessToken: updatedIntegration.access_token,
      };
    }

    return {
      success: true,
      accessToken: integration.access_token,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
