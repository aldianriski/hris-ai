import type { ILeaveRepository } from '../../domain/repositories/ILeaveRepository';
import type { CreateLeaveRequestDTO } from '../dto/LeaveDTO';
import { LeaveRequest } from '../../domain/entities/LeaveRequest';

export class CreateLeaveRequestUseCase {
  constructor(private readonly leaveRepository: ILeaveRepository) {}

  async execute(
    employerId: string,
    dto: CreateLeaveRequestDTO
  ): Promise<LeaveRequest> {
    // Check for conflicting leave requests
    const conflicts = await this.leaveRepository.findConflictingRequests(
      dto.employeeId,
      dto.startDate,
      dto.endDate
    );

    if (conflicts.length > 0) {
      throw new Error(
        `Leave request conflicts with existing leave from ${conflicts[0]?.startDate.toISOString().split('T')[0]} to ${conflicts[0]?.endDate.toISOString().split('T')[0]}`
      );
    }

    // Check leave balance for annual leave
    if (dto.leaveType === 'annual') {
      const currentYear = dto.startDate.getFullYear();
      const balance = await this.leaveRepository.findBalanceByEmployeeAndYear(
        dto.employeeId,
        currentYear
      );

      if (!balance) {
        throw new Error(`No leave balance found for year ${currentYear}`);
      }

      if (!balance.hasSufficientAnnualLeave(dto.totalDays)) {
        throw new Error(
          `Insufficient leave balance. Requested: ${dto.totalDays} days, Available: ${balance.annualRemaining} days`
        );
      }
    }

    // Create leave request
    const request = new LeaveRequest(
      crypto.randomUUID(),
      dto.employeeId,
      employerId,
      dto.leaveType,
      dto.startDate,
      dto.endDate,
      dto.totalDays,
      dto.reason,
      'pending',
      null, // Approver (will be set on approval)
      null, // Approval notes
      null, // Approved at
      false, // Auto approved (will be determined by AI)
      null, // AI confidence
      null, // AI reasoning
      dto.attachmentUrls ?? [],
      new Date(),
      new Date()
    );

    return await this.leaveRepository.createRequest(request);
  }
}
