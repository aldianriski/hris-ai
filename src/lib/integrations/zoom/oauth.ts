/**
 * Zoom OAuth Integration
 * Handles OAuth flow and token management for Zoom
 */

import { ZOOM_CONFIG, type OAuthTokens } from '../config';

export interface ZoomOAuthResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  error?: string;
  reason?: string;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  code: string
): Promise<{ success: boolean; tokens?: OAuthTokens; error?: string }> {
  try {
    // Zoom uses Basic Auth with client credentials
    const credentials = Buffer.from(
      `${ZOOM_CONFIG.CLIENT_ID}:${ZOOM_CONFIG.CLIENT_SECRET}`
    ).toString('base64');

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: ZOOM_CONFIG.REDIRECT_URI,
    });

    const response = await fetch(ZOOM_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data: ZoomOAuthResponse = await response.json();

    if (data.error) {
      return {
        success: false,
        error: data.reason || data.error || 'Failed to obtain access token',
      };
    }

    if (!data.access_token) {
      return {
        success: false,
        error: 'No access token received',
      };
    }

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

    return {
      success: true,
      tokens: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: expiresAt,
        scope: data.scope,
        token_type: data.token_type,
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
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ success: boolean; tokens?: OAuthTokens; error?: string }> {
  try {
    const credentials = Buffer.from(
      `${ZOOM_CONFIG.CLIENT_ID}:${ZOOM_CONFIG.CLIENT_SECRET}`
    ).toString('base64');

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const response = await fetch(ZOOM_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data: ZoomOAuthResponse = await response.json();

    if (data.error) {
      return {
        success: false,
        error: data.reason || data.error || 'Failed to refresh token',
      };
    }

    if (!data.access_token) {
      return {
        success: false,
        error: 'No access token received',
      };
    }

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

    return {
      success: true,
      tokens: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: expiresAt,
        scope: data.scope,
        token_type: data.token_type,
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
 * Revoke Zoom access token
 */
export async function revokeToken(
  accessToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const credentials = Buffer.from(
      `${ZOOM_CONFIG.CLIENT_ID}:${ZOOM_CONFIG.CLIENT_SECRET}`
    ).toString('base64');

    const params = new URLSearchParams({
      token: accessToken,
    });

    const response = await fetch(`${ZOOM_CONFIG.API_BASE_URL}/oauth/revoke`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to revoke token: ${response.statusText}`,
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
 * Check if token needs refresh (within 5 minutes of expiry)
 */
export function needsRefresh(expiresAt?: string): boolean {
  if (!expiresAt) {
    return false;
  }

  const expiryTime = new Date(expiresAt).getTime();
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  return expiryTime - now < fiveMinutes;
}
