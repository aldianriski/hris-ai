/**
 * Performance Review Domain Entity
 * Represents employee performance evaluations
 */
export class PerformanceReview {
  constructor(
    public readonly id: string,
    public readonly employeeId: string,
    public readonly employerId: string,
    public readonly reviewerId: string,
    public readonly reviewerName: string,
    public readonly reviewType: 'annual' | 'probation' | 'mid_year' | 'project' | '360',
    public readonly reviewPeriodStart: Date,
    public readonly reviewPeriodEnd: Date,
    public readonly status: 'draft' | 'submitted' | 'reviewed' | 'acknowledged' | 'completed',
    public readonly overallRating: number | null, // 1-5 scale
    public readonly ratings: Array<{
      categoryId: string;
      categoryName: string;
      rating: number; // 1-5
      weight: number; // Percentage
      comments: string | null;
    }>,
    public readonly strengths: string | null,
    public readonly areasForImprovement: string | null,
    public readonly achievements: string | null,
    public readonly goalsForNextPeriod: string | null,
    public readonly reviewerComments: string | null,
    public readonly employeeComments: string | null,
    public readonly actionPlan: string | null,
    public readonly promotionRecommendation: boolean,
    public readonly salaryIncreaseRecommendation: number | null, // Percentage
    public readonly aiSentiment: 'positive' | 'neutral' | 'negative' | null,
    public readonly aiSentimentScore: number | null, // 0-1
    public readonly aiSummary: string | null,
    public readonly aiRecommendations: string[] | null,
    public readonly submittedAt: Date | null,
    public readonly reviewedAt: Date | null,
    public readonly acknowledgedAt: Date | null,
    public readonly acknowledgedBy: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.reviewPeriodEnd < this.reviewPeriodStart) {
      throw new Error('Review period end date must be after start date');
    }

    if (this.overallRating !== null && (this.overallRating < 1 || this.overallRating > 5)) {
      throw new Error('Overall rating must be between 1 and 5');
    }

    // Validate category ratings
    for (const rating of this.ratings) {
      if (rating.rating < 1 || rating.rating > 5) {
        throw new Error('Category rating must be between 1 and 5');
      }

      if (rating.weight < 0 || rating.weight > 100) {
        throw new Error('Category weight must be between 0 and 100');
      }
    }

    // Validate total weights equal 100%
    const totalWeight = this.ratings.reduce((sum, r) => sum + r.weight, 0);
    if (this.ratings.length > 0 && Math.abs(totalWeight - 100) > 0.01) {
      throw new Error('Category weights must sum to 100%');
    }

    if (
      this.salaryIncreaseRecommendation !== null &&
      (this.salaryIncreaseRecommendation < 0 || this.salaryIncreaseRecommendation > 100)
    ) {
      throw new Error('Salary increase recommendation must be between 0 and 100%');
    }

