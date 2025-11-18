/**
 * Cache Key Generators
 * Consistent naming convention for cache keys
 */

/**
 * Generate cache key for analytics data
 */
export function analyticsKey(
  companyId: string,
  metric: string,
  timeframe?: string
): string {
  const base = `analytics:${companyId}:${metric}`;
  return timeframe ? `${base}:${timeframe}` : base;
}

/**
 * Generate cache key for employee data
 */
export function employeeKey(employeeId: string): string {
  return `employee:${employeeId}`;
}

/**
 * Generate cache key for employee list
 */
export function employeeListKey(companyId: string, filters?: string): string {
  const base = `employees:${companyId}`;
  return filters ? `${base}:${filters}` : base;
}

/**
 * Generate cache key for dashboard data
 */
export function dashboardKey(companyId: string, userId: string): string {
  return `dashboard:${companyId}:${userId}`;
}

/**
 * Generate cache key for leave requests
 */
export function leaveRequestsKey(
  companyId: string,
  status?: string
): string {
  const base = `leave:${companyId}`;
  return status ? `${base}:${status}` : base;
}

/**
 * Generate cache key for payroll data
 */
export function payrollKey(
  companyId: string,
  periodId?: string
): string {
  const base = `payroll:${companyId}`;
  return periodId ? `${base}:${periodId}` : base;
}

/**
 * Generate cache key for attendance data
 */
export function attendanceKey(
  employeeId: string,
  date?: string
): string {
  const base = `attendance:${employeeId}`;
  return date ? `${base}:${date}` : base;
}

/**
 * Generate cache key for department data
 */
export function departmentKey(departmentId: string): string {
  return `department:${departmentId}`;
}

/**
 * Generate cache key for company settings
 */
export function companySettingsKey(companyId: string): string {
  return `settings:${companyId}`;
}

/**
 * Generate pattern for invalidating multiple keys
 */
export function keyPattern(prefix: string, companyId: string): string {
  return `${prefix}:${companyId}:*`;
}
