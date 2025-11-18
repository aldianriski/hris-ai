/**
 * Integration Configuration
 * OAuth and API configuration for third-party integrations
 */

export const INTEGRATION_PROVIDERS = {
  SLACK: 'slack',
  GOOGLE: 'google',
  ZOOM: 'zoom',
} as const;

export type IntegrationProvider = typeof INTEGRATION_PROVIDERS[keyof typeof INTEGRATION_PROVIDERS];

/**
 * Slack Configuration
 */
export const SLACK_CONFIG = {
  CLIENT_ID: process.env.SLACK_CLIENT_ID || '',
  CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET || '',
  REDIRECT_URI: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/v1/integrations/callback/slack`,
  SCOPES: [
    'chat:write',           // Send messages
    'chat:write.public',    // Send messages to public channels
    'channels:read',        // View basic channel info
    'users:read',           // View users
    'users:read.email',     // View email addresses
  ].join(','),
  OAUTH_URL: 'https://slack.com/oauth/v2/authorize',
  TOKEN_URL: 'https://slack.com/api/oauth.v2.access',
  API_BASE_URL: 'https://slack.com/api',
} as const;

/**
 * Google Calendar Configuration
 */
export const GOOGLE_CONFIG = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  REDIRECT_URI: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/v1/integrations/callback/google`,
  SCOPES: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ].join(' '),
  OAUTH_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
  TOKEN_URL: 'https://oauth2.googleapis.com/token',
  REVOKE_URL: 'https://oauth2.googleapis.com/revoke',
  API_BASE_URL: 'https://www.googleapis.com/calendar/v3',
  ACCESS_TYPE: 'offline',
  PROMPT: 'consent',
} as const;

/**
 * Zoom Configuration
 */
export const ZOOM_CONFIG = {
  CLIENT_ID: process.env.ZOOM_CLIENT_ID || '',
  CLIENT_SECRET: process.env.ZOOM_CLIENT_SECRET || '',
  REDIRECT_URI: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/v1/integrations/callback/zoom`,
  SCOPES: [
    'meeting:write',
    'meeting:read',
    'user:read',
  ].join(' '),
  OAUTH_URL: 'https://zoom.us/oauth/authorize',
  TOKEN_URL: 'https://zoom.us/oauth/token',
  API_BASE_URL: 'https://api.zoom.us/v2',
} as const;

/**
 * Integration Types
 */
export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  scope?: string;
  token_type?: string;
}

export interface IntegrationConfig {
  employer_id: string;
  provider: IntegrationProvider;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  scope?: string;
  webhook_url?: string;
  settings?: Record<string, any>;
  installed_by: string;
}

/**
 * Get OAuth URL for provider
 */
export function getOAuthUrl(provider: IntegrationProvider, state: string): string {
  switch (provider) {
    case INTEGRATION_PROVIDERS.SLACK:
      return `${SLACK_CONFIG.OAUTH_URL}?client_id=${SLACK_CONFIG.CLIENT_ID}&scope=${SLACK_CONFIG.SCOPES}&redirect_uri=${encodeURIComponent(SLACK_CONFIG.REDIRECT_URI)}&state=${state}`;

    case INTEGRATION_PROVIDERS.GOOGLE:
      return `${GOOGLE_CONFIG.OAUTH_URL}?client_id=${GOOGLE_CONFIG.CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_CONFIG.REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(GOOGLE_CONFIG.SCOPES)}&access_type=${GOOGLE_CONFIG.ACCESS_TYPE}&prompt=${GOOGLE_CONFIG.PROMPT}&state=${state}`;

    case INTEGRATION_PROVIDERS.ZOOM:
      return `${ZOOM_CONFIG.OAUTH_URL}?client_id=${ZOOM_CONFIG.CLIENT_ID}&redirect_uri=${encodeURIComponent(ZOOM_CONFIG.REDIRECT_URI)}&response_type=code&state=${state}`;

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Validate integration configuration
 */
export function validateIntegrationConfig(provider: IntegrationProvider): { valid: boolean; error?: string } {
  switch (provider) {
    case INTEGRATION_PROVIDERS.SLACK:
      if (!SLACK_CONFIG.CLIENT_ID || !SLACK_CONFIG.CLIENT_SECRET) {
        return { valid: false, error: 'Slack OAuth credentials not configured' };
      }
      break;

    case INTEGRATION_PROVIDERS.GOOGLE:
      if (!GOOGLE_CONFIG.CLIENT_ID || !GOOGLE_CONFIG.CLIENT_SECRET) {
        return { valid: false, error: 'Google OAuth credentials not configured' };
      }
      break;

    case INTEGRATION_PROVIDERS.ZOOM:
      if (!ZOOM_CONFIG.CLIENT_ID || !ZOOM_CONFIG.CLIENT_SECRET) {
        return { valid: false, error: 'Zoom OAuth credentials not configured' };
      }
      break;

    default:
      return { valid: false, error: `Unsupported provider: ${provider}` };
  }

  return { valid: true };
}
