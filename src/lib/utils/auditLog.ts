/**
 * Audit Logging Utilities
 * Helper functions for creating audit log entries
 */

import { createClient } from '@/lib/supabase/server';
import type { UserContext } from '../api/types';
import { getClientIp, getUserAgent } from '../middleware/auth';
import { NextRequest } from 'next/server';

export interface AuditLogData {
  action: string;
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  severity?: 'info' | 'warning' | 'critical';
  metadata?: Record<string, any>;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  userContext: UserContext,
  request: NextRequest,
  data: AuditLogData
): Promise<void> {
  try {
    const supabase = await createClient();

    const auditLog = {
      tenant_id: userContext.companyId,
      actor_id: userContext.id,
      actor_email: userContext.email,
      actor_role: userContext.role,
      actor_ip: getClientIp(request),
      action: data.action,
      resource_type: data.resourceType,
      resource_id: data.resourceId,
      resource_name: data.resourceName,
      changes: data.changes,
      user_agent: getUserAgent(request),
      method: request.method,
      endpoint: new URL(request.url).pathname,
      severity: data.severity || 'info',
      metadata: data.metadata,
    };

    const { error } = await supabase
      .from('audit_logs')
      .insert(auditLog);

    if (error) {
      console.error('Failed to create audit log:', error);
    }
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
}

/**
 * Create field change history for detailed tracking
 */
export async function createFieldChangeHistory(
  userContext: UserContext,
  tableName: string,
  recordId: string,
  changes: { field: string; oldValue: any; newValue: any }[]
): Promise<void> {
  try {
    const supabase = await createClient();

    const fieldChanges = changes.map(change => ({
      table_name: tableName,
      record_id: recordId,
      field_name: change.field,
      old_value: change.oldValue,
      new_value: change.newValue,
      changed_by: userContext.id,
      changed_by_email: userContext.email,
    }));

    const { error } = await supabase
      .from('field_change_history')
      .insert(fieldChanges);

    if (error) {
      console.error('Failed to create field change history:', error);
    }
  } catch (error) {
    console.error('Error creating field change history:', error);
  }
}

/**
 * Log employee action
 */
export async function logEmployeeAction(
  userContext: UserContext,
  request: NextRequest,
  action: 'created' | 'updated' | 'deleted' | 'terminated',
  employeeId: string,
  employeeName: string,
  changes?: { before: Record<string, any>; after: Record<string, any> }
): Promise<void> {
  await createAuditLog(userContext, request, {
    action: `employee.${action}`,
    resourceType: 'employee',
    resourceId: employeeId,
    resourceName: employeeName,
    changes,
    severity: action === 'deleted' || action === 'terminated' ? 'warning' : 'info',
  });
}

/**
 * Log attendance action
 */
export async function logAttendanceAction(
  userContext: UserContext,
  request: NextRequest,
  action: 'clock_in' | 'clock_out' | 'updated' | 'deleted',
  attendanceId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog(userContext, request, {
    action: `attendance.${action}`,
    resourceType: 'attendance',
    resourceId: attendanceId,
    metadata,
    severity: 'info',
  });
}

/**
 * Log leave request action
 */
export async function logLeaveAction(
  userContext: UserContext,
  request: NextRequest,
  action: 'submitted' | 'approved' | 'rejected' | 'cancelled',
  leaveRequestId: string,
  employeeName: string,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog(userContext, request, {
    action: `leave.${action}`,
    resourceType: 'leave_request',
    resourceId: leaveRequestId,
    resourceName: employeeName,
    metadata,
    severity: 'info',
  });
}

/**
 * Log payroll action
 */
export async function logPayrollAction(
  userContext: UserContext,
  request: NextRequest,
  action: 'created' | 'processed' | 'approved' | 'paid' | 'deleted',
  payrollId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog(userContext, request, {
    action: `payroll.${action}`,
    resourceType: 'payroll',
    resourceId: payrollId,
    metadata,
    severity: action === 'paid' ? 'warning' : 'info',
  });
}

/**
 * Log document action
 */
export async function logDocumentAction(
  userContext: UserContext,
  request: NextRequest,
  action: 'uploaded' | 'downloaded' | 'deleted' | 'verified',
  documentId: string,
  documentName: string,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog(userContext, request, {
    action: `document.${action}`,
    resourceType: 'document',
    resourceId: documentId,
    resourceName: documentName,
    metadata,
    severity: action === 'deleted' ? 'warning' : 'info',
  });
}

/**
 * Log performance review action
 */
export async function logPerformanceAction(
  userContext: UserContext,
  request: NextRequest,
  action: 'review_created' | 'review_updated' | 'review_submitted' | 'review_completed' | 'review_deleted',
  reviewId: string,
  employeeName: string,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog(userContext, request, {
    action: `performance.${action}`,
    resourceType: 'performance_review',
    resourceId: reviewId,
    resourceName: employeeName,
    metadata,
    severity: 'info',
  });
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  userContext: UserContext | null,
  request: NextRequest,
  event: 'login_success' | 'login_failed' | 'logout' | 'mfa_enabled' | 'mfa_disabled' | 'password_reset',
  severity: 'info' | 'warning' | 'critical' = 'info'
): Promise<void> {
  try {
    const supabase = await createClient();

    const securityEvent = {
      user_id: userContext?.id,
      event_type: event,
      ip_address: getClientIp(request),
      user_agent: getUserAgent(request),
      severity,
      metadata: {
        email: userContext?.email,
        role: userContext?.role,
      },
    };

    const { error } = await supabase
      .from('security_events')
      .insert(securityEvent);

    if (error) {
      console.error('Failed to log security event:', error);
    }
  } catch (error) {
    console.error('Error logging security event:', error);
  }
}

/**
 * Log user session
 */
export async function createUserSession(
  userContext: UserContext,
  request: NextRequest,
  sessionToken: string
): Promise<void> {
  try {
    const supabase = await createClient();

    const session = {
      user_id: userContext.id,
      session_token: sessionToken,
      ip_address: getClientIp(request),
      user_agent: getUserAgent(request),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    const { error } = await supabase
      .from('user_sessions')
      .insert(session);

    if (error) {
      console.error('Failed to create user session:', error);
    }
  } catch (error) {
    console.error('Error creating user session:', error);
  }
}

/**
 * End user session
 */
export async function endUserSession(sessionToken: string): Promise<void> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('user_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('session_token', sessionToken)
      .is('ended_at', null);

    if (error) {
      console.error('Failed to end user session:', error);
    }
  } catch (error) {
    console.error('Error ending user session:', error);
  }
}
