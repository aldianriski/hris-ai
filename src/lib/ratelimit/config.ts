/**
 * Rate Limit Configuration
 * Define rate limits for different API endpoints
 */

export const RateLimitConfig = {
  // Authentication endpoints
  auth: {
    login: {
      requests: 5,
      window: '15m',
      description: 'Login attempts per 15 minutes',
    },
    register: {
      requests: 3,
      window: '1h',
      description: 'Registration attempts per hour',
    },
    passwordReset: {
      requests: 3,
      window: '1h',
      description: 'Password reset requests per hour',
    },
  },

  // API endpoints by user tier
  tiers: {
    free: {
      requests: 100,
      window: '1h',
      description: 'Free tier: 100 requests per hour',
    },
    pro: {
      requests: 500,
      window: '1h',
      description: 'Pro tier: 500 requests per hour',
    },
    enterprise: {
      requests: 2000,
      window: '1h',
      description: 'Enterprise tier: 2000 requests per hour',
    },
  },

  // Public endpoints (no auth required)
  public: {
    requests: 50,
    window: '1h',
    description: 'Public endpoints: 50 requests per hour per IP',
  },

  // Specific sensitive operations
  operations: {
    fileUpload: {
      requests: 20,
      window: '1h',
      description: 'File uploads per hour',
    },
    pdfGeneration: {
      requests: 50,
      window: '1h',
      description: 'PDF generation per hour',
    },
    emailSend: {
      requests: 30,
      window: '1h',
      description: 'Email sends per hour',
    },
    pushNotification: {
      requests: 100,
      window: '1h',
      description: 'Push notifications per hour',
    },
  },

  // Admin endpoints (higher limits)
  admin: {
    requests: 1000,
    window: '1h',
    description: 'Admin endpoints: 1000 requests per hour',
  },

  // Webhook endpoints
  webhook: {
    requests: 200,
    window: '1h',
    description: 'Webhook endpoints: 200 requests per hour',
  },
} as const;

/**
 * Get rate limit for specific endpoint
 */
export function getRateLimit(
  endpoint: keyof typeof RateLimitConfig
): { requests: number; window: string; description: string } {
  return RateLimitConfig[endpoint] as any;
}

/**
 * Get rate limit for user tier
 */
export function getTierRateLimit(
  tier: 'free' | 'pro' | 'enterprise' = 'free'
): { requests: number; window: string; description: string } {
  return RateLimitConfig.tiers[tier];
}
