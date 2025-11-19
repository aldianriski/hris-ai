# Testing Environment Setup & Execution Plan

**Version:** 1.0
**Created:** November 19, 2025
**Status:** 🟢 Ready for Setup & Execution

---

## 📋 Overview

This document provides a complete guide for setting up testing environments and executing comprehensive system tests for the HRIS application before production launch.

**Testing Coverage:**
- ✅ Branding/Marketing Site (40+ test scenarios)
- ✅ Employer Application (100+ test scenarios)
- ✅ CMS Admin Panel (45+ test scenarios)
- ✅ Platform Admin Dashboard
- ✅ API Integration Testing
- ✅ Security & Performance Testing

---

## 🎯 Testing Objectives

### Critical Success Criteria
1. **All 7 newly API-integrated components work correctly** (Performance, Payroll, Attendance, Documents, Support, Tenants)
2. **All critical user journeys complete without errors** (Onboarding, Payroll, Leave, Performance)
3. **Security fixes verified** (MFA encryption, OAuth, file uploads)
4. **No mock data visible to users** (7/9 components using real APIs)
5. **Production build succeeds** without dependency errors
6. **All environment variables validated** and configured

---

## 🏗️ Environment Setup

### 1. Development/Testing Environment

#### A. Prerequisites
```bash
# Required software
- Node.js v18+ (v20 recommended)
- npm v9+ or pnpm v8+
- PostgreSQL 15+
- Redis 7+
- Git

# Accounts required
- Supabase project (database + storage)
- OpenAI API key
- Upstash Redis (for rate limiting)
- Email service (SendGrid/Resend)
```

#### B. Environment Variables Setup

Create `.env.local` for testing:

```bash
# ====================
# DATABASE
# ====================
DATABASE_URL="postgresql://user:password@localhost:5432/hris_test"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# ====================
# APPLICATION
# ====================
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000/api"

# ====================
# SECURITY - MFA Encryption (CRITICAL!)
# ====================
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
MFA_ENCRYPTION_KEY="your-64-character-hex-string-here"

# ====================
# AI SERVICES
# ====================
OPENAI_API_KEY="sk-your-openai-api-key"
OPENAI_MODEL="gpt-4-turbo-preview"

# ====================
# CACHING & RATE LIMITING
# ====================
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# ====================
# EMAIL
# ====================
RESEND_API_KEY="re_your-resend-key"
SMTP_FROM="noreply@yourdomain.com"

# ====================
# OAUTH INTEGRATIONS
# ====================
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

SLACK_CLIENT_ID="your-slack-client-id"
SLACK_CLIENT_SECRET="your-slack-client-secret"

# ====================
# FILE STORAGE
# ====================
# Supabase Storage buckets (auto-configured)
# - documents
# - payslips
# - avatars
# - temp

# ====================
# OPTIONAL
# ====================
NEXT_PUBLIC_GA_TRACKING_ID="G-XXXXXXXXXX"
SENTRY_DSN="https://your-sentry-dsn"
```

#### C. Database Setup

```bash
# 1. Create test database
createdb hris_test

# 2. Run migrations
npx supabase db push

# 3. Seed test data (create seed script)
npm run db:seed:test
```

#### D. Supabase Storage Buckets

Create the following buckets in Supabase:

```sql
-- Run in Supabase SQL Editor

-- 1. Documents bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- 2. Payslips bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('payslips', 'payslips', false);

-- 3. Avatars bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- 4. Temp files bucket (private, auto-delete after 24h)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('temp', 'temp', false, 10485760); -- 10MB limit

-- Set up Row Level Security (RLS) policies
-- (Add policies based on your security requirements)
```

#### E. Install Dependencies

```bash
# Install packages
npm install

# Verify no dependency conflicts
npm ls react react-dom next

# Expected versions:
# - Next.js: 15.0.3 or compatible
# - React: 18.2.0 (NOT 19.x until Next.js supports it)
```

---

## 📊 Test Data Preparation

### 1. Create Test Users

