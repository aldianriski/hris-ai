import { z } from 'zod';

/**
 * Clock In DTO Schema
 */
export const ClockInSchema = z.object({
  employeeId: z.string().uuid(),
  date: z.string().or(z.date()).pipe(z.coerce.date()).optional(),
  locationLat: z.number().min(-90).max(90),
  locationLng: z.number().min(-180).max(180),
  locationAddress: z.string().nullable().optional(),
  photoUrl: z.string().url().nullable().optional(),
  deviceInfo: z.record(z.unknown()).nullable().optional(),
});

export type ClockInDTO = z.infer<typeof ClockInSchema>;

/**
 * Clock Out DTO Schema
 */
export const ClockOutSchema = z.object({
  attendanceId: z.string().uuid(),
  locationLat: z.number().min(-90).max(90),
  locationLng: z.number().min(-180).max(180),
  photoUrl: z.string().url().nullable().optional(),
});

export type ClockOutDTO = z.infer<typeof ClockOutSchema>;

/**
 * Attendance Filter DTO Schema
 */
export const AttendanceFilterSchema = z.object({
  employeeId: z.string().uuid().optional(),
  startDate: z.string().or(z.date()).pipe(z.coerce.date()).optional(),
  endDate: z.string().or(z.date()).pipe(z.coerce.date()).optional(),
  hasAnomaly: z.boolean().optional(),
  needsApproval: z.boolean().optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export type AttendanceFilterDTO = z.infer<typeof AttendanceFilterSchema>;

/**
 * Approve Attendance DTO Schema
 */
export const ApproveAttendanceSchema = z.object({
  attendanceId: z.string().uuid(),
  approvedBy: z.string().uuid(),
  notes: z.string().nullable().optional(),
});

export type ApproveAttendanceDTO = z.infer<typeof ApproveAttendanceSchema>;

/**
 * Attendance Response DTO
 */
export interface AttendanceResponseDTO {
  id: string;
  employeeId: string;
  employerId: string;
  employee?: {
    id: string;
    fullName: string;
    employeeNumber: string;
    position: string;
    photoUrl: string | null;
  };
  date: string;
  clockIn: string;
  clockOut: string | null;
  locationLat: number;
  locationLng: number;
  locationAddress: string | null;
  clockInPhotoUrl: string | null;
  clockOutPhotoUrl: string | null;
  workHoursDecimal: number | null;
  breakHours: number;
  overtimeHours: number;
  shiftName: string | null;
  isAnomaly: boolean;
  anomalyType: string | null;
  anomalyReason: string | null;
  anomalyConfidence: number | null;
  approvedBy: string | null;
  approvedAt: string | null;
  approvalNotes: string | null;
  createdAt: string;
  // Computed
  isLate: boolean;
  lateDurationMinutes: number;
  isClockedIn: boolean;
  needsApproval: boolean;
}

/**
 * Attendance Summary DTO
 */
export interface AttendanceSummaryDTO {
  employeeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  presentDays: number;
  lateDays: number;
  totalWorkHours: number;
  totalOvertimeHours: number;
  averageClockIn: string;
}

/**
 * Attendance Stats DTO
 */
export interface AttendanceStatsDTO {
  date: string;
  totalEmployees: number;
  clockedIn: number;
  absent: number;
  late: number;
  anomalies: number;
  attendanceRate: number; // percentage
}

/**
 * Create Shift DTO Schema
 */
export const CreateShiftSchema = z.object({
  shiftName: z.string().min(1, 'Shift name is required'),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:mm'),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:mm'),
  breakDurationMinutes: z.number().min(0).max(480).optional().default(60),
});

export type CreateShiftDTO = z.infer<typeof CreateShiftSchema>;

/**
 * Update Shift DTO Schema
 */
export const UpdateShiftSchema = CreateShiftSchema.partial().extend({
  id: z.string().uuid(),
  isActive: z.boolean().optional(),
});

export type UpdateShiftDTO = z.infer<typeof UpdateShiftSchema>;
