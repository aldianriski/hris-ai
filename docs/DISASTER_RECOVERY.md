# Disaster Recovery Plan

Complete disaster recovery procedures for HRIS AI system.

## Table of Contents

1. [Overview](#overview)
2. [Backup Strategy](#backup-strategy)
3. [Recovery Procedures](#recovery-procedures)
4. [Disaster Scenarios](#disaster-scenarios)
5. [Testing & Validation](#testing--validation)
6. [Contact Information](#contact-information)

---

## Overview

### Recovery Objectives

- **RTO (Recovery Time Objective):** 4 hours
- **RPO (Recovery Point Objective):** 6 hours
- **Data Loss Tolerance:** Maximum 6 hours of data

### Backup Schedule

| Type | Frequency | Retention | Time |
|------|-----------|-----------|------|
| Full Backup | Daily | 7 days | 2:00 AM |
| Incremental | Every 6 hours | 2 days | 12:00 AM, 6:00 AM, 12:00 PM, 6:00 PM |
| Weekly Verification | Weekly | - | Sunday 3:00 AM |

### Critical Systems

1. **Database:** Supabase PostgreSQL
2. **File Storage:** Supabase Storage
3. **Application:** Next.js on Vercel
4. **Cache:** Upstash Redis
5. **Queue:** Inngest
6. **Monitoring:** Sentry

---

## Backup Strategy

### Automated Backups

Backups are automatically created by Inngest jobs:

- **Daily Full Backup:** Backs up all tables at 2:00 AM
- **Incremental Backup:** Backs up changes every 6 hours
- **Auto-Cleanup:** Removes backups older than retention policy

### Backup Storage

- **Location:** Supabase Storage bucket `backups`
- **Path:** `database/[backup-id].json.gz`
- **Format:** Compressed JSON (gzip)
- **Encryption:** At rest via Supabase

### Backup Verification

All backups are automatically verified:
- Checksum validation (SHA-256)
- Decompression test
- Table presence validation
- Weekly full verification of all backups

### Manual Backup Creation

```bash
# Create full backup
pnpm tsx scripts/backup-create.ts --type full

# Create incremental backup
pnpm tsx scripts/backup-create.ts --type incremental

# List all backups
pnpm tsx scripts/backup-verify.ts --list

# Verify backup
pnpm tsx scripts/backup-verify.ts [backup-id]

# Verify all backups
pnpm tsx scripts/backup-verify.ts --all
```

---

## Recovery Procedures

### 1. Database Recovery

#### Full Database Restore

**When to use:** Complete database loss, catastrophic corruption

**Steps:**

1. **Identify latest valid backup:**
   ```bash
   pnpm tsx scripts/backup-verify.ts --list
   ```

2. **Verify backup integrity:**
   ```bash
   pnpm tsx scripts/backup-verify.ts [backup-id]
   ```

3. **Test restore (dry run):**
   ```bash
   pnpm tsx scripts/backup-restore.ts [backup-id] --dry-run
   ```

4. **Perform actual restore:**
   ```bash
   pnpm tsx scripts/backup-restore.ts [backup-id]
   ```

5. **Verify data integrity:**
   - Check row counts in critical tables
   - Verify recent transactions
   - Test application functionality

**Estimated Time:** 1-2 hours

#### Partial Table Restore

**When to use:** Specific table corruption, accidental data deletion

**Steps:**

1. **Restore specific tables:**
   ```bash
   pnpm tsx scripts/backup-restore.ts [backup-id] --tables employees,departments
   ```

2. **Verify restored data:**
   - Compare row counts before/after
   - Check data consistency
   - Test related functionality

**Estimated Time:** 30 minutes - 1 hour

#### Point-in-Time Recovery

**When to use:** Need to recover to specific time (within RPO window)

**Steps:**

1. **Find backup closest to target time:**
   ```bash
   pnpm tsx scripts/backup-verify.ts --list
   ```

2. **Restore base backup:**
   ```bash
   pnpm tsx scripts/backup-restore.ts [full-backup-id]
   ```

3. **Apply incremental backups in order:**
   ```bash
   # Apply each incremental backup created after the full backup
   pnpm tsx scripts/backup-restore.ts [incremental-1-id]
   pnpm tsx scripts/backup-restore.ts [incremental-2-id]
   # ... until reaching target time
   ```

4. **Verify final state**

**Estimated Time:** 2-4 hours

---

## Disaster Scenarios

### Scenario 1: Database Corruption

**Symptoms:**
- Application errors related to database queries
- Data inconsistencies
- Failed transactions

**Response:**

1. **Assess damage:**
   - Check Sentry for error patterns
   - Review database logs
   - Identify affected tables

2. **If isolated to specific tables:**
   - Restore affected tables from latest backup
   - Verify data integrity

3. **If widespread corruption:**
   - Perform full database restore
   - Verify all critical functionality

4. **Post-recovery:**
   - Investigate root cause
   - Update monitoring alerts
   - Document incident

**RTO:** 2-4 hours
**RPO:** Up to 6 hours

---

### Scenario 2: Accidental Data Deletion

**Symptoms:**
- User reports missing data
- Audit logs show DELETE operations
- Tables have fewer rows than expected

**Response:**

1. **Determine scope:**
   - Identify deleted records
   - Check deletion timestamp
   - Find affected tables

2. **Stop further deletions:**
   - Disable problematic features if needed
   - Review access controls

3. **Restore data:**
   - Use backup from before deletion
   - Restore specific tables to minimize disruption
   ```bash
   pnpm tsx scripts/backup-restore.ts [backup-id] --tables [affected-tables]
   ```

4. **Verify restoration:**
   - Confirm deleted records are back
   - Check data integrity
   - Test application

5. **Prevent recurrence:**
   - Review deletion logic
   - Add confirmation steps
   - Update audit logging

**RTO:** 1-2 hours
**RPO:** Up to 6 hours

---

### Scenario 3: Complete Infrastructure Failure

**Symptoms:**
- Entire Supabase project unavailable
- Application completely down
- Cannot access database or storage

**Response:**

1. **Create new Supabase project:**
   - Sign up or use backup project
   - Configure database schema
   - Set up storage buckets

2. **Update environment variables:**
   ```bash
   # Update .env.local with new Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL=https://[new-project].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[new-anon-key]
   SUPABASE_SERVICE_ROLE_KEY=[new-service-key]
   ```

3. **Run migrations:**
   ```bash
   # Apply all migrations to new database
   psql [new-database-url] < migrations/*.sql
   ```

4. **Restore from backup:**
   ```bash
   # Restore latest backup to new database
   pnpm tsx scripts/backup-restore.ts [latest-backup-id]
   ```

5. **Restore file storage:**
   - Download files from old project (if accessible)
   - Or restore from external backup service
   - Upload to new storage bucket

6. **Redeploy application:**
   ```bash
   # Deploy with new environment variables
   vercel --prod
   ```

7. **Update DNS if needed**

8. **Verify all systems:**
   - Test authentication
   - Test file uploads/downloads
   - Test critical workflows
   - Monitor for errors

**RTO:** 4-8 hours
**RPO:** Up to 6 hours

---

### Scenario 4: Supabase Storage Corruption

**Symptoms:**
- Files inaccessible or corrupted
- Storage bucket errors
- File download failures

**Response:**

1. **Assess damage:**
   - Check which buckets affected
   - Review storage logs
   - Test file access

2. **Restore from backups:**
   - If using external file backup (e.g., AWS S3 sync)
   - Download files from backup location
   - Upload to new or repaired bucket

3. **Alternative (if no external backup):**
   - Request Supabase support for restoration
   - Use database records to identify missing files
   - Request users to re-upload critical files

4. **Verify restoration:**
   - Test file downloads
   - Check file integrity
   - Verify thumbnails/previews

**RTO:** 2-6 hours (depends on data size)
**RPO:** Variable (depends on backup frequency)

---

### Scenario 5: Application Deployment Failure

**Symptoms:**
- New deployment breaks application
- Critical features non-functional
- Mass error reports

**Response:**

1. **Immediate rollback:**
   ```bash
   # Rollback to previous deployment on Vercel
   vercel rollback
   ```

2. **Assess impact:**
   - Check if data was affected
   - Review error logs in Sentry
   - Identify breaking changes

3. **If data affected:**
   - Follow data recovery procedures above
   - Restore to pre-deployment state

4. **Fix and redeploy:**
   - Identify root cause
   - Fix issues
   - Test thoroughly
   - Deploy fix

**RTO:** 30 minutes - 2 hours
**RPO:** 0 (no data loss expected)

---

## Testing & Validation

### Monthly Backup Tests

Perform monthly backup restoration tests:

1. **Test Schedule:** First Sunday of each month
2. **Test Environment:** Use staging/test database
3. **Procedure:**
   - Restore latest backup to test environment
   - Verify data integrity
   - Test application functionality
   - Document any issues
   - Update procedures if needed

### Disaster Recovery Drills

Conduct quarterly disaster recovery drills:

1. **Q1 Drill:** Partial table restoration
2. **Q2 Drill:** Full database recovery
3. **Q3 Drill:** Point-in-time recovery
4. **Q4 Drill:** Complete infrastructure failure

### Validation Checklist

After any recovery:

- [ ] Database accessible and responsive
- [ ] All tables present with expected row counts
- [ ] Authentication working
- [ ] File storage accessible
- [ ] Critical workflows functional
- [ ] No errors in monitoring
- [ ] Recent data verified
- [ ] Performance acceptable
- [ ] Backups resuming normally

---

## Contact Information

### Emergency Contacts

**On-Call Engineer:**
- Name: [Your Name]
- Phone: [Phone Number]
- Email: [Email]

**Backup Contact:**
- Name: [Backup Contact]
- Phone: [Phone Number]
- Email: [Email]

### Service Providers

**Supabase:**
- Support: support@supabase.com
- Status: https://status.supabase.com
- Emergency: Dashboard → Support

**Vercel:**
- Support: support@vercel.com
- Status: https://www.vercel-status.com
- Dashboard: https://vercel.com/dashboard

**Upstash:**
- Support: support@upstash.com
- Dashboard: https://console.upstash.com

**Inngest:**
- Support: support@inngest.com
- Dashboard: https://app.inngest.com

### Escalation Path

1. **Level 1:** On-call engineer attempts recovery
2. **Level 2:** Escalate to backup contact + vendor support
3. **Level 3:** Engage vendor emergency support + management
4. **Level 4:** Executive notification + external disaster recovery team

---

## Appendix

### Backup File Structure

```
backups/
└── database/
    ├── full-1705564800000.json.gz      # Full backup
    ├── incremental-1705586400000.json.gz # Incremental
    └── incremental-1705608000000.json.gz # Incremental
```

### Backup Metadata

Stored in `backup_metadata` table:
- `id`: Unique backup identifier
- `type`: full or incremental
- `timestamp`: Creation time
- `tables`: List of included tables
- `size`: File size in bytes
- `checksum`: SHA-256 hash
- `status`: completed, failed, pending

### Recovery Logs

All recovery operations should be logged:
- Start time and end time
- Backup ID used
- Tables restored
- Any errors encountered
- Verification results
- Personnel involved

### Post-Incident Review

After any disaster recovery:
1. Document incident timeline
2. Identify root cause
3. List what went well
4. List what could improve
5. Update procedures
6. Schedule follow-up review

---

## Document Maintenance

- **Last Updated:** 2025-01-18
- **Next Review:** 2025-04-18 (Quarterly)
- **Owner:** Engineering Team
- **Version:** 1.0.0
