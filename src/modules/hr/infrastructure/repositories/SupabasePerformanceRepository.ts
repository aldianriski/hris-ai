import type { SupabaseClient } from '@supabase/supabase-js';
import type { IPerformanceRepository } from '../../domain/repositories/IPerformanceRepository';
import { PerformanceReview } from '../../domain/entities/PerformanceReview';
import { PerformanceGoal } from '../../domain/entities/PerformanceGoal';

export class SupabasePerformanceRepository implements IPerformanceRepository {
  constructor(private supabase: SupabaseClient) {}

  async findReviewById(id: string): Promise<PerformanceReview | null> {
    const { data, error } = await this.supabase
      .from('performance_reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find review: ${error.message}`);
    }

    return this.mapReviewToEntity(data);
  }

  async findReviewsByEmployeeId(
    employeeId: string,
    options?: { reviewType?: string; status?: string; year?: number; limit?: number; offset?: number }
  ): Promise<{ reviews: PerformanceReview[]; total: number }> {
    let query = this.supabase
      .from('performance_reviews')
      .select('*', { count: 'exact' })
      .eq('employee_id', employeeId);

    if (options?.reviewType) query = query.eq('review_type', options.reviewType);
    if (options?.status) query = query.eq('status', options.status);
    if (options?.year) {
      query = query.gte('review_period_start', `${options.year}-01-01`)
        .lte('review_period_start', `${options.year}-12-31`);
    }

    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to find reviews: ${error.message}`);

    return {
      reviews: (data || []).map((row) => this.mapReviewToEntity(row)),
      total: count ?? 0,
    };
  }

  async findReviewsByEmployerId(
    employerId: string,
    options?: { reviewType?: string; status?: string; year?: number; limit?: number; offset?: number }
  ): Promise<{ reviews: PerformanceReview[]; total: number }> {
    let query = this.supabase
      .from('performance_reviews')
      .select('*', { count: 'exact' })
      .eq('employer_id', employerId);

    if (options?.reviewType) query = query.eq('review_type', options.reviewType);
    if (options?.status) query = query.eq('status', options.status);
    if (options?.year) {
      query = query.gte('review_period_start', `${options.year}-01-01`)
        .lte('review_period_start', `${options.year}-12-31`);
    }

    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to find reviews: ${error.message}`);

