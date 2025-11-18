# HRIS AI Platform - API Implementation Plan

**Version:** 1.0
**Date:** 2025-11-18
**Status:** Planning Phase

---

## 📋 TABLE OF CONTENTS

1. [API Architecture Overview](#api-architecture-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Module-by-Module API Endpoints](#module-by-module-api-endpoints)
4. [Implementation Sequence](#implementation-sequence)
5. [Database Schema Reference](#database-schema-reference)
6. [Error Handling Standards](#error-handling-standards)
7. [Testing Strategy](#testing-strategy)

---

## 🏗️ API Architecture Overview

### Technology Stack
- **Framework:** Next.js 15 App Router (Route Handlers)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Validation:** Zod
- **Rate Limiting:** Upstash Redis
- **Caching:** React Cache / Supabase Cache
- **Error Tracking:** Sentry

### API Structure
```
src/app/api/
├── v1/
│   ├── auth/              # Authentication endpoints
│   ├── employees/         # Employee management
│   ├── attendance/        # Attendance tracking
│   ├── leaves/            # Leave management
│   ├── payroll/           # Payroll processing
│   ├── performance/       # Performance reviews
│   ├── documents/         # Document management
│   ├── workflows/         # Workflow automation
│   ├── analytics/         # Analytics & reporting
│   ├── integrations/      # External integrations
│   ├── webhooks/          # Webhook management
│   ├── gamification/      # Badges, leaderboards
│   ├── compliance/        # Audit & GDPR
│   └── help/              # Help center
└── webhooks/              # Incoming webhooks from external services
```

### Response Format
```typescript
// Success Response
{
  success: true,
  data: T,
  meta?: {
    page: number,
    limit: number,
    total: number
  }
}

// Error Response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

---

## 🔐 Authentication & Authorization

### Authentication Endpoints

#### 1. POST `/api/v1/auth/login`
**Purpose:** User login with email/password
**Auth:** Public
**Request:**
```typescript
{
  email: string;
  password: string;
}
```
**Response:**
```typescript
{
  success: true,
  data: {
    user: User,
    session: Session,
    accessToken: string,
    refreshToken: string
  }
}
```
**Implementation:**
- Use Supabase Auth `signInWithPassword()`
- Return session tokens
- Log security event

#### 2. POST `/api/v1/auth/logout`
**Purpose:** User logout
**Auth:** Required
**Implementation:**
- Supabase Auth `signOut()`
- Invalidate session
- Log security event

#### 3. POST `/api/v1/auth/refresh`
**Purpose:** Refresh access token
**Auth:** Refresh token required
**Request:**
```typescript
{
  refreshToken: string;
}
```

#### 4. POST `/api/v1/auth/forgot-password`
**Purpose:** Send password reset email
**Auth:** Public
**Request:**
```typescript
{
  email: string;
}
```

#### 5. POST `/api/v1/auth/reset-password`
**Purpose:** Reset password with token
**Auth:** Public
**Request:**
```typescript
{
  token: string;
  newPassword: string;
}
```

### MFA Endpoints

#### 6. POST `/api/v1/auth/mfa/setup`
**Purpose:** Generate TOTP secret and QR code
**Auth:** Required
**Response:**
```typescript
{
  secret: string,
  qrCode: string, // base64 image
  backupCodes: string[]
}
```
**Implementation:**
- Generate TOTP secret using `otplib`
- Create QR code using `qrcode`
- Generate 10 backup codes
- Store in `user_mfa_settings` table

#### 7. POST `/api/v1/auth/mfa/verify`
**Purpose:** Verify TOTP code and enable MFA
**Auth:** Required
**Request:**
```typescript
{
  code: string;
}
```

#### 8. POST `/api/v1/auth/mfa/disable`
**Purpose:** Disable MFA
**Auth:** Required + Password confirmation

---

## 📊 Module 1: Employee Management

### Employee CRUD

#### 1. GET `/api/v1/employees`
**Purpose:** List all employees with pagination & filters
**Auth:** Required (read:employees)
**Query Params:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: 'active' | 'inactive' | 'terminated';
  sortBy?: 'name' | 'joinDate' | 'department';
  sortOrder?: 'asc' | 'desc';
}
```
**Response:**
```typescript
{
  success: true,
  data: Employee[],
  meta: {
    page: 1,
    limit: 20,
    total: 247,
    totalPages: 13
  }
}
```
**Database Query:**
```sql
SELECT * FROM employees
WHERE company_id = $1
  AND status = $2
  AND (name ILIKE $3 OR email ILIKE $3)
ORDER BY created_at DESC
LIMIT $4 OFFSET $5;
```

#### 2. GET `/api/v1/employees/:id`
**Purpose:** Get single employee details
**Auth:** Required
**Response:**
```typescript
{
  success: true,
  data: {
    ...employee,
    documents: Document[],
    attendance: AttendanceSummary,
    leaves: LeaveBalance,
    performance: PerformanceSummary
  }
}
```

#### 3. POST `/api/v1/employees`
**Purpose:** Create new employee
**Auth:** Required (write:employees)
**Request:**
```typescript
{
  fullName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  employmentType: string;
  joinDate: string;
  salary: number;
  // ... more fields
}
```
**Implementation:**
1. Validate input with Zod
2. Check if email already exists
3. Insert into `employees` table
4. Create user account in Supabase Auth
5. Trigger `employee.created` webhook event
6. Send welcome email
7. Create audit log

#### 4. PATCH `/api/v1/employees/:id`
**Purpose:** Update employee
**Auth:** Required (write:employees)
**Implementation:**
1. Validate input
2. Get old values for audit trail
3. Update employee record
4. Create audit log with before/after values
5. Trigger `employee.updated` webhook

#### 5. DELETE `/api/v1/employees/:id`
**Purpose:** Soft delete employee (terminate)
**Auth:** Required (write:employees)
**Implementation:**
1. Set status to 'terminated'
2. Set termination_date
3. Trigger offboarding workflow
4. Trigger `employee.terminated` webhook
5. Create audit log

---

## 🕐 Module 2: Attendance Management

#### 1. POST `/api/v1/attendance/clock-in`
**Purpose:** Clock in employee
**Auth:** Required
**Request:**
```typescript
{
  employeeId: string;
  clockInTime?: string; // Optional, defaults to now
  location?: {
    lat: number;
    lng: number;
  };
  workMode: 'office' | 'remote' | 'hybrid';
  notes?: string;
}
```
**Implementation:**
1. Check if already clocked in today
2. Validate location if office mode
3. Insert into `attendance` table
4. Calculate if late (compare with shift start time)
5. Trigger `attendance.clocked_in` webhook
6. Create audit log

#### 2. POST `/api/v1/attendance/clock-out`
**Purpose:** Clock out employee
**Auth:** Required
**Request:**
```typescript
{
  attendanceId: string;
  clockOutTime?: string;
  notes?: string;
}
```
**Implementation:**
1. Find active attendance record
2. Update clock_out_time
3. Calculate total hours worked
4. Calculate overtime if applicable
5. Update status
6. Trigger `attendance.clocked_out` webhook

#### 3. GET `/api/v1/attendance`
**Purpose:** Get attendance records
**Auth:** Required
**Query Params:**
```typescript
{
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  page?: number;
  limit?: number;
}
```

#### 4. GET `/api/v1/attendance/summary/:employeeId`
**Purpose:** Get attendance summary for employee
**Auth:** Required
**Response:**
```typescript
{
  totalDays: number,
  presentDays: number,
  absentDays: number,
  lateDays: number,
  overtimeHours: number,
  attendanceRate: number
}
```
**Database Query:**
```sql
SELECT
  COUNT(*) as total_days,
  COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days,
  COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_days,
  COUNT(CASE WHEN is_late = true THEN 1 END) as late_days,
  SUM(overtime_hours) as overtime_hours
FROM attendance
WHERE employee_id = $1
  AND DATE(clock_in_time) BETWEEN $2 AND $3;
```

---

## 🏖️ Module 3: Leave Management

#### 1. POST `/api/v1/leaves`
**Purpose:** Submit leave request
**Auth:** Required
**Request:**
```typescript
{
  employeeId: string;
  leaveType: 'annual' | 'sick' | 'emergency' | 'unpaid' | 'maternity' | 'paternity';
  startDate: string;
  endDate: string;
  reason: string;
  attachments?: string[];
}
```
**Implementation:**
1. Validate dates (start < end, not in past)
2. Check leave balance
3. Calculate working days
4. Insert into `leave_requests` table
5. Trigger approval workflow
6. Trigger `leave.submitted` webhook
7. Notify manager (email/Slack)
8. Create audit log

#### 2. GET `/api/v1/leaves`
**Purpose:** Get leave requests
**Auth:** Required
**Query Params:**
```typescript
{
  employeeId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  leaveType?: string;
  startDate?: string;
  endDate?: string;
}
```

#### 3. PATCH `/api/v1/leaves/:id/approve`
**Purpose:** Approve leave request
**Auth:** Required (manager or HR)
**Request:**
```typescript
{
  comments?: string;
}
```
**Implementation:**
1. Check if user has approval permission
2. Update status to 'approved'
3. Deduct from leave balance
4. Update approver info
5. Trigger `leave.approved` webhook
6. Notify employee
7. Create audit log

#### 4. PATCH `/api/v1/leaves/:id/reject`
**Purpose:** Reject leave request
**Auth:** Required (manager or HR)
**Request:**
```typescript
{
  reason: string;
}
```

#### 5. GET `/api/v1/leaves/balance/:employeeId`
**Purpose:** Get leave balance
**Auth:** Required
**Response:**
```typescript
{
  annual: { total: 12, used: 4, remaining: 8 },
  sick: { total: 0, used: 2, remaining: 0 }, // Unlimited
  emergency: { total: 3, used: 1, remaining: 2 },
  carryForward: 3
}
```

---

## 💰 Module 4: Payroll Management

#### 1. GET `/api/v1/payroll`
**Purpose:** Get payroll records
**Auth:** Required (HR only)
**Query Params:**
```typescript
{
  month?: string;
  year?: number;
  employeeId?: string;
  status?: 'pending' | 'processed' | 'paid';
}
```

#### 2. GET `/api/v1/payroll/:id`
**Purpose:** Get payroll details
**Auth:** Required
**Response:**
```typescript
{
  employeeId: string,
  month: string,
  basicSalary: number,
  allowances: {
    transport: number,
    meal: number,
    housing: number
  },
  deductions: {
    bpjs_kesehatan: number,
    bpjs_ketenagakerjaan: number,
    pph21: number,
    loan: number
  },
  netSalary: number,
  status: string
}
```

#### 3. POST `/api/v1/payroll/process`
**Purpose:** Process monthly payroll
**Auth:** Required (HR only)
**Request:**
```typescript
{
  month: string;
  year: number;
  employeeIds?: string[]; // Optional, all employees if not specified
}
```
**Implementation:**
1. Get all active employees
2. For each employee:
   - Calculate basic salary
   - Calculate allowances
   - Calculate attendance deductions
   - Calculate BPJS (Kesehatan 4%, Ketenagakerjaan 5.7%)
   - Calculate PPh21 tax
   - Calculate loan deductions
   - Calculate net salary
3. Insert into `payroll` table
4. Trigger `payroll.processed` webhook
5. Generate payslips (PDF)
6. Send to accounting integration
7. Create audit log

#### 4. POST `/api/v1/payroll/:id/mark-paid`
**Purpose:** Mark payroll as paid
**Auth:** Required (HR only)
**Implementation:**
1. Update status to 'paid'
2. Set payment_date
3. Notify employee
4. Create audit log

#### 5. GET `/api/v1/payroll/:id/payslip`
**Purpose:** Download payslip PDF
**Auth:** Required
**Response:** PDF file

---

## 📈 Module 5: Performance Management

#### 1. GET `/api/v1/performance/reviews`
**Purpose:** Get performance reviews
**Auth:** Required
**Query Params:**
```typescript
{
  employeeId?: string;
  reviewerId?: string;
  period?: string;
  status?: 'pending' | 'completed';
}
```

#### 2. POST `/api/v1/performance/reviews`
**Purpose:** Create performance review
**Auth:** Required (manager)
**Request:**
```typescript
{
  employeeId: string;
  reviewPeriod: string;
  reviewType: 'quarterly' | 'annual' | '360';
  dueDate: string;
}
```

#### 3. PATCH `/api/v1/performance/reviews/:id`
**Purpose:** Submit performance review
**Auth:** Required
**Request:**
```typescript
{
  rating: number; // 1-5
  strengths: string;
  areasForImprovement: string;
  goals: Goal[];
  overallFeedback: string;
}
```

#### 4. GET `/api/v1/performance/goals`
**Purpose:** Get goals/OKRs
**Auth:** Required

#### 5. POST `/api/v1/performance/goals`
**Purpose:** Create goal/OKR
**Auth:** Required

---

## 📄 Module 6: Document Management

#### 1. POST `/api/v1/documents/upload`
**Purpose:** Upload document
**Auth:** Required
**Request:** Multipart form data
```typescript
{
  file: File;
  employeeId: string;
  documentType: string;
  category: string;
  expiryDate?: string;
}
```
**Implementation:**
1. Validate file type and size
2. Upload to Supabase Storage
3. Generate file URL
4. Insert metadata into `documents` table
5. If KTP/NPWP, trigger AI extraction
6. Trigger `document.uploaded` webhook
7. Create audit log

#### 2. GET `/api/v1/documents`
**Purpose:** Get documents
**Auth:** Required
**Query Params:**
```typescript
{
  employeeId?: string;
  category?: string;
  documentType?: string;
  status?: string;
}
```

#### 3. GET `/api/v1/documents/:id/download`
**Purpose:** Download document
**Auth:** Required
**Response:** File stream

#### 4. PATCH `/api/v1/documents/:id/verify`
**Purpose:** Verify document (HR only)
**Auth:** Required (HR)

#### 5. DELETE `/api/v1/documents/:id`
**Purpose:** Delete document
**Auth:** Required

---

## 🔄 Module 7: Workflow Automation

#### 1. GET `/api/v1/workflows`
**Purpose:** Get workflows
**Auth:** Required

#### 2. POST `/api/v1/workflows`
**Purpose:** Create workflow
**Auth:** Required (admin)
**Request:**
```typescript
{
  name: string;
  description: string;
  trigger: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
```

#### 3. POST `/api/v1/workflows/:id/execute`
**Purpose:** Execute workflow
**Auth:** System/Trigger
**Implementation:**
1. Load workflow definition
2. Execute nodes in order
3. Handle conditions/branches
4. Execute actions (email, webhook, etc.)
5. Log execution results
6. Update workflow run statistics

---

## 📊 Module 8: Analytics & Reporting

#### 1. GET `/api/v1/analytics/executive-dashboard`
**Purpose:** Get executive KPIs
**Auth:** Required (manager/HR)
**Response:**
```typescript
{
  headcount: {
    total: number,
    growth: number
  },
  turnover: {
    rate: number,
    trend: number
  },
  // ... more KPIs
}
```

#### 2. GET `/api/v1/analytics/attendance`
**Purpose:** Get attendance analytics
**Auth:** Required

#### 3. GET `/api/v1/analytics/leave`
**Purpose:** Get leave analytics

#### 4. GET `/api/v1/analytics/payroll`
**Purpose:** Get payroll analytics

#### 5. GET `/api/v1/analytics/performance`
**Purpose:** Get performance analytics

#### 6. GET `/api/v1/analytics/predictive/attrition`
**Purpose:** Get attrition risk predictions
**Implementation:**
1. Fetch employee data
2. Calculate risk scores based on:
   - Tenure
   - Performance trends
   - Salary growth
   - Engagement scores
   - Leave patterns
3. Return ranked list with recommendations

---

## 🔌 Module 9: Integration Management

#### 1. GET `/api/v1/integrations/catalog`
**Purpose:** Get available integrations
**Auth:** Required

#### 2. POST `/api/v1/integrations/install`
**Purpose:** Install integration
**Auth:** Required (admin)
**Request:**
```typescript
{
  integrationId: string;
  credentials: {
    apiKey?: string;
    oauthToken?: string;
    // ... integration-specific
  };
  settings: {
    syncFrequency: string;
    // ... integration-specific
  };
}
```

#### 3. POST `/api/v1/integrations/:id/sync`
**Purpose:** Trigger integration sync
**Auth:** Required (admin)
**Implementation:**
1. Load integration config
2. Authenticate with external service
3. Fetch data from external service
4. Transform and map fields
5. Import/export data
6. Log sync results
7. Update last_sync_at

#### 4. GET `/api/v1/integrations/:id/logs`
**Purpose:** Get integration sync logs

---

## 🪝 Module 10: Webhook Management

#### 1. POST `/api/v1/webhooks`
**Purpose:** Create webhook
**Auth:** Required (admin)
**Request:**
```typescript
{
  name: string;
  endpointUrl: string;
  events: string[];
  secretKey?: string;
  retryPolicy?: {
    maxRetries: number;
    backoff: 'exponential' | 'linear';
  };
}
```

#### 2. GET `/api/v1/webhooks`
**Purpose:** Get webhooks

#### 3. DELETE `/api/v1/webhooks/:id`
**Purpose:** Delete webhook

#### 4. GET `/api/v1/webhooks/:id/deliveries`
**Purpose:** Get webhook delivery logs

#### 5. POST `/api/v1/webhooks/:id/test`
**Purpose:** Test webhook
**Implementation:**
1. Send test payload to endpoint
2. Record response
3. Return success/failure

---

## 🎮 Module 11: Gamification

#### 1. GET `/api/v1/gamification/badges`
**Purpose:** Get all badges

#### 2. GET `/api/v1/gamification/badges/user/:userId`
**Purpose:** Get user's earned badges

#### 3. POST `/api/v1/gamification/badges/award`
**Purpose:** Award badge to user
**Auth:** System/Auto
**Request:**
```typescript
{
  userId: string;
  badgeId: string;
  metadata?: any;
}
```
**Implementation:**
1. Check if already earned
2. Insert into `user_badges`
3. Award points
4. Update user level
5. Notify user
6. Create audit log

#### 4. GET `/api/v1/gamification/leaderboard`
**Purpose:** Get leaderboard
**Query Params:**
```typescript
{
  category: 'overall' | 'attendance' | 'performance' | 'learning' | 'recognition';
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}
```

#### 5. POST `/api/v1/gamification/recognize`
**Purpose:** Give recognition to peer
**Auth:** Required
**Request:**
```typescript
{
  toUserId: string;
  type: 'thank_you' | 'great_work' | 'team_player' | 'helpful' | 'innovative';
  message: string;
}
```

#### 6. POST `/api/v1/gamification/surveys`
**Purpose:** Submit pulse check survey

---

## 🛡️ Module 12: Compliance & Audit

#### 1. GET `/api/v1/compliance/audit-logs`
**Purpose:** Get audit logs
**Auth:** Required (admin)
**Query Params:**
```typescript
{
  userId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
}
```

#### 2. POST `/api/v1/compliance/gdpr/export-request`
**Purpose:** Request data export
**Auth:** Required
**Implementation:**
1. Create export request record
2. Queue background job to gather all user data
3. Generate JSON export
4. Upload to Supabase Storage
5. Generate signed URL (expires in 7 days)
6. Email user with download link
7. Update request status

#### 3. POST `/api/v1/compliance/gdpr/delete-request`
**Purpose:** Request data deletion
**Auth:** Required

#### 4. GET `/api/v1/compliance/gdpr/consents/:userId`
**Purpose:** Get user's consents

#### 5. POST `/api/v1/compliance/gdpr/consent`
**Purpose:** Record consent
**Auth:** Required

---

## 📚 Module 13: Help Center

#### 1. GET `/api/v1/help/articles`
**Purpose:** Get help articles
**Query Params:**
```typescript
{
  category?: string;
  search?: string;
}
```

#### 2. GET `/api/v1/help/articles/:id`
**Purpose:** Get article details

#### 3. POST `/api/v1/help/articles/:id/feedback`
**Purpose:** Submit article feedback
**Request:**
```typescript
{
  helpful: boolean;
  comment?: string;
}
```

---

## 🔢 Implementation Sequence (Priority Order)

### **Week 1: Foundation & Authentication**
**Priority:** P0 (Critical)
1. ✅ Set up API route structure
2. ✅ Authentication middleware
3. ✅ Error handling middleware
4. ✅ Rate limiting middleware
5. ✅ Auth endpoints (login, logout, refresh, MFA)
6. ✅ Audit logging helper functions

### **Week 2: Core HRIS - Employees & Attendance**
**Priority:** P0 (Critical)
7. Employee CRUD endpoints
8. Attendance clock-in/out
9. Attendance summary/reports
10. Webhook event emitter setup

### **Week 3: Leave & Payroll**
**Priority:** P0 (Critical)
11. Leave request submission
12. Leave approval workflow
13. Leave balance calculation
14. Payroll processing
15. Payslip generation

### **Week 4: Performance & Documents**
**Priority:** P1 (High)
16. Performance review endpoints
17. Goal/OKR management
18. Document upload/download
19. Document verification

### **Week 5: Analytics & Workflows**
**Priority:** P1 (High)
20. Analytics endpoints (dashboard KPIs)
21. Predictive analytics
22. Workflow execution engine
23. Workflow management endpoints

### **Week 6: Integrations & Advanced Features**
**Priority:** P2 (Medium)
24. Integration marketplace endpoints
25. Webhook management
26. API key management
27. Gamification endpoints
28. GDPR compliance endpoints

---

## 🗄️ Database Schema Reference

### Key Tables:
- `employees` - Employee master data
- `attendance` - Clock in/out records
- `leave_requests` - Leave applications
- `leave_balances` - Leave entitlements
- `payroll` - Monthly payroll records
- `performance_reviews` - Performance evaluations
- `documents` - Document metadata
- `workflows` - Workflow definitions
- `workflow_runs` - Workflow executions
- `integrations` - External integrations
- `webhooks` - Webhook configurations
- `webhook_deliveries` - Webhook logs
- `audit_logs` - System audit trail
- `user_badges` - Earned badges
- `user_points` - Gamification points
- `recognitions` - Peer recognition

---

## ⚠️ Error Handling Standards

### HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate)
- `422` - Unprocessable Entity
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

### Error Codes:
```typescript
enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
```

---

## ✅ Testing Strategy

### Unit Tests
- Validation schemas (Zod)
- Helper functions
- Business logic

### Integration Tests
- API endpoint tests
- Database queries
- External API mocks

### E2E Tests
- Full user workflows
- Authentication flows
- Critical paths (payroll, leave approval)

### Load Tests
- Concurrent users
- API rate limits
- Database performance

---

## 📝 API Documentation

### Tools:
- **OpenAPI/Swagger** - Auto-generated from code
- **Postman Collection** - For testing
- **Code Examples** - cURL, JavaScript, Python

---

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] API keys generated
- [ ] Rate limits configured
- [ ] CORS settings
- [ ] Logging setup (Sentry)
- [ ] Monitoring (Uptime)
- [ ] Load testing completed
- [ ] Security audit passed

---

**Next Step:** Begin implementation Week 1 - Foundation & Authentication

