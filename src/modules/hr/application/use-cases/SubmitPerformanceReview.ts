import type { IPerformanceRepository } from '../../domain/repositories/IPerformanceRepository';
import type { IEmployeeRepository } from '../../domain/repositories/IEmployeeRepository';
import type { PerformanceReview } from '../../domain/entities/PerformanceReview';
import { AISentimentAnalyzer } from '../../infrastructure/services/AISentimentAnalyzer';

/**
 * Submit Performance Review Use Case
 * Submits review and performs AI sentiment analysis
 */
export class SubmitPerformanceReview {
  constructor(
    private performanceRepository: IPerformanceRepository,
    private employeeRepository: IEmployeeRepository,
    private sentimentAnalyzer: AISentimentAnalyzer
  ) {}

  async execute(input: {
    reviewId: string;
    analyzeWithAI?: boolean;
  }): Promise<PerformanceReview> {
    // Get review
    const review = await this.performanceRepository.findReviewById(input.reviewId);
    if (!review) {
      throw new Error('Performance review not found');
    }

    if (!review.canSubmit()) {
      throw new Error('Review cannot be submitted: incomplete or already submitted');
    }

    // Submit review
    let submittedReview = review.submit();

    // Perform AI sentiment analysis if enabled
    if (input.analyzeWithAI !== false) {
      try {
        const employee = await this.employeeRepository.findById(review.employeeId);
        if (!employee) {
          throw new Error('Employee not found');
        }

        const sentimentResult = await this.sentimentAnalyzer.analyzeReview({
          employeeName: employee.fullName,
          position: employee.position,
          reviewType: review.reviewType,
          overallRating: review.overallRating,
          ratings: review.ratings,
          strengths: review.strengths,
          areasForImprovement: review.areasForImprovement,
          achievements: review.achievements,
          reviewerComments: review.reviewerComments,
          employeeComments: review.employeeComments,
        });

        // Add AI analysis to review
        submittedReview = submittedReview.addAIAnalysis(
          sentimentResult.sentiment,
          sentimentResult.sentimentScore,
          sentimentResult.summary,
          [
            ...sentimentResult.recommendations,
            ...sentimentResult.keyThemes.map((theme) => `Key theme: ${theme}`),
          ]
        );

        // Check for bias
        const biasResult = await this.sentimentAnalyzer.detectBias({
          employeeName: employee.fullName,
          position: employee.position,
          reviewType: review.reviewType,
          overallRating: review.overallRating,
          ratings: review.ratings,
          strengths: review.strengths,
          areasForImprovement: review.areasForImprovement,
          achievements: review.achievements,
          reviewerComments: review.reviewerComments,
          employeeComments: review.employeeComments,
        });

        // If potential bias detected, add to recommendations
        if (biasResult.hasPotentialBias) {
          const updatedRecommendations = [
            ...(submittedReview.aiRecommendations ?? []),
            `⚠️ Potential bias detected: ${biasResult.biasType} (Confidence: ${(biasResult.confidence * 100).toFixed(0)}%) - ${biasResult.explanation}`,
          ];

          submittedReview = submittedReview.addAIAnalysis(
            sentimentResult.sentiment,
            sentimentResult.sentimentScore,
            sentimentResult.summary,
            updatedRecommendations
          );
        }
      } catch (aiError) {
        console.error('AI sentiment analysis failed:', aiError);
        // Continue without AI analysis
      }
    }

    return this.performanceRepository.updateReview(review.id, submittedReview);
  }
}