```sql
-- Platform Admin
INSERT INTO users (email, role, first_name, last_name)
VALUES ('admin@test.com', 'super_admin', 'Admin', 'User');

-- HR Manager
INSERT INTO users (email, role, first_name, last_name)
VALUES ('hr@test.com', 'hr_manager', 'HR', 'Manager');

-- Employee
INSERT INTO users (email, role, first_name, last_name)
VALUES ('employee@test.com', 'employee', 'Test', 'Employee');

-- Support Staff
INSERT INTO users (email, role, first_name, last_name)
VALUES ('support@test.com', 'support_admin', 'Support', 'Staff');
```

### 2. Create Test Company/Tenant

```sql
-- Test Company
INSERT INTO tenants (company_name, slug, status, subscription_plan)
VALUES ('Test Company Inc', 'test-company', 'active', 'professional');

-- Link users to tenant
INSERT INTO user_tenants (user_id, tenant_id, role)
VALUES
  (1, 1, 'admin'),
  (2, 1, 'hr_manager'),
  (3, 1, 'employee');
```

### 3. Seed Test Data for Each Module

#### A. Employee Test Data
```sql
-- Create 10 test employees with various statuses
INSERT INTO employees (tenant_id, first_name, last_name, email, status, hired_date)
VALUES
  (1, 'John', 'Doe', 'john@test.com', 'active', '2024-01-15'),
  (1, 'Jane', 'Smith', 'jane@test.com', 'active', '2024-02-01'),
  (1, 'Bob', 'Johnson', 'bob@test.com', 'probation', '2024-11-01'),
  (1, 'Alice', 'Williams', 'alice@test.com', 'active', '2023-06-15'),
  (1, 'Charlie', 'Brown', 'charlie@test.com', 'on_leave', '2024-03-20'),
  -- Add more as needed
;
```

#### B. Payroll Test Data
```sql
-- Create payroll periods
INSERT INTO payroll_periods (tenant_id, period_month, period_year, status)
VALUES
  (1, 10, 2024, 'paid'),
  (1, 11, 2024, 'processing'),
  (1, 12, 2024, 'draft');

-- Create payslips for employees
INSERT INTO payslips (employee_id, period_id, gross_salary, total_deductions, net_salary, status)
VALUES
  (1, 1, 10000000, 400000, 9600000, 'paid'),
  (2, 1, 12000000, 500000, 11500000, 'paid');
```

#### C. Attendance Test Data
```sql
-- Create attendance records (last 30 days)
INSERT INTO attendance (employee_id, date, status, clock_in, clock_out, total_hours)
SELECT
  e.id,
  CURRENT_DATE - (n || ' days')::INTERVAL,
  CASE WHEN RANDOM() < 0.9 THEN 'present' ELSE 'absent' END,
  (CURRENT_DATE - (n || ' days')::INTERVAL + TIME '08:00:00')::TIMESTAMP,
  (CURRENT_DATE - (n || ' days')::INTERVAL + TIME '17:00:00')::TIMESTAMP,
  9.0
FROM employees e
CROSS JOIN generate_series(0, 29) AS n
WHERE e.tenant_id = 1 AND e.status = 'active';
```

#### D. Leave Requests Test Data
```sql
-- Create leave requests with different statuses
INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, status, reason)
VALUES
  (1, 'annual', '2024-12-20', '2024-12-31', 'approved', 'Year-end vacation'),
  (2, 'sick', '2024-11-18', '2024-11-19', 'pending', 'Medical appointment'),
  (3, 'annual', '2025-01-05', '2025-01-10', 'pending', 'Family visit');
```

#### E. Performance Reviews Test Data
```sql
-- Create performance reviews
INSERT INTO performance_reviews (employee_id, review_period, overall_rating, status, strengths, areas_for_improvement)
VALUES
  (1, 'Q3 2024', 4.5, 'completed', 'Excellent technical skills and teamwork', 'Could improve time management'),
  (2, 'Q3 2024', 4.0, 'completed', 'Great communication and leadership', 'Needs to focus on details'),
  (3, 'Q4 2024', 3.5, 'submitted', 'Good learning progress', 'Needs more initiative');
```

