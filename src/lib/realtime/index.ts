/**
 * Realtime Module Exports
 * Central export point for all realtime functionality
 */

// Client functions
export {
  subscribeToTable,
  subscribeToPresence,
  subscribeToBroadcast,
  sendBroadcast,
  unsubscribe,
  unsubscribeAll,
  getActiveChannelCount,
  getActiveChannelNames,
  type RealtimeEventType,
  type SubscriptionCallback,
} from './client';

// React hooks
export {
  useRealtimeTable,
  useAttendanceUpdates,
  useLeaveRequestUpdates,
  useEmployeeUpdates,
  usePayrollUpdates,
  usePerformanceReviewUpdates,
  useDocumentUpdates,
  useDashboardRealtime,
} from './hooks';

// Provider
export { RealtimeProvider, useRealtime } from './provider';
