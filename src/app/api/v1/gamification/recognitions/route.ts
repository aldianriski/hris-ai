/**
 * Recognition API Endpoints
 * GET /api/v1/gamification/recognitions - List all recognitions
 * POST /api/v1/gamification/recognitions - Create a new recognition
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';

// Schema for GET query parameters
const getRecognitionsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  toUserId: z.string().uuid().optional(),
  fromUserId: z.string().uuid().optional(),
});

// Schema for POST body
const createRecognitionSchema = z.object({
  toUserId: z.string().uuid('Invalid user ID'),
  recognitionType: z.enum(['thank_you', 'great_work', 'team_player', 'helpful', 'innovative']),
  message: z.string().min(1, 'Message is required').max(500, 'Message too long'),
  isPublic: z.boolean().default(true),
  pointsAwarded: z.number().int().min(0).max(100).default(10),
});

/**
 * GET /api/v1/gamification/recognitions
 * List all public recognitions
 */
async function handleGet(request: NextRequest) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const validatedParams = getRecognitionsSchema.parse(params);

  const supabase = await createClient();

  try {
    // Build query
    let query = supabase
      .from('recognitions')
      .select(`
        id,
        from_user_id,
        to_user_id,
        recognition_type,
        message,
        is_public,
        points_awarded,
        likes_count,
        created_at
      `, { count: 'exact' })
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(validatedParams.offset, validatedParams.offset + validatedParams.limit - 1);

    // Filter by user if specified
    if (validatedParams.toUserId) {
      query = query.eq('to_user_id', validatedParams.toUserId);
    }

    if (validatedParams.fromUserId) {
      query = query.eq('from_user_id', validatedParams.fromUserId);
    }

    const { data: recognitions, error: recognitionsError, count } = await query;

    if (recognitionsError) {
      throw recognitionsError;
    }

    if (!recognitions || recognitions.length === 0) {
      return successResponse({
        data: [],
        total: 0,
      });
    }

    // Get unique user IDs
    const userIds = [
      ...new Set([
        ...recognitions.map((r) => r.from_user_id),
        ...recognitions.map((r) => r.to_user_id),
      ]),
    ];

    // Fetch user details
    const { data: users, error: usersError } = await supabase
      .from('employees')
      .select('id, full_name, position, email')
      .in('id', userIds);

    if (usersError) {
      throw usersError;
    }

    // Create user map
    const userMap = new Map(users?.map((u) => [u.id, u]) || []);

    // Enrich recognitions with user data
    const enrichedRecognitions = recognitions.map((recognition) => ({
      id: recognition.id,
      fromUser: {
        id: recognition.from_user_id,
        name: userMap.get(recognition.from_user_id)?.full_name || 'Unknown User',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userMap.get(recognition.from_user_id)?.full_name || 'U')}`,
        position: userMap.get(recognition.from_user_id)?.position || '',
      },
      toUser: {
        id: recognition.to_user_id,
        name: userMap.get(recognition.to_user_id)?.full_name || 'Unknown User',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userMap.get(recognition.to_user_id)?.full_name || 'U')}`,
        position: userMap.get(recognition.to_user_id)?.position || '',
      },
      type: recognition.recognition_type,
      message: recognition.message,
      pointsAwarded: recognition.points_awarded,
      isPublic: recognition.is_public,
      likes: recognition.likes_count || 0,
      createdAt: recognition.created_at,
    }));

    return successResponse({
      data: enrichedRecognitions,
      total: count || 0,
      limit: validatedParams.limit,
      offset: validatedParams.offset,
    });
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch recognitions',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

/**
 * POST /api/v1/gamification/recognitions
 * Create a new recognition
 */
async function handlePost(request: NextRequest) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = createRecognitionSchema.parse(body);

  const supabase = await createClient();

  try {
    // Verify target user exists and belongs to same company
    const { data: targetEmployee, error: employeeError } = await supabase
      .from('employees')
      .select('id, full_name, employer_id')
      .eq('id', validatedData.toUserId)
      .single();

    if (employeeError || !targetEmployee) {
      return errorResponse(
        'RES_3001',
        'Target employee not found',
        404
      );
    }

    if (targetEmployee.employer_id !== userContext.companyId) {
      return errorResponse(
        'AUTH_1004',
        'Cannot recognize employees from other companies',
        403
      );
    }

    // Cannot recognize yourself
    if (validatedData.toUserId === userContext.id) {
      return errorResponse(
        'VAL_2002',
        'Cannot recognize yourself',
        400
      );
    }

    // Create recognition
    const { data: recognition, error: createError } = await supabase
      .from('recognitions')
      .insert({
        from_user_id: userContext.id,
        to_user_id: validatedData.toUserId,
        recognition_type: validatedData.recognitionType,
        message: validatedData.message,
        is_public: validatedData.isPublic,
        points_awarded: validatedData.pointsAwarded,
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    // Award points to the recipient
    if (validatedData.pointsAwarded > 0) {
      // Get or create recipient's points record
      const { data: existingPoints } = await supabase
        .from('gamification_points')
        .select('*')
        .eq('employee_id', validatedData.toUserId)
        .eq('employer_id', userContext.companyId)
        .single();

      if (!existingPoints) {
        // Create new points record
        await supabase
          .from('gamification_points')
          .insert({
            employee_id: validatedData.toUserId,
            employer_id: userContext.companyId,
            employee_name: targetEmployee.full_name,
            total_points: validatedData.pointsAwarded,
            badge_count: 0,
            achievement_count: 0,
          });
      } else {
        // Update existing points
        await supabase
          .from('gamification_points')
          .update({
            total_points: existingPoints.total_points + validatedData.pointsAwarded,
            last_activity_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('employee_id', validatedData.toUserId)
          .eq('employer_id', userContext.companyId);
      }

      // Log the points transaction
      await supabase
        .from('point_transactions')
        .insert({
          employee_id: validatedData.toUserId,
          employer_id: userContext.companyId,
          points: validatedData.pointsAwarded,
          reason: `Recognition: ${validatedData.recognitionType}`,
          category: 'recognition',
          awarded_by: userContext.id,
          awarded_by_email: userContext.email,
        });
    }

    // TODO: Send notification to recipient

    return successResponse(recognition, 201);
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to create recognition',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

export const GET = withErrorHandler(handleGet);
export const POST = withErrorHandler(handlePost);
