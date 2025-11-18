/**
 * GET /api/health
 * Health check endpoint for monitoring and uptime checks
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isRedisAvailable } from '@/lib/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'up' | 'down';
      latency?: number;
      error?: string;
    };
    cache: {
      status: 'up' | 'down';
      latency?: number;
      error?: string;
    };
    api: {
      status: 'up';
      latency: number;
    };
  };
  uptime: number;
}

/**
 * Health check endpoint
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  // Initialize response
  const health: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: { status: 'down' },
      cache: { status: 'down' },
      api: { status: 'up', latency: 0 },
    },
    uptime: process.uptime(),
  };

  // Check database connection
  try {
    const dbStartTime = Date.now();
    const supabase = await createClient();

    const { error } = await supabase
      .from('employers')
      .select('id')
      .limit(1)
      .single();

    const dbLatency = Date.now() - dbStartTime;

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is fine for health check
      throw error;
    }

    health.checks.database = {
      status: 'up',
      latency: dbLatency,
    };
  } catch (error) {
    health.status = 'degraded';
    health.checks.database = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Check cache connection
  try {
    const cacheStartTime = Date.now();
    const cacheAvailable = await isRedisAvailable();
    const cacheLatency = Date.now() - cacheStartTime;

    health.checks.cache = {
      status: cacheAvailable ? 'up' : 'down',
      latency: cacheLatency,
    };

    if (!cacheAvailable) {
      health.status = 'degraded';
    }
  } catch (error) {
    health.status = 'degraded';
    health.checks.cache = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Calculate API latency
  health.checks.api.latency = Date.now() - startTime;

  // Determine overall status
  if (health.checks.database.status === 'down') {
    health.status = 'unhealthy';
  }

  // Return appropriate HTTP status code
  const statusCode =
    health.status === 'healthy'
      ? 200
      : health.status === 'degraded'
      ? 200 // Still return 200 for degraded (BetterStack will check the status field)
      : 503; // Service Unavailable

  return NextResponse.json(health, { status: statusCode });
}
