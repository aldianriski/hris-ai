/**
 * Backup Verification Script
 * Verify backup integrity and list available backups
 *
 * Usage:
 *   pnpm tsx scripts/backup-verify.ts [backup-id]
 *   pnpm tsx scripts/backup-verify.ts --all
 *   pnpm tsx scripts/backup-verify.ts --list
 */

import { verifyBackup, listBackups } from '@/lib/backup/service';

async function main() {
  const args = process.argv.slice(2);
  const backupId = args[0];

  if (!backupId) {
    console.error('Usage: pnpm tsx scripts/backup-verify.ts [backup-id | --all | --list]');
    process.exit(1);
  }

  try {
    // List all backups
    if (backupId === '--list') {
      console.log('📋 Listing all backups...\n');

      const backups = await listBackups();

      if (backups.length === 0) {
        console.log('No backups found.');
        return;
      }

      console.log(`Found ${backups.length} backup(s):\n`);

      for (const backup of backups) {
        const sizeInMB = (backup.size / 1024 / 1024).toFixed(2);
        console.log(`ID: ${backup.id}`);
        console.log(`  Type: ${backup.type}`);
        console.log(`  Timestamp: ${backup.timestamp}`);
        console.log(`  Size: ${sizeInMB} MB`);
        console.log(`  Tables: ${backup.tables.length}`);
        console.log(`  Status: ${backup.status}`);
        console.log('');
      }

      return;
    }

    // Verify all backups
    if (backupId === '--all') {
      console.log('🔍 Verifying all backups...\n');

      const backups = await listBackups();

      if (backups.length === 0) {
        console.log('No backups found.');
        return;
      }

      let validCount = 0;
      let invalidCount = 0;

      for (const backup of backups) {
        console.log(`Verifying ${backup.id}...`);

        const result = await verifyBackup(backup.id);

        if (result.valid) {
          console.log(`  ✅ Valid`);
          validCount++;
        } else {
          console.log(`  ❌ Invalid`);
          console.log(`  Errors: ${result.errors.join(', ')}`);
          invalidCount++;
        }
      }

      console.log(`\nSummary:`);
      console.log(`  Valid: ${validCount}`);
      console.log(`  Invalid: ${invalidCount}`);
      console.log(`  Total: ${backups.length}`);

      return;
    }

    // Verify specific backup
    console.log(`🔍 Verifying backup: ${backupId}\n`);

    const result = await verifyBackup(backupId);

    if (result.valid) {
      console.log('✅ Backup is valid');
    } else {
      console.log('❌ Backup is invalid');
      console.log('\nErrors:');
      result.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
