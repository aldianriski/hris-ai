# EMPLOYER APP TESTING - QUICK REFERENCE GUIDE

## MODULES AT A GLANCE

| Module | Pages | Components | Key API | Critical Tests |
|--------|-------|------------|---------|-----------------|
| **Employee Management** | 5 | 10 | `/employees` | CRUD, filtering, pagination, validation |
| **Attendance Tracking** | 1 | 3 | `/attendance` | Clock in/out, GPS, anomaly detection |
| **Leave Management** | - | 2 | `/leave` | Balance check, conflicts, approval workflow |
| **Payroll Processing** | 2 | 6 | `/payroll` | BPJS calc, PPh21, error detection |
| **Performance** | 3 | 4 | `/performance` | Reviews, goals, sentiment analysis |
| **Onboarding/Workflows** | 4 | 5 | `/onboarding` | Task execution, automation |
| **Analytics** | 1 | 3 | `/analytics` | Dashboards, exports, predictions |
| **Compliance** | 3 | 4 | `/documents` | Document expiry, audit logs, GDPR |
| **Organization** | 2 | 2 | `/departments` | Structure, positions |
| **Integrations** | 1 | 3 | `/integrations` | OAuth, webhooks, API keys |
| **Manager Dashboard** | 1 | 1 | `/manager` | Team view, approvals, events |
| **Gamification** | - | - | `/gamification` | Points, badges, leaderboard |

---

## TOP 5 CRITICAL USER JOURNEYS

### 1. Onboard New Employee (Highest Impact)
**File**: `/src/app/(employer)/hr/employees/new/page.tsx`
- EmployeeForm (5-step form)
- Document uploads
- Workflow triggering
- **Risk**: Data inconsistency, missing documents

### 2. Process Monthly Payroll (Financial Impact)
**File**: `/src/app/(employer)/hr/payroll/page.tsx`
- PayrollPeriodList → PayrollPeriodDetail
- BPJS calculations (BPJSCalculator)
- PPh21 calculations (PPh21Calculator)
- Error detection (AIPayrollErrorDetector)
- **Risk**: Calculation errors, negative net, decimal rounding

### 3. Approve Leave Requests (Frequent Operation)
**File**: Manager Dashboard & API endpoints
- LeaveRequestCardWithAI
- Balance validation (AILeaveApprovalEngine)
- Conflict detection
- **Risk**: Double approval, balance corruption, date conflicts

### 4. View Real-time Attendance
**File**: `/src/components/hr/AttendanceAnomalyDashboard.tsx`
- Clock in/out (GPS validation)
- Anomaly detection (AIAnomalyDetector)
- Manual approvals
- **Risk**: Location spoofing, duplicate records, data loss

### 5. Generate Analytics Reports
**File**: `/src/app/(employer)/hr/analytics/page.tsx`
- ExecutiveDashboard, HRAnalyticsHub, PredictiveInsights
- Multiple data sources
- Export functionality
- **Risk**: Stale data, calculation errors, permission leaks

---

## QUICK TEST CHECKLIST

### Pre-Testing
- [ ] Database seeded with test data
- [ ] All API endpoints accessible
- [ ] Auth tokens valid
- [ ] File upload services working
- [ ] Email service configured
- [ ] Notifications enabled

### Module Testing Order
1. **Employee Management** (foundation for all others)
2. **Attendance Tracking** (daily operation)
3. **Leave Management** (frequent operation)
4. **Payroll Processing** (critical, monthly)
5. **Performance Management** (quarterly/annual)
6. **Workflows & Onboarding** (new employees)
7. **Analytics & Reporting** (dashboards)
8. **Compliance & Documents** (regulatory)
9. **Manager Dashboard** (daily use)
10. **Integrations** (if enabled)

### Cross-Module Dependencies
```
Employees
├─→ Attendance (daily clock in/out)
├─→ Leave (request and balance)
├─→ Payroll (salary calculation)
├─→ Performance (reviews and goals)
├─→ Documents (compliance)
└─→ Workflows (onboarding/offboarding)

Analytics depends on ALL modules
Manager Dashboard depends on Employees, Attendance, Leave, Performance
```

---

## AUTHENTICATION TESTING

### Essential Tests
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Token expiration and refresh
- [ ] MFA setup and verification
- [ ] Role-based access (HR > Manager > Employee)
- [ ] Session timeout
- [ ] CSRF token validation
- [ ] Rate limiting (5 failed attempts)

### Test Accounts Needed
```
- HR Admin: hr@company.com
- Manager: manager@company.com  
- Employee: employee1@company.com
- Finance (for payroll): finance@company.com
```

---

## FORM VALIDATION TESTING