    return {
      reviews: (data || []).map((row) => this.mapReviewToEntity(row)),
      total: count ?? 0,
    };
  }

  async findPendingReviewsByReviewer(reviewerId: string): Promise<PerformanceReview[]> {
    const { data, error } = await this.supabase
      .from('performance_reviews')
      .select('*')
      .eq('reviewer_id', reviewerId)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: true });

    if (error) throw new Error(`Failed to find pending reviews: ${error.message}`);
    return (data || []).map((row) => this.mapReviewToEntity(row));
  }

  async createReview(review: Omit<PerformanceReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<PerformanceReview> {
    const { data, error } = await this.supabase
      .from('performance_reviews')
      .insert([this.mapReviewToDatabase(review)])
      .select()
      .single();

    if (error) throw new Error(`Failed to create review: ${error.message}`);
    return this.mapReviewToEntity(data);
  }

  async updateReview(id: string, updates: Partial<PerformanceReview>): Promise<PerformanceReview> {
    const { data, error } = await this.supabase
      .from('performance_reviews')
      .update({ ...this.mapReviewToDatabase(updates), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update review: ${error.message}`);
    return this.mapReviewToEntity(data);
  }

  async deleteReview(id: string): Promise<void> {
    const { error } = await this.supabase.from('performance_reviews').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete review: ${error.message}`);
  }

  async findGoalById(id: string): Promise<PerformanceGoal | null> {
    const { data, error } = await this.supabase
      .from('performance_goals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find goal: ${error.message}`);
    }

    return this.mapGoalToEntity(data);
  }

  async findGoalsByEmployeeId(
    employeeId: string,
    options?: { goalType?: string; status?: string; priority?: string; category?: string; limit?: number; offset?: number }
  ): Promise<{ goals: PerformanceGoal[]; total: number }> {
    let query = this.supabase
      .from('performance_goals')
      .select('*', { count: 'exact' })
      .eq('employee_id', employeeId);

    if (options?.goalType) query = query.eq('goal_type', options.goalType);
    if (options?.status) query = query.eq('status', options.status);
    if (options?.priority) query = query.eq('priority', options.priority);
    if (options?.category) query = query.eq('category', options.category);

    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to find goals: ${error.message}`);

    return {
      goals: (data || []).map((row) => this.mapGoalToEntity(row)),
      total: count ?? 0,
    };
  }

  async findGoalsByEmployerId(
    employerId: string,
    options?: { goalType?: string; status?: string; priority?: string; category?: string; limit?: number; offset?: number }
  ): Promise<{ goals: PerformanceGoal[]; total: number }> {
    let query = this.supabase
      .from('performance_goals')
      .select('*', { count: 'exact' })
      .eq('employer_id', employerId);

    if (options?.goalType) query = query.eq('goal_type', options.goalType);
    if (options?.status) query = query.eq('status', options.status);
    if (options?.priority) query = query.eq('priority', options.priority);
    if (options?.category) query = query.eq('category', options.category);

    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to find goals: ${error.message}`);

    return {
      goals: (data || []).map((row) => this.mapGoalToEntity(row)),
      total: count ?? 0,
    };
  }

  async findOverdueGoals(employerId: string): Promise<PerformanceGoal[]> {
    const { data, error } = await this.supabase
      .from('performance_goals')
      .select('*')
      .eq('employer_id', employerId)
      .in('status', ['active', 'on_track', 'at_risk'])
      .lt('due_date', new Date().toISOString().split('T')[0]);

    if (error) throw new Error(`Failed to find overdue goals: ${error.message}`);
    return (data || []).map((row) => this.mapGoalToEntity(row));
  }

  async findGoalsByParentId(parentGoalId: string): Promise<PerformanceGoal[]> {
    const { data, error } = await this.supabase
      .from('performance_goals')
      .select('*')
      .eq('parent_goal_id', parentGoalId);

    if (error) throw new Error(`Failed to find child goals: ${error.message}`);
    return (data || []).map((row) => this.mapGoalToEntity(row));
  }

  async createGoal(goal: Omit<PerformanceGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<PerformanceGoal> {
    const { data, error } = await this.supabase
      .from('performance_goals')
      .insert([this.mapGoalToDatabase(goal)])
      .select()
      .single();

    if (error) throw new Error(`Failed to create goal: ${error.message}`);
    return this.mapGoalToEntity(data);
  }

  async updateGoal(id: string, updates: Partial<PerformanceGoal>): Promise<PerformanceGoal> {
    const { data, error } = await this.supabase
      .from('performance_goals')
      .update({ ...this.mapGoalToDatabase(updates), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update goal: ${error.message}`);
    return this.mapGoalToEntity(data);
  }

  async deleteGoal(id: string): Promise<void> {
    const { error } = await this.supabase.from('performance_goals').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete goal: ${error.message}`);
  }

  async getEmployeePerformanceStats(employeeId: string, year: number): Promise<{
    averageRating: number;
    totalReviews: number;
    goalsAchieved: number;
    totalGoals: number;
    achievementRate: number;
  }> {
    // Reviews
    const { data: reviews } = await this.supabase
      .from('performance_reviews')
      .select('overall_rating')
      .eq('employee_id', employeeId)
      .eq('status', 'completed')
      .gte('review_period_start', `${year}-01-01`)
      .lte('review_period_start', `${year}-12-31`);

    const totalReviews = reviews?.length || 0;
    const averageRating = totalReviews > 0 
      ? reviews!.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / totalReviews 
      : 0;

    // Goals
    const { count: totalGoals } = await this.supabase
      .from('performance_goals')
      .select('*', { count: 'exact', head: true })
      .eq('employee_id', employeeId)
      .gte('start_date', `${year}-01-01`)
      .lte('start_date', `${year}-12-31`);

    const { count: goalsAchieved } = await this.supabase
      .from('performance_goals')
      .select('*', { count: 'exact', head: true })
      .eq('employee_id', employeeId)
      .eq('status', 'achieved')
      .gte('start_date', `${year}-01-01`)
      .lte('start_date', `${year}-12-31`);

    const achievementRate = (totalGoals && totalGoals > 0) ? ((goalsAchieved || 0) / totalGoals) * 100 : 0;

    return { averageRating, totalReviews, goalsAchieved: goalsAchieved || 0, totalGoals: totalGoals || 0, achievementRate };
  }

  async getTeamPerformanceStats(employerId: string, year: number): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingsDistribution: { outstanding: number; exceeds: number; meets: number; needsImprovement: number; unsatisfactory: number };
    goalsAchieved: number;
    totalGoals: number;
  }> {
    const { data: reviews } = await this.supabase
      .from('performance_reviews')
      .select('overall_rating')
      .eq('employer_id', employerId)
      .eq('status', 'completed')
      .gte('review_period_start', `${year}-01-01`)
      .lte('review_period_start', `${year}-12-31`);

    const totalReviews = reviews?.length || 0;
    const averageRating = totalReviews > 0 
      ? reviews!.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / totalReviews 
      : 0;

    const ratingsDistribution = {
      outstanding: reviews?.filter(r => (r.overall_rating || 0) >= 4.5).length || 0,
      exceeds: reviews?.filter(r => (r.overall_rating || 0) >= 3.5 && (r.overall_rating || 0) < 4.5).length || 0,
      meets: reviews?.filter(r => (r.overall_rating || 0) >= 2.5 && (r.overall_rating || 0) < 3.5).length || 0,
      needsImprovement: reviews?.filter(r => (r.overall_rating || 0) >= 1.5 && (r.overall_rating || 0) < 2.5).length || 0,
      unsatisfactory: reviews?.filter(r => (r.overall_rating || 0) < 1.5).length || 0,
    };

    const { count: totalGoals } = await this.supabase
      .from('performance_goals')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .gte('start_date', `${year}-01-01`)
      .lte('start_date', `${year}-12-31`);

    const { count: goalsAchieved } = await this.supabase
      .from('performance_goals')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .eq('status', 'achieved')
      .gte('start_date', `${year}-01-01`)
      .lte('start_date', `${year}-12-31`);

    return { averageRating, totalReviews, ratingsDistribution, goalsAchieved: goalsAchieved || 0, totalGoals: totalGoals || 0 };
  }

  private mapReviewToEntity(row: any): PerformanceReview {
    return new PerformanceReview(
      row.id, row.employee_id, row.employer_id, row.reviewer_id, row.reviewer_name,
      row.review_type, new Date(row.review_period_start), new Date(row.review_period_end),
      row.status, row.overall_rating, row.ratings, row.strengths, row.areas_for_improvement,
      row.achievements, row.goals_for_next_period, row.reviewer_comments, row.employee_comments,
      row.action_plan, row.promotion_recommendation, row.salary_increase_recommendation,
      row.ai_sentiment, row.ai_sentiment_score, row.ai_summary, row.ai_recommendations,
      row.submitted_at ? new Date(row.submitted_at) : null,
      row.reviewed_at ? new Date(row.reviewed_at) : null,
      row.acknowledged_at ? new Date(row.acknowledged_at) : null,
      row.acknowledged_by, new Date(row.created_at), new Date(row.updated_at)
    );
  }

  private mapReviewToDatabase(review: Partial<PerformanceReview>): any {
    const db: any = {};
    if (review.id) db.id = review.id;
    if (review.employeeId) db.employee_id = review.employeeId;
    if (review.employerId) db.employer_id = review.employerId;
    if (review.reviewerId) db.reviewer_id = review.reviewerId;
    if (review.reviewerName) db.reviewer_name = review.reviewerName;
    if (review.reviewType) db.review_type = review.reviewType;
    if (review.reviewPeriodStart) db.review_period_start = review.reviewPeriodStart.toISOString().split('T')[0];
    if (review.reviewPeriodEnd) db.review_period_end = review.reviewPeriodEnd.toISOString().split('T')[0];
    if (review.status) db.status = review.status;
    if (review.overallRating !== undefined) db.overall_rating = review.overallRating;
    if (review.ratings) db.ratings = review.ratings;
    if (review.strengths !== undefined) db.strengths = review.strengths;
    if (review.areasForImprovement !== undefined) db.areas_for_improvement = review.areasForImprovement;
    if (review.achievements !== undefined) db.achievements = review.achievements;
    if (review.goalsForNextPeriod !== undefined) db.goals_for_next_period = review.goalsForNextPeriod;
    if (review.reviewerComments !== undefined) db.reviewer_comments = review.reviewerComments;
    if (review.employeeComments !== undefined) db.employee_comments = review.employeeComments;
    if (review.actionPlan !== undefined) db.action_plan = review.actionPlan;
    if (review.promotionRecommendation !== undefined) db.promotion_recommendation = review.promotionRecommendation;
    if (review.salaryIncreaseRecommendation !== undefined) db.salary_increase_recommendation = review.salaryIncreaseRecommendation;
    if (review.aiSentiment !== undefined) db.ai_sentiment = review.aiSentiment;
    if (review.aiSentimentScore !== undefined) db.ai_sentiment_score = review.aiSentimentScore;
    if (review.aiSummary !== undefined) db.ai_summary = review.aiSummary;
    if (review.aiRecommendations !== undefined) db.ai_recommendations = review.aiRecommendations;
    if (review.submittedAt) db.submitted_at = review.submittedAt?.toISOString() ?? null;
    if (review.reviewedAt) db.reviewed_at = review.reviewedAt?.toISOString() ?? null;
    if (review.acknowledgedAt) db.acknowledged_at = review.acknowledgedAt?.toISOString() ?? null;
    if (review.acknowledgedBy !== undefined) db.acknowledged_by = review.acknowledgedBy;
    if (review.createdAt) db.created_at = review.createdAt.toISOString();
    if (review.updatedAt) db.updated_at = review.updatedAt.toISOString();
    return db;
  }

  private mapGoalToEntity(row: any): PerformanceGoal {
    return new PerformanceGoal(
      row.id, row.employee_id, row.employer_id, row.goal_type, row.title, row.description,
      row.category, row.priority, row.status, new Date(row.start_date), new Date(row.due_date),
      row.target_value, row.target_unit, row.current_value, row.completion_percentage,
      row.key_results, row.milestones, row.linked_goals, row.parent_goal_id,
      row.assigned_by, row.assigned_by_name, new Date(row.last_updated), row.notes,
      row.achieved_at ? new Date(row.achieved_at) : null,
      new Date(row.created_at), new Date(row.updated_at)
    );
  }

  private mapGoalToDatabase(goal: Partial<PerformanceGoal>): any {
    const db: any = {};
    if (goal.id) db.id = goal.id;
    if (goal.employeeId) db.employee_id = goal.employeeId;
    if (goal.employerId) db.employer_id = goal.employerId;
    if (goal.goalType) db.goal_type = goal.goalType;
    if (goal.title) db.title = goal.title;
    if (goal.description) db.description = goal.description;
    if (goal.category) db.category = goal.category;
    if (goal.priority) db.priority = goal.priority;
    if (goal.status) db.status = goal.status;
    if (goal.startDate) db.start_date = goal.startDate.toISOString().split('T')[0];
    if (goal.dueDate) db.due_date = goal.dueDate.toISOString().split('T')[0];
    if (goal.targetValue !== undefined) db.target_value = goal.targetValue;
    if (goal.targetUnit !== undefined) db.target_unit = goal.targetUnit;
    if (goal.currentValue !== undefined) db.current_value = goal.currentValue;
    if (goal.completionPercentage !== undefined) db.completion_percentage = goal.completionPercentage;
    if (goal.keyResults !== undefined) db.key_results = goal.keyResults;
    if (goal.milestones !== undefined) db.milestones = goal.milestones;
    if (goal.linkedGoals !== undefined) db.linked_goals = goal.linkedGoals;
    if (goal.parentGoalId !== undefined) db.parent_goal_id = goal.parentGoalId;
    if (goal.assignedBy) db.assigned_by = goal.assignedBy;
    if (goal.assignedByName) db.assigned_by_name = goal.assignedByName;
    if (goal.lastUpdated) db.last_updated = goal.lastUpdated.toISOString();
    if (goal.notes !== undefined) db.notes = goal.notes;
    if (goal.achievedAt) db.achieved_at = goal.achievedAt?.toISOString() ?? null;
    if (goal.createdAt) db.created_at = goal.createdAt.toISOString();
    if (goal.updatedAt) db.updated_at = goal.updatedAt.toISOString();
    return db;
  }
}
