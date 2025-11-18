/**
 * GET/PUT /api/v1/notifications/preferences
 * Manage notification preferences
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';
import { z } from 'zod';

const updatePreferencesSchema = z.object({
  leaveApproved: z.boolean().optional(),
  leaveRejected: z.boolean().optional(),
  payslipReady: z.boolean().optional(),
  documentVerified: z.boolean().optional(),
  performanceReview: z.boolean().optional(),
  announcements: z.boolean().optional(),
  reminders: z.boolean().optional(),
  enableAll: z.boolean().optional(),
});

/**
 * GET notification preferences
 */
async function getHandler(request: NextRequest) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);

  const supabase = await createClient();

  const { data: preferences, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userContext.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = not found, which is OK
    return errorResponse(
      'SRV_9002',
      'Failed to fetch notification preferences',
      500,
      { details: error.message }
    );
  }

  // Return defaults if no preferences exist
  if (!preferences) {
    return successResponse({
      leaveApproved: true,
      leaveRejected: true,
      payslipReady: true,
      documentVerified: true,
      performanceReview: true,
      announcements: true,
      reminders: true,
      enableAll: true,
    });
  }

  return successResponse({
    leaveApproved: preferences.leave_approved,
    leaveRejected: preferences.leave_rejected,
    payslipReady: preferences.payslip_ready,
    documentVerified: preferences.document_verified,
    performanceReview: preferences.performance_review,
    announcements: preferences.announcements,
    reminders: preferences.reminders,
    enableAll: preferences.enable_all,
  });
}

/**
 * PUT notification preferences
 */
async function putHandler(request: NextRequest) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = updatePreferencesSchema.parse(body);

  const supabase = await createClient();

  // Check if preferences exist
  const { data: existingPreferences } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userContext.id)
    .single();

  const preferencesData = {
    user_id: userContext.id,
    leave_approved: validatedData.leaveApproved ?? existingPreferences?.leave_approved ?? true,
    leave_rejected: validatedData.leaveRejected ?? existingPreferences?.leave_rejected ?? true,
    payslip_ready: validatedData.payslipReady ?? existingPreferences?.payslip_ready ?? true,
    document_verified: validatedData.documentVerified ?? existingPreferences?.document_verified ?? true,
    performance_review: validatedData.performanceReview ?? existingPreferences?.performance_review ?? true,
    announcements: validatedData.announcements ?? existingPreferences?.announcements ?? true,
    reminders: validatedData.reminders ?? existingPreferences?.reminders ?? true,
    enable_all: validatedData.enableAll ?? existingPreferences?.enable_all ?? true,
    updated_at: new Date().toISOString(),
  };

  if (existingPreferences) {
    // Update existing preferences
    const { data, error } = await supabase
      .from('notification_preferences')
      .update(preferencesData)
      .eq('user_id', userContext.id)
      .select()
      .single();

    if (error) {
      return errorResponse(
        'SRV_9002',
        'Failed to update notification preferences',
        500,
        { details: error.message }
      );
    }

    return successResponse({
      message: 'Notification preferences updated',
      preferences: {
        leaveApproved: data.leave_approved,
        leaveRejected: data.leave_rejected,
        payslipReady: data.payslip_ready,
        documentVerified: data.document_verified,
        performanceReview: data.performance_review,
        announcements: data.announcements,
        reminders: data.reminders,
        enableAll: data.enable_all,
      },
    });
  } else {
    // Create new preferences
    const { data, error } = await supabase
      .from('notification_preferences')
      .insert(preferencesData)
      .select()
      .single();

    if (error) {
      return errorResponse(
        'SRV_9002',
        'Failed to create notification preferences',
        500,
        { details: error.message }
      );
    }

    return successResponse(
      {
        message: 'Notification preferences created',
        preferences: {
          leaveApproved: data.leave_approved,
          leaveRejected: data.leave_rejected,
          payslipReady: data.payslip_ready,
          documentVerified: data.document_verified,
          performanceReview: data.performance_review,
          announcements: data.announcements,
          reminders: data.reminders,
          enableAll: data.enable_all,
        },
      },
      201
    );
  }
}

export const GET = withErrorHandler(getHandler);
export const PUT = withErrorHandler(putHandler);
