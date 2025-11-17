# Supabase Database Setup

This directory contains all database migrations and seed data for the Talixa HRIS platform.

## Structure

```
supabase/
├── migrations/          # Database schema migrations
│   ├── 20240101000000_create_base_tables.sql
│   ├── 20240101000001_create_employees_table.sql
│   ├── 20240101000002_create_attendance_tables.sql
│   ├── 20240101000003_create_leave_tables.sql
│   ├── 20240101000004_create_payroll_tables.sql
│   ├── 20240101000005_create_performance_tables.sql
│   ├── 20240101000006_create_document_tables.sql
│   ├── 20240101000007_create_compliance_tables.sql
│   ├── 20240101000008_create_workflow_tables.sql
│   └── 20240101000009_create_rls_policies.sql
└── seed/                # Seed data for development
    └── 01_seed_development_data.sql
```

## Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Save your project URL and API keys

### 2. Install Supabase CLI

```bash
npm install -g supabase
```

### 3. Initialize Supabase

```bash
supabase init
supabase link --project-ref your-project-ref
```

### 4. Run Migrations

```bash
supabase db push
```

This will apply all migrations in order:
- Base tables (employers, profiles)
- Employee master data
- Attendance & shifts
- Leave management
- Payroll
- Performance management
- Document management
- Compliance & reporting
- Workflows
- Row Level Security (RLS) policies

### 5. Seed Development Data (Optional)

```bash
supabase db seed
```

Or manually run:
```sql
\i supabase/seed/01_seed_development_data.sql
```

### 6. Update Environment Variables

Copy `.env.example` to `.env.local` and update:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Database Schema Overview

### Core Tables

1. **employers** - Company/organization accounts
2. **profiles** - User profiles (linked to auth.users)
3. **employees** - Employee master data

### HR Modules

4. **attendance_records** - Clock in/out with GPS tracking
5. **attendance_shifts** - Shift schedules
6. **leave_requests** - Leave requests with AI auto-approval
7. **leave_balances** - Annual leave quotas
8. **payroll_periods** - Monthly payroll cycles
9. **payroll_components** - Salary components
10. **payroll_summaries** - Denormalized payroll data
11. **performance_reviews** - Performance evaluations
12. **performance_goals** - OKRs and KPIs
13. **employee_documents** - Document storage with AI extraction
14. **compliance_alerts** - Proactive compliance tracking
15. **audit_logs** - Complete audit trail
16. **workflow_instances** - Multi-step workflows

### Key Features

- **Auto-generated employee numbers**: `EMP-2024-001`
- **BPJS calculation**: Based on 2025 rates
- **PPh21 calculation**: Progressive tax with PTKP
- **AI confidence scores**: For auto-approvals
- **Audit logging**: All critical actions logged
- **RLS policies**: Row-level security for multi-tenancy

## Row Level Security (RLS)

All tables have RLS enabled with policies for:

- **Admin**: Full access to all data
- **HR Manager**: Company-wide access
- **Manager**: Team access + approvals
- **Employee**: Own data access only

### Helper Functions

```sql
-- Get employer ID for current user
SELECT auth.uid_to_employer_id();

-- Get employee ID for current user
SELECT auth.uid_to_employee_id();

-- Check user role
SELECT auth.user_role();

-- Check permissions
SELECT is_admin();
SELECT is_hr_manager_or_admin();
SELECT is_manager();
```

## Utilities

### Generate Employee Number

```sql
SELECT generate_employee_number('employer-uuid');
-- Returns: EMP-2024-001
```

### Calculate BPJS

```sql
SELECT calculate_bpjs(10000000, 'jht'); -- 5.7% = 570,000
SELECT calculate_bpjs(10000000, 'kesehatan'); -- 5% = 500,000
```

### Calculate PPh21

```sql
SELECT calculate_pph21(120000000, 'K/2'); -- Annual gross, PTKP status
-- Returns monthly tax amount
```

### Get Leave Balance

```sql
SELECT * FROM get_leave_balance('employee-uuid', 2024);
```

### Get Expiring Documents

```sql
SELECT * FROM get_expiring_documents('employer-uuid', 30);
-- Documents expiring in next 30 days
```

## Seed Data

The seed file creates:
- 1 test employer (PT Maju Jaya)
- 3 test employees
- Leave balances and requests
- Attendance records
- Performance goals
- Compliance alerts
- Workflow templates

### Test Credentials

After seeding, create auth users via Supabase Dashboard:

- **Admin**: admin@majujaya.com
- **HR Manager**: siti.rahayu@majujaya.com
- **Employee**: budi.santoso@majujaya.com

Then link profiles:
```sql
UPDATE profiles SET id = 'auth-user-id' WHERE email = 'admin@majujaya.com';
```

## Migrations Best Practices

1. **Never modify existing migrations** - Create new ones
2. **Test locally first** - Use `supabase db reset`
3. **Backup before production** - Always backup before pushing
4. **Review RLS policies** - Ensure data access is correct

## Troubleshooting

### Reset Database

```bash
supabase db reset
```

### Check Migration Status

```bash
supabase migration list
```

### Generate Types

```bash
supabase gen types typescript --local > src/types/database.ts
```

## Production Deployment

1. Review all migrations
2. Test with production-like data
3. Backup production database
4. Run migrations:
   ```bash
   supabase db push --linked
   ```
5. Verify RLS policies
6. Run smoke tests
7. Monitor for errors

## Support

For issues or questions:
- Documentation: [Supabase Docs](https://supabase.com/docs)
- PRD: See `HRIS_PRD.md`
- Design Patterns: See `HRIS_DESIGN_PATTERNS.md`
