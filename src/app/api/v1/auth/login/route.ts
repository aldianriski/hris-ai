/**
 * POST /api/v1/auth/login
 * Authenticate user with email and password
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { logSecurityEvent, createUserSession } from '@/lib/utils/auditLog';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

async function handler(request: NextRequest) {
  // Apply rate limiting
  await withRateLimit(request);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = loginSchema.parse(body);

  const supabase = await createClient();

  // Authenticate with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email: validatedData.email,
    password: validatedData.password,
  });

  if (error) {
    // Log failed login attempt
    await logSecurityEvent(null, request, 'login_failed', 'warning');
    
    return errorResponse(
      'AUTH_1002',
      'Invalid email or password',
      401
    );
  }

  if (!data.user) {
    return errorResponse(
      'AUTH_1002',
      'Invalid email or password',
      401
    );
  }

  // Check if MFA is enabled
  const { data: mfaSettings } = await supabase
    .from('user_mfa_settings')
    .select('mfa_enabled')
    .eq('user_id', data.user.id)
    .single();

  if (mfaSettings?.mfa_enabled) {
    // MFA is enabled, require verification
    // Store pending session for MFA verification
    const pendingSessionId = crypto.randomUUID();
    
    return successResponse({
      requiresMfa: true,
      sessionId: pendingSessionId,
      message: 'MFA verification required',
    });
  }

  // Get user metadata
  const { data: userData } = await supabase
    .from('users')
    .select('id, email, role, employee_id, company_id, department_id')
    .eq('id', data.user.id)
    .single();

  // Log successful login
  const userContext = {
    id: data.user.id,
    email: data.user.email || '',
    role: userData?.role || 'employee',
    companyId: userData?.company_id || '',
    employeeId: userData?.employee_id,
    departmentId: userData?.department_id,
  };

  await logSecurityEvent(userContext as any, request, 'login_success', 'info');

  // Create user session
  if (data.session?.access_token) {
    await createUserSession(userContext as any, request, data.session.access_token);
  }

  return successResponse({
    user: {
      id: data.user.id,
      email: data.user.email,
      role: userData?.role || 'employee',
      employeeId: userData?.employee_id,
      companyId: userData?.company_id,
    },
    session: {
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      expiresAt: data.session?.expires_at,
    },
  });
}

export const POST = withErrorHandler(handler);
