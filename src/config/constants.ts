/**
 * Application constants
 */

export const APP_NAME = 'Talixa HRIS';
export const APP_DESCRIPTION = 'AI-First Employee Management Platform';

/**
 * Employee statuses
 */
export const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  PROBATION: 'probation',
  RESIGNED: 'resigned',
  TERMINATED: 'terminated',
} as const;

export type EmployeeStatus =
  (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS];

/**
 * Employment types (Indonesian labor law)
 */
export const EMPLOYMENT_TYPE = {
  PKWT: 'PKWT', // Fixed-term contract
  PKWTT: 'PKWTT', // Permanent contract
} as const;

export type EmploymentType =
  (typeof EMPLOYMENT_TYPE)[keyof typeof EMPLOYMENT_TYPE];

/**
 * Leave types
 */
export const LEAVE_TYPE = {
  ANNUAL: 'annual',
  SICK: 'sick',
  UNPAID: 'unpaid',
  MATERNITY: 'maternity',
  PATERNITY: 'paternity',
  CUSTOM: 'custom',
} as const;

export type LeaveType = (typeof LEAVE_TYPE)[keyof typeof LEAVE_TYPE];

/**
 * Request statuses
 */
export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const;

export type RequestStatus =
  (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];

/**
 * Payroll statuses
 */
export const PAYROLL_STATUS = {
  DRAFT: 'draft',
  PROCESSING: 'processing',
  APPROVED: 'approved',
  PAID: 'paid',
  CANCELLED: 'cancelled',
} as const;

export type PayrollStatus =
  (typeof PAYROLL_STATUS)[keyof typeof PAYROLL_STATUS];

/**
 * Indonesian PTKP statuses (Non-Taxable Income)
 */
export const PTKP_STATUS = {
  TK_0: 'TK/0', // Single, no dependents
  TK_1: 'TK/1', // Single, 1 dependent
  TK_2: 'TK/2', // Single, 2 dependents
  TK_3: 'TK/3', // Single, 3 dependents
  K_0: 'K/0', // Married, no dependents
  K_1: 'K/1', // Married, 1 dependent
  K_2: 'K/2', // Married, 2 dependents
  K_3: 'K/3', // Married, 3 dependents
} as const;

export type PTKPStatus = (typeof PTKP_STATUS)[keyof typeof PTKP_STATUS];

/**
 * PTKP values for 2025 (in IDR)
 */
export const PTKP_VALUES: Record<PTKPStatus, number> & {
  SELF: number;
  MARRIED: number;
  DEPENDENT: number;
} = {
  [PTKP_STATUS.TK_0]: 54_000_000,
  [PTKP_STATUS.TK_1]: 58_500_000,
  [PTKP_STATUS.TK_2]: 63_000_000,
  [PTKP_STATUS.TK_3]: 67_500_000,
  [PTKP_STATUS.K_0]: 58_500_000,
  [PTKP_STATUS.K_1]: 63_000_000,
  [PTKP_STATUS.K_2]: 67_500_000,
  [PTKP_STATUS.K_3]: 72_000_000,
  SELF: 54_000_000, // Base PTKP for self
  MARRIED: 4_500_000, // Additional PTKP for married status
  DEPENDENT: 4_500_000, // Additional PTKP per dependent (max 3)
};

/**
 * BPJS rates for 2025
 */
export const BPJS_RATES = {
  KESEHATAN: {
    EMPLOYEE_RATE: 0.01, // 1% employee contribution
    EMPLOYER_RATE: 0.04, // 4% employer contribution
    MAX_SALARY: 12_000_000, // Maximum salary base for BPJS Kesehatan
  },
  KETENAGAKERJAAN: {
    JKM_EMPLOYER_RATE: 0.003, // 0.3% Death insurance (employer only)
    JHT_EMPLOYEE_RATE: 0.02, // 2% Old age insurance (employee)
    JHT_EMPLOYER_RATE: 0.037, // 3.7% Old age insurance (employer)
    JP_EMPLOYEE_RATE: 0.01, // 1% Pension (employee)
    JP_EMPLOYER_RATE: 0.02, // 2% Pension (employer)
    MAX_SALARY: 13_710_732, // Maximum salary base for BPJS Ketenagakerjaan
  },
} as const;

/**
 * PPh21 tax brackets for 2025
 */
export const TAX_BRACKETS = [
  { limit: 60_000_000, max: 60_000_000, rate: 0.05 },
  { limit: 250_000_000, max: 250_000_000, rate: 0.15 },
  { limit: 500_000_000, max: 500_000_000, rate: 0.25 },
  { limit: Infinity, max: Infinity, rate: 0.3 },
] as const;

/**
 * Indonesian labor law constants
 */
export const LABOR_LAW = {
  MIN_ANNUAL_LEAVE_DAYS: 12, // Minimum 12 days/year after 1 year
  MAX_WORK_HOURS_PER_DAY: 8, // 8 hours/day for 5-day week
  MAX_WORK_HOURS_PER_WEEK: 40, // 40 hours/week
  MAX_OVERTIME_PER_DAY: 4, // Maximum 4 hours overtime/day
  MAX_OVERTIME_PER_WEEK: 18, // Maximum 18 hours overtime/week
  OVERTIME_MULTIPLIER_WEEKDAY_FIRST_HOUR: 1.5,
  OVERTIME_MULTIPLIER_WEEKDAY_SUBSEQUENT: 2.0,
  OVERTIME_MULTIPLIER_WEEKEND: 2.0,
} as const;

/**
 * AI configuration
 */
export const AI_CONFIG = {
  AUTO_APPROVE_CONFIDENCE_THRESHOLD: 0.85,
  ANOMALY_CONFIDENCE_THRESHOLD: 0.8,
  DOCUMENT_EXTRACTION_CONFIDENCE_THRESHOLD: 0.9,
  PAYROLL_ERROR_DETECTION_THRESHOLD: 0.9,
} as const;

/**
 * Document types
 */
export const DOCUMENT_TYPE = {
  KTP: 'ktp',
  NPWP: 'npwp',
  BPJS_KESEHATAN: 'bpjs_kesehatan',
  BPJS_KETENAGAKERJAAN: 'bpjs_ketenagakerjaan',
  CONTRACT: 'contract',
  CERTIFICATE: 'certificate',
  CV: 'cv',
  PHOTO: 'photo',
  CUSTOM: 'custom',
} as const;

export type DocumentType = (typeof DOCUMENT_TYPE)[keyof typeof DOCUMENT_TYPE];

/**
 * User roles
 */
export const USER_ROLE = {
  ADMIN: 'admin',
  HR_MANAGER: 'hr_manager',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

/**
 * Subscription tiers
 */
export const SUBSCRIPTION_TIER = {
  STARTER: 'starter',
  GROWTH: 'growth',
  ENTERPRISE: 'enterprise',
} as const;

export type SubscriptionTier =
  (typeof SUBSCRIPTION_TIER)[keyof typeof SUBSCRIPTION_TIER];

/**
 * Pricing per employee per month (in IDR)
 */
export const PRICING: Record<SubscriptionTier, number> = {
  [SUBSCRIPTION_TIER.STARTER]: 50_000,
  [SUBSCRIPTION_TIER.GROWTH]: 40_000,
  [SUBSCRIPTION_TIER.ENTERPRISE]: 30_000,
};