    if (
      this.aiSentimentScore !== null &&
      (this.aiSentimentScore < 0 || this.aiSentimentScore > 1)
    ) {
      throw new Error('AI sentiment score must be between 0 and 1');
    }
  }

  /**
   * Calculate weighted average rating
   */
  get weightedRating(): number {
    if (this.ratings.length === 0) return 0;

    const weighted = this.ratings.reduce(
      (sum, r) => sum + r.rating * (r.weight / 100),
      0
    );

    return Math.round(weighted * 10) / 10; // Round to 1 decimal
  }

  /**
   * Get performance level based on rating
   */
  get performanceLevel(): 'outstanding' | 'exceeds' | 'meets' | 'needs_improvement' | 'unsatisfactory' | null {
    const rating = this.overallRating ?? this.weightedRating;

    if (rating === 0) return null;
    if (rating >= 4.5) return 'outstanding';
    if (rating >= 3.5) return 'exceeds';
    if (rating >= 2.5) return 'meets';
    if (rating >= 1.5) return 'needs_improvement';
    return 'unsatisfactory';
  }

  /**
   * Check if review is draft
   */
  isDraft(): boolean {
    return this.status === 'draft';
  }

  /**
   * Check if review is submitted
   */
  isSubmitted(): boolean {
    return this.status === 'submitted';
  }

  /**
   * Check if review is completed
   */
  isCompleted(): boolean {
    return this.status === 'completed';
  }

  /**
   * Check if review can be edited
   */
  canEdit(): boolean {
    return this.status === 'draft';
  }

  /**
   * Check if review can be submitted
   */
  canSubmit(): boolean {
    return (
      this.status === 'draft' &&
      this.overallRating !== null &&
      this.ratings.length > 0 &&
      this.reviewerComments !== null
    );
  }

  /**
   * Check if employee needs action plan
   */
  needsActionPlan(): boolean {
    const rating = this.overallRating ?? this.weightedRating;
    return rating < 3.0; // Below "meets expectations"
  }

  /**
   * Submit review
   */
  submit(): PerformanceReview {
    if (!this.canSubmit()) {
      throw new Error('Cannot submit: review is incomplete');
    }

    return new PerformanceReview(
      this.id,
      this.employeeId,
      this.employerId,
      this.reviewerId,
      this.reviewerName,
      this.reviewType,
      this.reviewPeriodStart,
      this.reviewPeriodEnd,
      'submitted',
      this.overallRating,
      this.ratings,
      this.strengths,
      this.areasForImprovement,
      this.achievements,
      this.goalsForNextPeriod,
      this.reviewerComments,
      this.employeeComments,
      this.actionPlan,
      this.promotionRecommendation,
      this.salaryIncreaseRecommendation,
      this.aiSentiment,
      this.aiSentimentScore,
      this.aiSummary,
      this.aiRecommendations,
      new Date(),
      this.reviewedAt,
      this.acknowledgedAt,
      this.acknowledgedBy,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Mark as reviewed (by HR or senior manager)
   */
  markReviewed(): PerformanceReview {
    if (!this.isSubmitted()) {
      throw new Error('Can only review submitted performance reviews');
    }

    return new PerformanceReview(
      this.id,
      this.employeeId,
      this.employerId,
      this.reviewerId,
      this.reviewerName,
      this.reviewType,
      this.reviewPeriodStart,
      this.reviewPeriodEnd,
      'reviewed',
      this.overallRating,
      this.ratings,
      this.strengths,
      this.areasForImprovement,
      this.achievements,
      this.goalsForNextPeriod,
      this.reviewerComments,
      this.employeeComments,
      this.actionPlan,
      this.promotionRecommendation,
      this.salaryIncreaseRecommendation,
      this.aiSentiment,
      this.aiSentimentScore,
      this.aiSummary,
      this.aiRecommendations,
      this.submittedAt,
      new Date(),
      this.acknowledgedAt,
      this.acknowledgedBy,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Employee acknowledges review
   */
  acknowledge(employeeId: string, comments?: string): PerformanceReview {
    if (this.status !== 'reviewed') {
      throw new Error('Can only acknowledge reviewed performance reviews');
    }

    return new PerformanceReview(
      this.id,
      this.employeeId,
      this.employerId,
      this.reviewerId,
      this.reviewerName,
      this.reviewType,
      this.reviewPeriodStart,
      this.reviewPeriodEnd,
      'acknowledged',
      this.overallRating,
      this.ratings,
      this.strengths,
      this.areasForImprovement,
      this.achievements,
      this.goalsForNextPeriod,
      this.reviewerComments,
      comments ?? this.employeeComments,
      this.actionPlan,
      this.promotionRecommendation,
      this.salaryIncreaseRecommendation,
      this.aiSentiment,
      this.aiSentimentScore,
      this.aiSummary,
      this.aiRecommendations,
      this.submittedAt,
      this.reviewedAt,
      new Date(),
      employeeId,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Complete review (final step)
   */
  complete(): PerformanceReview {
    if (this.status !== 'acknowledged') {
      throw new Error('Review must be acknowledged before completion');
    }

    return new PerformanceReview(
      this.id,
      this.employeeId,
      this.employerId,
      this.reviewerId,
      this.reviewerName,
      this.reviewType,
      this.reviewPeriodStart,
      this.reviewPeriodEnd,
      'completed',
      this.overallRating,
      this.ratings,
      this.strengths,
      this.areasForImprovement,
      this.achievements,
      this.goalsForNextPeriod,
      this.reviewerComments,
      this.employeeComments,
      this.actionPlan,
      this.promotionRecommendation,
      this.salaryIncreaseRecommendation,
      this.aiSentiment,
      this.aiSentimentScore,
      this.aiSummary,
      this.aiRecommendations,
      this.submittedAt,
      this.reviewedAt,
      this.acknowledgedAt,
      this.acknowledgedBy,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Add AI analysis
   */
  addAIAnalysis(
    sentiment: 'positive' | 'neutral' | 'negative',
    sentimentScore: number,
    summary: string,
    recommendations: string[]
  ): PerformanceReview {
    return new PerformanceReview(
      this.id,
      this.employeeId,
      this.employerId,
      this.reviewerId,
      this.reviewerName,
      this.reviewType,
      this.reviewPeriodStart,
      this.reviewPeriodEnd,
      this.status,
      this.overallRating,
      this.ratings,
      this.strengths,
      this.areasForImprovement,
      this.achievements,
      this.goalsForNextPeriod,
      this.reviewerComments,
      this.employeeComments,
      this.actionPlan,
      this.promotionRecommendation,
      this.salaryIncreaseRecommendation,
      sentiment,
      sentimentScore,
      summary,
      recommendations,
      this.submittedAt,
      this.reviewedAt,
      this.acknowledgedAt,
      this.acknowledgedBy,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update review content
   */
  update(updates: {
    overallRating?: number;
    ratings?: Array<{
      categoryId: string;
      categoryName: string;
      rating: number;
      weight: number;
      comments: string | null;
    }>;
    strengths?: string;
    areasForImprovement?: string;
    achievements?: string;
    goalsForNextPeriod?: string;
    reviewerComments?: string;
    actionPlan?: string;
    promotionRecommendation?: boolean;
    salaryIncreaseRecommendation?: number | null;
  }): PerformanceReview {
    if (!this.canEdit()) {
      throw new Error('Cannot edit submitted reviews');
    }

    return new PerformanceReview(
      this.id,
      this.employeeId,
      this.employerId,
      this.reviewerId,
      this.reviewerName,
      this.reviewType,
      this.reviewPeriodStart,
      this.reviewPeriodEnd,
      this.status,
      updates.overallRating ?? this.overallRating,
      updates.ratings ?? this.ratings,
      updates.strengths ?? this.strengths,
      updates.areasForImprovement ?? this.areasForImprovement,
      updates.achievements ?? this.achievements,
      updates.goalsForNextPeriod ?? this.goalsForNextPeriod,
      updates.reviewerComments ?? this.reviewerComments,
      this.employeeComments,
      updates.actionPlan ?? this.actionPlan,
      updates.promotionRecommendation ?? this.promotionRecommendation,
      updates.salaryIncreaseRecommendation !== undefined
        ? updates.salaryIncreaseRecommendation
        : this.salaryIncreaseRecommendation,
      this.aiSentiment,
      this.aiSentimentScore,
      this.aiSummary,
      this.aiRecommendations,
      this.submittedAt,
      this.reviewedAt,
      this.acknowledgedAt,
      this.acknowledgedBy,
      this.createdAt,
      new Date()
    );
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      employeeId: this.employeeId,
      employerId: this.employerId,
      reviewerId: this.reviewerId,
      reviewerName: this.reviewerName,
      reviewType: this.reviewType,
      reviewPeriodStart: this.reviewPeriodStart.toISOString().split('T')[0],
      reviewPeriodEnd: this.reviewPeriodEnd.toISOString().split('T')[0],
      status: this.status,
      overallRating: this.overallRating,
      weightedRating: this.weightedRating,
      performanceLevel: this.performanceLevel,
      ratings: this.ratings,
      strengths: this.strengths,
      areasForImprovement: this.areasForImprovement,
      achievements: this.achievements,
      goalsForNextPeriod: this.goalsForNextPeriod,
      reviewerComments: this.reviewerComments,
      employeeComments: this.employeeComments,
      actionPlan: this.actionPlan,
      promotionRecommendation: this.promotionRecommendation,
      salaryIncreaseRecommendation: this.salaryIncreaseRecommendation,
      aiSentiment: this.aiSentiment,
      aiSentimentScore: this.aiSentimentScore,
      aiSummary: this.aiSummary,
      aiRecommendations: this.aiRecommendations,
      submittedAt: this.submittedAt?.toISOString() ?? null,
      reviewedAt: this.reviewedAt?.toISOString() ?? null,
      acknowledgedAt: this.acknowledgedAt?.toISOString() ?? null,
      acknowledgedBy: this.acknowledgedBy,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      // Computed
      canEdit: this.canEdit(),
      canSubmit: this.canSubmit(),
      needsActionPlan: this.needsActionPlan(),
    };
  }
}