#### F. Documents Test Data
```sql
-- Create document records
INSERT INTO documents (employee_id, file_name, document_type, is_verified, expiry_date)
VALUES
  (1, 'john_doe_contract.pdf', 'contract', true, '2025-12-31'),
  (1, 'john_doe_id.pdf', 'id_card', true, NULL),
  (2, 'jane_smith_certificate.pdf', 'certificate', false, '2026-06-30');
```

#### G. Support Tickets Test Data
```sql
-- Create support tickets
INSERT INTO support_tickets (tenant_id, subject, priority, status, requester_email, requester_name)
VALUES
  (1, 'Issue with payroll calculation', 'high', 'open', 'hr@test.com', 'HR Manager'),
  (1, 'Question about leave policies', 'normal', 'in_progress', 'john@test.com', 'John Doe'),
  (1, 'Feature request: Custom reports', 'low', 'resolved', 'jane@test.com', 'Jane Smith');
```

---

## 🧪 Test Execution Plan

### Phase 1: Component-Level Testing (Newly Integrated APIs)

**Priority: HIGH** - Test all 7 components that were migrated from mock to real data

#### Test 1: TenantListTable
**Location:** Admin Panel → Tenants
**API:** `/api/platform/tenants`

**Test Cases:**
- [ ] Page loads without errors
- [ ] Displays all tenants from database
- [ ] Shows correct count (e.g., "Showing 4 of 4 tenants")
- [ ] Search filter works (type company name)
- [ ] Status filter works (Active, Trial, Suspended)
- [ ] Plan filter works (Starter, Professional, Enterprise)
- [ ] Loading state appears during fetch
- [ ] Error state shows on API failure
- [ ] Empty state shows when no tenants
- [ ] Tenant click navigation works

**Expected Results:**
- ✅ No mock data visible
- ✅ Real tenant data from database
- ✅ Filters update results correctly
- ✅ Loading spinner shows during fetch
- ✅ Error message with retry button on failure

---

#### Test 2: TenantSupportTab
**Location:** Admin Panel → Tenants → [Tenant] → Support Tab
**API:** `/api/platform/support?tenant_id={id}`

