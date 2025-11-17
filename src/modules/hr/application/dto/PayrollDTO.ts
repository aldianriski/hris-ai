import { z } from 'zod';

/**
 * Payroll Period DTOs
 */
export const CreatePayrollPeriodSchema = z.object({
  employerId: z.string().uuid(),
  periodMonth: z.number().int().min(1).max(12),
  periodYear: z.number().int().min(2000).max(2100),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()),
  paymentDate: z.string().datetime().or(z.date()),
  notes: z.string().optional(),
});

export type CreatePayrollPeriodInput = z.infer<typeof CreatePayrollPeriodSchema>;

export const UpdatePayrollPeriodSchema = z.object({
  paymentDate: z.string().datetime().or(z.date()).optional(),
  notes: z.string().optional(),
});

export type UpdatePayrollPeriodInput = z.infer<typeof UpdatePayrollPeriodSchema>;

export const FilterPayrollPeriodsSchema = z.object({
  employerId: z.string().uuid(),
  year: z.number().int().optional(),
  status: z.enum(['draft', 'processing', 'approved', 'paid', 'cancelled']).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type FilterPayrollPeriodsInput = z.infer<typeof FilterPayrollPeriodsSchema>;

/**
 * Payroll Component DTOs
 */
export const CreatePayrollComponentSchema = z.object({
  employerId: z.string().uuid(),
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  nameIndonesian: z.string().min(1).max(200),
  type: z.enum(['earning', 'deduction', 'benefit']),
  category: z.enum([
    'basic_salary',
    'allowance',
    'overtime',
    'bonus',
    'bpjs',
    'tax',
    'loan',
    'other',
  ]),
  isTaxable: z.boolean().default(false),
  isBpjsBase: z.boolean().default(false),
  calculationType: z.enum(['fixed', 'percentage', 'formula']),
  calculationValue: z.number().nullable().optional(),
  calculationFormula: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  displayOrder: z.number().int().default(0),
});

export type CreatePayrollComponentInput = z.infer<typeof CreatePayrollComponentSchema>;

export const UpdatePayrollComponentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  nameIndonesian: z.string().min(1).max(200).optional(),
  isTaxable: z.boolean().optional(),
  isBpjsBase: z.boolean().optional(),
  calculationType: z.enum(['fixed', 'percentage', 'formula']).optional(),
  calculationValue: z.number().nullable().optional(),
  calculationFormula: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  displayOrder: z.number().int().optional(),
});

export type UpdatePayrollComponentInput = z.infer<typeof UpdatePayrollComponentSchema>;

/**
 * Payroll Summary DTOs
 */
export const ProcessPayrollSchema = z.object({
  periodId: z.string().uuid(),
  employerId: z.string().uuid(),
  employeeIds: z.array(z.string().uuid()).optional(), // If not provided, process all active employees
  validateWithAI: z.boolean().default(true),
});

export type ProcessPayrollInput = z.infer<typeof ProcessPayrollSchema>;

export const UpdatePayrollSummarySchema = z.object({
  notes: z.string().optional(),
  allowances: z.number().optional(),
  bonuses: z.number().optional(),
  loans: z.number().optional(),
  otherDeductions: z.number().optional(),
});

export type UpdatePayrollSummaryInput = z.infer<typeof UpdatePayrollSummarySchema>;

export const FilterPayrollSummariesSchema = z.object({
  periodId: z.string().uuid(),
  hasAnomalies: z.boolean().optional(),
  status: z.enum(['draft', 'calculated', 'approved', 'paid']).optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export type FilterPayrollSummariesInput = z.infer<typeof FilterPayrollSummariesSchema>;

/**
 * Payroll Calculation DTOs
 */
export const CalculateBPJSSchema = z.object({
  baseSalary: z.number().min(0),
  additionalBpjsBase: z.number().min(0).default(0),
  riskLevel: z.enum(['1', '2', '3', '4', '5']).default('1'),
});

export type CalculateBPJSInput = z.infer<typeof CalculateBPJSSchema>;

export const CalculatePPh21Schema = z.object({
  monthlyGrossIncome: z.number().min(0),
  monthlyBpjsEmployee: z.number().min(0),
  isMarried: z.boolean().default(false),
  dependents: z.number().int().min(0).max(3).default(0),
});

export type CalculatePPh21Input = z.infer<typeof CalculatePPh21Schema>;

export const CalculateOvertimeSchema = z.object({
  baseSalary: z.number().min(0),
  overtimeHours: z.number().min(0),
  workingDaysPerMonth: z.number().int().min(1).default(22),
  workingHoursPerDay: z.number().min(1).default(8),
  overtimeType: z.enum(['weekday', 'weekend', 'holiday']).default('weekday'),
});

export type CalculateOvertimeInput = z.infer<typeof CalculateOvertimeSchema>;

/**
 * Payslip DTO
 */
export const GeneratePayslipSchema = z.object({
  summaryId: z.string().uuid(),
  format: z.enum(['pdf', 'html', 'json']).default('pdf'),
  language: z.enum(['en', 'id']).default('id'),
});

export type GeneratePayslipInput = z.infer<typeof GeneratePayslipSchema>;
