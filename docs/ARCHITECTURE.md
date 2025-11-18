# Architecture Overview

## System Design

The HRIS platform is built with a modern, serverless-first architecture using Next.js 15, Supabase, and various cloud services.

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: HeroUI (based on React Aria)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Internationalization**: next-intl

### Backend
- **Runtime**: Node.js 20+
- **API Framework**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **ORM**: Supabase JS Client
- **Authentication**: JWT + Supabase Auth
- **File Storage**: Supabase Storage

### Infrastructure
- **Hosting**: Vercel (recommended) or self-hosted
- **Database**: Supabase (PostgreSQL)
- **Job Queue**: Inngest (serverless)
- **Email**: Resend or SendGrid
- **Push Notifications**: Firebase Cloud Messaging
- **Monitoring**: Vercel Analytics, Sentry (optional)

### Integrations
- **Chat**: Slack OAuth
- **Calendar**: Google Calendar OAuth
- **Meetings**: Zoom OAuth
- **AI**: OpenAI GPT-4

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Next.js  │  │ React    │  │ HeroUI   │  │ Tailwind │   │
│  │ App      │  │ 19       │  │ Components│ │ CSS      │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/API Calls
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Next.js API Routes                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Auth     │  │ Employees│  │ Payroll  │  │ Leave    │   │
│  │ Endpoints│  │ Endpoints│  │ Endpoints│  │ Endpoints│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
         │                │                │                │
         │                │                │                │
┌────────┴────────────────┴────────────────┴────────────────┐
│                   Business Logic Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Auth     │  │ Email    │  │ PDF      │  │ Storage  │   │
│  │ Handlers │  │ Sender   │  │ Generator│  │ Manager  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
         │                │                │                │
         │                │                │                │
┌────────┴────────────────┴────────────────┴────────────────┐
│                    Data Access Layer                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Supabase │  │ Storage  │  │ Redis    │  │ External │   │
│  │ Client   │  │ Client   │  │ (Future) │  │ APIs     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
         │                │                                  │
         ▼                ▼                                  ▼
┌──────────────┐  ┌──────────────┐              ┌──────────────┐
│  Supabase    │  │  Supabase    │              │  External    │
│  PostgreSQL  │  │  Storage     │              │  Services    │
│  Database    │  │  (S3-like)   │              │  (Slack, etc)│
└──────────────┘  └──────────────┘              └──────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Background Jobs (Inngest)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Payroll  │  │ Email    │  │ Token    │  │ Cleanup  │   │
│  │ Process  │  │ Queue    │  │ Refresh  │  │ Jobs     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Authentication Flow

```
1. User submits credentials
   ↓
2. API validates credentials against database
   ↓
3. Generate JWT token with user context
   ↓
4. Return token + user data to client
   ↓
5. Client stores token (secure cookie)
   ↓
6. Subsequent requests include token in Authorization header
   ↓
7. Middleware validates token and extracts user context
   ↓
8. Request proceeds with authenticated user context
```

### Leave Request Flow

```
1. Employee creates leave request
   ↓
2. Validate dates and leave balance
   ↓
3. Store request in database (status: pending)
   ↓
4. Queue email notification to manager
   ↓
5. Send push notification to manager
   ↓
6. Manager reviews and approves/rejects
   ↓
7. Update request status in database
   ↓
8. Queue email to employee
   ↓
9. Send push notification to employee
   ↓
10. If approved, create Google Calendar event (if integrated)
```

### Payroll Processing Flow

```
1. HR initiates payroll processing for period
   ↓
2. Queue background job (Inngest)
   ↓
3. Job fetches all active employees
   ↓
4. For each employee (batch of 10):
   - Calculate base salary
   - Calculate allowances
   - Calculate overtime
   - Calculate deductions (BPJS, PPh21)
   - Calculate net salary
   - Store in payroll_details table
   ↓
5. Generate PDF payslips for all employees
   ↓
6. Upload PDFs to storage
   ↓
7. Send email notifications with download links
   ↓
8. Send push notifications
   ↓
9. Update payroll period status (calculated)
```

## Database Schema

### Key Tables

**users**
- id (uuid, primary key)
- email (unique)
- password_hash
- role (employee|hr|manager|admin)
- created_at
- updated_at

**employees**
- id (uuid, primary key)
- employer_id (fk → employers)
- user_id (fk → users)
- full_name
- position
- department
- hire_date
- status (active|inactive)
- ...

**leave_requests**
- id (uuid, primary key)
- employee_id (fk → employees)
- leave_type
- start_date
- end_date
- days_count
- status (pending|approved|rejected)
- reason
- ...

**payroll_periods**
- id (uuid, primary key)
- employer_id (fk → employers)
- month
- year
- status (draft|processing|calculated)
- period_start
- period_end
- ...

**payroll_details**
- id (uuid, primary key)
- payroll_period_id (fk → payroll_periods)
- employee_id (fk → employees)
- base_salary
- allowances
- overtime
- gross_salary
- deductions
- net_salary
- ...

See `supabase/migrations/` for full schema.

## Security Architecture

### Authentication

- **Method**: JWT (JSON Web Tokens)
- **Storage**: Secure HTTP-only cookies
- **Expiry**: 7 days (configurable)
- **Refresh**: Automatic token refresh

### Authorization

- **RBAC**: Role-Based Access Control
- **Roles**: Employee, HR, Manager, Admin, Platform Admin
- **Enforcement**: Middleware + database RLS (Row Level Security)

### Data Protection

- **Encryption at Rest**: Supabase handles
- **Encryption in Transit**: HTTPS/TLS
- **Password Hashing**: bcrypt (strength: 12)
- **API Keys**: Environment variables, never committed
- **Sensitive Data**: Masked in logs and responses

