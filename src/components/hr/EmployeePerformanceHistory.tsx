'use client';

import { Card, CardBody, Chip } from '@heroui/react';
import { Award, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface PerformanceReview {
  id: string;
  period: string;
  rating: number;
  category: 'Exceeds Expectations' | 'Meets Expectations' | 'Needs Improvement';
  reviewer: string;
  reviewedAt: string;
  highlights: string[];
}

interface EmployeePerformanceHistoryProps {
  employeeId: string;
}

export function EmployeePerformanceHistory({ employeeId }: EmployeePerformanceHistoryProps) {
  // TODO: Fetch actual performance data from API
  const reviews: PerformanceReview[] = [
    {
      id: '1',
      period: 'Q3 2024',
      rating: 4.5,
      category: 'Exceeds Expectations',
      reviewer: 'John Manager',
      reviewedAt: '2024-10-15',
      highlights: [
        'Excellent project delivery',
        'Strong teamwork',
        'Leadership potential',
      ],
    },
    {
      id: '2',
      period: 'Q2 2024',
      rating: 4.0,
      category: 'Meets Expectations',
      reviewer: 'John Manager',
      reviewedAt: '2024-07-15',
      highlights: [
        'Good technical skills',
        'Consistent performance',
        'Reliable team member',
      ],
    },
  ];

  const ratingColorMap = {
    'Exceeds Expectations': 'success',
    'Meets Expectations': 'primary',
    'Needs Improvement': 'warning',
  } as const;

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Average Rating
              </p>
              <p className="text-4xl font-bold text-purple-600">
                {averageRating.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Based on {reviews.length} reviews
              </p>
            </div>
            <Award className="w-16 h-16 text-purple-600 opacity-20" />
          </div>
        </CardBody>
      </Card>

      {/* Performance History */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Performance Reviews
        </h3>

        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Award className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No performance reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardBody>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-lg">{review.period}</h4>
                        <Chip
                          size="sm"
                          color={ratingColorMap[review.category]}
                          variant="flat"
                        >
                          {review.category}
                        </Chip>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Reviewed by {review.reviewer} •{' '}
                        {format(new Date(review.reviewedAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Rating
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        {review.rating}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Highlights:</p>
                    <ul className="space-y-1">
                      {review.highlights.map((highlight, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                        >
                          <span className="text-green-600 mt-1">✓</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
