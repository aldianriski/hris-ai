/**
 * Cache Module Exports
 * Central export point for all caching functionality
 */

// Redis client
export { getRedisClient, isRedisAvailable, CacheTTL } from './redis';

// Cache keys
export * from './keys';

// Cache utilities
export {
  getCached,
  setCache,
  deleteCache,
  deleteCachePattern,
  trackKeyInPattern,
  multiGetCache,
  incrementCache,
  existsInCache,
} from './utils';

// Cache invalidation
export {
  invalidateEmployeeCache,
  invalidateLeaveCache,
  invalidatePayrollCache,
  invalidateAttendanceCache,
  invalidateDashboardCache,
  invalidateAnalyticsCache,
  invalidateAllCompanyCache,
} from './invalidation';

// Cache warming
export {
  warmEmployeeCache,
  warmAnalyticsCache,
  warmDashboardCache,
  warmCompanySettingsCache,
  warmAllCompanyCache,
  scheduledCacheWarming,
} from './warming';
