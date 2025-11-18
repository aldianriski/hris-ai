/**
 * POST /api/v1/auth/logout
 * Log out current user
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { logSecurityEvent, endUserSession } from '@/lib/utils/auditLog';

async function handler(request: NextRequest) {
  // Require authentication
  const userContext = await requireAuth(request);

  const supabase = await createClient();

  // Get current session token before signing out
  const { data: { session } } = await supabase.auth.getSession();

  // Sign out from Supabase
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout error:', error);
  }

  // End user session in database
  if (session?.access_token) {
    await endUserSession(session.access_token);
  }

  // Log logout event
  await logSecurityEvent(userContext, request, 'logout', 'info');

  return successResponse({
    message: 'Logged out successfully',
  });
}

export const POST = withErrorHandler(handler);
