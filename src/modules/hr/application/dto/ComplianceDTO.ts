import { z } from 'zod';

/**
 * Compliance Alert DTOs
 */
export const CreateComplianceAlertSchema = z.object({
  employerId: z.string().uuid(),
  alertType: z.enum([
    'contract_expiry',
    'document_expiry',
    'probation_ending',
    'bpjs_registration',
    'tax_reporting',
    'minimum_wage',
    'overtime_violation',
    'leave_quota',
    'other',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  affectedEntityType: z.enum(['employee', 'department', 'document', 'payroll', 'other']),
  affectedEntityId: z.string().nullable().optional(),
  affectedEntityName: z.string().nullable().optional(),
  dueDate: z.string().datetime().or(z.date()).nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
});

export type CreateComplianceAlertInput = z.infer<typeof CreateComplianceAlertSchema>;

export const ResolveAlertSchema = z.object({
  resolution: z.string().min(1),
});

export type ResolveAlertInput = z.infer<typeof ResolveAlertSchema>;

export const DismissAlertSchema = z.object({
  reason: z.string().min(1),
});

export type DismissAlertInput = z.infer<typeof DismissAlertSchema>;

export const FilterComplianceAlertsSchema = z.object({
  employerId: z.string().uuid(),
  alertType: z
    .enum([
      'contract_expiry',
      'document_expiry',
      'probation_ending',
      'bpjs_registration',
      'tax_reporting',
      'minimum_wage',
      'overtime_violation',
      'leave_quota',
      'other',
    ])
    .optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['open', 'acknowledged', 'in_progress', 'resolved', 'dismissed']).optional(),
  assignedTo: z.string().uuid().optional(),
  isOverdue: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type FilterComplianceAlertsInput = z.infer<typeof FilterComplianceAlertsSchema>;

/**
 * Audit Log DTOs
 */
export const CreateAuditLogSchema = z.object({
  employerId: z.string().uuid(),
  userId: z.string().uuid(),
  userName: z.string(),
  userRole: z.string(),
  action: z.enum([
    'create',
    'update',
    'delete',
    'view',
    'export',
    'approve',
    'reject',
    'login',
    'logout',
    'other',
  ]),
  entityType: z.enum([
    'employee',
    'payroll',
    'leave',
    'attendance',
    'performance',
    'document',
    'department',
    'position',
    'user',
    'other',
  ]),
  entityId: z.string().nullable().optional(),
  entityName: z.string().nullable().optional(),
  description: z.string().min(1),
  changes: z.record(z.object({ before: z.unknown(), after: z.unknown() })).nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
});

export type CreateAuditLogInput = z.infer<typeof CreateAuditLogSchema>;

export const FilterAuditLogsSchema = z.object({
  employerId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  action: z
    .enum([
      'create',
      'update',
      'delete',
      'view',
      'export',
      'approve',
      'reject',
      'login',
      'logout',
      'other',
    ])
    .optional(),
  entityType: z
    .enum([
      'employee',
      'payroll',
      'leave',
      'attendance',
      'performance',
      'document',
      'department',
      'position',
      'user',
      'other',
    ])
    .optional(),
  entityId: z.string().optional(),
  startDate: z.string().datetime().or(z.date()).optional(),
  endDate: z.string().datetime().or(z.date()).optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export type FilterAuditLogsInput = z.infer<typeof FilterAuditLogsSchema>;

/**
 * Report Template DTOs
 */
export const CreateReportTemplateSchema = z.object({
  employerId: z.string().uuid(),
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  nameIndonesian: z.string().min(1).max(200),
  category: z.enum([
    'payroll',
    'attendance',
    'leave',
    'performance',
    'compliance',
    'headcount',
    'recruitment',
    'other',
  ]),
  description: z.string().nullable().optional(),
  reportType: z.enum(['list', 'summary', 'chart', 'dashboard']),
  dataSource: z.string().min(1),
  filters: z.array(
    z.object({
      field: z.string(),
      label: z.string(),
      type: z.enum(['text', 'date', 'select', 'number', 'boolean']),
      required: z.boolean(),
      options: z.array(z.string()).optional(),
    })
  ),
  columns: z.array(
    z.object({
      field: z.string(),
      label: z.string(),
      dataType: z.enum(['text', 'number', 'date', 'currency', 'boolean']),
      format: z.string().optional(),
      aggregate: z.enum(['sum', 'avg', 'count', 'min', 'max']).optional(),
    })
  ),
  sortBy: z.string().nullable().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  groupBy: z.array(z.string()).nullable().optional(),
  format: z.enum(['pdf', 'excel', 'csv', 'json']).default('pdf'),
  schedule: z
    .object({
      enabled: z.boolean(),
      frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).nullable(),
      dayOfWeek: z.number().int().min(0).max(6).optional(),
      dayOfMonth: z.number().int().min(1).max(31).optional(),
      recipients: z.array(z.string().email()).optional(),
    })
    .nullable()
    .optional(),
  createdBy: z.string().uuid(),
  createdByName: z.string(),
});

export type CreateReportTemplateInput = z.infer<typeof CreateReportTemplateSchema>;

export const GenerateReportSchema = z.object({
  templateId: z.string().uuid(),
  filterValues: z.record(z.unknown()).optional(),
  format: z.enum(['pdf', 'excel', 'csv', 'json']).optional(),
});

export type GenerateReportInput = z.infer<typeof GenerateReportSchema>;
