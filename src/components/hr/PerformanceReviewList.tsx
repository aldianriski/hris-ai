'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, Chip } from '@heroui/react';
import { Award, User, Calendar } from 'lucide-react';
import { PerformanceReview } from '@/lib/api/types';
import { performanceService } from '@/lib/api/services';
import { format } from 'date-fns';
import Link from 'next/link';

const CATEGORY_COLOR_MAP = {
  'Exceeds Expectations': 'success',
  'Meets Expectations': 'primary',
  'Needs Improvement': 'warning',
  'Unsatisfactory': 'danger',
} as const;

export function PerformanceReviewList() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // TODO: Get actual employerId from auth context
        const data = await performanceService.listReviews({
          employerId: 'temp-employer-id',
        });
        setReviews(data);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg border">
        <Award className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-500">No performance reviews yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reviews.map((review) => (
        <Card
          key={review.id}
          isPressable
          as={Link}
          href={`/hr/performance/reviews/${review.id}`}
          className="hover:scale-105 transition-transform"
        >
          <CardBody>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <h3 className="font-semibold">{review.employeeName}</h3>
                  <p className="text-xs text-gray-500">{review.reviewPeriod}</p>
                </div>
              </div>
              <Chip
                size="sm"
                color={CATEGORY_COLOR_MAP[review.category]}
                variant="flat"
              >
                {review.category}
              </Chip>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Rating</span>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-purple-600">
                    {review.overallRating}
                  </span>
                  <span className="text-sm text-gray-500">/5</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>Reviewed on {format(new Date(review.reviewDate), 'MMM dd, yyyy')}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <User className="w-3 h-3" />
                <span>By {review.reviewerName}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
