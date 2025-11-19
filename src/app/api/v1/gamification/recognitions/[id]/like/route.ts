/**
 * Recognition Likes API
 * POST /api/v1/gamification/recognitions/[id]/like - Like a recognition
 * DELETE /api/v1/gamification/recognitions/[id]/like - Unlike a recognition
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/v1/gamification/recognitions/[id]/like
 * Like a recognition
 */
async function handlePost(request: NextRequest, context: RouteContext) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);
  const { id: recognitionId } = await context.params;

  const supabase = await createClient();

  try {
    // Verify recognition exists and is public or belongs to user
    const { data: recognition, error: recognitionError } = await supabase
      .from('recognitions')
      .select('id, is_public, from_user_id, to_user_id')
      .eq('id', recognitionId)
      .single();

    if (recognitionError || !recognition) {
      return errorResponse(
        'RES_3001',
        'Recognition not found',
        404
      );
    }

    // Check if user can access this recognition
    if (!recognition.is_public &&
        recognition.from_user_id !== userContext.id &&
        recognition.to_user_id !== userContext.id) {
      return errorResponse(
        'AUTH_1004',
        'Cannot like private recognitions from other users',
        403
      );
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('recognition_likes')
      .select('id')
      .eq('recognition_id', recognitionId)
      .eq('user_id', userContext.id)
      .single();

    if (existingLike) {
      return errorResponse(
        'BIZ_4004',
        'Already liked this recognition',
        400
      );
    }

    // Create like
    const { data: like, error: likeError } = await supabase
      .from('recognition_likes')
      .insert({
        recognition_id: recognitionId,
        user_id: userContext.id,
      })
      .select()
      .single();

    if (likeError) {
      throw likeError;
    }

    // Get updated likes count
    const { data: updatedRecognition } = await supabase
      .from('recognitions')
      .select('likes_count')
      .eq('id', recognitionId)
      .single();

    return successResponse({
      liked: true,
      likesCount: updatedRecognition?.likes_count || 0,
    });
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to like recognition',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

/**
 * DELETE /api/v1/gamification/recognitions/[id]/like
 * Unlike a recognition
 */
async function handleDelete(request: NextRequest, context: RouteContext) {
  await withRateLimit(request);

  const userContext = await requireAuth(request);
  const { id: recognitionId } = await context.params;

  const supabase = await createClient();

  try {
    // Delete like
    const { error: deleteError } = await supabase
      .from('recognition_likes')
      .delete()
      .eq('recognition_id', recognitionId)
      .eq('user_id', userContext.id);

    if (deleteError) {
      throw deleteError;
    }

    // Get updated likes count
    const { data: updatedRecognition } = await supabase
      .from('recognitions')
      .select('likes_count')
      .eq('id', recognitionId)
      .single();

    return successResponse({
      liked: false,
      likesCount: updatedRecognition?.likes_count || 0,
    });
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to unlike recognition',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

export const POST = withErrorHandler(handlePost);
export const DELETE = withErrorHandler(handleDelete);