### Common Validations
| Field | Validation | Test Cases |
|-------|-----------|-----------|
| Email | Format + Uniqueness | `valid@test.com`, `invalid`, duplicate |
| Phone | Format + Length | `+6281234567890`, `123`, `abc` |
| Date | Format + Range | `01/01/2000`, `invalid`, future |
| Salary | Positive number | `5000000`, `-1000`, `0`, `abc` |
| Leave Days | 1-365 | `1`, `0`, `365`, `366` |

### Cross-Field Validations
- Leave end date ≥ start date
- Payroll period no overlaps
- Salary components ≤ base + allowances
- Document expiry > today

---

## API ENDPOINT TESTING

### High-Priority Endpoints
```
Critical (Financial):
- POST /api/v1/payroll/periods/{id}/process
- POST /api/v1/payroll/periods/{id}/approve
- GET /api/v1/payroll/payslips/{employeeId}/{periodId}/generate

Frequent:
- POST /api/v1/attendance/clock-in
- POST /api/v1/attendance/clock-out
- POST /api/v1/leave/requests
- POST /api/v1/leave/requests/{id}/approve

Foundation:
- GET /api/v1/employees
- POST /api/v1/employees
- PATCH /api/v1/employees/{id}
```

### Test Each Endpoint With
- [ ] Valid data
- [ ] Invalid data (validation errors)
- [ ] Missing required fields
- [ ] Unauthorized access
- [ ] Rate limiting
- [ ] Pagination (if applicable)
- [ ] Sorting and filtering
- [ ] Empty results
- [ ] Large datasets
- [ ] Concurrent requests

---

## PERFORMANCE BENCHMARKS

| Operation | Target | Critical |
|-----------|--------|----------|
| Employee list (100 items) | <500ms | <1s |
| Payroll processing (50 emps) | <5s | <30s |
| Analytics dashboard | <2s | <5s |
| PDF generation | <3s | <10s |
| File upload (10MB) | <5s | <15s |

---

## SECURITY CHECKLIST

- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Authentication bypass attempts
- [ ] Authorization bypass (access other company data)
- [ ] Rate limiting enforcement
- [ ] Input sanitization
- [ ] File upload security
- [ ] API key management
- [ ] Data exposure in logs

---

## DATA CONSISTENCY TESTS

### Critical Data Flows
1. **Employee Creation → Payroll**: Employee must exist before payroll
2. **Leave Request → Balance Update**: Balance decreases on approval
3. **Clock In/Out → Attendance Summary**: Records reflected immediately
4. **Payroll Process → Payslip**: Payslip accurate reflection
5. **Performance Review → Analytics**: Data in dashboard next refresh

### Tests
- [ ] Create employee, verify in payroll
- [ ] Approve leave, check balance decreased
- [ ] Clock in/out, check attendance updated
- [ ] Process payroll, verify calculations
- [ ] Check analytics reflects latest data

---

## ERROR SCENARIO TESTING

### Network Issues
- [ ] Slow network (>5s latency)
- [ ] Connection timeout
- [ ] Intermittent failures
- [ ] Offline mode (PWA)
- [ ] Retry mechanisms

### Business Logic Errors
- [ ] Insufficient leave balance
- [ ] Overlapping leave requests
- [ ] Duplicate clock-in
- [ ] Invalid payroll state transition
- [ ] Missing employee salary data

### System Errors
- [ ] Database unavailable
- [ ] File upload service down
- [ ] Email service failure
- [ ] PDF generation timeout
- [ ] API rate limit exceeded

---

## EXPORT/IMPORT TESTING

### Export Formats
- [ ] CSV (UTF-8 encoding)
- [ ] Excel (formatting preserved)
- [ ] PDF (layout correct)

### Test Cases
- [ ] Single record export
- [ ] Bulk export (1000+ records)
- [ ] Special characters (Indonesian: á, ñ, ü, etc.)
- [ ] Large numbers (formatting)
- [ ] Dates (consistent format)

### Import Testing
- [ ] CSV import
- [ ] Data validation
- [ ] Error handling
- [ ] Duplicate detection
- [ ] Partial success

---

## REAL-TIME FEATURES TEST

### WebSocket Connection
- [ ] Connects on page load
- [ ] Reconnects on disconnect
- [ ] Handles network instability
- [ ] Processes messages in order

### Real-Time Updates
- [ ] Attendance updates (clock in/out)
- [ ] Leave approvals
- [ ] Notifications
- [ ] Dashboard metrics

---

## NOTIFICATION TESTING

### Channels
- [ ] Email
- [ ] In-app notifications
- [ ] Push notifications
- [ ] Webhooks (Slack integration)

