import { apiClient } from '../client';

export interface ComplianceAlert {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  status: 'active' | 'resolved' | 'dismissed';
  dueDate?: string;
  employerId: string;
  affectedEmployees?: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  employerId: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface ComplianceAlertFilters {
  status?: string;
  severity?: string;
}

export interface AuditLogFilters {
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
}

export const complianceService = {
  /**
   * Get compliance alerts
   */
  getAlerts: async (employerId: string, filters?: ComplianceAlertFilters) => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.severity) params.severity = filters.severity;

    return apiClient.get<{ alerts: ComplianceAlert[]; total: number }>(
      '/compliance/alerts',
      params
    );
  },

  /**
   * Resolve compliance alert
   */
  resolveAlert: async (alertId: string, resolution?: string) => {
    return apiClient.post<{ success: boolean }>(
      `/compliance/alerts/${alertId}/resolve`,
      resolution ? { resolution } : {}
    );
  },

  /**
   * Get audit logs
   */
  getAuditLogs: async (employerId: string, filters?: AuditLogFilters) => {
    const params: Record<string, string> = {};
    if (filters?.action) params.action = filters.action;
    if (filters?.entityType) params.entityType = filters.entityType;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;

    return apiClient.get<{ logs: AuditLog[]; total: number }>(
      '/compliance/audit-logs',
      params
    );
  },
};
