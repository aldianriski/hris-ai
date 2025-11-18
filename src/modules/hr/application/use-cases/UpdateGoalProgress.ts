import type { IPerformanceRepository } from '../../domain/repositories/IPerformanceRepository';
import type { PerformanceGoal } from '../../domain/entities/PerformanceGoal';
import type { UpdateGoalProgressInput } from '../dto/PerformanceDTO';

/**
 * Update Goal Progress Use Case
 */
export class UpdateGoalProgress {
  constructor(private performanceRepository: IPerformanceRepository) {}

  async execute(input: {
    goalId: string;
    progress: UpdateGoalProgressInput;
  }): Promise<PerformanceGoal> {
    // Get goal
    const goal = await this.performanceRepository.findGoalById(input.goalId);
    if (!goal) {
      throw new Error('Performance goal not found');
    }

    if (goal.isCompleted()) {
      throw new Error('Cannot update completed goal');
    }

    // Update progress
    const updatedGoal = goal.updateProgress(input.progress.currentValue, input.progress.notes);

    return this.performanceRepository.updateGoal(goal.id, updatedGoal);
  }
}
