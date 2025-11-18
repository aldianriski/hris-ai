'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, Chip, Progress } from '@heroui/react';
import { Target, TrendingUp, Calendar } from 'lucide-react';
import { PerformanceGoal } from '@/lib/api/types';
import { performanceService } from '@/lib/api/services';
import { format } from 'date-fns';

const STATUS_COLOR_MAP = {
  not_started: 'default',
  in_progress: 'primary',
  completed: 'success',
  cancelled: 'danger',
} as const;

export function GoalsList() {
  const [goals, setGoals] = useState<PerformanceGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        const data = await performanceService.listGoals({
          employerId: 'temp-employer-id',
        });
        setGoals(data);
      } catch (error) {
        console.error('Failed to fetch goals:', error);
        setGoals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg border">
        <Target className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-500">No goals set yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <Card key={goal.id} className="hover:shadow-lg transition-shadow">
          <CardBody>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Chip size="sm" variant="flat" color="primary">
                    {goal.goalType}
                  </Chip>
                  <Chip
                    size="sm"
                    color={STATUS_COLOR_MAP[goal.status]}
                    variant="flat"
                  >
                    {goal.status.replace('_', ' ').toUpperCase()}
                  </Chip>
                </div>

                <h3 className="text-lg font-semibold mb-2">{goal.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {goal.description}
                </p>

                {goal.keyResults && goal.keyResults.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Key Results:</p>
                    {goal.keyResults.map((kr) => (
                      <div key={kr.id} className="pl-4 border-l-2 border-gray-200">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm">{kr.description}</p>
                          <span className="text-xs font-medium">
                            {kr.currentValue}/{kr.targetValue} {kr.unit}
                          </span>
                        </div>
                        <Progress
                          size="sm"
                          value={(kr.currentValue / kr.targetValue) * 100}
                          color={
                            kr.status === 'completed'
                              ? 'success'
                              : kr.status === 'in_progress'
                              ? 'primary'
                              : 'default'
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end justify-between gap-4 md:w-48">
                <div className="text-center">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Progress</span>
                  </div>
                  <div className="relative inline-flex">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 36}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 36 * (1 - goal.progress / 100)
                        }`}
                        className="text-blue-600"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                      {goal.progress}%
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Due {format(new Date(goal.targetDate), 'MMM dd')}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
