import { z } from 'zod';
import { EMPLOYMENT_TYPE, EMPLOYEE_STATUS, PTKP_STATUS } from '@/config/constants';

/**
 * Salary Component Schema
 */
const SalaryComponentSchema = z.object({
  name: z.string().min(1, 'Component name is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  isTaxable: z.boolean().optional().default(true),
});

const DeductionComponentSchema = z.object({
  name: z.string().min(1, 'Component name is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
});

/**
 * Create Employee DTO Schema
 */
export const CreateEmployeeSchema = z.object({
  // Required fields
  fullName: z.string().min(1, 'Full name is required').max(255),
  email: z.string().email('Invalid email format'),
  position: z.string().min(1, 'Position is required'),
  department: z.string().min(1, 'Department is required'),
  joinDate: z.string().or(z.date()).pipe(z.coerce.date()),
  employmentType: z.enum([EMPLOYMENT_TYPE.PKWT, EMPLOYMENT_TYPE.PKWTT]),
  salaryBase: z.number().min(0, 'Salary must be non-negative'),

  // Optional personal info
  phone: z.string().nullable().optional(),
  dateOfBirth: z.string().or(z.date()).pipe(z.coerce.date()).nullable().optional(),
  gender: z.enum(['male', 'female', 'other']).nullable().optional(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  idCardNumber: z.string().nullable().optional(),

  // Employment details
  contractStartDate: z.string().or(z.date()).pipe(z.coerce.date()).nullable().optional(),
  contractEndDate: z.string().or(z.date()).pipe(z.coerce.date()).nullable().optional(),
  division: z.string().nullable().optional(),
  managerId: z.string().uuid().nullable().optional(),

  // Salary components
  salaryComponents: z
    .object({
      allowances: z.array(SalaryComponentSchema).optional().default([]),
      deductions: z.array(DeductionComponentSchema).optional().default([]),
    })
    .optional()
    .default({ allowances: [], deductions: [] }),

  // Government registration
  bpjsKesehatanNumber: z.string().nullable().optional(),
  bpjsKetenagakerjaanNumber: z.string().nullable().optional(),
  npwp: z.string().length(15, 'NPWP must be 15 digits').nullable().optional(),
  ptkpStatus: z.enum([
    PTKP_STATUS.TK_0,
    PTKP_STATUS.TK_1,
    PTKP_STATUS.TK_2,
    PTKP_STATUS.TK_3,
    PTKP_STATUS.K_0,
    PTKP_STATUS.K_1,
    PTKP_STATUS.K_2,
    PTKP_STATUS.K_3,
  ]).optional().default(PTKP_STATUS.TK_0),

  // Banking
  bankName: z.string().nullable().optional(),
  bankAccountNumber: z.string().nullable().optional(),
  bankAccountHolder: z.string().nullable().optional(),

  // Status
  status: z.enum([
    EMPLOYEE_STATUS.ACTIVE,
    EMPLOYEE_STATUS.PROBATION,
    EMPLOYEE_STATUS.RESIGNED,
    EMPLOYEE_STATUS.TERMINATED,
  ]).optional().default(EMPLOYEE_STATUS.PROBATION),

  // Metadata
  photoUrl: z.string().url().nullable().optional(),
  notes: z.string().nullable().optional(),
  userId: z.string().uuid().nullable().optional(),
}).refine(
  (data) => {
    // If PKWT, contract dates are required
    if (data.employmentType === EMPLOYMENT_TYPE.PKWT) {
      return !!data.contractStartDate && !!data.contractEndDate;
    }
    return true;
  },
  {
    message: 'Contract dates are required for PKWT employment type',
    path: ['contractEndDate'],
  }
).refine(
  (data) => {
    // Contract end date must be after start date
    if (data.contractStartDate && data.contractEndDate) {
      return data.contractEndDate >= data.contractStartDate;
    }
    return true;
  },
  {
    message: 'Contract end date must be after start date',
    path: ['contractEndDate'],
  }
);

export type CreateEmployeeDTO = z.infer<typeof CreateEmployeeSchema>;

/**
 * Update Employee DTO Schema
 */
export const UpdateEmployeeSchema = CreateEmployeeSchema.partial().extend({
  id: z.string().uuid(),
  exitDate: z.string().or(z.date()).pipe(z.coerce.date()).nullable().optional(),
  exitReason: z.string().nullable().optional(),
});

export type UpdateEmployeeDTO = z.infer<typeof UpdateEmployeeSchema>;

/**
 * Employee Filter DTO Schema
 */
export const EmployeeFilterSchema = z.object({
  status: z.enum([
    EMPLOYEE_STATUS.ACTIVE,
    EMPLOYEE_STATUS.PROBATION,
    EMPLOYEE_STATUS.RESIGNED,
    EMPLOYEE_STATUS.TERMINATED,
  ]).optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  managerId: z.string().uuid().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
  sortBy: z.enum(['fullName', 'joinDate', 'position', 'department', 'status']).optional().default('fullName'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type EmployeeFilterDTO = z.infer<typeof EmployeeFilterSchema>;

/**
 * Employee Response DTO (for API responses)
 */
export interface EmployeeResponseDTO {
  id: string;
  employerId: string;
  employeeNumber: string;
  fullName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  idCardNumber: string | null;
  joinDate: string;
  employmentType: string;
  contractStartDate: string | null;
  contractEndDate: string | null;
  position: string;
  department: string;
  division: string | null;
  managerId: string | null;
  manager?: {
    id: string;
    fullName: string;
    position: string;
  } | null;
  salaryBase: number;
  salaryComponents: {
    allowances: Array<{ name: string; amount: number; isTaxable: boolean }>;
    deductions: Array<{ name: string; amount: number }>;
  };
  bpjsKesehatanNumber: string | null;
  bpjsKetenagakerjaanNumber: string | null;
  npwp: string | null;
  ptkpStatus: string;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
  status: string;
  exitDate: string | null;
  exitReason: string | null;
  photoUrl: string | null;
  notes: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  // Computed fields
  totalGrossSalary: number;
  taxableIncome: number;
  isActive: boolean;
  yearsOfService: number;
}

/**
 * Bulk Create Employee DTO
 */
export const BulkCreateEmployeeSchema = z.object({
  employees: z.array(CreateEmployeeSchema).min(1, 'At least one employee is required'),
});

export type BulkCreateEmployeeDTO = z.infer<typeof BulkCreateEmployeeSchema>;
