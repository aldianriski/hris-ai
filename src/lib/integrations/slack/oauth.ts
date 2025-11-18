/**
 * Slack OAuth Integration
 * Handles OAuth flow and token management for Slack
 */

import { SLACK_CONFIG, type OAuthTokens } from '../config';

export interface SlackOAuthResponse {
  ok: boolean;
  access_token?: string;
  token_type?: string;
  scope?: string;
  bot_user_id?: string;
  app_id?: string;
  team?: {
    id: string;
    name: string;
  };
  enterprise?: {
    id: string;
    name: string;
  };
  authed_user?: {
    id: string;
    scope?: string;
    access_token?: string;
    token_type?: string;
  };
  error?: string;
  error_description?: string;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  code: string
): Promise<{ success: boolean; tokens?: OAuthTokens; error?: string }> {
  try {
    const params = new URLSearchParams({
      client_id: SLACK_CONFIG.CLIENT_ID,
      client_secret: SLACK_CONFIG.CLIENT_SECRET,
      code,
      redirect_uri: SLACK_CONFIG.REDIRECT_URI,
    });

    const response = await fetch(SLACK_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data: SlackOAuthResponse = await response.json();

    if (!data.ok || !data.access_token) {
      return {
        success: false,
        error: data.error || data.error_description || 'Failed to obtain access token',
      };
    }

    return {
      success: true,
      tokens: {
        access_token: data.access_token,
        token_type: data.token_type,
        scope: data.scope,
        // Slack tokens don't expire, but we can track installation time
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Revoke Slack access token
 */
export async function revokeToken(
  accessToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${SLACK_CONFIG.API_BASE_URL}/auth.revoke`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await response.json();

    if (!data.ok) {
      return {
        success: false,
        error: data.error || 'Failed to revoke token',
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Test Slack connection
 */
export async function testConnection(
  accessToken: string
): Promise<{ success: boolean; error?: string; teamInfo?: any }> {
  try {
    const response = await fetch(`${SLACK_CONFIG.API_BASE_URL}/auth.test`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await response.json();

    if (!data.ok) {
      return {
        success: false,
        error: data.error || 'Connection test failed',
      };
    }

    return {
      success: true,
      teamInfo: {
        team: data.team,
        team_id: data.team_id,
        user: data.user,
        user_id: data.user_id,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
