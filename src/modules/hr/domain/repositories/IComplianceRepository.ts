import type { ComplianceAlert } from '../entities/ComplianceAlert';
import type { AuditLog } from '../entities/AuditLog';
import type { ReportTemplate } from '../entities/ReportTemplate';

export interface IComplianceRepository {
  // Compliance Alerts
  findAlertById(id: string): Promise<ComplianceAlert | null>;

  findAlertsByEmployerId(
    employerId: string,
    options?: {
      alertType?: string;
      severity?: string;
      status?: string;
      assignedTo?: string;
      isOverdue?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    alerts: ComplianceAlert[];
    total: number;
  }>;

  findCriticalAlerts(employerId: string): Promise<ComplianceAlert[]>;

  findOverdueAlerts(employerId: string): Promise<ComplianceAlert[]>;

  createAlert(
    alert: Omit<ComplianceAlert, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ComplianceAlert>;

  updateAlert(id: string, updates: Partial<ComplianceAlert>): Promise<ComplianceAlert>;

  deleteAlert(id: string): Promise<void>;

  // Audit Logs
  findAuditLogById(id: string): Promise<AuditLog | null>;

  findAuditLogsByEmployerId(
    employerId: string,
    options?: {
      userId?: string;
      action?: string;
      entityType?: string;
      entityId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    logs: AuditLog[];
    total: number;
  }>;

  findSensitiveAuditLogs(employerId: string, days: number): Promise<AuditLog[]>;

  createAuditLog(log: Omit<AuditLog, 'id'>): Promise<AuditLog>;

  // Report Templates
  findTemplateById(id: string): Promise<ReportTemplate | null>;

  findTemplatesByEmployerId(
    employerId: string,
    options?: {
      category?: string;
      isActive?: boolean;
      isSystem?: boolean;
    }
  ): Promise<ReportTemplate[]>;

  findScheduledTemplates(employerId: string): Promise<ReportTemplate[]>;

  createTemplate(
    template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ReportTemplate>;

  updateTemplate(id: string, updates: Partial<ReportTemplate>): Promise<ReportTemplate>;

  deleteTemplate(id: string): Promise<void>;

  // Statistics
  getComplianceStats(employerId: string): Promise<{
    totalAlerts: number;
    openAlerts: number;
    criticalAlerts: number;
    overdueAlerts: number;
    alertsBySeverity: Record<string, number>;
    alertsByType: Record<string, number>;
  }>;

  getAuditStats(employerId: string, days: number): Promise<{
    totalActions: number;
    uniqueUsers: number;
    actionsByType: Record<string, number>;
    actionsByEntity: Record<string, number>;
    sensitiveActions: number;
  }>;
}
