# Setup Guide

Complete guide to setting up the HRIS application for development and production.

## Prerequisites

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Git**: Latest version
- **Supabase Account**: For database and storage
- **Firebase Account**: For push notifications (optional)
- **Email Service**: SendGrid or Resend account (optional)

## Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/hris-ai.git
cd hris-ai
```

### 2. Install Dependencies

```bash
npm install
```

If you encounter peer dependency issues:

```bash
npm install --legacy-peer-deps
```

### 3. Environment Variables

Create `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="HRIS Platform"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=7d

# Email (Choose one)
EMAIL_PROVIDER=resend  # or sendgrid
RESEND_API_KEY=re_xxxxxxxxxxxx
# or
SENDGRID_API_KEY=SG.xxxxxxxxxxxx

EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME="HRIS Platform"

# Firebase Cloud Messaging (Optional)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
FIREBASE_WEB_PUSH_CERTIFICATE=your-vapid-key

# Integrations (Optional)
SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret
SLACK_SIGNING_SECRET=your-slack-signing-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

ZOOM_CLIENT_ID=your-zoom-client-id
ZOOM_CLIENT_SECRET=your-zoom-client-secret

# Inngest (Optional for development)
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key

# OpenAI (Optional for AI features)
OPENAI_API_KEY=sk-xxxxxxxxxxxx
```

### 4. Database Setup

#### Using Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push database schema
supabase db push

# Seed database (optional)
npm run db:seed
```

#### Manual Setup:

1. Go to https://supabase.com/dashboard
2. Create new project
3. Go to SQL Editor
4. Run migration scripts from `supabase/migrations/`

### 5. Storage Buckets

Create storage buckets in Supabase:

1. Go to Storage in Supabase Dashboard
2. Create buckets:
   - `documents` (private)
   - `payslips` (private)
   - `avatars` (public)
   - `temp` (public)

3. Set bucket policies (example for documents):

```sql
-- Allow authenticated users to upload their company's documents
CREATE POLICY "Allow company uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.jwt() ->> 'company_id'
);

-- Allow users to download their company's documents
CREATE POLICY "Allow company downloads"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.jwt() ->> 'company_id'
);
```

### 6. Email Provider Setup

#### Resend (Recommended):

1. Sign up at https://resend.com
2. Create API key
3. Verify domain (for production)
4. Add API key to `.env.local`

#### SendGrid:

1. Sign up at https://sendgrid.com
2. Create API key
3. Verify sender identity
4. Add API key to `.env.local`

### 7. Firebase Setup (Optional)

1. Create Firebase project at https://console.firebase.google.com
2. Enable Cloud Messaging
3. Generate service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Download JSON file
4. Get Web Push certificate:
   - Go to Project Settings → Cloud Messaging
   - Generate Web Push certificate
5. Add credentials to `.env.local`

### 8. Start Development Server

```bash
# Start Next.js dev server
npm run dev

# In another terminal, start Inngest dev server (optional)
npx inngest-cli dev
```

Visit http://localhost:3000

## Production Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Or use Vercel Dashboard:
- Import GitHub repository
- Configure environment variables
- Deploy

3. **Configure Environment Variables**

In Vercel Dashboard → Settings → Environment Variables, add all variables from `.env.local`

4. **Configure Custom Domain**

- Add custom domain in Vercel Dashboard
- Update DNS records as instructed
- SSL will be auto-configured

### Self-Hosted Deployment

#### Using Docker:

```bash
# Build image
docker build -t hris-app .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL \
  -e SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY \
  # ... other env vars
  hris-app
```

#### Using PM2:

```bash
# Build application
npm run build

# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "hris" -- start

# Save PM2 configuration
pm2 save

# Setup auto-restart on reboot
pm2 startup
```

### Database Migrations

Run migrations before deploying:

```bash
# Supabase CLI
supabase db push

# Or manual SQL
psql $DATABASE_URL < supabase/migrations/xxx_migration.sql
```

### Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test authentication flow
- [ ] Test file uploads to storage
- [ ] Verify email sending works
- [ ] Test push notifications (if enabled)
- [ ] Check database connections
- [ ] Verify API rate limiting
- [ ] Test OAuth integrations (if enabled)
- [ ] Monitor error logs
- [ ] Set up monitoring (Sentry, etc.)

## Development Tools

### Inngest Dashboard

Monitor background jobs:

```bash
# Local development
npx inngest-cli dev

# Visit http://localhost:8288
```

### Supabase Studio

Manage database locally:

```bash
supabase start

# Visit http://localhost:54323
```

### Database Migrations

Create new migration:

```bash
supabase migration new migration_name
```

### Type Generation

Generate TypeScript types from database:

```bash
supabase gen types typescript --local > src/types/database.ts
```

## Common Issues

### Build Errors

**Issue**: Module not found errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Database Connection

**Issue**: Cannot connect to Supabase

- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `SUPABASE_SERVICE_ROLE_KEY` is set
- Ensure database is not paused (free tier)

### Email Not Sending

**Issue**: Emails not being delivered

- Verify API key is correct
- Check spam folder
- Verify sender domain (production)
- Check email provider dashboard for errors

### File Upload Fails

**Issue**: Cannot upload files

- Verify storage buckets exist
- Check bucket policies allow uploads
- Ensure file size is within limits (10MB default)
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct

### Jobs Not Running

**Issue**: Background jobs not executing

- Verify Inngest endpoint is accessible (`/api/inngest`)
- Check `INNGEST_EVENT_KEY` is set (production)
- Monitor Inngest dashboard for errors
- Ensure jobs are registered in `src/jobs/index.ts`

## Monitoring & Logging

### Error Tracking

Integrate Sentry:

```bash
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs
```

### Performance Monitoring

Use Vercel Analytics or custom solution:

```typescript
// pages/_app.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### Log Aggregation

Use LogDNA, Datadog, or similar:

```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
  },
});
```

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure cookies (httpOnly, secure, sameSite)
- [ ] Implement CORS properly
- [ ] Validate all inputs
- [ ] Sanitize user data
- [ ] Use parameterized queries (Supabase handles this)
- [ ] Rate limit all endpoints
- [ ] Implement CSP headers
- [ ] Regular dependency updates
- [ ] Secure environment variables
- [ ] Enable 2FA for admin accounts
- [ ] Regular security audits
- [ ] Backup database regularly

## Backup Strategy

### Database Backups

Supabase handles automatic backups, but you can also:

```bash
# Manual backup
pg_dump $DATABASE_URL > backup.sql

# Restore backup
psql $DATABASE_URL < backup.sql
```

### File Storage Backups

Use Supabase CLI:

```bash
# Download all files from bucket
supabase storage download documents --recursive
```

## Scaling Considerations

### Database

- Use connection pooling (Supabase Pooler)
- Add database indexes for frequently queried fields
- Consider read replicas for heavy read workloads

### Caching

- Implement Redis for session storage
- Cache API responses with appropriate TTL
- Use CDN for static assets

### Background Jobs

- Inngest scales automatically
- Monitor job execution times
- Implement job priority queues

## Support

- **Documentation**: https://docs.hris.com
- **GitHub Issues**: https://github.com/your-org/hris-ai/issues
- **Email**: support@hris.com
- **Discord**: https://discord.gg/hris