**Test Cases:**
- [ ] Tab loads without errors
- [ ] Displays support tickets for specific tenant
- [ ] Stats cards show correct counts (Open, In Progress, Resolved)
- [ ] Ticket list shows all tickets with correct data
- [ ] Ticket number displays correctly (#TKT-2024-XXX)
- [ ] Status chips show correct colors
- [ ] Priority chips show correct colors
- [ ] Created/updated dates format correctly
- [ ] Loading state appears during fetch
- [ ] Error state shows on API failure
- [ ] Empty state shows "No support tickets"

**Expected Results:**
- ✅ Real ticket data, not mock
- ✅ Stats calculated from actual data
- ✅ Proper date formatting
- ✅ Loading/error states work

---

#### Test 3: EmployeePerformanceHistory
**Location:** Employer App → Employees → [Employee] → Performance
**API:** `/api/v1/performance/reviews?employeeId={id}`

**Test Cases:**
- [ ] Component loads without errors
- [ ] Displays only completed reviews
- [ ] Shows average rating correctly calculated
- [ ] Rating card shows "N/A" when no ratings
- [ ] Review period displays correctly
- [ ] Overall rating displays as number (e.g., 4.5)
- [ ] Status chip shows correct color
- [ ] Completed/submitted date shows correctly
- [ ] Strengths section displays when available
- [ ] Areas for improvement shows when available
- [ ] Empty state shows "No performance reviews yet"
- [ ] Loading spinner appears
- [ ] Error state with retry button works

**Expected Results:**
- ✅ Real performance reviews from database
- ✅ Average rating calculated correctly
- ✅ All dates formatted properly
- ✅ No mock review data

---

#### Test 4: EmployeePayrollHistory
**Location:** Employer App → Employees → [Employee] → Payroll
**API:** `/api/v1/payroll/payslips/[employeeId]`

**Test Cases:**
- [ ] Component loads without errors
- [ ] Displays all payslips for employee
- [ ] Period displays as "Month YYYY" (e.g., "October 2024")
- [ ] Status chip shows correct color (Paid=green, Draft=gray)
- [ ] Gross salary formatted with Indonesian rupiah (Rp)
- [ ] Deductions shown in red with minus sign
- [ ] Net salary shown in green
- [ ] "Paid on" date shows when status is paid
- [ ] View button is clickable
- [ ] Download button is clickable
- [ ] Empty state shows "No payroll records yet"
- [ ] Loading state works
- [ ] Error state with retry works

**Expected Results:**
- ✅ Real payslip data from database
- ✅ Currency formatted correctly (Indonesian locale)
- ✅ Dates formatted properly
- ✅ Status colors match payroll status

---

#### Test 5: EmployeeAttendanceSummary
**Location:** Employer App → Employees → [Employee] → Attendance
**API:** `/api/v1/attendance/summary?employeeId={id}&startDate={start}&endDate={end}`

**Test Cases:**
- [ ] Component loads for current month
- [ ] Summary cards show correct data
- [ ] Present days count is accurate
- [ ] Late days count is accurate
- [ ] Absent days count is accurate
- [ ] Overtime hours show correctly
- [ ] Attendance rate calculates correctly (%)
- [ ] Punctuality rate calculates correctly (%)
- [ ] Average work hours displays (hours per day)
- [ ] Recent 5 attendance records show
- [ ] Clock in/out times format correctly
- [ ] Status chips show correct colors (Present=green, Late=yellow, Absent=red)
- [ ] Total hours displays per day
- [ ] Empty state shows "No attendance data available"
- [ ] Loading state works
- [ ] Error state with retry works

**Expected Results:**
- ✅ Real attendance data for current month
- ✅ All calculations accurate
- ✅ Percentages display correctly
- ✅ Time formatting is readable

---

#### Test 6: EmployeeDocumentsList
**Location:** Employer App → Employees → [Employee] → Documents
**API:** `/api/v1/documents?employeeId={id}`

**Test Cases:**
- [ ] Component loads without errors
- [ ] Displays all employee documents
- [ ] File name shows correctly
- [ ] Document type chip shows with correct color
- [ ] Uploaded date formats correctly
- [ ] Verified badge shows when is_verified=true
- [ ] Expiry date shows in orange when present
- [ ] View button is clickable
- [ ] Download button is clickable
- [ ] Upload button is visible
- [ ] Empty state shows "No documents uploaded yet"
- [ ] Loading state works
- [ ] Error state with retry works

**Expected Results:**
- ✅ Real document data from database
- ✅ Document types mapped correctly (Contract, ID Card, Certificate, etc.)
- ✅ Verification status visible
- ✅ Expiry warnings work

---

#### Test 7: TenantDetailView
**Location:** Admin Panel → Tenants → [Tenant ID]
**API:** `/api/platform/tenants/{id}`

**Test Cases:**
- [ ] Page loads without errors
- [ ] Company name displays in header
- [ ] Slug/ID shows below company name
- [ ] Status chip shows correct color
- [ ] Subscription plan chip shows
- [ ] Edit button is visible and clickable
- [ ] Suspend/Activate button shows based on status
- [ ] All tabs are clickable (Overview, Users, Billing, Usage, Settings, Audit, Support)
- [ ] Tab content loads correctly
- [ ] Loading spinner shows during initial load
- [ ] Error message shows on API failure

**Expected Results:**
- ✅ Real tenant data loads
- ✅ No mock tenant object used
- ✅ All tenant details accurate

---

### Phase 2: Critical User Journeys Testing

**Priority: HIGH** - Test end-to-end workflows

#### Journey 1: HR Manager Onboarding New Employee
**Estimated Time:** 15 minutes

**Steps:**
1. Login as HR Manager
2. Navigate to Employees → Add Employee
3. Fill in basic info (name, email, hired date)
4. Set position and department
5. Set salary information
6. Upload required documents (ID, contract)
7. Review and submit
8. Verify employee appears in list
9. Check employee detail page loads
10. Verify all data saved correctly

**Success Criteria:**
- ✅ Employee created successfully
- ✅ All fields saved to database
- ✅ Documents uploaded to Supabase Storage
- ✅ Employee shows in real-time list
- ✅ No errors in console

---

#### Journey 2: Processing Monthly Payroll
**Estimated Time:** 20 minutes

**Steps:**
1. Login as HR Manager
2. Navigate to Payroll → Periods
3. Create new payroll period for current month
4. System calculates all employee salaries
5. Review payslip details
6. Check deductions calculated correctly
7. Approve payroll period
8. Generate payslips for all employees
9. Verify payslips appear in EmployeePayrollHistory
10. Download sample payslip PDF

**Success Criteria:**
- ✅ Payroll period created
- ✅ All salaries calculated
- ✅ Deductions applied correctly
- ✅ Payslips generated and visible
- ✅ Real data shows in EmployeePayrollHistory component

---

#### Journey 3: Employee Submits and Manager Approves Leave
**Estimated Time:** 10 minutes

**Steps:**
1. Login as Employee
2. Navigate to Leave → Request Leave
3. Select leave type (Annual/Sick)
4. Choose date range
5. Enter reason
6. Submit request
7. Logout and login as Manager
8. Navigate to Leave → Pending Requests
9. Review leave request with AI insights (if available)
10. Approve or reject
11. Verify employee sees updated status

**Success Criteria:**
- ✅ Leave request created
- ✅ Manager sees in pending list
- ✅ Approval updates status
- ✅ Employee notified (if notifications enabled)
- ✅ Leave balance updated

---

#### Journey 4: Completing Performance Review
**Estimated Time:** 15 minutes

**Steps:**
1. Login as Manager
2. Navigate to Performance → Reviews
3. Start new review for employee
4. Fill in review period (Q4 2024)
5. Rate different competencies
6. Enter overall rating
7. Write strengths and areas for improvement
8. Submit review
9. Verify review status changes to "submitted"
10. Login as employee and check can view
11. Verify shows in EmployeePerformanceHistory component

**Success Criteria:**
- ✅ Performance review created
- ✅ Rating saved correctly
- ✅ Review visible in EmployeePerformanceHistory
- ✅ Average rating calculates correctly
- ✅ Status shows as "completed"

---

#### Journey 5: Attendance Check-in/Check-out
**Estimated Time:** 5 minutes

**Steps:**
1. Login as Employee
2. Navigate to Attendance → Today
3. Click "Clock In"
4. Verify time recorded
5. Wait 1 minute
6. Click "Clock Out"
7. Verify total hours calculated
8. Check attendance summary updates
9. Verify shows in EmployeeAttendanceSummary component
10. Check stats update (present days, hours)

**Success Criteria:**
- ✅ Clock in time recorded
- ✅ Clock out time recorded
- ✅ Total hours calculated
- ✅ Attendance summary shows data
- ✅ Recent records display correctly

---

#### Journey 6: Document Upload and Verification
**Estimated Time:** 10 minutes

**Steps:**
1. Login as Employee
2. Navigate to Profile → Documents
3. Click "Upload Document"
4. Select document type (Certificate)
5. Choose file from computer
6. Upload to Supabase Storage (not base64!)
7. Verify document appears in list
8. Check EmployeeDocumentsList component shows it
9. Login as HR to verify
10. HR marks document as verified
11. Verify badge shows on document

**Success Criteria:**
- ✅ File uploads to Supabase Storage
- ✅ Document record created in database
- ✅ Shows in EmployeeDocumentsList
- ✅ Verification status updates
- ✅ File is downloadable

---

#### Journey 7: Admin Managing Support Tickets
**Estimated Time:** 10 minutes

**Steps:**
1. Login as Platform Admin
2. Navigate to Tenants → [Select Tenant]
3. Go to Support tab
4. Verify TenantSupportTab loads
5. Check ticket stats are accurate
6. Click on an open ticket
7. Review ticket details
8. Add internal note
9. Change ticket status to "In Progress"
10. Verify stats update immediately
11. Close ticket
12. Verify stats update

**Success Criteria:**
- ✅ Real ticket data loads
- ✅ Stats calculate from database
- ✅ Status changes save
- ✅ Stats update in real-time
- ✅ Internal notes saved

---

### Phase 3: Security Testing

**Priority: CRITICAL** - Verify all security fixes

#### Security Test 1: MFA Encryption
**What was fixed:** Replaced base64 with AES-256-GCM

**Test Cases:**
- [ ] Enable 2FA on user account
- [ ] Verify MFA secret saved in database
- [ ] Check secret is NOT readable (encrypted)
- [ ] Verify MFA_ENCRYPTION_KEY env var is set
- [ ] Test MFA authentication works
- [ ] Disable and re-enable 2FA
- [ ] Verify old secrets can be decrypted

**Success Criteria:**
- ✅ Secrets stored encrypted in database
- ✅ Cannot decrypt without encryption key
- ✅ MFA auth succeeds with encrypted secret
- ✅ No plaintext secrets visible

---

#### Security Test 2: OAuth State Validation
**What was fixed:** Enhanced validation with structure checks

**Test Cases:**
- [ ] Initiate OAuth flow (Slack/Google)
- [ ] Capture OAuth redirect URL
- [ ] Verify state parameter exists
- [ ] Tamper with state parameter
- [ ] Attempt to complete OAuth
- [ ] Verify error is returned
- [ ] Test valid OAuth flow completes

**Success Criteria:**
- ✅ Invalid state rejected
- ✅ Tampered state rejected
- ✅ Valid state accepted
- ✅ No crashes on invalid state

---

#### Security Test 3: File Upload Security
**What was fixed:** Replaced base64 with Supabase Storage

**Test Cases:**
- [ ] Upload document (valid type: PDF)
- [ ] Verify saves to Supabase Storage
- [ ] Verify NOT base64 in database
- [ ] Attempt to upload invalid file type (exe)
- [ ] Verify rejection with error
- [ ] Attempt to upload large file (>10MB)
- [ ] Verify size limit enforced
- [ ] Download uploaded file
- [ ] Verify file integrity

**Success Criteria:**
- ✅ Files stored in Supabase Storage
- ✅ Database only stores file URL
- ✅ File type validation works
- ✅ File size limits enforced
- ✅ Downloaded files are not corrupted

---

#### Security Test 4: Environment Variable Validation
**What was fixed:** Added Zod validation with getAppUrl()

**Test Cases:**
- [ ] Remove NEXT_PUBLIC_APP_URL from env
- [ ] Start development server
- [ ] Verify environment validation error
- [ ] Set invalid URL format
- [ ] Verify validation fails
- [ ] Set correct URL
- [ ] Verify app starts successfully
- [ ] Check all OAuth redirects use correct URL
- [ ] Verify no localhost fallbacks in logs

**Success Criteria:**
- ✅ Missing env vars caught at startup
- ✅ Invalid formats rejected
- ✅ Production mode requires valid URL
- ✅ No localhost URLs in production

---

### Phase 4: Performance & Load Testing

#### Performance Test 1: Page Load Times
**Target:** < 3 seconds for initial page load

**Test Pages:**
- [ ] Dashboard (employer app)
- [ ] Employee list page
- [ ] Payroll overview
- [ ] Leave requests
- [ ] Attendance summary
- [ ] Documents page
- [ ] Admin panel dashboard

**Measure:**
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)

