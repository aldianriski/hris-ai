/**
 * Backup Creation Script
 * Manually create a database backup
 *
 * Usage:
 *   pnpm tsx scripts/backup-create.ts [--type full|incremental]
 *
 * Examples:
 *   pnpm tsx scripts/backup-create.ts
 *   pnpm tsx scripts/backup-create.ts --type full
 *   pnpm tsx scripts/backup-create.ts --type incremental
 */

import { createFullBackup, createIncrementalBackup, listBackups, verifyBackup } from '@/lib/backup/service';

async function main() {
  const args = process.argv.slice(2);
  const typeIndex = args.indexOf('--type');
  const type = typeIndex !== -1 && args[typeIndex + 1] ? args[typeIndex + 1] : 'full';

  if (type !== 'full' && type !== 'incremental') {
    console.error('Invalid type. Must be "full" or "incremental"');
    process.exit(1);
  }

  try {
    if (type === 'full') {
      console.log('📦 Creating full backup...\n');

      const metadata = await createFullBackup();
      const sizeInMB = (metadata.size / 1024 / 1024).toFixed(2);

      console.log('✅ Full backup created successfully');
      console.log(`\nBackup ID: ${metadata.id}`);
      console.log(`Timestamp: ${metadata.timestamp}`);
      console.log(`Size: ${sizeInMB} MB`);
      console.log(`Tables: ${metadata.tables.length}`);
      console.log(`Checksum: ${metadata.checksum}`);

      // Verify backup
      console.log('\n🔍 Verifying backup...');
      const verification = await verifyBackup(metadata.id);

      if (verification.valid) {
        console.log('✅ Backup verification succeeded');
      } else {
        console.log('❌ Backup verification failed');
        console.log('Errors:', verification.errors.join(', '));
        process.exit(1);
      }
    } else {
      console.log('📦 Creating incremental backup...\n');

      // Get last backup
      const backups = await listBackups();
      if (backups.length === 0) {
        console.error('❌ No previous backup found. Create a full backup first.');
        process.exit(1);
      }

      const lastBackup = backups[0];
      console.log(`Last backup: ${lastBackup.id} (${lastBackup.timestamp})\n`);

      const metadata = await createIncrementalBackup(lastBackup.timestamp);
      const sizeInMB = (metadata.size / 1024 / 1024).toFixed(2);

      console.log('✅ Incremental backup created successfully');
      console.log(`\nBackup ID: ${metadata.id}`);
      console.log(`Timestamp: ${metadata.timestamp}`);
      console.log(`Size: ${sizeInMB} MB`);
      console.log(`Tables with changes: ${metadata.tables.length}`);
      console.log(`Checksum: ${metadata.checksum}`);

      // Verify backup
      console.log('\n🔍 Verifying backup...');
      const verification = await verifyBackup(metadata.id);

      if (verification.valid) {
        console.log('✅ Backup verification succeeded');
      } else {
        console.log('❌ Backup verification failed');
        console.log('Errors:', verification.errors.join(', '));
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
