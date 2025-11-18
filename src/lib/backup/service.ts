/**
 * Backup Service
 * Handles database backup and restoration
 */

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { BackupConfig, BackupMetadata, RestoreOptions } from './config';
import { createHash } from 'crypto';
import { gzipSync, gunzipSync } from 'zlib';

/**
 * Create a full database backup
 */
export async function createFullBackup(): Promise<BackupMetadata> {
  const supabase = createServiceClient();
  const backupId = `full-${Date.now()}`;
  const timestamp = new Date().toISOString();

  try {
    const backup: any = {};
    let totalSize = 0;

    // Backup each table
    for (const table of BackupConfig.tables) {
      const { data, error } = await supabase.from(table).select('*');

      if (error) {
        throw new Error(`Failed to backup table ${table}: ${error.message}`);
      }

      backup[table] = data;
      totalSize += JSON.stringify(data).length;
    }

    // Compress backup
    const backupJson = JSON.stringify(backup);
    const compressed = gzipSync(backupJson);

    // Calculate checksum
    const checksum = createHash('sha256').update(compressed).digest('hex');

    // Upload to storage
    const fileName = `${BackupConfig.storage.path}/${backupId}.json.gz`;
    const { error: uploadError } = await supabase.storage
      .from(BackupConfig.storage.bucket)
      .upload(fileName, compressed, {
        contentType: 'application/gzip',
        cacheControl: '3600',
      });

    if (uploadError) {
      throw new Error(`Failed to upload backup: ${uploadError.message}`);
    }

    // Store metadata
    const metadata: BackupMetadata = {
      id: backupId,
      type: 'full',
      timestamp,
      version: BackupConfig.metadata.version,
      tables: BackupConfig.tables,
      size: compressed.length,
      compression: BackupConfig.metadata.compression,
      checksum,
      status: 'completed',
    };

    // Save metadata to database
    await supabase.from('backup_metadata').insert(metadata);

    return metadata;
  } catch (error) {
    const metadata: BackupMetadata = {
      id: backupId,
      type: 'full',
      timestamp,
      version: BackupConfig.metadata.version,
      tables: BackupConfig.tables,
      size: 0,
      compression: BackupConfig.metadata.compression,
      checksum: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    // Save failed metadata
    await supabase.from('backup_metadata').insert(metadata);

    throw error;
  }
}

/**
 * Create an incremental backup (only changed records)
 */
export async function createIncrementalBackup(
  sinceTimestamp: string
): Promise<BackupMetadata> {
  const supabase = createServiceClient();
  const backupId = `incremental-${Date.now()}`;
  const timestamp = new Date().toISOString();

  try {
    const backup: any = {};
    let totalSize = 0;

    // Backup changes since last backup
    for (const table of BackupConfig.tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .gte('updated_at', sinceTimestamp);

      if (error) {
        throw new Error(`Failed to backup table ${table}: ${error.message}`);
      }

      if (data && data.length > 0) {
        backup[table] = data;
        totalSize += JSON.stringify(data).length;
      }
    }

    // Compress backup
    const backupJson = JSON.stringify(backup);
    const compressed = gzipSync(backupJson);

    // Calculate checksum
    const checksum = createHash('sha256').update(compressed).digest('hex');

    // Upload to storage
    const fileName = `${BackupConfig.storage.path}/${backupId}.json.gz`;
    const { error: uploadError } = await supabase.storage
      .from(BackupConfig.storage.bucket)
      .upload(fileName, compressed, {
        contentType: 'application/gzip',
        cacheControl: '3600',
      });

    if (uploadError) {
      throw new Error(`Failed to upload backup: ${uploadError.message}`);
    }

    // Store metadata
    const metadata: BackupMetadata = {
      id: backupId,
      type: 'incremental',
      timestamp,
      version: BackupConfig.metadata.version,
      tables: Object.keys(backup),
      size: compressed.length,
      compression: BackupConfig.metadata.compression,
      checksum,
      status: 'completed',
    };

    await supabase.from('backup_metadata').insert(metadata);

    return metadata;
  } catch (error) {
    const metadata: BackupMetadata = {
      id: backupId,
      type: 'incremental',
      timestamp,
      version: BackupConfig.metadata.version,
      tables: [],
      size: 0,
      compression: BackupConfig.metadata.compression,
      checksum: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    await supabase.from('backup_metadata').insert(metadata);

    throw error;
  }
}

/**
 * Restore from backup
 */
export async function restoreFromBackup(
  options: RestoreOptions
): Promise<{ success: boolean; restoredTables: string[]; errors: string[] }> {
  const supabase = createServiceClient();
  const { backupId, tables, dryRun = false } = options;

  try {
    // Get backup metadata
    const { data: metadata, error: metadataError } = await supabase
      .from('backup_metadata')
      .select('*')
      .eq('id', backupId)
      .single();

    if (metadataError || !metadata) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    // Download backup file
    const fileName = `${BackupConfig.storage.path}/${backupId}.json.gz`;
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(BackupConfig.storage.bucket)
      .download(fileName);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download backup: ${downloadError?.message}`);
    }

    // Decompress and parse
    const compressed = Buffer.from(await fileData.arrayBuffer());
    const decompressed = gunzipSync(compressed);
    const backup = JSON.parse(decompressed.toString());

    // Verify checksum
    const checksum = createHash('sha256').update(compressed).digest('hex');
    if (checksum !== metadata.checksum) {
      throw new Error('Backup checksum mismatch - data may be corrupted');
    }

    const restoredTables: string[] = [];
    const errors: string[] = [];

    // Restore tables
    const tablesToRestore = tables || Object.keys(backup);
    for (const table of tablesToRestore) {
      if (!backup[table]) {
        errors.push(`Table ${table} not found in backup`);
        continue;
      }

      if (dryRun) {
        console.log(`[DRY RUN] Would restore ${backup[table].length} rows to ${table}`);
        restoredTables.push(table);
        continue;
      }

      try {
        // Delete existing data (careful!)
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (deleteError) {
          errors.push(`Failed to clear table ${table}: ${deleteError.message}`);
          continue;
        }

        // Insert backup data
        const { error: insertError } = await supabase.from(table).insert(backup[table]);

        if (insertError) {
          errors.push(`Failed to restore table ${table}: ${insertError.message}`);
          continue;
        }

        restoredTables.push(table);
      } catch (error) {
        errors.push(
          `Error restoring table ${table}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return {
      success: errors.length === 0,
      restoredTables,
      errors,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Verify backup integrity
 */
export async function verifyBackup(backupId: string): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const supabase = createServiceClient();
  const errors: string[] = [];

  try {
    // Get backup metadata
    const { data: metadata, error: metadataError } = await supabase
      .from('backup_metadata')
      .select('*')
      .eq('id', backupId)
      .single();

    if (metadataError || !metadata) {
      errors.push(`Backup metadata not found: ${backupId}`);
      return { valid: false, errors };
    }

    // Download backup file
    const fileName = `${BackupConfig.storage.path}/${backupId}.json.gz`;
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(BackupConfig.storage.bucket)
      .download(fileName);

    if (downloadError || !fileData) {
      errors.push(`Failed to download backup file: ${downloadError?.message}`);
      return { valid: false, errors };
    }

    // Verify checksum
    const compressed = Buffer.from(await fileData.arrayBuffer());
    const checksum = createHash('sha256').update(compressed).digest('hex');

    if (checksum !== metadata.checksum) {
      errors.push('Checksum mismatch - backup file may be corrupted');
      return { valid: false, errors };
    }

    // Try to decompress and parse
    try {
      const decompressed = gunzipSync(compressed);
      const backup = JSON.parse(decompressed.toString());

      // Verify tables exist
      for (const table of metadata.tables) {
        if (!backup[table]) {
          errors.push(`Table ${table} missing from backup`);
        }
      }
    } catch (error) {
      errors.push(
        `Failed to decompress or parse backup: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return { valid: false, errors };
    }

    return { valid: errors.length === 0, errors };
  } catch (error) {
    errors.push(
      `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return { valid: false, errors };
  }
}

/**
 * List available backups
 */
export async function listBackups(type?: 'full' | 'incremental'): Promise<BackupMetadata[]> {
  const supabase = createServiceClient();

  let query = supabase
    .from('backup_metadata')
    .select('*')
    .eq('status', 'completed')
    .order('timestamp', { ascending: false });

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list backups: ${error.message}`);
  }

  return data || [];
}

/**
 * Clean old backups based on retention policy
 */
export async function cleanOldBackups(): Promise<{ deleted: number; errors: string[] }> {
  const supabase = createServiceClient();
  const errors: string[] = [];
  let deleted = 0;

  try {
    const now = new Date();
    const dailyCutoff = new Date(now.getTime() - BackupConfig.retention.daily * 24 * 60 * 60 * 1000);
    const weeklyCutoff = new Date(
      now.getTime() - BackupConfig.retention.weekly * 7 * 24 * 60 * 60 * 1000
    );
    const monthlyCutoff = new Date(
      now.getTime() - BackupConfig.retention.monthly * 30 * 24 * 60 * 60 * 1000
    );

    // Get old backups
    const { data: oldBackups, error: listError } = await supabase
      .from('backup_metadata')
      .select('*')
      .lt('timestamp', dailyCutoff.toISOString());

    if (listError) {
      throw new Error(`Failed to list old backups: ${listError.message}`);
    }

    // Delete old backups
    for (const backup of oldBackups || []) {
      const backupDate = new Date(backup.timestamp);

      // Keep weekly backups for longer
      if (backupDate < weeklyCutoff && backupDate.getDay() === 0) {
        continue; // Keep Sunday backups for weekly retention
      }

      // Keep monthly backups for longer
      if (backupDate < monthlyCutoff && backupDate.getDate() === 1) {
        continue; // Keep first-of-month backups for monthly retention
      }

      try {
        // Delete file from storage
        const fileName = `${BackupConfig.storage.path}/${backup.id}.json.gz`;
        await supabase.storage.from(BackupConfig.storage.bucket).remove([fileName]);

        // Delete metadata
        await supabase.from('backup_metadata').delete().eq('id', backup.id);

        deleted++;
      } catch (error) {
        errors.push(
          `Failed to delete backup ${backup.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return { deleted, errors };
  } catch (error) {
    throw error;
  }
}
