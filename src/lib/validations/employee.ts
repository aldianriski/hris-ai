import { z } from 'zod';

export const employeeBasicInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  nationality: z.string().min(1, 'Nationality is required'),
  nationalId: z.string().optional(),
  taxId: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  postalCode: z.string().optional(),
});

export const employeeEmploymentSchema = z.object({
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  employmentType: z.enum(['permanent', 'contract', 'probation', 'intern', 'part_time']),
  employmentStatus: z.enum(['active', 'inactive', 'terminated', 'resigned']),
  joinDate: z.string().min(1, 'Join date is required'),
  manager: z.string().optional(),
  workLocation: z.string().min(1, 'Work location is required'),
  workSchedule: z.string().min(1, 'Work schedule is required'),
});

export const employeeSalarySchema = z.object({
  salary: z.number().min(0, 'Salary must be positive'),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountName: z.string().optional(),
});

export const employeeBPJSSchema = z.object({
  bpjsKetenagakerjaanNumber: z.string().optional(),
  bpjsKesehatanNumber: z.string().optional(),
  bpjsKetenagakerjaanStatus: z.enum(['active', 'inactive']).optional(),
  bpjsKesehatanStatus: z.enum(['active', 'inactive']).optional(),
});

export const employeeFormSchema = z.object({
  ...employeeBasicInfoSchema.shape,
  ...employeeEmploymentSchema.shape,
  ...employeeSalarySchema.shape,
  ...employeeBPJSSchema.shape,
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;
export type EmployeeBasicInfoData = z.infer<typeof employeeBasicInfoSchema>;
export type EmployeeEmploymentData = z.infer<typeof employeeEmploymentSchema>;
export type EmployeeSalaryData = z.infer<typeof employeeSalarySchema>;
export type EmployeeBPJSData = z.infer<typeof employeeBPJSSchema>;
