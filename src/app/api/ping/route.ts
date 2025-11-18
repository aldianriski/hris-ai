import { handlePing } from '@/lib/resilience/health-check';

/**
 * Ping Endpoint
 * GET /api/ping
 *
 * Simple uptime check
 * Always returns 200 OK
 */
export async function GET() {
  return handlePing();
}
