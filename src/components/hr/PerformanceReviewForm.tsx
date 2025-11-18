'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardBody, Input, Textarea, Button, Select, SelectItem, Chip } from '@heroui/react';
import { Save, X, Star, TrendingUp } from 'lucide-react';
import { performanceService } from '@/lib/api/services';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface PerformanceReviewFormProps {
  mode: 'create' | 'edit';
  reviewId?: string;
}

const RATING_OPTIONS = [
  { value: '5', label: '5 - Outstanding' },
  { value: '4', label: '4 - Exceeds Expectations' },
  { value: '3', label: '3 - Meets Expectations' },
  { value: '2', label: '2 - Needs Improvement' },
  { value: '1', label: '1 - Unsatisfactory' },
];

export function PerformanceReviewForm({ mode, reviewId }: PerformanceReviewFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, watch, setValue } = useForm();

  const rating = watch('overallRating');

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      const reviewData = {
        employeeId: data.employeeId,
        employerId: 'temp-employer-id',
        reviewerId: 'temp-reviewer-id',
        reviewPeriod: data.reviewPeriod,
        reviewDate: data.reviewDate,
        overallRating: parseFloat(data.overallRating),
        strengths: data.strengths.split('\n').filter(Boolean),
        areasForImprovement: data.areasForImprovement.split('\n').filter(Boolean),
        goals: data.goals.split('\n').filter(Boolean),
        comments: data.comments,
      };

      if (mode === 'create') {
        await performanceService.createReview(reviewData);
        toast.success('Performance review created successfully!');
      } else {
        await performanceService.updateReview(reviewId!, reviewData);
        toast.success('Performance review updated successfully!');
      }

      router.push('/hr/performance');
    } catch (error) {
      console.error('Failed to save review:', error);
      toast.error('Failed to save performance review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardBody className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              {...register('employeeId')}
              label="Employee"
              placeholder="Select employee"
              isRequired
            />

            <Input
              {...register('reviewPeriod')}
              label="Review Period"
              placeholder="Q1 2024"
              isRequired
            />

            <Input
              {...register('reviewDate')}
              type="date"
              label="Review Date"
              isRequired
            />

            <Select
              label="Overall Rating"
              placeholder="Select rating"
              selectedKeys={rating ? [rating] : []}
              onChange={(e) => setValue('overallRating', e.target.value)}
              isRequired
              startContent={<Star className="w-4 h-4" />}
            >
              {RATING_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          {rating && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900 dark:text-purple-100">
                    Rating: {rating}/5
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-200">
                    {RATING_OPTIONS.find((o) => o.value === rating)?.label.split(' - ')[1]}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Textarea
            {...register('strengths')}
            label="Strengths"
            placeholder="Enter strengths (one per line)"
            minRows={4}
            description="Key strengths and accomplishments during this period"
          />

          <Textarea
            {...register('areasForImprovement')}
            label="Areas for Improvement"
            placeholder="Enter areas for improvement (one per line)"
            minRows={4}
            description="Areas where the employee can improve"
          />

          <Textarea
            {...register('goals')}
            label="Future Goals"
            placeholder="Enter future goals (one per line)"
            minRows={4}
            description="Goals to focus on for the next period"
          />

          <Textarea
            {...register('comments')}
            label="Additional Comments"
            placeholder="Enter additional feedback and observations"
            minRows={6}
          />

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              AI Sentiment Analysis
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              Our AI will analyze the tone and sentiment of your feedback to ensure it's
              constructive and professional. Analysis will be available after submission.
            </p>
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="bordered"
          startContent={<X className="w-4 h-4" />}
          onPress={() => router.back()}
          isDisabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          color="primary"
          startContent={<Save className="w-4 h-4" />}
          isLoading={isSubmitting}
        >
          {mode === 'create' ? 'Create Review' : 'Update Review'}
        </Button>
      </div>
    </form>
  );
}