### Test Scenarios
- [ ] Employee onboarded (notifications sent)
- [ ] Leave approved (email to employee)
- [ ] Payroll processed (email to all)
- [ ] Document expires soon (alert)
- [ ] Anomaly detected (manager notification)

---

## PERMISSION TESTING MATRIX

| Feature | Employee | Manager | HR | Admin |
|---------|----------|---------|-----|-------|
| View own record | ✓ | ✓ | ✓ | ✓ |
| View team records | ✗ | ✓ | ✓ | ✓ |
| Create employee | ✗ | ✗ | ✓ | ✓ |
| Approve leave | ✗ | ✓ | ✓ | ✓ |
| Process payroll | ✗ | ✗ | ✓ | ✓ |
| View analytics | ✗ | ✓ | ✓ | ✓ |
| Manage integrations | ✗ | ✗ | ✗ | ✓ |

---

## BROWSER COMPATIBILITY

### Must Support
- Chrome 120+
- Firefox 121+
- Safari 17+
- Edge 120+
- Mobile Chrome (latest)
- Mobile Safari (iOS 15+)

### Test with BrowserStack or Similar
- [ ] Desktop browsers
- [ ] Mobile browsers
- [ ] Tablet views
- [ ] Different screen sizes

---

## ACCESSIBILITY (A11Y) CHECKLIST

- [ ] Keyboard navigation (Tab, Shift+Tab, Enter, Escape)
- [ ] Screen reader (NVDA, JAWS)
- [ ] Color contrast (WCAG AA minimum)
- [ ] Focus indicators visible
- [ ] Form labels linked
- [ ] Error messages announced
- [ ] Modal dialogs trapped focus
- [ ] Skip to main content link

---

## LOAD TESTING SCENARIOS

### Concurrent Users
- [ ] 10 concurrent users
- [ ] 50 concurrent users
- [ ] 100 concurrent users
- [ ] Monitor response times
- [ ] Check error rates

### Large Data Sets
- [ ] 1,000 employees
- [ ] 10,000 attendance records
- [ ] 100 payroll periods
- [ ] 1,000 leave requests
- [ ] Verify pagination/search still fast

---

## REGRESSION TEST SUITE

### Critical Path (Must Always Pass)
1. Create employee with all required fields
2. Create payroll period and process
3. Submit and approve leave request
4. Clock in and clock out
5. Create and submit performance review
6. View manager dashboard
7. Export employee list

### Smoke Tests (Before Release)
1. Can login
2. Can access main pages
3. Can perform main CRUD operations
4. Notifications sent
5. Analytics load

---

## TEST ENVIRONMENT SETUP

### Database
```sql
-- Seed test data
INSERT INTO employees (10-50 test employees)
INSERT INTO attendance (6 months of records)
INSERT INTO leave_requests (20-30 requests)
INSERT INTO payroll_periods (12 months)
INSERT INTO performance_reviews (quarterly reviews)
INSERT INTO documents (various types)
```

### Configuration
```
- Test email: testhr@company.test
- Test phone: +6281234567890
- Test file uploads: Enable
- Notifications: Enable (test service)
- Webhooks: Mock endpoints
```

---

## KNOWN ISSUES TO WATCH FOR

Based on typical HRIS systems:
- [ ] Payroll rounding errors (use Decimal, not Float)
- [ ] Timezone issues (clock in/out)
- [ ] Leave balance on year boundary
- [ ] Document OCR accuracy
- [ ] PDF generation on large payrolls
- [ ] Real-time sync delays
- [ ] Permission caching issues
- [ ] Concurrent update conflicts

---

## RESOURCES

**Comprehensive Map**: `/home/user/hris-ai/EMPLOYER_APP_TESTING_MAP.md`

**Key Files to Review**:
- Domain entities: `/src/modules/hr/domain/entities/`
- API services: `/src/lib/api/services/`
- Use cases: `/src/modules/hr/application/use-cases/`
- Form components: `/src/components/forms/`

**API Documentation**: `/home/user/hris-ai/API_DOCUMENTATION.md`

---

## NEXT STEPS

1. **Review Map** - Read full EMPLOYER_APP_TESTING_MAP.md
2. **Set Up Test Environment** - Database seeding, test accounts
3. **Create Test Cases** - Per module and user journey
4. **Automate Tests** - Unit, integration, E2E
5. **Performance Test** - Load testing and optimization
6. **Security Audit** - Penetration testing if needed
7. **UAT** - User acceptance testing with stakeholders

---

**Last Updated**: 2025-11-19
**Modules Covered**: 12 major modules, 70+ components, 100+ API endpoints
