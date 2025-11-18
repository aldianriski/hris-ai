/**
 * Cache Invalidation Logic
 * Handles cache invalidation on data changes
 */

import { deleteCache, deleteCachePattern } from './utils';
import {
  employeeKey,
  employeeListKey,
  leaveRequestsKey,
  payrollKey,
  attendanceKey,
  dashboardKey,
  analyticsKey,
  keyPattern,
} from './keys';

/**
 * Invalidate employee-related caches
 */
export async function invalidateEmployeeCache(
  employeeId: string,
  companyId: string
): Promise<void> {
  await Promise.all([
    // Delete specific employee
    deleteCache(employeeKey(employeeId)),

    // Delete employee lists for this company
    deleteCachePattern(keyPattern('employees', companyId)),

    // Delete analytics that might include this employee
    deleteCachePattern(keyPattern('analytics', companyId)),

    // Delete company dashboard
    deleteCachePattern(keyPattern('dashboard', companyId)),
  ]);
}

/**
 * Invalidate leave-related caches
 */
export async function invalidateLeaveCache(
  companyId: string,
  employeeId?: string
): Promise<void> {
  await Promise.all([
    // Delete leave requests for company
    deleteCachePattern(keyPattern('leave', companyId)),

    // Delete analytics
    deleteCachePattern(keyPattern('analytics', companyId)),

    // Delete dashboards
    deleteCachePattern(keyPattern('dashboard', companyId)),

    // Delete employee cache if specific employee
    employeeId ? deleteCache(employeeKey(employeeId)) : Promise.resolve(),
  ]);
}

/**
 * Invalidate payroll-related caches
 */
export async function invalidatePayrollCache(
  companyId: string,
  periodId?: string
): Promise<void> {
  await Promise.all([
    // Delete payroll data
    periodId
      ? deleteCache(payrollKey(companyId, periodId))
      : deleteCachePattern(keyPattern('payroll', companyId)),

    // Delete analytics
    deleteCachePattern(keyPattern('analytics', companyId)),

    // Delete dashboards
    deleteCachePattern(keyPattern('dashboard', companyId)),
  ]);
}

/**
 * Invalidate attendance-related caches
 */
export async function invalidateAttendanceCache(
  employeeId: string,
  companyId: string,
  date?: string
): Promise<void> {
  await Promise.all([
    // Delete attendance data
    date
      ? deleteCache(attendanceKey(employeeId, date))
      : deleteCachePattern(keyPattern('attendance', employeeId)),

    // Delete analytics
    deleteCachePattern(keyPattern('analytics', companyId)),

    // Delete employee data
    deleteCache(employeeKey(employeeId)),

    // Delete dashboards
    deleteCachePattern(keyPattern('dashboard', companyId)),
  ]);
}

/**
 * Invalidate dashboard caches
 */
export async function invalidateDashboardCache(
  companyId: string,
  userId?: string
): Promise<void> {
  if (userId) {
    await deleteCache(dashboardKey(companyId, userId));
  } else {
    await deleteCachePattern(keyPattern('dashboard', companyId));
  }
}

/**
 * Invalidate analytics caches
 */
export async function invalidateAnalyticsCache(
  companyId: string,
  metric?: string
): Promise<void> {
  if (metric) {
    await deleteCachePattern(analyticsKey(companyId, metric));
  } else {
    await deleteCachePattern(keyPattern('analytics', companyId));
  }
}

/**
 * Invalidate all caches for a company
 * Use sparingly - only when major changes occur
 */
export async function invalidateAllCompanyCache(
  companyId: string
): Promise<void> {
  await Promise.all([
    deleteCachePattern(keyPattern('analytics', companyId)),
    deleteCachePattern(keyPattern('employees', companyId)),
    deleteCachePattern(keyPattern('leave', companyId)),
    deleteCachePattern(keyPattern('payroll', companyId)),
    deleteCachePattern(keyPattern('dashboard', companyId)),
    deleteCachePattern(keyPattern('settings', companyId)),
  ]);

  console.log(`[Cache] Invalidated all caches for company ${companyId}`);
}
