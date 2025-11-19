'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Chip, Spinner, Button } from '@heroui/react';
import { Award, TrendingUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface PerformanceReview {
  id: string;
  review_period: string;
  overall_rating?: number;
  status: 'draft' | 'submitted' | 'completed' | 'cancelled';
  reviewer_id?: string;
  submitted_at?: string;
  completed_at?: string;
  strengths?: string;
  areas_for_improvement?: string;
}

interface EmployeePerformanceHistoryProps {
  employeeId: string;
}

export function EmployeePerformanceHistory({ employeeId }: EmployeePerformanceHistoryProps) {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/performance/reviews?employeeId=${employeeId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch performance reviews');
        }

        const result = await response.json();
        const completedReviews = (result.data || []).filter((r: PerformanceReview) => r.status === 'completed');
        setReviews(completedReviews);
      } catch (err) {
        console.error('Error fetching performance reviews:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch performance reviews');
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [employeeId]);

  const statusColorMap = {
    completed: 'success',
    submitted: 'primary',
    draft: 'default',
    cancelled: 'danger',
  } as const;

  const averageRating = reviews.length > 0 && reviews.some(r => r.overall_rating)
    ? reviews.reduce((sum, review) => sum + (review.overall_rating || 0), 0) / reviews.filter(r => r.overall_rating).length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <Spinner size="lg" color="primary" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading performance reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Reviews</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Button color="primary" size="sm" onPress={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      {reviews.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Average Rating
                </p>
                <p className="text-4xl font-bold text-purple-600">
                  {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Based on {reviews.length} reviews
                </p>
              </div>
              <Award className="w-16 h-16 text-purple-600 opacity-20" />
            </div>
          </CardBody>
        </Card>
      )}

      {/* Performance History */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Performance Reviews
        </h3>

        {reviews.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Award className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">No performance reviews yet</p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardBody>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-lg">{review.review_period}</h4>
                        <Chip
                          size="sm"
                          color={statusColorMap[review.status]}
                          variant="flat"
                        >
                          {review.status}
                        </Chip>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {review.completed_at && `Completed on ${format(new Date(review.completed_at), 'MMM dd, yyyy')}`}
                        {!review.completed_at && review.submitted_at && `Submitted on ${format(new Date(review.submitted_at), 'MMM dd, yyyy')}`}
                      </p>
                    </div>
                    {review.overall_rating && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Rating
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          {review.overall_rating.toFixed(1)}
                        </p>
                      </div>
                    )}
                  </div>

                  {(review.strengths || review.areas_for_improvement) && (
                    <div className="space-y-3">
                      {review.strengths && (
                        <div>
                          <p className="text-sm font-medium mb-2 text-green-600">Strengths:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{review.strengths}</p>
                        </div>
                      )}
                      {review.areas_for_improvement && (
                        <div>
                          <p className="text-sm font-medium mb-2 text-orange-600">Areas for Improvement:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{review.areas_for_improvement}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