**Success Criteria:**
- ✅ TTFB < 600ms
- ✅ FCP < 1.8s
- ✅ LCP < 2.5s
- ✅ TTI < 3.8s

---

#### Performance Test 2: API Response Times
**Target:** < 500ms for most endpoints

**Test Endpoints:**
- [ ] GET /api/v1/employees
- [ ] GET /api/v1/performance/reviews
- [ ] GET /api/v1/payroll/payslips/[id]
- [ ] GET /api/v1/attendance/summary
- [ ] GET /api/v1/documents
- [ ] GET /api/platform/tenants
- [ ] GET /api/platform/support

**Success Criteria:**
- ✅ List endpoints < 500ms
- ✅ Detail endpoints < 300ms
- ✅ Search endpoints < 1s
- ✅ No timeouts

---

#### Performance Test 3: Concurrent Users
**Target:** Support 50 concurrent users

**Test Scenario:**
- [ ] Simulate 50 users accessing app
- [ ] 30% viewing dashboards
- [ ] 30% submitting forms
- [ ] 20% uploading files
- [ ] 20% viewing reports
- [ ] Monitor CPU, memory, database connections
- [ ] Check for errors or timeouts

**Success Criteria:**
- ✅ All requests complete successfully
- ✅ No significant degradation in response times
- ✅ Database connections handled properly
- ✅ No memory leaks

