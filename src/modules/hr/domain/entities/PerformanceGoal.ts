/**
 * Performance Goal Domain Entity
 * Represents OKRs (Objectives and Key Results) and KPIs
 */
export class PerformanceGoal {
  constructor(
    public readonly id: string,
    public readonly employeeId: string,
    public readonly employerId: string,
    public readonly goalType: 'okr' | 'kpi' | 'smart',
    public readonly title: string,
    public readonly description: string,
    public readonly category:
      | 'sales'
      | 'productivity'
      | 'quality'
      | 'customer_satisfaction'
      | 'learning'
      | 'leadership'
      | 'other',
    public readonly priority: 'high' | 'medium' | 'low',
    public readonly status: 'draft' | 'active' | 'on_track' | 'at_risk' | 'achieved' | 'not_achieved' | 'cancelled',
    public readonly startDate: Date,
    public readonly dueDate: Date,
    public readonly targetValue: number | null, // For quantitative goals
    public readonly targetUnit: string | null, // e.g., "sales", "hours", "%"
    public readonly currentValue: number | null,
    public readonly completionPercentage: number, // 0-100
    public readonly keyResults: Array<{
      id: string;
      description: string;
      targetValue: number;
      currentValue: number;
      unit: string;
      completionPercentage: number;
    }> | null, // For OKRs
    public readonly milestones: Array<{
      id: string;
      description: string;
      dueDate: Date;
      isCompleted: boolean;
      completedAt: Date | null;
    }> | null,
    public readonly linkedGoals: string[], // IDs of related goals
    public readonly parentGoalId: string | null, // For cascading goals
    public readonly assignedBy: string,
    public readonly assignedByName: string,
    public readonly lastUpdated: Date,
    public readonly notes: string | null,
    public readonly achievedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.title || this.title.trim().length === 0) {
      throw new Error('Goal title is required');
    }

    if (this.dueDate < this.startDate) {
      throw new Error('Due date must be after start date');
    }

    if (this.completionPercentage < 0 || this.completionPercentage > 100) {
      throw new Error('Completion percentage must be between 0 and 100');
    }

    if (this.targetValue !== null && this.targetValue < 0) {
      throw new Error('Target value cannot be negative');
    }

    if (this.currentValue !== null && this.currentValue < 0) {
      throw new Error('Current value cannot be negative');
    }

