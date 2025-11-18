/**
 * Performance Review Card Component
 * Display performance review summary
 */

'use client';

import { Star, Calendar, User, TrendingUp, FileText } from 'lucide-react';

interface PerformanceReview {
  id: string;
  employeeName: string;
  employeeAvatar?: string;
  reviewerName: string;
  period: string;
  status: 'draft' | 'pending' | 'completed';
  overallRating?: number;
  categories: {
    name: string;
    rating: number;
  }[];
  strengths?: string[];
  improvements?: string[];
  goals?: string[];
  reviewDate?: string;
  nextReviewDate?: string;
}

interface PerformanceReviewCardProps {
  review: PerformanceReview;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
    </div>
  );
}

export function PerformanceReviewCard({
  review,
  onView,
  onEdit,
}: PerformanceReviewCardProps) {
  const statusInfo = statusConfig[review.status];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 flex-shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-lg">
            {review.employeeName[0]}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {review.employeeName}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              Reviewer: {review.reviewerName}
            </div>
          </div>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Period & Dates */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Period: {review.period}
        </div>
        {review.reviewDate && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reviewed: {new Date(review.reviewDate).toLocaleDateString('id-ID')}
          </div>
        )}
      </div>

      {/* Overall Rating */}
      {review.overallRating && (
        <div className="mt-4 rounded-lg bg-yellow-50 p-4">
          <p className="mb-2 text-sm font-medium text-gray-700">Overall Rating</p>
          <StarRating rating={review.overallRating} />
        </div>
      )}

      {/* Categories */}
      {review.categories.length > 0 && (
        <div className="mt-4">
          <p className="mb-3 text-sm font-medium text-gray-700">Performance Categories</p>
          <div className="space-y-2">
            {review.categories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{category.name}</span>
                <StarRating rating={category.rating} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {review.strengths && review.strengths.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-green-700">Strengths</p>
          <ul className="space-y-1">
            {review.strengths.slice(0, 2).map((strength, index) => (
              <li key={index} className="text-sm text-gray-600">
                • {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Review */}
      {review.nextReviewDate && (
        <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
          <TrendingUp className="h-4 w-4" />
          Next review: {new Date(review.nextReviewDate).toLocaleDateString('id-ID')}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        {onView && (
          <button
            onClick={() => onView(review.id)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FileText className="h-4 w-4" />
            View Details
          </button>
        )}
        {review.status === 'draft' && onEdit && (
          <button
            onClick={() => onEdit(review.id)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <FileText className="h-4 w-4" />
            Continue Editing
          </button>
        )}
      </div>
    </div>
  );
}