---

## 🏗️ Production Build Verification

### Step 1: Fix Dependency Issues

#### Issue: React 19 vs Next.js 15
```bash
# Check current versions
npm ls react react-dom next

# If React 19 is installed, downgrade to 18.2.0
npm install react@18.2.0 react-dom@18.2.0

# Or update Next.js when React 19 support is available
npm install next@latest
```

#### Issue: @heroui Package
```bash
# Verify @heroui package exists
npm ls @heroui/react

# If not found, check if it should be @nextui-org
# Update imports if needed
find src -name "*.tsx" -type f -exec sed -i 's/@heroui/@nextui-org/g' {} +
```

---

### Step 2: Run Production Build

```bash
# Clean previous builds
rm -rf .next
rm -rf out

# Build for production
npm run build

# Expected output:
# - Compiled successfully
# - No TypeScript errors
# - No dependency warnings
# - Build size report
```

**Success Criteria:**
- ✅ Build completes without errors
- ✅ No TypeScript compilation errors
- ✅ No missing dependencies
- ✅ Bundle size is reasonable
- ✅ All routes generated correctly

---

### Step 3: Test Production Build Locally

```bash
# Start production server
npm run start

# Test in browser
# Navigate to http://localhost:3000
```

**Test Checklist:**
- [ ] Homepage loads
- [ ] Can login successfully
- [ ] Dashboard displays
- [ ] All newly integrated components work
- [ ] No console errors
- [ ] API calls succeed
- [ ] Files can be uploaded
- [ ] Forms can be submitted

