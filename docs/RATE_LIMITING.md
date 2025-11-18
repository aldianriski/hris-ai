# Rate Limiting Guide

Complete guide to API rate limiting in HRIS AI system using Upstash Rate Limit.

## Table of Contents

1. [Overview](#overview)
2. [Configuration](#configuration)
3. [Usage](#usage)
4. [Rate Limit Tiers](#rate-limit-tiers)
5. [Response Headers](#response-headers)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)
8. [Monitoring](#monitoring)

---

## Overview

### Why Rate Limiting?

Rate limiting protects your API from:
- **Abuse:** Prevents malicious users from overwhelming the system
- **DoS Attacks:** Mitigates denial-of-service attempts
- **Cost Control:** Limits resource consumption per user
- **Fair Usage:** Ensures equitable access for all users

### Technology Stack

- **Upstash Rate Limit:** Serverless rate limiting with Redis
- **Sliding Window:** Smooth rate limiting algorithm
- **Analytics:** Built-in rate limit analytics

---

## Configuration

### Environment Variables

Add to `.env.local`:

```bash
# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### Default Rate Limits

| Category | Endpoint Type | Limit | Window |
|----------|--------------|-------|--------|
| **Authentication** | Login | 5 requests | 15 minutes |
| | Register | 3 requests | 1 hour |
| | Password Reset | 3 requests | 1 hour |
| **API Tiers** | Free | 100 requests | 1 hour |
| | Pro | 500 requests | 1 hour |
| | Enterprise | 2000 requests | 1 hour |
| **Public** | Unauthenticated | 50 requests | 1 hour |
| **Operations** | File Upload | 20 requests | 1 hour |
| | PDF Generation | 50 requests | 1 hour |
| | Email Send | 30 requests | 1 hour |
| | Push Notification | 100 requests | 1 hour |
| **Admin** | Admin Endpoints | 1000 requests | 1 hour |
| **Webhook** | Webhook Endpoints | 200 requests | 1 hour |

---

## Usage

### Basic Usage

Apply rate limiting to any API route:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware } from '@/lib/ratelimit/middleware';
import { successResponse } from '@/lib/api/response';

async function handleRequest(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    successResponse({ message: 'Success' })
  );
}

// Apply public rate limiting (50 requests/hour per IP)
export const GET = rateLimitMiddleware.public(handleRequest);
```

### Pre-configured Middleware

Use pre-configured middleware for common scenarios:

```typescript
import { rateLimitMiddleware } from '@/lib/ratelimit/middleware';

// Authentication endpoints
export const POST = rateLimitMiddleware.login(handleLogin);
export const POST = rateLimitMiddleware.register(handleRegister);
export const POST = rateLimitMiddleware.passwordReset(handlePasswordReset);

// Tier-based endpoints
export const GET = rateLimitMiddleware.free(handleFreeEndpoint);
export const GET = rateLimitMiddleware.pro(handleProEndpoint);
export const GET = rateLimitMiddleware.enterprise(handleEnterpriseEndpoint);

// Operations
export const POST = rateLimitMiddleware.fileUpload(handleFileUpload);
export const POST = rateLimitMiddleware.pdfGeneration(handlePdfGeneration);
export const POST = rateLimitMiddleware.emailSend(handleEmailSend);
export const POST = rateLimitMiddleware.pushNotification(handlePushNotification);

// Admin/Webhook
export const POST = rateLimitMiddleware.admin(handleAdminAction);
export const POST = rateLimitMiddleware.webhook(handleWebhook);
```

### Custom Rate Limits

Create custom rate limits for specific needs:

```typescript
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { createRateLimiter } from '@/lib/ratelimit/service';

// Create custom limiter
const customLimiter = createRateLimiter({
  requests: 10,
  window: '5m',
  prefix: 'ratelimit:custom',
});

// Apply to endpoint
export const POST = withRateLimit(handleRequest, {
  limiter: customLimiter,
  onLimitReached: (identifier, request) => {
    console.log(`Rate limit exceeded: ${identifier}`);
  },
});
```

### User-Specific Rate Limiting

Apply different rate limits based on user authentication:

```typescript
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { verifyAuthToken } from '@/lib/auth/jwt';

export const GET = withRateLimit(handleRequest, {
  limiterKey: 'pro',
  getUserId: async (request) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return undefined;

    try {
      const token = authHeader.replace('Bearer ', '');
      const payload = await verifyAuthToken(token);
      return payload.userId;
    } catch {
      return undefined;
    }
  },
});
```

### Dynamic Tier-Based Rate Limiting

Automatically apply rate limits based on user's subscription tier:

```typescript
import { withTierRateLimit } from '@/lib/ratelimit/middleware';
import { verifyAuthToken } from '@/lib/auth/jwt';

export const GET = await withTierRateLimit(
  handleRequest,
  async (request) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return undefined;

    const token = authHeader.replace('Bearer ', '');
    const payload = await verifyAuthToken(token);
    return payload.userId;
  }
);
```

---

## Rate Limit Tiers

### Free Tier

**Limit:** 100 requests per hour

**Best for:**
- Individual users
- Small teams (1-5 employees)
- Testing and evaluation

**Use cases:**
- Basic HRIS operations
- Read-heavy workloads
- Manual data entry

### Pro Tier

**Limit:** 500 requests per hour

**Best for:**
- Growing companies (5-50 employees)
- Moderate automation
- Integration with other tools

**Use cases:**
- Automated workflows
- Third-party integrations
- Real-time updates

### Enterprise Tier

**Limit:** 2000 requests per hour

**Best for:**
- Large organizations (50+ employees)
- Heavy automation
- Custom integrations

**Use cases:**
- Complex workflows
- Multiple integrations
- High-frequency data sync
- Custom applications

---

## Response Headers

Every API response includes rate limit information:

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-01-18T03:00:00.000Z
Content-Type: application/json
```

### Header Definitions

| Header | Description | Example |
|--------|-------------|---------|
| `X-RateLimit-Limit` | Total requests allowed in window | `100` |
| `X-RateLimit-Remaining` | Requests remaining in window | `95` |
| `X-RateLimit-Reset` | When the rate limit resets (ISO 8601) | `2025-01-18T03:00:00.000Z` |

### Client-Side Implementation

```typescript
async function makeApiRequest(url: string) {
  const response = await fetch(url);

  const limit = response.headers.get('X-RateLimit-Limit');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');

  console.log(`Rate limit: ${remaining}/${limit} remaining`);
  console.log(`Resets at: ${reset}`);

  if (response.status === 429) {
    const resetTime = new Date(reset!);
    const waitMs = resetTime.getTime() - Date.now();
    console.log(`Rate limited. Wait ${waitMs}ms before retrying.`);
  }

  return response.json();
}
```

---

## Error Handling

### Rate Limit Exceeded Response

When rate limit is exceeded, API returns:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2025-01-18T03:00:00.000Z
Content-Type: application/json

{
  "success": false,
  "message": "Rate limit exceeded. Please try again later.",
  "error": "RATE_LIMIT_EXCEEDED"
}
```

### Client Error Handling

```typescript
try {
  const response = await fetch('/api/v1/employees');

  if (response.status === 429) {
    const data = await response.json();
    const resetTime = new Date(response.headers.get('X-RateLimit-Reset')!);
    const waitSeconds = Math.ceil((resetTime.getTime() - Date.now()) / 1000);

    throw new Error(`Rate limit exceeded. Try again in ${waitSeconds} seconds.`);
  }

  return response.json();
} catch (error) {
  console.error('API Error:', error);
  // Show user-friendly error message
}
```

### Retry Strategy

Implement exponential backoff with rate limit awareness:

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);

    // Success
    if (response.ok) {
      return response;
    }

    // Rate limited
    if (response.status === 429) {
      const resetTime = new Date(response.headers.get('X-RateLimit-Reset')!);
      const waitMs = resetTime.getTime() - Date.now();

      // Wait until rate limit resets
      console.log(`Rate limited. Waiting ${waitMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      continue;
    }

    // Other errors
    if (i === maxRetries - 1) {
      throw new Error(`Failed after ${maxRetries} retries`);
    }

    // Exponential backoff
    const delay = Math.pow(2, i) * 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw new Error('Max retries exceeded');
}
```

---

## Best Practices

### 1. Choose Appropriate Limits

```typescript
// ✅ Good: Strict limits for sensitive operations
export const POST = rateLimitMiddleware.login(handleLogin); // 5 requests/15min

// ✅ Good: Generous limits for read operations
export const GET = rateLimitMiddleware.pro(handleRead); // 500 requests/hour

// ❌ Bad: Too strict for normal operations
export const GET = rateLimitMiddleware.login(handleRead); // 5 requests/15min
```

### 2. Use User-Specific Limiting

```typescript
// ✅ Good: Rate limit per user, not per IP
export const GET = withRateLimit(handler, {
  limiterKey: 'pro',
  getUserId: async (req) => extractUserId(req),
});

// ❌ Bad: Rate limit per IP (shared IPs cause issues)
export const GET = rateLimitMiddleware.public(handler);
```

### 3. Provide Clear Error Messages

```typescript
// ✅ Good: Informative error with reset time
if (!result.success) {
  return NextResponse.json(
    {
      error: 'Rate limit exceeded',
      resetAt: new Date(result.reset).toISOString(),
      limit: result.limit,
    },
    { status: 429 }
  );
}
```

### 4. Log Rate Limit Events

```typescript
export const POST = withRateLimit(handler, {
  limiterKey: 'fileUpload',
  onLimitReached: (identifier, request) => {
    logger.warn('Rate limit exceeded', {
      identifier,
      url: request.url,
      method: request.method,
    });
  },
});
```

### 5. Monitor Rate Limit Usage

```typescript
// Track rate limit analytics
import { rateLimiters } from '@/lib/ratelimit/service';

// Upstash automatically tracks:
// - Requests per identifier
// - Rate limit hits
// - Usage patterns
```

---

## Monitoring

### Upstash Dashboard

View rate limit analytics in Upstash Console:
- https://console.upstash.com

**Metrics available:**
- Total requests
- Rate limit hits
- Top consumers
- Usage patterns

### Application Logs

Rate limit events are logged automatically:

```json
{
  "level": "warn",
  "message": "Rate limit exceeded",
  "identifier": "user:123",
  "url": "/api/v1/employees",
  "method": "GET",
  "timestamp": "2025-01-18T12:00:00.000Z"
}
```

### Sentry Integration

Rate limit errors are tracked in Sentry:

```typescript
import { captureError } from '@/lib/monitoring/sentry';

if (!result.success) {
  captureError(new Error('Rate limit exceeded'), {
    context: 'rate-limit',
    identifier,
    url: request.url,
  });
}
```

### Custom Alerts

Set up alerts for rate limit issues:

```typescript
// Track rate limit violations
if (!result.success) {
  // Send alert if same identifier exceeds limit multiple times
  await sendAlert({
    type: 'rate-limit-violation',
    identifier,
    count: await getViolationCount(identifier),
  });
}
```

---

## API Reference

### `withRateLimit(handler, options)`

Apply rate limiting to API route handler.

**Parameters:**
- `handler`: API route handler function
- `options`: Rate limit options
  - `limiter`: Custom Ratelimit instance
  - `limiterKey`: Pre-configured limiter key
  - `getUserId`: Function to extract user ID
  - `onLimitReached`: Callback when limit exceeded

**Returns:** Rate-limited handler function

### `rateLimitMiddleware`

Pre-configured middleware for common scenarios.

**Available middleware:**
- `login`, `register`, `passwordReset`
- `free`, `pro`, `enterprise`
- `public`
- `fileUpload`, `pdfGeneration`, `emailSend`, `pushNotification`
- `admin`, `webhook`

### `createRateLimiter(options)`

Create custom rate limiter.

**Parameters:**
- `requests`: Number of requests allowed
- `window`: Time window (e.g., "15m", "1h")
- `prefix`: Redis key prefix (optional)

**Returns:** Ratelimit instance

---

## Examples

### Protecting Login Endpoint

```typescript
// src/app/api/auth/login/route.ts
import { rateLimitMiddleware } from '@/lib/ratelimit/middleware';

async function handleLogin(request: NextRequest) {
  // Login logic
}

// 5 requests per 15 minutes per IP
export const POST = rateLimitMiddleware.login(handleLogin);
```

### Tier-Based API Access

```typescript
// src/app/api/v1/employees/route.ts
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { getUserFromToken } from '@/lib/auth';

export const GET = withRateLimit(handleGetEmployees, {
  limiterKey: 'pro', // 500 requests/hour
  getUserId: async (req) => {
    const user = await getUserFromToken(req);
    return user?.id;
  },
});
```

### File Upload Protection

```typescript
// src/app/api/v1/files/upload/route.ts
import { rateLimitMiddleware } from '@/lib/ratelimit/middleware';

async function handleFileUpload(request: NextRequest) {
  // File upload logic
}

// 20 uploads per hour
export const POST = rateLimitMiddleware.fileUpload(handleFileUpload);
```

---

## Troubleshooting

### Issue: Rate limit too strict

**Solution:** Increase limits or use tier-based limiting

```typescript
// Increase limit
const customLimiter = createRateLimiter({
  requests: 200, // Increased from 100
  window: '1h',
});
```

### Issue: Shared IP addresses

**Solution:** Use user-specific limiting instead of IP-based

```typescript
// Switch from IP to user-based
export const GET = withRateLimit(handler, {
  getUserId: async (req) => extractUserId(req),
});
```

### Issue: Rate limit not applying

**Solution:** Check Redis connection and environment variables

```bash
# Verify environment variables
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN

# Test Redis connection
pnpm tsx -e "import {getRedisClient} from './src/lib/cache/redis'; getRedisClient().ping().then(console.log)"
```

---

## Further Reading

- [Upstash Rate Limit Documentation](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)
- [API Best Practices](./API.md)
- [Monitoring Guide](./ARCHITECTURE.md#monitoring)

---

**Last Updated:** 2025-01-18
**Version:** 1.0.0
