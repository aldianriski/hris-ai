import { z } from 'zod';

/**
 * Department DTOs
 */
export const CreateDepartmentSchema = z.object({
  employerId: z.string().uuid(),
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  nameIndonesian: z.string().min(1).max(200),
  type: z.enum(['department', 'division', 'team', 'unit']),
  parentId: z.string().uuid().nullable().optional(),
  managerId: z.string().uuid().nullable().optional(),
  managerName: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  costCenter: z.string().nullable().optional(),
  budget: z.number().min(0).nullable().optional(),
  location: z.string().nullable().optional(),
  level: z.number().int().min(0).default(0),
  displayOrder: z.number().int().min(0).default(0),
});

export type CreateDepartmentInput = z.infer<typeof CreateDepartmentSchema>;

export const UpdateDepartmentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  nameIndonesian: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  costCenter: z.string().nullable().optional(),
  budget: z.number().min(0).nullable().optional(),
  location: z.string().nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export type UpdateDepartmentInput = z.infer<typeof UpdateDepartmentSchema>;

/**
 * Position DTOs
 */
export const CreatePositionSchema = z.object({
  employerId: z.string().uuid(),
  code: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  titleIndonesian: z.string().min(1).max(200),
  departmentId: z.string().uuid().nullable().optional(),
  level: z.enum([
    'executive',
    'senior_management',
    'middle_management',
    'supervisor',
    'staff',
    'entry',
  ]),
  jobFamily: z.string().nullable().optional(),
  reportsTo: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  responsibilities: z.array(z.string()).nullable().optional(),
  requirements: z.array(z.string()).nullable().optional(),
  minSalary: z.number().min(0).nullable().optional(),
  maxSalary: z.number().min(0).nullable().optional(),
  headcount: z.number().int().min(0).default(1),
  currentCount: z.number().int().min(0).default(0),
  displayOrder: z.number().int().min(0).default(0),
});

export type CreatePositionInput = z.infer<typeof CreatePositionSchema>;

export const UpdatePositionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  titleIndonesian: z.string().min(1).max(200).optional(),
  departmentId: z.string().uuid().nullable().optional(),
  level: z
    .enum([
      'executive',
      'senior_management',
      'middle_management',
      'supervisor',
      'staff',
      'entry',
    ])
    .optional(),
  jobFamily: z.string().nullable().optional(),
  reportsTo: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  responsibilities: z.array(z.string()).nullable().optional(),
  requirements: z.array(z.string()).nullable().optional(),
  minSalary: z.number().min(0).nullable().optional(),
  maxSalary: z.number().min(0).nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export type UpdatePositionInput = z.infer<typeof UpdatePositionSchema>;

export const UpdateHeadcountSchema = z.object({
  headcount: z.number().int().min(0),
});

export type UpdateHeadcountInput = z.infer<typeof UpdateHeadcountSchema>;
