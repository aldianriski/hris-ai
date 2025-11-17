import type { LeaveType, RequestStatus } from '@/config/constants';

/**
 * Leave Request Domain Entity
 */
export class LeaveRequest {
  constructor(
    public readonly id: string,
    public readonly employeeId: string,
    public readonly employerId: string,
    public readonly leaveType: LeaveType,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly totalDays: number,
    public readonly reason: string,
    public readonly status: RequestStatus,
    public readonly approverId: string | null,
    public readonly approvalNotes: string | null,
    public readonly approvedAt: Date | null,
    public readonly autoApproved: boolean,
    public readonly aiConfidence: number | null,
    public readonly aiReasoning: string | null,
    public readonly attachmentUrls: string[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.endDate < this.startDate) {
      throw new Error('End date must be after or equal to start date');
    }

    if (this.totalDays <= 0) {
      throw new Error('Total days must be positive');
    }

    if (!this.reason || this.reason.trim().length === 0) {
      throw new Error('Leave reason is required');
    }

    if (this.aiConfidence !== null && (this.aiConfidence < 0 || this.aiConfidence > 1)) {
      throw new Error('AI confidence must be between 0 and 1');
    }
  }

  /**
   * Calculate duration in business days
   */
  getDurationDays(): number {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round(
      Math.abs((this.endDate.getTime() - this.startDate.getTime()) / oneDay)
    );
    return diffDays + 1; // Include both start and end dates
  }

  /**
   * Check if leave is pending
   */
  isPending(): boolean {
    return this.status === 'pending';
  }

  /**
   * Check if leave is approved
   */
  isApproved(): boolean {
    return this.status === 'approved';
  }

  /**
   * Check if leave is rejected
   */
  isRejected(): boolean {
    return this.status === 'rejected';
  }

  /**
   * Check if leave is in the future
   */
  isFuture(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.startDate > today;
  }

  /**
   * Check if leave is ongoing
   */
  isOngoing(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.startDate <= today && this.endDate >= today;
  }

  /**
   * Check if leave conflicts with another leave
   */
  conflictsWith(other: LeaveRequest): boolean {
    return (
      this.employeeId === other.employeeId &&
      this.id !== other.id &&
      other.status === 'approved' &&
      this.startDate <= other.endDate &&
      this.endDate >= other.startDate
    );
  }

  /**
   * Approve leave request
   */
  approve(approverId: string, notes?: string, autoApproved = false, aiConfidence?: number, aiReasoning?: string): LeaveRequest {
    if (!this.isPending()) {
      throw new Error('Can only approve pending leave requests');
    }

    return new LeaveRequest(
      this.id,
      this.employeeId,
      this.employerId,
      this.leaveType,
      this.startDate,
      this.endDate,
      this.totalDays,
      this.reason,
      'approved',
      approverId,
      notes ?? null,
      new Date(),
      autoApproved,
      aiConfidence ?? this.aiConfidence,
      aiReasoning ?? this.aiReasoning,
      this.attachmentUrls,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Reject leave request
   */
  reject(approverId: string, notes: string): LeaveRequest {
    if (!this.isPending()) {
      throw new Error('Can only reject pending leave requests');
    }

    if (!notes || notes.trim().length === 0) {
      throw new Error('Rejection reason is required');
    }

    return new LeaveRequest(
      this.id,
      this.employeeId,
      this.employerId,
      this.leaveType,
      this.startDate,
      this.endDate,
      this.totalDays,
      this.reason,
      'rejected',
      approverId,
      notes,
      new Date(),
      false,
      null,
      null,
      this.attachmentUrls,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Cancel leave request
   */
  cancel(): LeaveRequest {
    if (this.status === 'cancelled') {
      throw new Error('Leave request is already cancelled');
    }

    if (!this.isFuture()) {
      throw new Error('Cannot cancel leave that has already started');
    }

    return new LeaveRequest(
      this.id,
      this.employeeId,
      this.employerId,
      this.leaveType,
      this.startDate,
      this.endDate,
      this.totalDays,
      this.reason,
      'cancelled',
      this.approverId,
      this.approvalNotes,
      this.approvedAt,
      this.autoApproved,
      this.aiConfidence,
      this.aiReasoning,
      this.attachmentUrls,
      this.createdAt,
      new Date()
    );
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      employeeId: this.employeeId,
      employerId: this.employerId,
      leaveType: this.leaveType,
      startDate: this.startDate.toISOString().split('T')[0],
      endDate: this.endDate.toISOString().split('T')[0],
      totalDays: this.totalDays,
      reason: this.reason,
      status: this.status,
      approverId: this.approverId,
      approvalNotes: this.approvalNotes,
      approvedAt: this.approvedAt?.toISOString() ?? null,
      autoApproved: this.autoApproved,
      aiConfidence: this.aiConfidence,
      aiReasoning: this.aiReasoning,
      attachmentUrls: this.attachmentUrls,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      // Computed
      isPending: this.isPending(),
      isApproved: this.isApproved(),
      isFuture: this.isFuture(),
      isOngoing: this.isOngoing(),
    };
  }
}
