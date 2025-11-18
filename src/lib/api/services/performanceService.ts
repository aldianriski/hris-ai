import { apiClient } from '../client';
import type {
  PerformanceReview,
  PerformanceGoal,
  CreatePerformanceReviewData,
} from '../types';

export const performanceService = {
  /**
   * Get list of performance reviews
   */
  listReviews: async (params: {
    employeeId?: string;
    employerId?: string;
    status?: string;
  }): Promise<PerformanceReview[]> => {
    return apiClient.get('/performance/reviews', params as Record<string, string>);
  },

  /**
   * Get performance review by ID
   */
  getReviewById: async (id: string): Promise<PerformanceReview> => {
    return apiClient.get(`/performance/reviews/${id}`);
  },

  /**
   * Create new performance review
   */
  createReview: async (
    data: CreatePerformanceReviewData
  ): Promise<PerformanceReview> => {
    return apiClient.post('/performance/reviews', data);
  },

  /**
   * Update performance review
   */
  updateReview: async (
    id: string,
    data: Partial<CreatePerformanceReviewData>
  ): Promise<PerformanceReview> => {
    return apiClient.patch(`/performance/reviews/${id}`, data);
  },

  /**
   * Submit performance review
   */
  submitReview: async (id: string): Promise<PerformanceReview> => {
    return apiClient.post(`/performance/reviews/${id}/submit`);
  },

  /**
   * Get list of performance goals
   */
  listGoals: async (params: {
    employeeId?: string;
    employerId?: string;
    status?: string;
  }): Promise<PerformanceGoal[]> => {
    return apiClient.get('/performance/goals', params as Record<string, string>);
  },

  /**
   * Create new performance goal
   */
  createGoal: async (data: Partial<PerformanceGoal>): Promise<PerformanceGoal> => {
    return apiClient.post('/performance/goals', data);
  },

  /**
   * Update performance goal
   */
  updateGoal: async (
    id: string,
    data: Partial<PerformanceGoal>
  ): Promise<PerformanceGoal> => {
    return apiClient.patch(`/performance/goals/${id}`, data);
  },
};