---

### Step 4: Environment Variables Checklist

**Production .env requirements:**

```bash
# CRITICAL - Must be set
✅ MFA_ENCRYPTION_KEY (64-char hex)
✅ NEXT_PUBLIC_APP_URL (production domain)
✅ DATABASE_URL (production database)
✅ SUPABASE_SERVICE_ROLE_KEY

# IMPORTANT - Recommended
✅ OPENAI_API_KEY
✅ UPSTASH_REDIS_REST_URL
✅ UPSTASH_REDIS_REST_TOKEN
✅ RESEND_API_KEY

# OPTIONAL - If using features
⚪ SLACK_CLIENT_ID
⚪ GOOGLE_CLIENT_ID
⚪ SENTRY_DSN
⚪ NEXT_PUBLIC_GA_TRACKING_ID
```

**Validation:**
```bash
# Run environment validation script
node -e "require('./src/lib/config/env.ts')"

# Should pass without errors
```

---

## 📝 Test Execution Tracking

### Master Checklist

**Phase 1: Component Testing**
- [ ] Test 1: TenantListTable (Passed / Failed)
- [ ] Test 2: TenantSupportTab (Passed / Failed)
- [ ] Test 3: EmployeePerformanceHistory (Passed / Failed)
- [ ] Test 4: EmployeePayrollHistory (Passed / Failed)
- [ ] Test 5: EmployeeAttendanceSummary (Passed / Failed)
- [ ] Test 6: EmployeeDocumentsList (Passed / Failed)
- [ ] Test 7: TenantDetailView (Passed / Failed)

**Phase 2: User Journeys**
- [ ] Journey 1: Onboarding Employee (Passed / Failed)
- [ ] Journey 2: Processing Payroll (Passed / Failed)
- [ ] Journey 3: Leave Approval (Passed / Failed)
- [ ] Journey 4: Performance Review (Passed / Failed)
- [ ] Journey 5: Attendance Tracking (Passed / Failed)
- [ ] Journey 6: Document Management (Passed / Failed)
- [ ] Journey 7: Support Tickets (Passed / Failed)

**Phase 3: Security Testing**
- [ ] Security Test 1: MFA Encryption (Passed / Failed)
- [ ] Security Test 2: OAuth Validation (Passed / Failed)
- [ ] Security Test 3: File Upload Security (Passed / Failed)
- [ ] Security Test 4: Env Validation (Passed / Failed)

