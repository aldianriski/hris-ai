import type { SupabaseClient } from '@supabase/supabase-js';
import type { IComplianceRepository } from '../../domain/repositories/IComplianceRepository';
import { ComplianceAlert } from '../../domain/entities/ComplianceAlert';
import { AuditLog } from '../../domain/entities/AuditLog';
import { ReportTemplate } from '../../domain/entities/ReportTemplate';

export class SupabaseComplianceRepository implements IComplianceRepository {
  constructor(private supabase: SupabaseClient) {}

  // ============================================================
  // Compliance Alerts
  // ============================================================

  async findAlertById(id: string): Promise<ComplianceAlert | null> {
    const { data, error } = await this.supabase
      .from('compliance_alerts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find compliance alert: ${error.message}`);
    }

    return this.mapAlertToEntity(data);
  }

  async findAlertsByEmployerId(
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
  ): Promise<{ alerts: ComplianceAlert[]; total: number }> {
    let query = this.supabase
      .from('compliance_alerts')
      .select('*', { count: 'exact' })
      .eq('employer_id', employerId);

    if (options?.alertType) query = query.eq('alert_type', options.alertType);
    if (options?.severity) query = query.eq('severity', options.severity);
    if (options?.status) query = query.eq('status', options.status);
    if (options?.assignedTo) query = query.eq('assigned_to', options.assignedTo);
    if (options?.isOverdue) {
      query = query
        .not('due_date', 'is', null)
        .lt('due_date', new Date().toISOString().split('T')[0])
        .not('status', 'in', '("resolved","dismissed")');
    }

    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to find compliance alerts: ${error.message}`);

    return {
      alerts: (data || []).map((row) => this.mapAlertToEntity(row)),
      total: count ?? 0,
    };
  }

  async findCriticalAlerts(employerId: string): Promise<ComplianceAlert[]> {
    const { data, error } = await this.supabase
      .from('compliance_alerts')
      .select('*')
      .eq('employer_id', employerId)
      .eq('severity', 'critical')
      .not('status', 'in', '("resolved","dismissed")')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to find critical alerts: ${error.message}`);
    return (data || []).map((row) => this.mapAlertToEntity(row));
  }

  async findOverdueAlerts(employerId: string): Promise<ComplianceAlert[]> {
    const { data, error } = await this.supabase
      .from('compliance_alerts')
      .select('*')
      .eq('employer_id', employerId)
      .not('due_date', 'is', null)
      .lt('due_date', new Date().toISOString().split('T')[0])
      .not('status', 'in', '("resolved","dismissed")')
      .order('due_date', { ascending: true });

    if (error) throw new Error(`Failed to find overdue alerts: ${error.message}`);
    return (data || []).map((row) => this.mapAlertToEntity(row));
  }

  async createAlert(alert: Omit<ComplianceAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<ComplianceAlert> {
    const { data, error } = await this.supabase
      .from('compliance_alerts')
      .insert([this.mapAlertToDatabase(alert)])
      .select()
      .single();

    if (error) throw new Error(`Failed to create compliance alert: ${error.message}`);
    return this.mapAlertToEntity(data);
  }

  async updateAlert(id: string, updates: Partial<ComplianceAlert>): Promise<ComplianceAlert> {
    const { data, error } = await this.supabase
      .from('compliance_alerts')
      .update({ ...this.mapAlertToDatabase(updates), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update compliance alert: ${error.message}`);
    return this.mapAlertToEntity(data);
  }

  async deleteAlert(id: string): Promise<void> {
    const { error } = await this.supabase.from('compliance_alerts').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete compliance alert: ${error.message}`);
  }

  // ============================================================
  // Audit Logs
  // ============================================================

  async findAuditLogById(id: string): Promise<AuditLog | null> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find audit log: ${error.message}`);
    }

    return this.mapAuditLogToEntity(data);
  }

  async findAuditLogsByEmployerId(
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
  ): Promise<{ logs: AuditLog[]; total: number }> {
    let query = this.supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('employer_id', employerId);

    if (options?.userId) query = query.eq('user_id', options.userId);
    if (options?.action) query = query.eq('action', options.action);
    if (options?.entityType) query = query.eq('entity_type', options.entityType);
    if (options?.entityId) query = query.eq('entity_id', options.entityId);
    if (options?.startDate) {
      query = query.gte('timestamp', options.startDate.toISOString());
    }
    if (options?.endDate) {
      query = query.lte('timestamp', options.endDate.toISOString());
    }

    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;
    query = query.range(offset, offset + limit - 1).order('timestamp', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to find audit logs: ${error.message}`);

    return {
      logs: (data || []).map((row) => this.mapAuditLogToEntity(row)),
      total: count ?? 0,
    };
  }

  async findSensitiveAuditLogs(employerId: string, days: number): Promise<AuditLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('employer_id', employerId)
      .in('action', ['delete', 'approve', 'export'])
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw new Error(`Failed to find sensitive audit logs: ${error.message}`);
    return (data || []).map((row) => this.mapAuditLogToEntity(row));
  }

  async createAuditLog(log: Omit<AuditLog, 'id'>): Promise<AuditLog> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .insert([this.mapAuditLogToDatabase(log)])
      .select()
      .single();

    if (error) throw new Error(`Failed to create audit log: ${error.message}`);
    return this.mapAuditLogToEntity(data);
  }

  // ============================================================
  // Report Templates
  // ============================================================

  async findTemplateById(id: string): Promise<ReportTemplate | null> {
    const { data, error } = await this.supabase
      .from('report_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find report template: ${error.message}`);
    }

    return this.mapTemplateToEntity(data);
  }

  async findTemplatesByEmployerId(
    employerId: string,
    options?: { category?: string; isActive?: boolean; isSystem?: boolean }
  ): Promise<ReportTemplate[]> {
    let query = this.supabase.from('report_templates').select('*').eq('employer_id', employerId);

    if (options?.category) query = query.eq('category', options.category);
    if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive);
    if (options?.isSystem !== undefined) query = query.eq('is_system', options.isSystem);

    query = query.order('name', { ascending: true });

    const { data, error } = await query;
    if (error) throw new Error(`Failed to find report templates: ${error.message}`);

    return (data || []).map((row) => this.mapTemplateToEntity(row));
  }

  async findScheduledTemplates(employerId: string): Promise<ReportTemplate[]> {
    const { data, error } = await this.supabase
      .from('report_templates')
      .select('*')
      .eq('employer_id', employerId)
      .eq('is_active', true)
      .not('schedule', 'is', null)
      .order('name', { ascending: true });

    if (error) throw new Error(`Failed to find scheduled templates: ${error.message}`);

    // Filter by schedule.enabled in application layer since Supabase doesn't support nested JSON filtering easily
    return (data || [])
      .map((row) => this.mapTemplateToEntity(row))
      .filter((template) => template.schedule?.enabled === true);
  }

  async createTemplate(
    template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ReportTemplate> {
    const { data, error } = await this.supabase
      .from('report_templates')
      .insert([this.mapTemplateToDatabase(template)])
      .select()
      .single();

    if (error) throw new Error(`Failed to create report template: ${error.message}`);
    return this.mapTemplateToEntity(data);
  }

  async updateTemplate(id: string, updates: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const { data, error } = await this.supabase
      .from('report_templates')
      .update({ ...this.mapTemplateToDatabase(updates), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update report template: ${error.message}`);
    return this.mapTemplateToEntity(data);
  }

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await this.supabase.from('report_templates').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete report template: ${error.message}`);
  }

  // ============================================================
  // Statistics
  // ============================================================

  async getComplianceStats(employerId: string): Promise<{
    totalAlerts: number;
    openAlerts: number;
    criticalAlerts: number;
    overdueAlerts: number;
    alertsBySeverity: Record<string, number>;
    alertsByType: Record<string, number>;
  }> {
    const { count: total } = await this.supabase
      .from('compliance_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId);

    const { count: open } = await this.supabase
      .from('compliance_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .eq('status', 'open');

    const { count: critical } = await this.supabase
      .from('compliance_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .eq('severity', 'critical')
      .not('status', 'in', '("resolved","dismissed")');

    const { count: overdue } = await this.supabase
      .from('compliance_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .not('due_date', 'is', null)
      .lt('due_date', new Date().toISOString().split('T')[0])
      .not('status', 'in', '("resolved","dismissed")');

    const { data: severityData } = await this.supabase
      .from('compliance_alerts')
      .select('severity')
      .eq('employer_id', employerId);

    const alertsBySeverity: Record<string, number> = {};
    (severityData || []).forEach((row) => {
      alertsBySeverity[row.severity] = (alertsBySeverity[row.severity] || 0) + 1;
    });

    const { data: typeData } = await this.supabase
      .from('compliance_alerts')
      .select('alert_type')
      .eq('employer_id', employerId);

    const alertsByType: Record<string, number> = {};
    (typeData || []).forEach((row) => {
      alertsByType[row.alert_type] = (alertsByType[row.alert_type] || 0) + 1;
    });

    return {
      totalAlerts: total ?? 0,
      openAlerts: open ?? 0,
      criticalAlerts: critical ?? 0,
      overdueAlerts: overdue ?? 0,
      alertsBySeverity,
      alertsByType,
    };
  }

  async getAuditStats(employerId: string, days: number): Promise<{
    totalActions: number;
    uniqueUsers: number;
    actionsByType: Record<string, number>;
    actionsByEntity: Record<string, number>;
    sensitiveActions: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { count: total } = await this.supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .gte('timestamp', startDate.toISOString());

    const { data: userData } = await this.supabase
      .from('audit_logs')
      .select('user_id')
      .eq('employer_id', employerId)
      .gte('timestamp', startDate.toISOString());

    const uniqueUserIds = new Set((userData || []).map((row) => row.user_id));

    const { data: actionData } = await this.supabase
      .from('audit_logs')
      .select('action')
      .eq('employer_id', employerId)
      .gte('timestamp', startDate.toISOString());

    const actionsByType: Record<string, number> = {};
    (actionData || []).forEach((row) => {
      actionsByType[row.action] = (actionsByType[row.action] || 0) + 1;
    });

    const { data: entityData } = await this.supabase
      .from('audit_logs')
      .select('entity_type')
      .eq('employer_id', employerId)
      .gte('timestamp', startDate.toISOString());

    const actionsByEntity: Record<string, number> = {};
    (entityData || []).forEach((row) => {
      actionsByEntity[row.entity_type] = (actionsByEntity[row.entity_type] || 0) + 1;
    });

    const { count: sensitive } = await this.supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .in('action', ['delete', 'approve', 'export'])
      .gte('timestamp', startDate.toISOString());

    return {
      totalActions: total ?? 0,
      uniqueUsers: uniqueUserIds.size,
      actionsByType,
      actionsByEntity,
      sensitiveActions: sensitive ?? 0,
    };
  }

  // ============================================================
  // Private Mapping Methods
  // ============================================================

  private mapAlertToEntity(row: any): ComplianceAlert {
    return new ComplianceAlert(
      row.id,
      row.employer_id,
      row.alert_type,
      row.severity,
      row.title,
      row.description,
      row.affected_entity_type,
      row.affected_entity_id,
      row.affected_entity_name,
      row.due_date ? new Date(row.due_date) : null,
      row.status,
      row.assigned_to,
      row.assigned_to_name,
      row.resolution,
      row.resolved_at ? new Date(row.resolved_at) : null,
      row.resolved_by,
      row.acknowledged_at ? new Date(row.acknowledged_at) : null,
      row.acknowledged_by,
      row.metadata,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

  private mapAlertToDatabase(alert: Partial<ComplianceAlert>): any {
    const db: any = {};
    if (alert.id) db.id = alert.id;
    if (alert.employerId) db.employer_id = alert.employerId;
    if (alert.alertType) db.alert_type = alert.alertType;
    if (alert.severity) db.severity = alert.severity;
    if (alert.title) db.title = alert.title;
    if (alert.description) db.description = alert.description;
    if (alert.affectedEntityType) db.affected_entity_type = alert.affectedEntityType;
    if (alert.affectedEntityId !== undefined) db.affected_entity_id = alert.affectedEntityId;
    if (alert.affectedEntityName !== undefined) db.affected_entity_name = alert.affectedEntityName;
    if (alert.dueDate !== undefined) db.due_date = alert.dueDate?.toISOString().split('T')[0] ?? null;
    if (alert.status) db.status = alert.status;
    if (alert.assignedTo !== undefined) db.assigned_to = alert.assignedTo;
    if (alert.assignedToName !== undefined) db.assigned_to_name = alert.assignedToName;
    if (alert.resolution !== undefined) db.resolution = alert.resolution;
    if (alert.resolvedAt !== undefined) db.resolved_at = alert.resolvedAt?.toISOString() ?? null;
    if (alert.resolvedBy !== undefined) db.resolved_by = alert.resolvedBy;
    if (alert.acknowledgedAt !== undefined) db.acknowledged_at = alert.acknowledgedAt?.toISOString() ?? null;
    if (alert.acknowledgedBy !== undefined) db.acknowledged_by = alert.acknowledgedBy;
    if (alert.metadata !== undefined) db.metadata = alert.metadata;
    if (alert.createdAt) db.created_at = alert.createdAt.toISOString();
    if (alert.updatedAt) db.updated_at = alert.updatedAt.toISOString();
    return db;
  }

  private mapAuditLogToEntity(row: any): AuditLog {
    return new AuditLog(
      row.id,
      row.employer_id,
      row.user_id,
      row.user_name,
      row.user_role,
      row.action,
      row.entity_type,
      row.entity_id,
      row.entity_name,
      row.description,
      row.changes,
      row.metadata,
      row.ip_address,
      row.user_agent,
      new Date(row.timestamp)
    );
  }

  private mapAuditLogToDatabase(log: Partial<AuditLog>): any {
    const db: any = {};
    if (log.id) db.id = log.id;
    if (log.employerId) db.employer_id = log.employerId;
    if (log.userId) db.user_id = log.userId;
    if (log.userName) db.user_name = log.userName;
    if (log.userRole) db.user_role = log.userRole;
    if (log.action) db.action = log.action;
    if (log.entityType) db.entity_type = log.entityType;
    if (log.entityId !== undefined) db.entity_id = log.entityId;
    if (log.entityName !== undefined) db.entity_name = log.entityName;
    if (log.description) db.description = log.description;
    if (log.changes !== undefined) db.changes = log.changes;
    if (log.metadata !== undefined) db.metadata = log.metadata;
    if (log.ipAddress !== undefined) db.ip_address = log.ipAddress;
    if (log.userAgent !== undefined) db.user_agent = log.userAgent;
    if (log.timestamp) db.timestamp = log.timestamp.toISOString();
    return db;
  }

  private mapTemplateToEntity(row: any): ReportTemplate {
    return new ReportTemplate(
      row.id,
      row.employer_id,
      row.code,
      row.name,
      row.name_indonesian,
      row.category,
      row.description,
      row.report_type,
      row.data_source,
      row.filters,
      row.columns,
      row.sort_by,
      row.sort_order,
      row.group_by,
      row.format,
      row.schedule,
      row.is_system,
      row.is_active,
      row.created_by,
      row.created_by_name,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

  private mapTemplateToDatabase(template: Partial<ReportTemplate>): any {
    const db: any = {};
    if (template.id) db.id = template.id;
    if (template.employerId) db.employer_id = template.employerId;
    if (template.code) db.code = template.code;
    if (template.name) db.name = template.name;
    if (template.nameIndonesian) db.name_indonesian = template.nameIndonesian;
    if (template.category) db.category = template.category;
    if (template.description !== undefined) db.description = template.description;
    if (template.reportType) db.report_type = template.reportType;
    if (template.dataSource) db.data_source = template.dataSource;
    if (template.filters) db.filters = template.filters;
    if (template.columns) db.columns = template.columns;
    if (template.sortBy !== undefined) db.sort_by = template.sortBy;
    if (template.sortOrder) db.sort_order = template.sortOrder;
    if (template.groupBy !== undefined) db.group_by = template.groupBy;
    if (template.format) db.format = template.format;
    if (template.schedule !== undefined) db.schedule = template.schedule;
    if (template.isSystem !== undefined) db.is_system = template.isSystem;
    if (template.isActive !== undefined) db.is_active = template.isActive;
    if (template.createdBy) db.created_by = template.createdBy;
    if (template.createdByName) db.created_by_name = template.createdByName;
    if (template.createdAt) db.created_at = template.createdAt.toISOString();
    if (template.updatedAt) db.updated_at = template.updatedAt.toISOString();
    return db;
  }
}
