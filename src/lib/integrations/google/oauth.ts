/**
 * Google OAuth Integration
 * Handles OAuth flow and token management for Google Calendar
 */

import { GOOGLE_CONFIG, type OAuthTokens } from '../config';

export interface GoogleOAuthResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
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
      client_id: GOOGLE_CONFIG.CLIENT_ID,
      client_secret: GOOGLE_CONFIG.CLIENT_SECRET,
      code,
      redirect_uri: GOOGLE_CONFIG.REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const response = await fetch(GOOGLE_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data: GoogleOAuthResponse = await response.json();

    if (data.error) {
      return {
        success: false,
        error: data.error_description || data.error || 'Failed to obtain access token',
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
    const params = new URLSearchParams({
      client_id: GOOGLE_CONFIG.CLIENT_ID,
      client_secret: GOOGLE_CONFIG.CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const response = await fetch(GOOGLE_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data: GoogleOAuthResponse = await response.json();

    if (data.error) {
      return {
        success: false,
        error: data.error_description || data.error || 'Failed to refresh token',
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
        refresh_token: data.refresh_token || refreshToken, // Keep old refresh token if new one not provided
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
 * Revoke Google access token
 */
export async function revokeToken(
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const params = new URLSearchParams({ token });

    const response = await fetch(`${GOOGLE_CONFIG.REVOKE_URL}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
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