    // Validate key results
    if (this.keyResults) {
      for (const kr of this.keyResults) {
        if (kr.completionPercentage < 0 || kr.completionPercentage > 100) {
          throw new Error('Key result completion percentage must be between 0 and 100');
        }
      }
    }
  }

  /**
   * Check if goal is overdue
   */
  isOverdue(): boolean {
    const now = new Date();
    return this.dueDate < now && !this.isCompleted();
  }

  /**
   * Check if goal is active
   */
  isActive(): boolean {
    return this.status === 'active' || this.status === 'on_track' || this.status === 'at_risk';
  }

  /**
   * Check if goal is completed
   */
  isCompleted(): boolean {
    return this.status === 'achieved' || this.status === 'not_achieved';
  }

  /**
   * Get days remaining
   */
  get daysRemaining(): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(this.dueDate);
    due.setHours(0, 0, 0, 0);

    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((due.getTime() - now.getTime()) / oneDay);
  }

  /**
   * Get progress status
   */
  get progressStatus(): 'ahead' | 'on_track' | 'at_risk' | 'behind' {
    if (this.isCompleted()) return 'ahead';

    const totalDays = Math.round(
      (this.dueDate.getTime() - this.startDate.getTime()) / (24 * 60 * 60 * 1000)
    );
    const elapsedDays = Math.round(
      (Date.now() - this.startDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    const expectedProgress = totalDays > 0 ? (elapsedDays / totalDays) * 100 : 0;
    const actualProgress = this.completionPercentage;

    const variance = actualProgress - expectedProgress;

    if (variance > 10) return 'ahead';
    if (variance >= -10) return 'on_track';
    if (variance >= -25) return 'at_risk';
    return 'behind';
  }

  /**
   * Update progress
   */
  updateProgress(
    currentValue: number,
    notes?: string
  ): PerformanceGoal {
    const targetValue = this.targetValue ?? 100;
    const completionPercentage = Math.min(100, (currentValue / targetValue) * 100);

    // Auto-update status based on progress
    let newStatus = this.status;
    if (this.status !== 'achieved' && this.status !== 'not_achieved') {
      if (completionPercentage >= 100) {
        newStatus = 'achieved';
      } else {
        const progressStatus = this.progressStatus;
        if (progressStatus === 'at_risk' || progressStatus === 'behind') {
          newStatus = 'at_risk';
        } else {
          newStatus = 'on_track';
        }
      }
    }

    return new PerformanceGoal(
      this.id,
      this.employeeId,
      this.employerId,
      this.goalType,
      this.title,
      this.description,
      this.category,
      this.priority,
      newStatus,
      this.startDate,
      this.dueDate,
      this.targetValue,
      this.targetUnit,
      currentValue,
      completionPercentage,
      this.keyResults,
      this.milestones,
      this.linkedGoals,
      this.parentGoalId,
      this.assignedBy,
      this.assignedByName,
      new Date(),
      notes ?? this.notes,
      completionPercentage >= 100 ? new Date() : this.achievedAt,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update key result progress (for OKRs)
   */
  updateKeyResult(
    keyResultId: string,
    currentValue: number
  ): PerformanceGoal {
    if (!this.keyResults) {
      throw new Error('This goal has no key results');
    }

    const updatedKeyResults = this.keyResults.map((kr) => {
      if (kr.id === keyResultId) {
        const completionPercentage = Math.min(100, (currentValue / kr.targetValue) * 100);
        return {
          ...kr,
          currentValue,
          completionPercentage,
        };
      }
      return kr;
    });

    // Calculate overall completion based on key results
    const avgCompletion =
      updatedKeyResults.reduce((sum, kr) => sum + kr.completionPercentage, 0) /
      updatedKeyResults.length;

    // Auto-update status
    let newStatus = this.status;
    if (this.status !== 'achieved' && this.status !== 'not_achieved') {
      if (avgCompletion >= 100) {
        newStatus = 'achieved';
      } else if (this.progressStatus === 'at_risk' || this.progressStatus === 'behind') {
        newStatus = 'at_risk';
      } else {
        newStatus = 'on_track';
      }
    }

    return new PerformanceGoal(
      this.id,
      this.employeeId,
      this.employerId,
      this.goalType,
      this.title,
      this.description,
      this.category,
      this.priority,
      newStatus,
      this.startDate,
      this.dueDate,
      this.targetValue,
      this.targetUnit,
      this.currentValue,
      avgCompletion,
      updatedKeyResults,
      this.milestones,
      this.linkedGoals,
      this.parentGoalId,
      this.assignedBy,
      this.assignedByName,
      new Date(),
      this.notes,
      avgCompletion >= 100 ? new Date() : this.achievedAt,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Complete milestone
   */
  completeMilestone(milestoneId: string): PerformanceGoal {
    if (!this.milestones) {
      throw new Error('This goal has no milestones');
    }

    const updatedMilestones = this.milestones.map((m) => {
      if (m.id === milestoneId && !m.isCompleted) {
        return {
          ...m,
          isCompleted: true,
          completedAt: new Date(),
        };
      }
      return m;
    });

    // Calculate completion based on milestones
    const completedCount = updatedMilestones.filter((m) => m.isCompleted).length;
    const completionPercentage = (completedCount / updatedMilestones.length) * 100;

    return new PerformanceGoal(
      this.id,
      this.employeeId,
      this.employerId,
      this.goalType,
      this.title,
      this.description,
      this.category,
      this.priority,
      this.status,
      this.startDate,
      this.dueDate,
      this.targetValue,
      this.targetUnit,
      this.currentValue,
      completionPercentage,
      this.keyResults,
      updatedMilestones,
      this.linkedGoals,
      this.parentGoalId,
      this.assignedBy,
      this.assignedByName,
      new Date(),
      this.notes,
      this.achievedAt,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Mark as achieved
   */
  markAchieved(): PerformanceGoal {
    if (this.isCompleted()) {
      throw new Error('Goal is already completed');
    }

    return new PerformanceGoal(
      this.id,
      this.employeeId,
      this.employerId,
      this.goalType,
      this.title,
      this.description,
      this.category,
      this.priority,
      'achieved',
      this.startDate,
      this.dueDate,
      this.targetValue,
      this.targetUnit,
      this.targetValue,
      100,
      this.keyResults,
      this.milestones,
      this.linkedGoals,
      this.parentGoalId,
      this.assignedBy,
      this.assignedByName,
      new Date(),
      this.notes,
      new Date(),
      this.createdAt,
      new Date()
    );
  }

  /**
   * Mark as not achieved
   */
  markNotAchieved(reason: string): PerformanceGoal {
    if (this.isCompleted()) {
      throw new Error('Goal is already completed');
    }

    return new PerformanceGoal(
      this.id,
      this.employeeId,
      this.employerId,
      this.goalType,
      this.title,
      this.description,
      this.category,
      this.priority,
      'not_achieved',
      this.startDate,
      this.dueDate,
      this.targetValue,
      this.targetUnit,
      this.currentValue,
      this.completionPercentage,
      this.keyResults,
      this.milestones,
      this.linkedGoals,
      this.parentGoalId,
      this.assignedBy,
      this.assignedByName,
      new Date(),
      reason,
      new Date(),
      this.createdAt,
      new Date()
    );
  }

  /**
   * Cancel goal
   */
  cancel(reason: string): PerformanceGoal {
    if (this.isCompleted()) {
      throw new Error('Cannot cancel completed goal');
    }

    return new PerformanceGoal(
      this.id,
      this.employeeId,
      this.employerId,
      this.goalType,
      this.title,
      this.description,
      this.category,
      this.priority,
      'cancelled',
      this.startDate,
      this.dueDate,
      this.targetValue,
      this.targetUnit,
      this.currentValue,
      this.completionPercentage,
      this.keyResults,
      this.milestones,
      this.linkedGoals,
      this.parentGoalId,
      this.assignedBy,
      this.assignedByName,
      new Date(),
      reason,
      null,
      this.createdAt,
      new Date()
    );
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      employeeId: this.employeeId,
      employerId: this.employerId,
      goalType: this.goalType,
      title: this.title,
      description: this.description,
      category: this.category,
      priority: this.priority,
      status: this.status,
      startDate: this.startDate.toISOString().split('T')[0],
      dueDate: this.dueDate.toISOString().split('T')[0],
      targetValue: this.targetValue,
      targetUnit: this.targetUnit,
      currentValue: this.currentValue,
      completionPercentage: this.completionPercentage,
      keyResults: this.keyResults,
      milestones: this.milestones?.map((m) => ({
        ...m,
        dueDate: m.dueDate.toISOString().split('T')[0],
        completedAt: m.completedAt?.toISOString() ?? null,
      })),
      linkedGoals: this.linkedGoals,
      parentGoalId: this.parentGoalId,
      assignedBy: this.assignedBy,
      assignedByName: this.assignedByName,
      lastUpdated: this.lastUpdated.toISOString(),
      notes: this.notes,
      achievedAt: this.achievedAt?.toISOString() ?? null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      // Computed
      isOverdue: this.isOverdue(),
      isActive: this.isActive(),
      daysRemaining: this.daysRemaining,
      progressStatus: this.progressStatus,
    };
  }
}