**Phase 4: Performance**
- [ ] Performance Test 1: Page Load Times (Passed / Failed)
- [ ] Performance Test 2: API Response Times (Passed / Failed)
- [ ] Performance Test 3: Concurrent Users (Passed / Failed)

**Production Build**
- [ ] Dependencies resolved (Passed / Failed)
- [ ] Build succeeds (Passed / Failed)
- [ ] Production test (Passed / Failed)
- [ ] Environment variables validated (Passed / Failed)

---

## 🐛 Bug Tracking Template

For each failed test, document:

```markdown
### Bug #[Number]: [Brief Description]

**Severity:** Critical / High / Medium / Low
**Test:** [Which test case]
**Component:** [Affected component/API]

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots/Logs:**
[Attach if applicable]

**Environment:**
- Browser: [Chrome/Firefox/Safari]
- OS: [Windows/Mac/Linux]
- Node version: [X.X.X]

**Priority:** [Must fix before launch / Can defer]
```

---

## 📊 Test Results Summary Template

```markdown
# Test Execution Summary

**Date:** [YYYY-MM-DD]
**Tester:** [Name]
**Environment:** Development / Staging / Production
**Build Version:** [Git commit hash]

## Overall Results

- **Total Tests:** [X]
- **Passed:** [X] ([X]%)
- **Failed:** [X] ([X]%)
- **Blocked:** [X] ([X]%)
- **Not Executed:** [X] ([X]%)

## Critical Issues Found

1. [Issue description]
2. [Issue description]
3. [Issue description]

## Recommendations

- [ ] Ready for production deployment
- [ ] Needs fixes before deployment
- [ ] Requires additional testing

## Next Steps

1. [Action item]
2. [Action item]
3. [Action item]
```

---

## 🎯 Success Criteria for Production Launch

### Must Have (Blockers)
- ✅ All 7 API-integrated components work without errors
- ✅ All security fixes verified and working
- ✅ Production build succeeds
- ✅ All environment variables configured
- ✅ Database migrations applied
- ✅ Supabase Storage buckets created
- ✅ No mock data visible to users
- ✅ Critical user journeys complete successfully
- ✅ No console errors on production build

### Should Have (Important but not blocking)
- ⚪ All 185+ test scenarios passed
- ⚪ Performance benchmarks met
- ⚪ Load testing completed
- ⚪ Error monitoring configured (Sentry)
- ⚪ Analytics configured (GA)

### Nice to Have (Can be added post-launch)
- ⚪ Timeline API implementation (Sprint 2)
- ⚪ Recognition Wall API implementation (Sprint 2)
- ⚪ TypeScript @ts-ignore fixes (Sprint 2)
- ⚪ Additional performance optimizations
- ⚪ Advanced monitoring dashboards

---

## 📚 Additional Resources

### Testing Documentation
- `EMPLOYER_APP_TESTING_MAP.md` - Comprehensive employer app testing guide (100+ scenarios)
- `CMS_ADMIN_TESTING_MAP.md` - Admin panel testing guide (45+ scenarios)
- `CMS_ADMIN_TEST_SCENARIOS.md` - Detailed admin test cases
- `TESTING_DOCUMENTATION_INDEX.md` - Index of all testing docs

### Development Documentation
- `CRITICAL_FIXES_PROGRESS.md` - Security fixes and mock data status
- `PRE_LAUNCH_AUDIT_REPORT.md` - Full audit results
- `PRODUCTION_BUILD_READINESS.md` - Build configuration guide
- `src/lib/config/env.ts` - Environment variable validation

### API Documentation
- Check Swagger/OpenAPI docs if available
- Review `src/app/api/` for endpoint implementations

---

## 🤝 Support

**Questions or Issues?**
- Check existing documentation first
- Review component file comments for API specs
- Check `CRITICAL_FIXES_PROGRESS.md` for known issues
- Review console logs for errors
- Check Supabase dashboard for database/storage issues

**Critical Blockers:**
- Contact development team immediately
- Document in Bug Tracking section
- Mark as "Blocker" priority

---

**Document Version:** 1.0
**Last Updated:** November 19, 2025
**Status:** ✅ Ready for Test Execution
