## Advanced Monitoring

This module provides comprehensive monitoring and observability for the HRIS application.

## Components

### 1. **Sentry** - Error Tracking

Track and debug errors in production with Sentry.

**Setup:**

1. Create a Sentry account at https://sentry.io
2. Create a new Next.js project
3. Copy the DSN and add to environment variables:

```bash
# .env.local
NEXT_PUBLIC_SENTRY_DSN=https://your-public-key@sentry.io/your-project-id
SENTRY_DSN=https://your-private-key@sentry.io/your-project-id
```

**Usage:**

```typescript
import { captureError, captureMessage, setUser } from '@/lib/monitoring';

// Capture an error
try {
  throw new Error('Something went wrong');
} catch (error) {
  captureError(error, { context: 'payment-processing' });
}

// Capture a message
captureMessage('User signed up', 'info', { userId: '123' });

// Set user context
setUser({
  id: '123',
  email: 'user@example.com',
  username: 'johndoe',
});

// Wrap function with error handling
const safeFn = withErrorHandling(riskyFunction, {
  context: { module: 'auth' },
  rethrow: true,
});
```

### 2. **Structured Logging** - Axiom Compatible

Structured JSON logging for better log analysis.

**Setup:**

For Axiom integration:
1. Create account at https://axiom.co
2. Create a dataset
3. Get API token
4. Configure log shipper (optional)

**Usage:**

```typescript
import { logger, log } from '@/lib/monitoring';

// Quick logging
log.info('User logged in', { userId: '123' });
log.error('Payment failed', error, { orderId: '456' });
log.warn('Rate limit approaching', { current: 95, limit: 100 });

// Structured logging
logger.httpRequest('GET', '/api/users', 200, 150, { userId: '123' });
logger.dbQuery('SELECT * FROM users', 25);
logger.jobExecution('payroll-processing', 'completed', 5000);
logger.securityEvent('invalid-token', 'high', { ip: '1.2.3.4' });

// Custom logger
import { createLogger } from '@/lib/monitoring';
const payrollLogger = createLogger('payroll-service');
payrollLogger.info('Processing payroll', { periodId: '789' });
```

### 3. **Metrics** - Performance Tracking

Track custom metrics and performance data.

**Usage:**

```typescript
import { recordMetric, incrementCounter, recordTiming, measureTiming } from '@/lib/monitoring';

// Record metric
recordMetric('active-users', 150, 'count', { tier: 'pro' });

// Increment counter
incrementCounter('api-requests', 1, { endpoint: '/api/users' });

// Record timing
recordTiming('db-query', 125, { table: 'users' });

// Measure function timing
const result = await measureTiming(
  'payroll-calculation',
  async () => await calculatePayroll(periodId),
  { companyId }
);
```

### 4. **Vercel Analytics** - User Analytics

Track page views and custom events.

**Setup:**

Add Analytics component to your root layout:

```tsx
// app/layout.tsx
import { Analytics } from '@/lib/monitoring/analytics';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Usage:**

```typescript
import { trackEvent } from '@/lib/monitoring/analytics';

// Track custom events
trackEvent('button-click', { button: 'signup', page: '/pricing' });
trackEvent('feature-used', { feature: 'payroll-export' });
```

### 5. **Health Check** - Uptime Monitoring

Monitor application health and dependencies.

**Endpoint:** `GET /api/health`

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-11-18T10:30:00Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": {
      "status": "up",
      "latency": 25
    },
    "cache": {
      "status": "up",
      "latency": 15
    },
    "api": {
      "status": "up",
      "latency": 42
    }
  },
  "uptime": 86400
}
```

**BetterStack Setup:**

1. Create account at https://betterstack.com
2. Add HTTP monitor
3. Set URL to `https://your-app.com/api/health`
4. Set check interval (e.g., 1 minute)
5. Configure alerts (email, Slack, PagerDuty)

## Best Practices

### Error Tracking

- ✅ Capture errors with context
- ✅ Set user context after authentication
- ✅ Add breadcrumbs for debugging
- ✅ Filter out sensitive data
- ❌ Don't log passwords or tokens
- ❌ Don't capture too many errors (rate limit)

### Logging

- ✅ Use structured logging (JSON)
- ✅ Include timestamps and context
- ✅ Use appropriate log levels
- ✅ Log important business events
- ❌ Don't log sensitive data (PII, credentials)
- ❌ Don't log too verbosely in production

### Metrics

- ✅ Track key business metrics
- ✅ Track performance metrics
- ✅ Use tags for filtering
- ✅ Set up dashboards
- ❌ Don't track too many metrics (cost)
- ❌ Don't use high-cardinality tags

### Monitoring

- ✅ Set up alerts for critical issues
- ✅ Monitor error rates
- ✅ Monitor response times
- ✅ Monitor uptime
- ✅ Set up escalation policies
- ❌ Don't create alert fatigue
- ❌ Don't ignore warnings

## Integration Example

Complete monitoring setup:

```typescript
// app/api/some-route/route.ts
import { NextRequest } from 'next/server';
import { logger, captureError, recordMetric } from '@/lib/monitoring';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Add breadcrumb
    logger.addBreadcrumb('Processing request', 'http');

    // Your business logic
    const result = await processData();

    // Record success metric
    const duration = Date.now() - startTime;
    recordMetric('request-duration', duration, 'ms', { status: 'success' });
    logger.httpRequest('POST', '/api/some-route', 200, duration);

    return Response.json(result);
  } catch (error) {
    // Capture error
    captureError(error, {
      route: '/api/some-route',
      method: 'POST',
    });

    // Log error
    logger.error('Request failed', error, { route: '/api/some-route' });

    // Record error metric
    recordMetric('request-errors', 1, 'count', { route: '/api/some-route' });

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Cost Optimization

### Sentry
- Free tier: 5K errors/month
- Pro: $26/month for 50K errors
- **Tip**: Use sampling in production (0.1 = 10%)

### Axiom
- Free tier: 0.5GB/month
- Pro: $25/month for 100GB
- **Tip**: Filter logs, avoid debug in production

### Vercel Analytics
- Free tier: 2.5K events/month
- Pro: Included with Vercel Pro plan
- **Tip**: Track important events only

### BetterStack
- Free tier: 10 monitors, 3-min checks
- Pro: $24/month for 50 monitors, 1-min checks
- **Tip**: Start with critical endpoints only

## Troubleshooting

### Sentry Not Capturing Errors

1. Check DSN is set correctly
2. Verify Sentry config files exist
3. Check beforeSend isn't filtering events
4. Ensure error is thrown (not just logged)

### Logs Not Appearing

1. Check environment (debug logs disabled in prod)
2. Verify console output is captured
3. Check log shipper configuration
4. Ensure JSON format is valid

### Health Check Failing

1. Check database connection
2. Verify Redis is accessible
3. Check network/firewall rules
4. Review error messages in response

## Security Considerations

- **Never log sensitive data**: passwords, tokens, SSNs, credit cards
- **Sanitize errors** before sending to Sentry
- **Use environment variables** for DSNs and tokens
- **Restrict access** to monitoring dashboards
- **Set up alerts** for security events
- **Rotate tokens** regularly
