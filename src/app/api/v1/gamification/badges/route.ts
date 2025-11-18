/**
 * GET /api/v1/gamification/badges
 * List available badges in the system
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit } from '@/lib/ratelimit/middleware';

async function handler(request: NextRequest) {
  await withRateLimit(request);

  await requireAuth(request);

  try {
    // Available badges (static data - could be from database)
    const badges = [
      {
        id: 'perfect-attendance',
        name: 'Perfect Attendance',
        description: 'No late arrivals or absences for 30 consecutive days',
        icon: '🏆',
        category: 'attendance',
        points: 100,
        criteria: {
          type: 'attendance_streak',
          days: 30,
        },
      },
      {
        id: 'early-bird',
        name: 'Early Bird',
        description: 'Clock in before 8:00 AM for 10 consecutive days',
        icon: '🐦',
        category: 'attendance',
        points: 50,
        criteria: {
          type: 'early_clock_in',
          days: 10,
          time: '08:00',
        },
      },
      {
        id: 'team-player',
        name: 'Team Player',
        description: 'Complete 5 performance reviews',
        icon: '🤝',
        category: 'performance',
        points: 150,
        criteria: {
          type: 'review_completion',
          count: 5,
        },
      },
      {
        id: 'top-performer',
        name: 'Top Performer',
        description: 'Receive a 5-star performance review',
        icon: '⭐',
        category: 'performance',
        points: 200,
        criteria: {
          type: 'review_rating',
          rating: 5,
        },
      },
      {
        id: 'document-master',
        name: 'Document Master',
        description: 'Upload and verify all required documents',
        icon: '📋',
        category: 'documentation',
        points: 75,
        criteria: {
          type: 'documents_verified',
          count: 5,
        },
      },
      {
        id: 'anniversary',
        name: 'Work Anniversary',
        description: 'Complete 1 year with the company',
        icon: '🎂',
        category: 'milestone',
        points: 500,
        criteria: {
          type: 'tenure',
          years: 1,
        },
      },
    ];

    return successResponse(badges);
  } catch (error) {
    return errorResponse(
      'SRV_9002',
      'Failed to fetch badges',
      500,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

export const GET = withErrorHandler(handler);