### Row Level Security (RLS)

Example policies:

```sql
-- Employees can view their own data
CREATE POLICY "Employees view own data"
ON employees FOR SELECT
USING (auth.uid() = user_id);

-- HR can view all employees in their company
CREATE POLICY "HR view company employees"
ON employees FOR SELECT
USING (
  employer_id IN (
    SELECT employer_id FROM employees
    WHERE user_id = auth.uid()
    AND role = 'hr'
  )
);
```

## API Design

### RESTful Principles

- **Resources**: Nouns (employees, leave-requests)
- **HTTP Methods**: GET, POST, PUT, DELETE
- **Status Codes**: 200, 201, 400, 401, 404, 500
- **Versioning**: `/api/v1/...`

### Response Format

Consistent across all endpoints:

```json
{
  "success": boolean,
  "data": object | array,
  "error": { code, message } | undefined,
  "pagination": object | undefined
}
```

### Error Handling

- **Validation Errors**: `VAL_xxxx` codes
- **Auth Errors**: `AUTH_xxxx` codes
- **Business Logic Errors**: `BIZ_xxxx` codes
- **Server Errors**: `SRV_xxxx` codes

## Background Jobs

### Job Queue (Inngest)

**Benefits:**
- Serverless (no infrastructure)
- Type-safe event schemas
- Automatic retries
- Built-in observability
- Cron scheduling

**Job Types:**
1. **Payroll Processing**: Batch calculations
2. **Email Sending**: Async delivery
3. **Token Refresh**: OAuth token maintenance
4. **Workflow Execution**: Automated workflows
5. **Cleanup**: Expired data removal

**Job Lifecycle:**

```
Event Triggered
   ↓
Job Queued
   ↓
Job Executes (with retries)
   ↓
Success → Complete
Failure → Retry (exponential backoff)
   ↓
Max Retries → Dead Letter Queue
```

## File Storage

### Organization

```
buckets/
├── documents/
│   └── {company_id}/
│       ├── contracts/
│       ├── policies/
│       └── general/
├── payslips/
│   └── {company_id}/
│       └── {year}/
│           └── {month}/
├── avatars/
│   └── {user_id}/
└── temp/
    └── {session_id}/
```

### Access Control

- **Private Buckets**: documents, payslips
- **Public Buckets**: avatars (with restrictions)
- **Signed URLs**: For secure downloads (5min - 24hr expiry)

## Integrations

### OAuth Flow

```
1. User clicks "Connect Slack"
   ↓
2. Redirect to OAuth provider
   ↓
3. User authorizes application
   ↓
4. Provider redirects back with code
   ↓
5. Exchange code for access token
   ↓
6. Store tokens in database (encrypted)
   ↓
7. Test connection
   ↓
8. Mark integration as active
```

### Token Refresh

```
Scheduled Job (every 5 minutes)
   ↓
Check tokens expiring soon (<5min)
   ↓
For each expiring token:
   - Call provider refresh endpoint
   - Update database with new tokens
   - Log refresh status
```

## Scalability

### Horizontal Scaling

- **Frontend**: Vercel Edge Network
- **API**: Serverless functions (auto-scale)
- **Database**: Supabase Connection Pooler
- **Jobs**: Inngest auto-scaling

### Performance Optimization

1. **Database Indexing**: All foreign keys and frequently queried fields
2. **Connection Pooling**: Supabase Pooler (PgBouncer)
3. **Caching**: TanStack Query client-side caching
4. **CDN**: Static assets via Vercel Edge
5. **Image Optimization**: Next.js Image component

### Future Improvements

- Redis caching layer
- Database read replicas
- GraphQL API (Apollo)
- Microservices architecture
- Event sourcing for audit logs

## Monitoring & Observability

### Metrics

- **API Response Times**: <200ms p95
- **Error Rates**: <0.1%
- **Uptime**: 99.9% SLA
- **Job Success Rate**: >99%

### Logging

- **Application Logs**: Console + aggregation service
- **Access Logs**: Automatic (Vercel)
- **Error Logs**: Sentry integration
- **Audit Logs**: Database table

### Alerts

- **Critical Errors**: Immediate notification
- **Failed Jobs**: After 3 retries
- **High Error Rate**: >1% over 5min
- **Database Connection**: Connection pool exhaustion

## Disaster Recovery

### Backup Strategy

- **Database**: Automatic daily backups (Supabase)
- **File Storage**: Periodic snapshots
- **Code**: Git repository

### Recovery Procedures

1. **Database Restore**: Supabase dashboard or CLI
2. **File Restore**: From snapshots
3. **Code Deploy**: Vercel rollback or redeploy

### RTO/RPO

- **Recovery Time Objective**: <1 hour
- **Recovery Point Objective**: <24 hours

## Development Workflow

### Branch Strategy

- `main`: Production
- `develop`: Staging
- `feature/*`: Feature branches
- `fix/*`: Bug fixes
- `release/*`: Release candidates

### CI/CD Pipeline

```
Push to GitHub
   ↓
Run Tests (Vitest)
   ↓
Type Check (TypeScript)
   ↓
Lint (ESLint)
   ↓
Build Next.js
   ↓
Deploy to Vercel (preview)
   ↓
Merge to main → Production deploy
```

## Future Roadmap

- [ ] Mobile apps (React Native)
- [ ] Advanced analytics dashboard
- [ ] ML-powered insights
- [ ] Multi-language support
- [ ] Custom workflow builder
- [ ] Advanced role permissions
- [ ] Time tracking module
- [ ] Expense management
- [ ] Recruitment module
- [ ] Performance management 2.0
