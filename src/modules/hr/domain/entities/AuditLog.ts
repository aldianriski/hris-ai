/**
 * Audit Log Domain Entity
 * Tracks all important actions in the system for compliance and security
 */
export class AuditLog {
  constructor(
    public readonly id: string,
    public readonly employerId: string,
    public readonly userId: string,
    public readonly userName: string,
    public readonly userRole: string,
    public readonly action:
      | 'create'
      | 'update'
      | 'delete'
      | 'view'
      | 'export'
      | 'approve'
      | 'reject'
      | 'login'
      | 'logout'
      | 'other',
    public readonly entityType:
      | 'employee'
      | 'payroll'
      | 'leave'
      | 'attendance'
      | 'performance'
      | 'document'
      | 'department'
      | 'position'
      | 'user'
      | 'other',
    public readonly entityId: string | null,
    public readonly entityName: string | null,
    public readonly description: string,
    public readonly changes: Record<string, { before: unknown; after: unknown }> | null,
    public readonly metadata: Record<string, unknown> | null,
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null,
    public readonly timestamp: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.description || this.description.trim().length === 0) {
      throw new Error('Audit log description is required');
    }
  }

  /**
   * Check if action is sensitive (requires special attention)
   */
  isSensitiveAction(): boolean {
    const sensitiveActions = ['delete', 'approve', 'export'];
    return sensitiveActions.includes(this.action);
  }

  /**
   * Check if action affects payroll
   */
  isPayrollAction(): boolean {
    return this.entityType === 'payroll';
  }

  /**
   * Check if action affects employee data
   */
  isEmployeeAction(): boolean {
    return this.entityType === 'employee';
  }

  /**
   * Get formatted timestamp
   */
  get formattedTimestamp(): string {
    return this.timestamp.toISOString();
  }

  /**
   * Get summary of changes
   */
  getChangeSummary(): string[] {
    if (!this.changes) return [];

    return Object.entries(this.changes).map(([field, change]) => {
      return `${field}: ${JSON.stringify(change.before)} → ${JSON.stringify(change.after)}`;
    });
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      employerId: this.employerId,
      userId: this.userId,
      userName: this.userName,
      userRole: this.userRole,
      action: this.action,
      entityType: this.entityType,
      entityId: this.entityId,
      entityName: this.entityName,
      description: this.description,
      changes: this.changes,
      changeSummary: this.getChangeSummary(),
      metadata: this.metadata,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      timestamp: this.timestamp.toISOString(),
      // Computed
      isSensitiveAction: this.isSensitiveAction(),
      isPayrollAction: this.isPayrollAction(),
      isEmployeeAction: this.isEmployeeAction(),
    };
  }
}
