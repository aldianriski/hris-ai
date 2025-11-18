/**
 * Inngest API Endpoint
 * This endpoint is used by Inngest to execute job functions
 */

import { serve } from 'inngest/next';
import { inngest } from '@/lib/queue/client';
import { allJobs } from '@/jobs';

/**
 * Serve Inngest functions
 * This creates both GET and POST handlers
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: allJobs,
  // Optional: Customize serving options
  servePath: '/api/inngest',
  // Signing key for production (verifies requests from Inngest)
  signingKey: process.env.INNGEST_SIGNING_KEY,
});
