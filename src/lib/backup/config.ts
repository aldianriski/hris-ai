/**
 * Backup Configuration
 * Configuration for database backup and recovery
 */

export const BackupConfig = {
  // Backup schedule (cron format)
  schedule: {
    full: '0 2 * * *', // Daily at 2 AM (full backup)
    incremental: '0 */6 * * *', // Every 6 hours (incremental)
  },

  // Retention policies
  retention: {
    daily: 7, // Keep 7 daily backups
    weekly: 4, // Keep 4 weekly backups
    monthly: 12, // Keep 12 monthly backups
  },

  // Backup storage
  storage: {
    bucket: 'backups',
    path: 'database',
  },

  // Tables to backup
  tables: [
    'users',
    'employees',
    'departments',
    'attendance',
    'leave_requests',
    'leave_balances',
    'payroll_periods',
    'payslips',
    'documents',
    'performance_reviews',
    'announcements',
    'notifications',
  ],

  // Backup metadata
  metadata: {
    version: '1.0.0',
    format: 'json',
    compression: 'gzip',
  },
} as const;

export interface BackupMetadata {
  id: string;
  type: 'full' | 'incremental';
  timestamp: string;
  version: string;
  tables: string[];
  size: number;
  compression: string;
  checksum: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export interface RestoreOptions {
  backupId: string;
  tables?: string[];
  pointInTime?: string;
  dryRun?: boolean;
}
