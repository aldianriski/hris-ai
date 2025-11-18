/**
 * Backup Restore Script
 * Restore database from backup
 *
 * Usage:
 *   pnpm tsx scripts/backup-restore.ts <backup-id> [--tables table1,table2] [--dry-run]
 *
 * Examples:
 *   pnpm tsx scripts/backup-restore.ts full-1234567890 --dry-run
 *   pnpm tsx scripts/backup-restore.ts full-1234567890 --tables employees,departments
 *   pnpm tsx scripts/backup-restore.ts incremental-1234567890
 */

import { restoreFromBackup, verifyBackup } from '@/lib/backup/service';
import { RestoreOptions } from '@/lib/backup/config';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const backupId = args[0];

  if (!backupId) {
    console.error('Usage: pnpm tsx scripts/backup-restore.ts <backup-id> [--tables table1,table2] [--dry-run]');
    console.error('');
    console.error('Examples:');
    console.error('  pnpm tsx scripts/backup-restore.ts full-1234567890 --dry-run');
    console.error('  pnpm tsx scripts/backup-restore.ts full-1234567890 --tables employees,departments');
    process.exit(1);
  }

  try {
    // Parse options
    const options: RestoreOptions = {
      backupId,
      dryRun: args.includes('--dry-run'),
    };

    const tablesIndex = args.indexOf('--tables');
    const tablesArg = args[tablesIndex + 1];
    if (tablesIndex !== -1 && tablesArg) {
      options.tables = tablesArg.split(',').map((t) => t.trim());
    }

    console.log('🔍 Verifying backup...\n');

    // Verify backup first
    const verification = await verifyBackup(backupId);

    if (!verification.valid) {
      console.error('❌ Backup verification failed:');
      verification.errors.forEach((error, index) => {
        console.error(`  ${index + 1}. ${error}`);
      });
      process.exit(1);
    }

    console.log('✅ Backup is valid\n');

    // Confirm restore
    if (!options.dryRun) {
      console.log('⚠️  WARNING: This will DELETE existing data and restore from backup!');
      console.log(`Backup ID: ${backupId}`);
      if (options.tables) {
        console.log(`Tables: ${options.tables.join(', ')}`);
      } else {
        console.log('Tables: ALL');
      }
      console.log('');

      const answer = await question('Are you sure you want to continue? (yes/no): ');

      if (answer.toLowerCase() !== 'yes') {
        console.log('Restore cancelled.');
        rl.close();
        return;
      }
    }

    console.log(`\n${options.dryRun ? '🧪 Running in DRY RUN mode' : '🔄 Starting restore'}...\n`);

    // Perform restore
    const result = await restoreFromBackup(options);

    if (result.success) {
      console.log('✅ Restore completed successfully');
      console.log(`\nRestored tables (${result.restoredTables.length}):`);
      result.restoredTables.forEach((table) => {
        console.log(`  ✓ ${table}`);
      });
    } else {
      console.log('⚠️  Restore completed with errors');
      console.log(`\nRestored tables (${result.restoredTables.length}):`);
      result.restoredTables.forEach((table) => {
        console.log(`  ✓ ${table}`);
      });

      console.log(`\nErrors (${result.errors.length}):`);
      result.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });

      process.exit(1);
    }

    rl.close();
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    rl.close();
    process.exit(1);
  }
}

main();
