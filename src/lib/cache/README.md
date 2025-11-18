# Redis Caching Module

This module provides a complete caching layer using **Upstash Redis** for serverless environments.

## Features

- ✅ **Cache-aside pattern** with automatic fallback
- ✅ **Cache invalidation** on data changes
- ✅ **Cache warming** for frequently accessed data
- ✅ **Graceful degradation** when Redis is unavailable
- ✅ **Pattern-based invalidation** for related caches
- ✅ **Automatic retry** and error handling

## Setup

### 1. Create Upstash Redis Instance

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database (select your region)
3. Copy the **REST URL** and **REST Token**

### 2. Add Environment Variables

```bash
# .env.local
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### 3. Verify Connection

```typescript
import { isRedisAvailable } from '@/lib/cache';

const available = await isRedisAvailable();
console.log('Redis available:', available);
```

## Usage

### Basic Caching

```typescript
import { getCached, CacheTTL } from '@/lib/cache';

const data = await getCached(
  'my-cache-key',
  async () => {
    // Fetch from database
    return await db.query('SELECT * FROM users');
  },
  CacheTTL.MEDIUM // 15 minutes
);
```

### Cache Keys

Use the provided key generators for consistency:

```typescript
import {
  employeeKey,
  employeeListKey,
  dashboardKey,
  analyticsKey,
} from '@/lib/cache';

// Single employee
const key1 = employeeKey('emp-123');
// -> "employee:emp-123"

// Employee list with filters
const key2 = employeeListKey('company-456', JSON.stringify({ status: 'active' }));
// -> "employees:company-456:{\"status\":\"active\"}"

// Dashboard data
const key3 = dashboardKey('company-456', 'user-789');
// -> "dashboard:company-456:user-789"

// Analytics metric
const key4 = analyticsKey('company-456', 'headcount', '2024-01');
// -> "analytics:company-456:headcount:2024-01"
```

### Cache Invalidation

Invalidate caches when data changes:

```typescript
import {
  invalidateEmployeeCache,
  invalidateLeaveCache,
  invalidatePayrollCache,
  invalidateAttendanceCache,
} from '@/lib/cache';

// After creating/updating an employee
await invalidateEmployeeCache(employeeId, companyId);

// After approving a leave request
await invalidateLeaveCache(companyId, employeeId);

// After processing payroll
await invalidatePayrollCache(companyId, periodId);

// After marking attendance
await invalidateAttendanceCache(employeeId, companyId, date);
```

### Manual Cache Operations

```typescript
import { setCache, deleteCache, existsInCache } from '@/lib/cache';

// Set cache manually
await setCache('my-key', { foo: 'bar' }, CacheTTL.LONG);

// Check if exists
const exists = await existsInCache('my-key');

// Delete cache
await deleteCache('my-key');
```

### Cache Warming

Pre-populate cache with frequently accessed data:

```typescript
import {
  warmEmployeeCache,
  warmAnalyticsCache,
  warmDashboardCache,
  warmAllCompanyCache,
} from '@/lib/cache';

// Warm specific caches
await warmEmployeeCache('company-123');
await warmAnalyticsCache('company-123');
await warmDashboardCache('company-123', 'user-456');

// Warm all caches for a company
await warmAllCompanyCache('company-123');
```

**Automatic Cache Warming:**
A scheduled job runs every 30 minutes to warm caches for all active companies.

## Cache TTL Guidelines

```typescript
CacheTTL.SHORT   // 5 minutes  - Frequently changing data
CacheTTL.MEDIUM  // 15 minutes - Moderate change frequency
CacheTTL.LONG    // 1 hour     - Infrequently changing data
CacheTTL.DAY     // 24 hours   - Static data
CacheTTL.WEEK    // 7 days     - Very static data
```

### When to Use Each TTL

- **SHORT (5 min)**: Dashboard metrics, attendance today, pending approvals
- **MEDIUM (15 min)**: Employee lists, analytics, department data
- **LONG (1 hour)**: Company settings, department structure, position data
- **DAY (24 hours)**: Static configuration, rarely changing master data
- **WEEK (7 days)**: Lookup tables, country/province lists

## Integration Examples

### API Route with Caching

```typescript
// src/app/api/v1/analytics/dashboard/route.ts
import { getCached, dashboardKey, CacheTTL } from '@/lib/cache';

export async function GET(request: NextRequest) {
  const userContext = await requireAuth(request);

  const analytics = await getCached(
    dashboardKey(userContext.companyId, userContext.userId),
    async () => {
      // Fetch data from database
      return await fetchDashboardAnalytics(userContext.companyId);
    },
    CacheTTL.SHORT
  );

  return successResponse(analytics);
}
```

### Data Modification with Cache Invalidation

```typescript
// src/app/api/v1/employees/route.ts
import { invalidateEmployeeCache } from '@/lib/cache';

export async function POST(request: NextRequest) {
  // ... create employee

  // Invalidate caches after successful creation
  await invalidateEmployeeCache(employee.id, userContext.companyId);

  return successResponse(employee, 201);
}
```

## Monitoring

### Check Cache Hit Rate

Add logging to track cache performance:

```typescript
// Cache hits are logged as: [Cache] HIT: <key>
// Cache misses are logged as: [Cache] MISS: <key>
```

### Health Check

```typescript
import { isRedisAvailable } from '@/lib/cache';

export async function GET() {
  const redisHealthy = await isRedisAvailable();

  return {
    redis: redisHealthy ? 'healthy' : 'unavailable',
  };
}
```

## Best Practices

1. **Always use cache key generators** for consistency
2. **Invalidate caches** after data modifications
3. **Use appropriate TTLs** based on data change frequency
4. **Graceful degradation** - app works even if Redis is down
5. **Monitor cache hit rates** to optimize TTLs
6. **Warm critical caches** during off-peak hours
7. **Don't cache user-specific sensitive data** for too long

## Troubleshooting

### Cache Not Working

1. **Check Redis connection**:
   ```typescript
   const available = await isRedisAvailable();
   console.log('Redis available:', available);
   ```

2. **Verify environment variables**:
   ```bash
   echo $UPSTASH_REDIS_REST_URL
   echo $UPSTASH_REDIS_REST_TOKEN
   ```

3. **Check Upstash console** for connection errors

### Cache Not Invalidating

1. **Ensure invalidation is called** after data changes
2. **Check pattern matching** for pattern-based invalidation
3. **Verify company/employee IDs** are correct

### High Cache Miss Rate

1. **Increase TTL** if data doesn't change often
2. **Implement cache warming** for critical data
3. **Check if invalidation is too aggressive**

## Performance

- **Average latency**: 20-50ms for Upstash REST API
- **Cache hit**: ~50ms (Redis fetch)
- **Cache miss**: ~200-500ms (DB query + Redis set)
- **Speedup**: 4-10x for complex analytics queries

## Cost Optimization

Upstash pricing is based on:
- **Requests per day**: First 10K free, then $0.2 per 100K
- **Storage**: First 256MB free, then $0.25/GB

**Tips:**
- Use appropriate TTLs to reduce requests
- Batch cache operations when possible
- Monitor usage in Upstash console
- Consider cache warming to spread load
