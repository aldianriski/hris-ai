import { z } from 'zod';
import { LEAVE_TYPE, REQUEST_STATUS } from '@/config/constants';

/**
 * Create Leave Request DTO Schema
 */
export const CreateLeaveRequestSchema = z.object({
  employeeId: z.string().uuid(),
  leaveType: z.enum([
    LEAVE_TYPE.ANNUAL,
    LEAVE_TYPE.SICK,
    LEAVE_TYPE.UNPAID,
    LEAVE_TYPE.MATERNITY,
    LEAVE_TYPE.PATERNITY,
    LEAVE_TYPE.CUSTOM,
  ]),
  startDate: z.string().or(z.date()).pipe(z.coerce.date()),
  endDate: z.string().or(z.date()).pipe(z.coerce.date()),
  totalDays: z.number().min(0.5).max(365),
  reason: z.string().min(10, 'Please provide a reason (minimum 10 characters)'),
  attachmentUrls: z.array(z.string().url()).optional().default([]),
}).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  }
);

export type CreateLeaveRequestDTO = z.infer<typeof CreateLeaveRequestSchema>;

/**
 * Leave Request Filter DTO Schema
 */
export const LeaveRequestFilterSchema = z.object({
  employeeId: z.string().uuid().optional(),
  status: z.enum([
    REQUEST_STATUS.PENDING,
    REQUEST_STATUS.APPROVED,
    REQUEST_STATUS.REJECTED,
    REQUEST_STATUS.CANCELLED,
  ]).optional(),
  leaveType: z.string().optional(),
  startDate: z.string().or(z.date()).pipe(z.coerce.date()).optional(),
  endDate: z.string().or(z.date()).pipe(z.coerce.date()).optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export type LeaveRequestFilterDTO = z.infer<typeof LeaveRequestFilterSchema>;

/**
 * Approve/Reject Leave Request DTO Schema
 */
export const ApproveLeaveRequestSchema = z.object({
  requestId: z.string().uuid(),
  approverId: z.string().uuid(),
  notes: z.string().optional(),
});

export type ApproveLeaveRequestDTO = z.infer<typeof ApproveLeaveRequestSchema>;

export const RejectLeaveRequestSchema = z.object({
  requestId: z.string().uuid(),
  approverId: z.string().uuid(),
  notes: z.string().min(10, 'Please provide a reason for rejection (minimum 10 characters)'),
});

export type RejectLeaveRequestDTO = z.infer<typeof RejectLeaveRequestSchema>;

/**
 * Leave Request Response DTO
 */
export interface LeaveRequestResponseDTO {
  id: string;
  employeeId: string;
  employerId: string;
  employee?: {
    id: string;
    fullName: string;
    employeeNumber: string;
    position: string;
    department: string;
    photoUrl: string | null;
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  approverId: string | null;
  approver?: {
    id: string;
    fullName: string;
    position: string;
  } | null;
  approvalNotes: string | null;
  approvedAt: string | null;
  autoApproved: boolean;
  aiConfidence: number | null;
  aiReasoning: string | null;
  attachmentUrls: string[];
  createdAt: string;
  updatedAt: string;
  // Computed
  isPending: boolean;
  isApproved: boolean;
  isFuture: boolean;
  isOngoing: boolean;
}

/**
 * Leave Balance Response DTO
 */
export interface LeaveBalanceResponseDTO {
  employeeId: string;
  employerId: string;
  year: number;
  annualQuota: number;
  annualUsed: number;
  annualCarryForward: number;
  carryForwardExpiresAt: string | null;
  sickUsed: number;
  unpaidUsed: number;
  customQuotas: Record<string, { quota: number; used: number }>;
  // Computed
  totalAnnualAvailable: number;
  annualRemaining: number;
  isCarryForwardExpired: boolean;
}

/**
 * Team Leave Calendar DTO
 */
export interface TeamLeaveCalendarDTO {
  date: string;
  employees: Array<{
    id: string;
    fullName: string;
    position: string;
    leaveType: string;
    totalDays: number;
  }>;
}
