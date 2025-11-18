# Job Queue System

This directory contains the job queue implementation using [Inngest](https://www.inngest.com/).

## Overview

Inngest is a serverless job queue that provides:
- **Automatic retries** with exponential backoff
- **Event-driven** job execution
- **Scheduled jobs** (cron)
- **Type-safe** event schemas
- **Built-in observability** and monitoring
- **No infrastructure** required (serverless)

## Architecture

```
src/
├── lib/queue/
│   ├── client.ts       # Inngest client and event schemas
│   ├── helpers.ts      # Helper functions for queueing jobs
│   ├── config.ts       # Configuration and constants
│   └── README.md       # This file
└── jobs/
    ├── index.ts        # Export all job functions
    ├── payroll.ts      # Payroll processing jobs
    ├── email.ts        # Email sending jobs
    ├── integrations.ts # OAuth token refresh jobs
    ├── workflow.ts     # Workflow execution jobs
    └── cleanup.ts      # Cleanup and maintenance jobs
```

## Setup

### 1. Install Inngest

```bash
npm install inngest
```

### 2. Environment Variables

Add to `.env.local`:

```env
# Inngest Configuration
INNGEST_EVENT_KEY=your_event_key_here
INNGEST_SIGNING_KEY=your_signing_key_here
```

For local development, these are optional. Inngest will work in development mode.

### 3. Run Inngest Dev Server

For local development with the Inngest dashboard:

```bash
npx inngest-cli dev
```

This starts a local Inngest server at `http://localhost:8288`

## Available Jobs

### Payroll Jobs

**`payroll/process`** - Process payroll for a period
- Calculates earnings and deductions for all employees
- Batch processing (10 employees at a time)
- Automatic retries on failure
- Sends completion notification

Usage:
```typescript
import { queuePayrollProcessing } from '@/lib/queue/helpers';

await queuePayrollProcessing(payrollPeriodId, companyId, initiatedBy);
```

### Email Jobs

**`email/send`** - Send individual email
- Automatic retry (3 attempts)
- Supports all email types (leave, payslip, welcome, etc.)
- Exponential backoff

**`email/send-batch`** - Send batch emails
- Concurrency limit: 10 emails at a time
- Parallel processing
- Failed email tracking

Usage:
```typescript
import { queueEmail, queueBatchEmails } from '@/lib/queue/helpers';

// Single email
await queueEmail('leave-approved', 'user@example.com', data);

// Batch emails
await queueBatchEmails([
  { to: 'user1@example.com', type: 'payslip-ready', data: { ... } },
  { to: 'user2@example.com', type: 'payslip-ready', data: { ... } },
]);
```

### Integration Jobs

**`integrations/refresh-tokens`** - Refresh OAuth tokens
- Refreshes expiring tokens (5min buffer)
- Handles Google Calendar and Zoom tokens
- Automatic retry (2 attempts)

**Scheduled: Token Refresh** (Every 5 minutes)
- Automatically refreshes all expiring tokens
- Runs in background

Usage:
```typescript
import { queueTokenRefresh } from '@/lib/queue/helpers';

// Refresh specific integration
await queueTokenRefresh(integrationId);

// Refresh all expiring tokens
await queueTokenRefresh();
```

### Workflow Jobs

**`workflow/execute`** - Execute automated workflow
- Runs workflow steps in sequence
- Supports email, notifications, status updates, webhooks
- Continues on error (configurable)

Usage:
```typescript
import { queueWorkflowExecution } from '@/lib/queue/helpers';

await queueWorkflowExecution(workflowId, triggerId, payload, companyId);
```

### Cleanup Jobs

**Scheduled: Cleanup Expired Tokens** (Daily at 2 AM)
- Deletes expired sessions (30+ days old)
- Deletes expired password reset tokens
- Deletes expired invitations (7+ days old)
- Cleans up temp files (24+ hours old)

**Scheduled: Archive Old Logs** (Monthly on 1st at 3 AM)
- Archives audit logs older than 1 year
- Moves to `audit_logs_archive` table

**Scheduled: Cleanup Failed Jobs** (Weekly on Sunday at 4 AM)
- Deletes failed workflow executions (30+ days old)

## API Endpoint

The job queue is served at `/api/inngest`. This endpoint is used by Inngest to:
- Register job functions
- Execute jobs
- Handle retries

**Do not call this endpoint directly.** Use the helper functions in `helpers.ts`.

## Monitoring

### Local Development

Access the Inngest dashboard at:
```
http://localhost:8288
```

You can view:
- Running jobs
- Failed jobs
- Job history
- Event logs
- Retry status

### Production

Access the Inngest dashboard at:
```
https://app.inngest.com
```

Features:
- Real-time job monitoring
- Error tracking
- Performance metrics
- Replay failed jobs

## Error Handling

All jobs have automatic retry logic:

- **Email jobs**: 3 retries with exponential backoff
- **Payroll jobs**: 3 retries
- **Integration jobs**: 2 retries
- **Workflow jobs**: 2 retries

Failed jobs are logged and can be:
1. Retried manually from the dashboard
2. Inspected for error details
3. Cancelled if needed

## Best Practices

### 1. Use Queue for Heavy Operations

Queue jobs for operations that:
- Take more than 2 seconds
- Process large batches
- Make external API calls
- Can be retried safely

### 2. Idempotent Jobs

Design jobs to be idempotent (can be run multiple times safely):

```typescript
// Good: Check if already processed
const existing = await db.getPayrollDetail(employeeId, periodId);
if (existing) {
  return existing; // Already processed
}

// Process payroll...
```

### 3. Error Handling

Always throw errors for retryable failures:

```typescript
const result = await externalApi.call();
if (!result.success) {
  throw new Error('API call failed'); // Will retry
}
```

### 4. Progress Tracking

Update progress in database for long-running jobs:

```typescript
await db.updatePayrollPeriod(periodId, {
  status: 'processing',
  progress: '50%',
});
```

## Adding New Jobs

1. Create job file in `/src/jobs/`:

```typescript
import { inngest } from '@/lib/queue/client';

export const myNewJob = inngest.createFunction(
  {
    id: 'my-new-job',
    name: 'My New Job',
    retries: 3,
  },
  { event: 'my/new-event' },
  async ({ event, step }) => {
    // Job logic here
    const result = await step.run('step-name', async () => {
      // Step logic
      return { success: true };
    });

    return result;
  }
);
```

2. Add event schema to `client.ts`:

```typescript
type Events = {
  'my/new-event': {
    data: {
      // Event data structure
    };
  };
};
```

3. Export from `/src/jobs/index.ts`:

```typescript
export { myNewJob } from './my-new-job';
```

4. Add to `allJobs` array in `index.ts`

5. Add helper function to `helpers.ts` (optional):

```typescript
export async function queueMyNewJob(data: MyData) {
  return sendEvent('my/new-event', data);
}
```

## Troubleshooting

### Jobs not executing

1. Check Inngest dev server is running:
   ```bash
   npx inngest-cli dev
   ```

2. Verify API endpoint is accessible:
   ```
   GET http://localhost:3000/api/inngest
   ```

3. Check environment variables are set

### Jobs failing

1. View error in Inngest dashboard
2. Check retry count and backoff
3. Manually retry from dashboard
4. Check logs for stack trace

### Performance issues

1. Review concurrency limits
2. Check batch sizes
3. Monitor job execution time
4. Add more step breakpoints for progress tracking

## References

- [Inngest Documentation](https://www.inngest.com/docs)
- [Next.js Integration](https://www.inngest.com/docs/sdk/serve#framework-next-js)
- [Event Schemas](https://www.inngest.com/docs/guides/writing-functions#type-safe-functions)
