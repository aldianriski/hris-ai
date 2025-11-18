import { z } from 'zod';

/**
 * Performance Review DTOs
 */
export const CreatePerformanceReviewSchema = z.object({
  employeeId: z.string().uuid(),
  employerId: z.string().uuid(),
  reviewerId: z.string().uuid(),
  reviewerName: z.string().min(1),
  reviewType: z.enum(['annual', 'probation', 'mid_year', 'project', '360']),
  reviewPeriodStart: z.string().datetime().or(z.date()),
  reviewPeriodEnd: z.string().datetime().or(z.date()),
});

export type CreatePerformanceReviewInput = z.infer<typeof CreatePerformanceReviewSchema>;

export const UpdatePerformanceReviewSchema = z.object({
  overallRating: z.number().min(1).max(5).optional(),
  ratings: z
    .array(
      z.object({
        categoryId: z.string(),
        categoryName: z.string(),
        rating: z.number().min(1).max(5),
        weight: z.number().min(0).max(100),
        comments: z.string().nullable(),
      })
    )
    .optional(),
  strengths: z.string().optional(),
  areasForImprovement: z.string().optional(),
  achievements: z.string().optional(),
  goalsForNextPeriod: z.string().optional(),
  reviewerComments: z.string().optional(),
  actionPlan: z.string().optional(),
  promotionRecommendation: z.boolean().optional(),
  salaryIncreaseRecommendation: z.number().min(0).max(100).nullable().optional(),
});

export type UpdatePerformanceReviewInput = z.infer<typeof UpdatePerformanceReviewSchema>;

export const AcknowledgeReviewSchema = z.object({
  employeeComments: z.string().optional(),
});

export type AcknowledgeReviewInput = z.infer<typeof AcknowledgeReviewSchema>;

export const FilterPerformanceReviewsSchema = z.object({
  employerId: z.string().uuid().optional(),
  employeeId: z.string().uuid().optional(),
  reviewType: z.enum(['annual', 'probation', 'mid_year', 'project', '360']).optional(),
  status: z
    .enum(['draft', 'submitted', 'reviewed', 'acknowledged', 'completed'])
    .optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type FilterPerformanceReviewsInput = z.infer<typeof FilterPerformanceReviewsSchema>;

/**
 * Performance Goal DTOs
 */
export const CreatePerformanceGoalSchema = z.object({
  employeeId: z.string().uuid(),
  employerId: z.string().uuid(),
  goalType: z.enum(['okr', 'kpi', 'smart']),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  category: z.enum([
    'sales',
    'productivity',
    'quality',
    'customer_satisfaction',
    'learning',
    'leadership',
    'other',
  ]),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  startDate: z.string().datetime().or(z.date()),
  dueDate: z.string().datetime().or(z.date()),
  targetValue: z.number().nullable().optional(),
  targetUnit: z.string().nullable().optional(),
  keyResults: z
    .array(
      z.object({
        id: z.string(),
        description: z.string(),
        targetValue: z.number(),
        currentValue: z.number().default(0),
        unit: z.string(),
        completionPercentage: z.number().min(0).max(100).default(0),
      })
    )
    .nullable()
    .optional(),
  milestones: z
    .array(
      z.object({
        id: z.string(),
        description: z.string(),
        dueDate: z.string().datetime().or(z.date()),
        isCompleted: z.boolean().default(false),
        completedAt: z.string().datetime().or(z.date()).nullable().optional(),
      })
    )
    .nullable()
    .optional(),
  parentGoalId: z.string().uuid().nullable().optional(),
  assignedBy: z.string().uuid(),
  assignedByName: z.string(),
});

export type CreatePerformanceGoalInput = z.infer<typeof CreatePerformanceGoalSchema>;

export const UpdateGoalProgressSchema = z.object({
  currentValue: z.number().min(0),
  notes: z.string().optional(),
});

export type UpdateGoalProgressInput = z.infer<typeof UpdateGoalProgressSchema>;

export const UpdateKeyResultSchema = z.object({
  keyResultId: z.string(),
  currentValue: z.number().min(0),
});

export type UpdateKeyResultInput = z.infer<typeof UpdateKeyResultSchema>;

export const CompleteMilestoneSchema = z.object({
  milestoneId: z.string(),
});

export type CompleteMilestoneInput = z.infer<typeof CompleteMilestoneSchema>;

export const FilterPerformanceGoalsSchema = z.object({
  employerId: z.string().uuid().optional(),
  employeeId: z.string().uuid().optional(),
  goalType: z.enum(['okr', 'kpi', 'smart']).optional(),
  status: z
    .enum([
      'draft',
      'active',
      'on_track',
      'at_risk',
      'achieved',
      'not_achieved',
      'cancelled',
    ])
    .optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  category: z
    .enum([
      'sales',
      'productivity',
      'quality',
      'customer_satisfaction',
      'learning',
      'leadership',
      'other',
    ])
    .optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type FilterPerformanceGoalsInput = z.infer<typeof FilterPerformanceGoalsSchema>;
