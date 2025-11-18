import type { IPerformanceRepository } from '../../domain/repositories/IPerformanceRepository';
import { PerformanceReview } from '../../domain/entities/PerformanceReview';
import { AISentimentAnalyzer } from '../../infrastructure/services/AISentimentAnalyzer';
import type { CreatePerformanceReviewInput } from '../dto/PerformanceDTO';

/**
 * Create Performance Review Use Case
 */
export class CreatePerformanceReview {
  constructor(
    private performanceRepository: IPerformanceRepository,
    private sentimentAnalyzer: AISentimentAnalyzer
  ) {}

  async execute(input: CreatePerformanceReviewInput): Promise<PerformanceReview> {
    // Parse dates
    const reviewPeriodStart =
      typeof input.reviewPeriodStart === 'string'
        ? new Date(input.reviewPeriodStart)
        : input.reviewPeriodStart;
    const reviewPeriodEnd =
      typeof input.reviewPeriodEnd === 'string'
        ? new Date(input.reviewPeriodEnd)
        : input.reviewPeriodEnd;

    // Create review
    const review = new PerformanceReview(
      crypto.randomUUID(),
      input.employeeId,
      input.employerId,
      input.reviewerId,
      input.reviewerName,
      input.reviewType,
      reviewPeriodStart,
      reviewPeriodEnd,
      'draft',
      null, // overallRating
      [], // ratings
      null, // strengths
      null, // areasForImprovement
      null, // achievements
      null, // goalsForNextPeriod
      null, // reviewerComments
      null, // employeeComments
      null, // actionPlan
      false, // promotionRecommendation
      null, // salaryIncreaseRecommendation
      null, // aiSentiment
      null, // aiSentimentScore
      null, // aiSummary
      null, // aiRecommendations
      null, // submittedAt
      null, // reviewedAt
      null, // acknowledgedAt
      null, // acknowledgedBy
      new Date(),
      new Date()
    );

    return this.performanceRepository.createReview(review);
  }
}
