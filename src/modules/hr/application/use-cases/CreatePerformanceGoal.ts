import type { IPerformanceRepository } from '../../domain/repositories/IPerformanceRepository';
import { PerformanceGoal } from '../../domain/entities/PerformanceGoal';
import type { CreatePerformanceGoalInput } from '../dto/PerformanceDTO';

/**
 * Create Performance Goal Use Case
 */
export class CreatePerformanceGoal {
  constructor(private performanceRepository: IPerformanceRepository) {}

  async execute(input: CreatePerformanceGoalInput): Promise<PerformanceGoal> {
    // Parse dates
    const startDate =
      typeof input.startDate === 'string' ? new Date(input.startDate) : input.startDate;
    const dueDate =
      typeof input.dueDate === 'string' ? new Date(input.dueDate) : input.dueDate;

    // Parse milestones dates if provided
    const milestones = input.milestones
      ? input.milestones.map((m) => ({
          ...m,
          dueDate: typeof m.dueDate === 'string' ? new Date(m.dueDate) : m.dueDate,
          completedAt: null,
        }))
      : null;

    // Create goal
    const goal = new PerformanceGoal(
      crypto.randomUUID(),
      input.employeeId,
      input.employerId,
      input.goalType,
      input.title,
      input.description,
      input.category,
      input.priority,
      'draft',
      startDate,
      dueDate,
      input.targetValue ?? null,
      input.targetUnit ?? null,
      null, // currentValue
      0, // completionPercentage
      input.keyResults ?? null,
      milestones,
      [], // linkedGoals
      input.parentGoalId ?? null,
      input.assignedBy,
      input.assignedByName,
      new Date(), // lastUpdated
      null, // notes
      null, // achievedAt
      new Date(),
      new Date()
    );

    return this.performanceRepository.createGoal(goal);
  }
}
