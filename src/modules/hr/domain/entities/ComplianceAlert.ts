/**
 * Compliance Alert Domain Entity
 * Represents compliance issues and reminders
 */
export class ComplianceAlert {
  constructor(
    public readonly id: string,
    public readonly employerId: string,
    public readonly alertType:
      | 'contract_expiry'
      | 'document_expiry'
      | 'probation_ending'
      | 'bpjs_registration'
      | 'tax_reporting'
      | 'minimum_wage'
      | 'overtime_violation'
      | 'leave_quota'
      | 'other',
    public readonly severity: 'low' | 'medium' | 'high' | 'critical',
    public readonly title: string,
    public readonly description: string,
    public readonly affectedEntityType: 'employee' | 'department' | 'document' | 'payroll' | 'other',
    public readonly affectedEntityId: string | null,
    public readonly affectedEntityName: string | null,
    public readonly dueDate: Date | null,
    public readonly status: 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed',
    public readonly assignedTo: string | null,
    public readonly assignedToName: string | null,
    public readonly resolution: string | null,
    public readonly resolvedAt: Date | null,
    public readonly resolvedBy: string | null,
    public readonly acknowledgedAt: Date | null,
    public readonly acknowledgedBy: string | null,
    public readonly metadata: Record<string, unknown> | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.title || this.title.trim().length === 0) {
      throw new Error('Alert title is required');
    }

    if (!this.description || this.description.trim().length === 0) {
      throw new Error('Alert description is required');
    }
  }

  /**
   * Check if alert is overdue
   */
  isOverdue(): boolean {
    if (!this.dueDate || this.isResolved()) return false;
    return new Date() > this.dueDate;
  }

  /**
   * Check if alert is open
   */
  isOpen(): boolean {
    return this.status === 'open';
  }

  /**
   * Check if alert is resolved
   */
  isResolved(): boolean {
    return this.status === 'resolved';
  }

  /**
   * Check if alert is dismissed
   */
  isDismissed(): boolean {
    return this.status === 'dismissed';
  }

  /**
   * Check if alert is critical
   */
  isCritical(): boolean {
    return this.severity === 'critical';
  }

  /**
   * Get days until due
   */
  get daysUntilDue(): number | null {
    if (!this.dueDate) return null;
    const now = new Date();
    return Math.ceil((this.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Acknowledge alert
   */
  acknowledge(userId: string): ComplianceAlert {
    if (!this.isOpen()) {
      throw new Error('Can only acknowledge open alerts');
    }

    return new ComplianceAlert(
      this.id,
      this.employerId,
      this.alertType,
      this.severity,
      this.title,
      this.description,
      this.affectedEntityType,
      this.affectedEntityId,
      this.affectedEntityName,
      this.dueDate,
      'acknowledged',
      this.assignedTo,
      this.assignedToName,
      this.resolution,
      this.resolvedAt,
      this.resolvedBy,
      new Date(),
      userId,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Assign alert
   */
  assign(userId: string, userName: string): ComplianceAlert {
    return new ComplianceAlert(
      this.id,
      this.employerId,
      this.alertType,
      this.severity,
      this.title,
      this.description,
      this.affectedEntityType,
      this.affectedEntityId,
      this.affectedEntityName,
      this.dueDate,
      'in_progress',
      userId,
      userName,
      this.resolution,
      this.resolvedAt,
      this.resolvedBy,
      this.acknowledgedAt,
      this.acknowledgedBy,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Resolve alert
   */
  resolve(userId: string, resolution: string): ComplianceAlert {
    if (this.isResolved() || this.isDismissed()) {
      throw new Error('Alert is already resolved or dismissed');
    }

    return new ComplianceAlert(
      this.id,
      this.employerId,
      this.alertType,
      this.severity,
      this.title,
      this.description,
      this.affectedEntityType,
      this.affectedEntityId,
      this.affectedEntityName,
      this.dueDate,
      'resolved',
      this.assignedTo,
      this.assignedToName,
      resolution,
      new Date(),
      userId,
      this.acknowledgedAt,
      this.acknowledgedBy,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Dismiss alert
   */
  dismiss(userId: string, reason: string): ComplianceAlert {
    if (this.isResolved() || this.isDismissed()) {
      throw new Error('Alert is already resolved or dismissed');
    }

    return new ComplianceAlert(
      this.id,
      this.employerId,
      this.alertType,
      this.severity,
      this.title,
      this.description,
      this.affectedEntityType,
      this.affectedEntityId,
      this.affectedEntityName,
      this.dueDate,
      'dismissed',
      this.assignedTo,
      this.assignedToName,
      reason,
      new Date(),
      userId,
      this.acknowledgedAt,
      this.acknowledgedBy,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      employerId: this.employerId,
      alertType: this.alertType,
      severity: this.severity,
      title: this.title,
      description: this.description,
      affectedEntityType: this.affectedEntityType,
      affectedEntityId: this.affectedEntityId,
      affectedEntityName: this.affectedEntityName,
      dueDate: this.dueDate?.toISOString().split('T')[0] ?? null,
      status: this.status,
      assignedTo: this.assignedTo,
      assignedToName: this.assignedToName,
      resolution: this.resolution,
      resolvedAt: this.resolvedAt?.toISOString() ?? null,
      resolvedBy: this.resolvedBy,
      acknowledgedAt: this.acknowledgedAt?.toISOString() ?? null,
      acknowledgedBy: this.acknowledgedBy,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      // Computed
      isOverdue: this.isOverdue(),
      isOpen: this.isOpen(),
      isResolved: this.isResolved(),
      isCritical: this.isCritical(),
      daysUntilDue: this.daysUntilDue,
    };
  }
}
