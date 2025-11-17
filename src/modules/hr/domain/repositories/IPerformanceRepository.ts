import type { PerformanceReview } from '../entities/PerformanceReview';
import type { PerformanceGoal } from '../entities/PerformanceGoal';

export interface IPerformanceRepository {
  // Performance Reviews
  findReviewById(id: string): Promise<PerformanceReview | null>;

  findReviewsByEmployeeId(
    employeeId: string,
    options?: {
      reviewType?: string;
      status?: string;
      year?: number;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    reviews: PerformanceReview[];
    total: number;
  }>;

  findReviewsByEmployerId(
    employerId: string,
    options?: {
      reviewType?: string;
      status?: string;
      year?: number;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    reviews: PerformanceReview[];
    total: number;
  }>;

  findPendingReviewsByReviewer(reviewerId: string): Promise<PerformanceReview[]>;

  createReview(
    review: Omit<PerformanceReview, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PerformanceReview>;

  updateReview(id: string, updates: Partial<PerformanceReview>): Promise<PerformanceReview>;

  deleteReview(id: string): Promise<void>;

  // Performance Goals
  findGoalById(id: string): Promise<PerformanceGoal | null>;

  findGoalsByEmployeeId(
    employeeId: string,
    options?: {
      goalType?: string;
      status?: string;
      priority?: string;
      category?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    goals: PerformanceGoal[];
    total: number;
  }>;

  findGoalsByEmployerId(
    employerId: string,
    options?: {
      goalType?: string;
      status?: string;
      priority?: string;
      category?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    goals: PerformanceGoal[];
    total: number;
  }>;

  findOverdueGoals(employerId: string): Promise<PerformanceGoal[]>;

  findGoalsByParentId(parentGoalId: string): Promise<PerformanceGoal[]>;

  createGoal(
    goal: Omit<PerformanceGoal, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PerformanceGoal>;

  updateGoal(id: string, updates: Partial<PerformanceGoal>): Promise<PerformanceGoal>;

  deleteGoal(id: string): Promise<void>;

  // Statistics
  getEmployeePerformanceStats(employeeId: string, year: number): Promise<{
    averageRating: number;
    totalReviews: number;
    goalsAchieved: number;
    totalGoals: number;
    achievementRate: number;
  }>;

  getTeamPerformanceStats(employerId: string, year: number): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingsDistribution: {
      outstanding: number;
      exceeds: number;
      meets: number;
      needsImprovement: number;
      unsatisfactory: number;
    };
    goalsAchieved: number;
    totalGoals: number;
  }>;
}
