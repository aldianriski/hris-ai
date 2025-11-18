/**
 * Health Check Utilities
 * Monitor external service availability
 */

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency?: number;
  error?: string;
  lastCheck: Date;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down';
  services: ServiceHealth[];
  timestamp: Date;
}

/**
 * Check Supabase health
 */
export async function checkSupabaseHealth(): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    const latency = Date.now() - start;
    const status = response.ok ? 'healthy' : 'degraded';

    return {
      name: 'Supabase',
      status,
      latency,
      lastCheck: new Date(),
    };
  } catch (error) {
    return {
      name: 'Supabase',
      status: 'down',
      error: (error as Error).message,
      lastCheck: new Date(),
    };
  }
}

/**
 * Check Redis health (Upstash)
 */
export async function checkRedisHealth(): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      return {
        name: 'Redis',
        status: 'down',
        error: 'Not configured',
        lastCheck: new Date(),
      };
    }

    const response = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/ping`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
        signal: AbortSignal.timeout(3000),
      }
    );

    const latency = Date.now() - start;
    const status = response.ok ? 'healthy' : 'degraded';

    return {
      name: 'Redis',
      status,
      latency,
      lastCheck: new Date(),
    };
  } catch (error) {
    return {
      name: 'Redis',
      status: 'down',
      error: (error as Error).message,
      lastCheck: new Date(),
    };
  }
}

/**
 * Check OpenAI API health
 */
export async function checkOpenAIHealth(): Promise<ServiceHealth> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        name: 'OpenAI',
        status: 'down',
        error: 'Not configured',
        lastCheck: new Date(),
      };
    }

    // Simple check - we just verify the API key format
    // Full check would require actual API call
    const hasValidKey = process.env.OPENAI_API_KEY.startsWith('sk-');

    return {
      name: 'OpenAI',
      status: hasValidKey ? 'healthy' : 'degraded',
      error: hasValidKey ? undefined : 'Invalid API key format',
      lastCheck: new Date(),
    };
  } catch (error) {
    return {
      name: 'OpenAI',
      status: 'down',
      error: (error as Error).message,
      lastCheck: new Date(),
    };
  }
}

/**
 * Check all system services
 */
export async function checkSystemHealth(): Promise<SystemHealth> {
  const services = await Promise.all([
    checkSupabaseHealth(),
    checkRedisHealth(),
    checkOpenAIHealth(),
  ]);

  // Determine overall health
  const downCount = services.filter((s) => s.status === 'down').length;
  const degradedCount = services.filter((s) => s.status === 'degraded').length;

  let overall: 'healthy' | 'degraded' | 'down';
  if (downCount > 1) {
    overall = 'down';
  } else if (downCount > 0 || degradedCount > 1) {
    overall = 'degraded';
  } else {
    overall = 'healthy';
  }

  return {
    overall,
    services,
    timestamp: new Date(),
  };
}

/**
 * Health check API endpoint helper
 */
export async function handleHealthCheck() {
  const health = await checkSystemHealth();

  const statusCode = health.overall === 'down' ? 503 : 200;

  return new Response(JSON.stringify(health, null, 2), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

/**
 * Simple ping endpoint
 */
export function handlePing() {
  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
