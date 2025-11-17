# HRIS Product Requirements Document

> **Purpose:** Extend Talixa from hiring platform to full employee lifecycle management
> **Target:** Indonesian SMBs (1-500 employees) in F&B, retail, logistics
> **Vision:** AI-first HRIS that becomes irreplaceable, not just another tool

---

## 1. THE PROBLEM

### Why Companies Change HRIS Every Year

**Pain Points Observed:**
1. **Generic workflows** - "One size fits all" doesn't fit anyone
2. **Expensive contracts** - Forced to buy all modules, use 30%
3. **Manual work remains** - Data entry, approvals, calculations still manual
4. **Poor integration** - Hiring ≠ HR, payroll ≠ attendance, everything disconnected
5. **No intelligence** - Just data storage, no insights or automation

**Market Gap:**
- Gadjian, Mekari Talenta, Sleekr: Feature-rich but no AI, expensive all-in pricing
- No seamless hiring → HR flow (candidates become employees manually)
- High churn (40% annual) because "it's just software, replaceable"

**Our Opportunity:**
Make HRIS **indispensable** through AI automation + seamless integration with existing hiring platform.

---

## 2. SOLUTION OVERVIEW

### Core Value Proposition

**"AI-powered HRIS that reduces HR admin by 70% and learns your company's patterns"**

### Three Strategic Pillars

#### 1. **AI-First Automation**
- Auto-approve leave based on historical patterns (85%+ confidence)
- Detect attendance anomalies (fraud, location deviation, excessive hours)
- Smart payroll error detection (prevent calculation mistakes)
- Predictive turnover alerts (identify at-risk employees)
- Natural language HR assistant (employee self-service)

#### 2. **Seamless Hiring → HR Flow**
- Hired candidate → Auto-create employee profile (zero re-entry)
- Auto-generate employment contract (PKWT/PKWTT templates)
- AI-powered onboarding workflows (document upload, BPJS registration)
- Single source of truth (one database, candidate → employee)

#### 3. **Modular Pay-Per-Use Pricing**
- Start with 1 module (e.g., Time & Attendance: IDR 20K/employee/month)
- Add modules as you grow (no forced bundles)
- Credit system for AI tasks (1 credit = 1 automation, IDR 5K)
- No multi-year contracts (monthly subscription)

---

## 3. USER PERSONAS

### Persona 1: HR Manager (Primary User)
**Profile:** Sarah, 32, HR Manager at 150-person F&B chain
**Pain:** Spends 60% of time on admin (leave approvals, attendance checking, payroll prep)
**Goal:** Automate repetitive tasks, focus on strategic HR (training, culture)
**Success:** Approvals reduced from 2 hours/day to 15 mins, AI handles 80%

### Persona 2: Finance/Operations Lead (Buyer)
**Profile:** Budi, 45, COO at 80-person logistics company
**Pain:** Current HRIS costs IDR 50M/year, uses only half the features
**Goal:** Reduce costs, improve accuracy (payroll errors cost money)
**Success:** Save 40% on HRIS costs, zero payroll errors in 3 months

### Persona 3: Employee (End User)
**Profile:** Dini, 26, warehouse supervisor
**Pain:** Needs manager approval for simple leave, takes 3 days to get response
**Goal:** Quick leave approval, easy access to payslips, transparent attendance
**Success:** Leave approved in 5 minutes (AI auto-approve), payslip downloaded anytime

---

## 4. CORE MODULES (8 Modules)

### Module 1: Employee Master Data
**Problem:** Manual data entry, duplicate records, outdated info
**Features:**
- Employee profile (personal, employment, salary, BPJS, tax)
- Auto-create from hired candidate (one-click conversion)
- AI document extraction (KTP, NPWP, BPJS card → auto-fill)
- Employee lifecycle (active, probation, resigned, terminated)
- Org chart (auto-generated from manager relationships)

**AI Feature:** Extract data from uploaded documents (90%+ accuracy)

### Module 2: Time & Attendance
**Problem:** Manual timesheets, buddy punching, location fraud
**Features:**
- Mobile clock in/out (GPS-based)
- Shift scheduling (weekly/monthly templates)
- Overtime tracking (auto-calculate pay multiplier)
- Attendance summary (daily, weekly, monthly)
- Leave integration (absent if leave approved)

**AI Feature:** Anomaly detection (unusual location, excessive hours, pattern deviation)

### Module 3: Leave Management
**Problem:** Slow approvals, balance tracking errors, policy confusion
**Features:**
- Leave request (annual, sick, unpaid, custom types)
- Balance tracking (quota, used, remaining, carry-forward)
- Approval workflow (manager → HR, custom chains)
- Team calendar (see who's on leave)
- Auto-deduct from balance on approval

**AI Feature:** Auto-approve leave (85%+ confidence based on balance, team availability, historical patterns)

### Module 4: Payroll Preparation
**Problem:** Calculation errors, BPJS mistakes, tax compliance risk
**Features:**
- Salary components (base, allowances, deductions)
- BPJS calculation (JKK, JKM, JHT, JP, Kesehatan - auto-rates)
- PPh21 calculation (PTKP, progressive tax, annual reconciliation)
- Attendance integration (deduct unpaid leave, add overtime)
- Payroll period (monthly, semi-monthly)
- Payslip generation (PDF download, email)

**AI Feature:** Error detection (salary spike, missing BPJS, wrong tax bracket)

**Note:** Payroll execution (bank transfer) via integration (BCA, Mandiri APIs) or export to existing payroll vendor.

### Module 5: Performance Management
**Problem:** Subjective reviews, no documentation, annual only
**Features:**
- Goal setting (OKRs, KPIs, individual goals)
- Review cycles (probation, annual, quarterly)
- 360° feedback (peer, manager, subordinate)
- Rating scales (1-5, custom criteria)
- Performance history (trends over time)

**AI Feature:** Sentiment analysis on feedback (detect bias, highlight strengths/weaknesses)

### Module 6: Document Management
**Problem:** Lost contracts, expired IDs, manual tracking
**Features:**
- Document upload (contract, KTP, NPWP, certificates)
- Expiry tracking (alert 30 days before)
- E-signature integration (future)
- Document templates (employment contract, warning letter)
- Auto-categorization (AI detects document type)

**AI Feature:** Extract metadata from documents (issue date, expiry, ID numbers)

### Module 7: Organizational Structure
**Problem:** Outdated org charts, unclear reporting lines
**Features:**
- Visual org chart (drag-drop editing)
- Department/division management
- Position/job title library
- Manager assignment (cascading approvals)
- Cost center allocation

**AI Feature:** Auto-sync from employee data (manager changes → chart updates)

### Module 8: Compliance & Reporting
**Problem:** Missed deadlines, manual reports, legal risks
**Features:**
- Government reports (BPJS monthly, tax annual)
- Contract expiry alerts (PKWT auto-renew or convert to PKWTT)
- Labor law compliance (overtime limits, leave quotas)
- Audit trail (all HR actions logged)
- Custom reports (headcount, turnover, cost)

**AI Feature:** Proactive alerts (contract expiring, BPJS payment due, overtime limit exceeded)

---

## 5. KEY USER FLOWS

### Flow 1: Candidate Hired → Employee Onboarded
```
1. Employer marks application as "Hired" in talent pipeline
   ↓
2. System shows "Create Employee" modal
   - Pre-filled: Name, email, phone, address (from candidate profile)
   - Input: Start date, employment type (PKWT/PKWTT), position, department, salary
   ↓
3. Click "Create Employee"
   - Auto-generate employee number (e.g., EMP-2025-001)
   - Create employee record in database
   - Link to user account (candidate becomes employee role)
   ↓
4. System generates employment contract (PDF)
   - Template based on PKWT/PKWTT
   - Auto-fill variables (name, salary, dates)
   ↓
5. Trigger onboarding workflow
   - Task 1: Upload KTP, NPWP (AI extracts data)
   - Task 2: BPJS registration form
   - Task 3: Bank account for salary
   - Task 4: Orientation scheduling
   ↓
6. Employee receives email: "Welcome! Complete your onboarding"
   - Link to employee portal
   - Checklist of pending tasks
```

**Success Metric:** 90% of hired candidates become employees in <5 minutes

### Flow 2: Employee Requests Leave (AI Auto-Approve)
```
1. Employee opens "My Leave" page (mobile/desktop)
   ↓
2. Select leave type, dates, reason
   - System shows: "Balance: 12 days remaining"
   - Calendar highlights team members on leave (conflict check)
   ↓
3. Submit leave request
   ↓
4. AI evaluation (backend, <2 seconds)
   - Check balance (sufficient?)
   - Check team conflicts (2+ people same dates?)
   - Check historical patterns (manager always approves this?)
   - Calculate confidence score (0-100%)
   ↓
5a. IF confidence > 85%:
     - Auto-approve ✅
     - Deduct from balance
     - Send notification: "Leave approved automatically"
     - Add to team calendar

5b. IF confidence < 85%:
     - Route to manager for manual approval
     - Send notification to manager: "Review leave request"
     - Manager approves/rejects (reason required if rejected)
```

**Success Metric:** 70% of leave requests auto-approved, <10 seconds response time

### Flow 3: Attendance Anomaly Detected
```
1. Employee clocks in (mobile app, GPS location captured)
   ↓
2. Backend processes attendance record
   ↓
3. AI anomaly detection runs (async)
   - Compare location vs. usual office (>5km = anomaly)
   - Compare time vs. average (>3 hours deviation = anomaly)
   - Check work hours (>12h without break = anomaly)
   ↓
4. IF anomaly detected:
   - Flag attendance record (is_anomaly = true)
   - Create compliance alert for HR
     - Type: "attendance_anomaly"
     - Severity: "medium"
     - Message: "Employee clocked in 8km from usual location"
   - Send notification to HR: "Review flagged attendance"
   ↓
5. HR reviews (desktop dashboard)
   - See employee's attendance history
   - See location on map
   - Options:
     - Approve (valid, employee at client site)
     - Reject (mark as absent, deduct pay)
     - Request explanation from employee
```

**Success Metric:** 95% of fraud attempts detected, <5% false positives

### Flow 4: Monthly Payroll Processing
```
1. HR opens "Payroll" module, clicks "Create Period"
   - Input: Start date, end date (e.g., Jan 1-31)
   ↓
2. System auto-calculates for all employees
   - Fetch attendance (total days worked, unpaid leave deductions)
   - Fetch overtime hours (multiply by 1.5x or 2x hourly rate)
   - Calculate BPJS (4% JHT, 1% JP, etc.)
   - Calculate PPh21 (progressive tax based on gross)
   ↓
3. AI error detection runs
   - Check for anomalies:
     - Salary >50% higher than average (flag)
     - BPJS deduction missing (flag)
     - Tax bracket mismatch (flag)
   - Generate error report
   ↓
4. HR reviews errors (if any)
   - See flagged employees
   - Compare expected vs. actual amounts
   - Fix or approve
   ↓
5. Approve payroll period
   - Lock calculations (no further edits)
   - Generate payslips (PDF for each employee)
   - Send email to all employees: "Payslip ready for download"
   ↓
6. Export to bank (CSV format: employee name, account, amount)
   OR
   Integrate with payroll vendor API (BCA, Mandiri)
```

**Success Metric:** 100% payroll accuracy (zero calculation errors), <1 hour total processing time

---

## 6. AI FEATURES DETAIL

### 1. Auto-Approval Engine (Leave, Claims, Timesheets)

**Input:**
- Request details (type, amount, dates, reason)
- Employee history (past requests, approvals)
- Company policies (rules, limits, blackout dates)
- Team context (who's on leave, department workload)

**Process:**
```
1. Fetch historical approvals (last 50 similar requests)
2. Check policy compliance (balance, limits, blackout dates)
3. Evaluate team impact (conflict with other leaves?)
4. Send to OpenAI GPT-4o-mini:
   - System prompt: "You are an HR approval assistant. Evaluate if this request should be auto-approved."
   - User prompt: JSON with request + context
   - Response format: { shouldAutoApprove: boolean, confidence: number, reasoning: string }
5. IF confidence > 85% AND shouldAutoApprove = true:
   - Auto-approve
   ELSE:
   - Route to manager
```

**Training:**
- Learns from manual approvals (manager approves → AI learns pattern)
- Adjusts confidence threshold per company (some strict, some lenient)

**Safety:**
- Never auto-approve if balance insufficient
- Never auto-approve if violates policy
- Log all decisions for audit

### 2. Attendance Anomaly Detection

**Anomalies Detected:**
- **Location deviation:** Clock in >5km from usual office
- **Time deviation:** Clock in >3h earlier/later than average
- **Excessive hours:** Work hours >12h without break
- **Impossible travel:** Clock out location A, clock in location B (distance/time mismatch)
- **Pattern break:** Always Mon-Fri 9-5, suddenly Sat-Sun night shift

**Algorithm:**
```python
def detect_anomaly(record):
    # Fetch 30-day history
    history = get_attendance_history(record.employee_id, days=30)

    # Calculate baselines
    avg_clock_in = mean([h.clock_in for h in history])
    avg_location = mean([h.location for h in history])
    avg_work_hours = mean([h.work_hours for h in history])

    anomalies = []

    # Location check
    distance = haversine(record.location, avg_location)
    if distance > 5000:  # 5km
        anomalies.append({
            'type': 'location_deviation',
            'confidence': 0.95,
            'message': f'Clocked in {distance}m from usual location'
        })

    # Time check
    time_diff = abs(record.clock_in.hour - avg_clock_in.hour)
    if time_diff > 3:
        anomalies.append({
            'type': 'time_deviation',
            'confidence': 0.8,
            'message': f'Clock in time deviates {time_diff}h from average'
        })

    # Excessive hours
    if record.work_hours > 12:
        anomalies.append({
            'type': 'excessive_hours',
            'confidence': 0.9,
            'message': f'Work hours ({record.work_hours}h) exceed 12h'
        })

    return anomalies
```

**Action:**
- High confidence (>85%): Alert HR immediately
- Medium confidence (50-85%): Flag for review (not urgent)
- Low confidence (<50%): Log only (no alert)

### 3. Payroll Error Detection

**Errors Detected:**
- Salary spike (>30% increase from last month)
- BPJS deduction missing or incorrect rate
- Tax bracket wrong (gross vs. PTKP calculation)
- Overtime calculation error (wrong multiplier)
- Duplicate payments (same employee, same period)

**Implementation:**
```typescript
async function detectPayrollErrors(period: PayrollPeriod) {
  const errors = []
  const employees = await getPayrollComponents(period.id)

  for (const emp of employees) {
    // Check salary spike
    const lastMonth = await getPayrollForEmployee(emp.id, previousPeriod)
    const increase = (emp.total_gross - lastMonth.total_gross) / lastMonth.total_gross
    if (increase > 0.3) {
      errors.push({
        employeeId: emp.id,
        type: 'salary_spike',
        message: `Salary increased ${(increase * 100).toFixed(0)}% from last month`,
        expected: lastMonth.total_gross,
        actual: emp.total_gross,
        confidence: 0.9
      })
    }

    // Check BPJS
    const expectedBPJS = calculateBPJS(emp.base_salary)
    if (Math.abs(emp.bpjs_total - expectedBPJS) > 1000) {
      errors.push({
        employeeId: emp.id,
        type: 'bpjs_error',
        message: 'BPJS deduction incorrect',
        expected: expectedBPJS,
        actual: emp.bpjs_total,
        confidence: 0.95
      })
    }

    // Check tax
    const expectedTax = calculatePPh21(emp.total_gross, emp.ptkp_status)
    if (Math.abs(emp.pph21_amount - expectedTax) > 5000) {
      errors.push({
        employeeId: emp.id,
        type: 'tax_error',
        message: 'PPh21 calculation incorrect',
        expected: expectedTax,
        actual: emp.pph21_amount,
        confidence: 0.9
      })
    }
  }

  return errors
}
```

**UI:**
- Show errors before payroll approval (blocking)
- HR can review and fix or override (with reason)
- Track error rate (goal: <0.1% errors)

### 4. Document Data Extraction

**Supported Documents:**
- KTP (ID card): Name, NIK, address, DOB
- NPWP (tax ID): NPWP number, name
- BPJS card: BPJS number, class
- Employment contract: Start date, end date, salary

**Technology:**
- OpenAI GPT-4o with vision (image → structured data)
- Fallback: Tesseract OCR + regex

**Flow:**
```
1. Employee uploads document (photo or PDF)
   ↓
2. Convert to image (if PDF)
   ↓
3. Send to OpenAI Vision API:
   - Prompt: "Extract structured data from this KTP. Return JSON: { nik, name, address, dob }"
   - Image: base64 encoded
   ↓
4. Parse response (JSON)
   ↓
5. Auto-fill form fields
   ↓
6. Employee reviews and confirms (can edit if wrong)
   ↓
7. Save to employee record
```

**Accuracy Target:** 90%+ (human review always available)

---

## 7. TECHNICAL ARCHITECTURE

### Database Schema (New Tables)

**employees**
```sql
CREATE TABLE employees (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,  -- Link to candidate if hired
  employer_id uuid REFERENCES employers,
  employee_number text UNIQUE,         -- EMP-2025-001
  full_name text,
  email text,
  phone text,
  join_date date,
  employment_type text,                -- PKWT, PKWTT
  position text,
  department text,
  manager_id uuid REFERENCES employees, -- Self-reference
  salary_base numeric,
  salary_components jsonb,             -- { allowances: [], deductions: [] }
  bpjs_number text,
  npwp text,
  status text,                         -- active, probation, resigned, terminated
  exit_date date,
  exit_reason text,
  created_at timestamptz,
  updated_at timestamptz
);
```

**attendance_records**
```sql
CREATE TABLE attendance_records (
  id uuid PRIMARY KEY,
  employee_id uuid REFERENCES employees,
  employer_id uuid REFERENCES employers,
  date date,
  clock_in timestamptz,
  clock_out timestamptz,
  location_lat numeric,
  location_lng numeric,
  work_hours_decimal numeric,          -- 8.5 (8h 30m)
  overtime_hours numeric,
  is_anomaly boolean DEFAULT false,
  anomaly_reason text,
  approved_by uuid REFERENCES employees,
  approved_at timestamptz,
  created_at timestamptz
);
```

**leave_requests**
```sql
CREATE TABLE leave_requests (
  id uuid PRIMARY KEY,
  employee_id uuid REFERENCES employees,
  employer_id uuid REFERENCES employers,
  leave_type text,                     -- annual, sick, unpaid, custom
  start_date date,
  end_date date,
  total_days numeric,                  -- 2.5 (half-day support)
  reason text,
  status text,                         -- pending, approved, rejected
  approver_id uuid REFERENCES employees,
  approval_notes text,
  auto_approved boolean DEFAULT false,
  ai_confidence numeric,               -- 0.87
  created_at timestamptz,
  approved_at timestamptz
);
```

**leave_balances**
```sql
CREATE TABLE leave_balances (
  employee_id uuid REFERENCES employees,
  employer_id uuid REFERENCES employers,
  year integer,
  annual_quota numeric,                -- 12 days
  annual_used numeric,
  sick_used numeric,
  unpaid_used numeric,
  carry_forward numeric,               -- From previous year
  expires_at date,
  PRIMARY KEY (employee_id, year)
);
```

**payroll_periods**
```sql
CREATE TABLE payroll_periods (
  id uuid PRIMARY KEY,
  employer_id uuid REFERENCES employers,
  period_start date,
  period_end date,
  status text,                         -- draft, processing, approved, paid
  total_employees integer,
  total_gross numeric,
  total_deductions numeric,
  total_net numeric,
  approved_by uuid REFERENCES employees,
  approved_at timestamptz,
  created_at timestamptz
);
```

**payroll_components**
```sql
CREATE TABLE payroll_components (
  id uuid PRIMARY KEY,
  payroll_period_id uuid REFERENCES payroll_periods,
  employee_id uuid REFERENCES employees,
  component_type text,                 -- base, allowance, deduction, tax
  component_name text,                 -- "Base Salary", "Transport", "BPJS JHT"
  amount numeric,
  is_taxable boolean,
  calculation_formula text,            -- "base_salary * 0.04" for BPJS
  created_at timestamptz
);
```

**employee_documents**
```sql
CREATE TABLE employee_documents (
  id uuid PRIMARY KEY,
  employee_id uuid REFERENCES employees,
  document_type text,                  -- ktp, npwp, bpjs, contract, certificate
  file_name text,
  storage_path text,                   -- Supabase Storage path
  extracted_data jsonb,                -- AI-extracted metadata
  issue_date date,
  expiry_date date,
  reminder_sent_at timestamptz,
  created_at timestamptz
);
```

**performance_reviews**
```sql
CREATE TABLE performance_reviews (
  id uuid PRIMARY KEY,
  employee_id uuid REFERENCES employees,
  reviewer_id uuid REFERENCES employees,
  review_period text,                  -- "2025-Q1", "Probation"
  review_type text,                    -- probation, annual, 360
  goals_achieved jsonb,
  competencies jsonb,                  -- { leadership: 4, technical: 5 }
  rating_overall numeric,              -- 1-5
  comments text,
  status text,                         -- draft, submitted, acknowledged
  created_at timestamptz
);
```

**compliance_alerts**
```sql
CREATE TABLE compliance_alerts (
  id uuid PRIMARY KEY,
  employer_id uuid REFERENCES employers,
  alert_type text,                     -- contract_expiry, bpjs_overdue, overtime_limit
  severity text,                       -- low, medium, high, critical
  message text,
  related_entity_id uuid,              -- employee_id or document_id
  due_date date,
  resolved_at timestamptz,
  auto_generated boolean DEFAULT true,
  created_at timestamptz
);
```

**workflow_instances**
```sql
CREATE TABLE workflow_instances (
  id uuid PRIMARY KEY,
  employer_id uuid REFERENCES employers,
  workflow_name text,                  -- "employee-onboarding", "leave-approval"
  entity_type text,                    -- employee, leave_request
  entity_id uuid,
  current_step integer,
  total_steps integer,
  status text,                         -- pending, in_progress, completed, failed
  ai_confidence_score numeric,
  auto_approved boolean,
  started_at timestamptz,
  completed_at timestamptz
);
```

### API Routes (New Endpoints)

**Employee Management**
```
POST   /api/v1/hr/employees                 # Create employee
GET    /api/v1/hr/employees                 # List employees
GET    /api/v1/hr/employees/:id             # Get employee detail
PATCH  /api/v1/hr/employees/:id             # Update employee
POST   /api/v1/hr/employees/:id/resign      # Process resignation
POST   /api/v1/hr/employees/from-candidate  # Convert hired candidate
```

**Attendance**
```
POST   /api/v1/hr/attendance/clock-in       # Clock in
POST   /api/v1/hr/attendance/clock-out      # Clock out
GET    /api/v1/hr/attendance                # Get records (filters: date, employee)
GET    /api/v1/hr/attendance/anomalies      # AI-detected anomalies
PATCH  /api/v1/hr/attendance/:id/approve    # Approve flagged record
```

**Leave**
```
POST   /api/v1/hr/leave/request             # Submit leave request
GET    /api/v1/hr/leave/requests            # List requests
PATCH  /api/v1/hr/leave/:id/approve         # Approve/reject
GET    /api/v1/hr/leave/balance             # Get balance
GET    /api/v1/hr/leave/calendar            # Team leave calendar
```

**Payroll**
```
POST   /api/v1/hr/payroll/periods           # Create period
GET    /api/v1/hr/payroll/periods/:id       # Get period detail
POST   /api/v1/hr/payroll/calculate         # Calculate salaries
POST   /api/v1/hr/payroll/approve           # Approve period
GET    /api/v1/hr/payroll/slips/:id         # Generate payslip PDF
POST   /api/v1/hr/payroll/export            # Export to bank CSV
```

**Documents**
```
POST   /api/v1/hr/documents/upload          # Upload document
POST   /api/v1/hr/documents/extract         # AI extract data
GET    /api/v1/hr/documents                 # List documents
GET    /api/v1/hr/documents/expiring        # Expiring soon
```

**Performance**
```
POST   /api/v1/hr/performance/reviews       # Create review
GET    /api/v1/hr/performance/reviews/:id   # Get review
PATCH  /api/v1/hr/performance/reviews/:id   # Update review
GET    /api/v1/hr/performance/goals         # Get employee goals
```

**Compliance**
```
GET    /api/v1/hr/compliance/alerts         # List alerts
PATCH  /api/v1/hr/compliance/:id/resolve    # Mark resolved
GET    /api/v1/hr/compliance/reports        # Government reports
```

### Module Structure (Clean Architecture)

```
modules/
├── hr/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Employee.ts
│   │   │   ├── AttendanceRecord.ts
│   │   │   ├── LeaveRequest.ts
│   │   │   └── PayrollPeriod.ts
│   │   ├── value-objects/
│   │   │   ├── EmployeeNumber.ts
│   │   │   ├── SalaryComponents.ts
│   │   │   └── WorkingHours.ts
│   │   └── repositories/
│   │       ├── IEmployeeRepository.ts
│   │       └── IAttendanceRepository.ts
│   │
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── CreateEmployee.ts
│   │   │   ├── RecordAttendance.ts
│   │   │   ├── SubmitLeaveRequest.ts
│   │   │   └── ProcessPayroll.ts
│   │   └── dto/
│   │       ├── EmployeeDTO.ts
│   │       └── AttendanceDTO.ts
│   │
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   ├── SupabaseEmployeeRepository.ts
│   │   │   └── SupabaseAttendanceRepository.ts
│   │   └── services/
│   │       ├── BPJSCalculator.ts
│   │       ├── PPh21Calculator.ts
│   │       ├── AIAnomalyDetector.ts
│   │       └── WorkflowEngine.ts
│   │
│   └── presentation/
│       ├── hooks/
│       │   ├── useEmployees.ts
│       │   ├── useAttendance.ts
│       │   └── useLeaveBalance.ts
│       └── stores/
│           └── useHRStore.ts
│
└── workflows/
    ├── domain/
    │   ├── entities/WorkflowTemplate.ts
    │   └── entities/WorkflowInstance.ts
    ├── application/
    │   ├── ExecuteWorkflow.ts
    │   └── EvaluateAutoApproval.ts
    └── infrastructure/
        └── services/AIDecisionEngine.ts
```

### UI Pages (New Routes)

**Employer HRIS Dashboard**
```
app/(employer)/hr/
├── employees/
│   ├── page.tsx                    # Employee list
│   ├── [id]/page.tsx               # Employee detail
│   └── new/page.tsx                # Create employee (or from hired candidate)
│
├── attendance/
│   ├── page.tsx                    # Attendance dashboard
│   ├── anomalies/page.tsx          # AI-detected anomalies
│   └── live/page.tsx               # Live clock in/out feed (realtime)
│
├── leave/
│   ├── page.tsx                    # Leave requests (pending/history)
│   └── calendar/page.tsx           # Team leave calendar
│
├── payroll/
│   ├── page.tsx                    # Payroll periods
│   ├── [periodId]/page.tsx         # Period detail + errors
│   └── settings/page.tsx           # Salary components config
│
├── performance/
│   ├── page.tsx                    # Performance dashboard
│   └── reviews/page.tsx            # Review cycles
│
├── documents/
│   ├── page.tsx                    # Document library
│   └── expiring/page.tsx           # Expiring documents
│
├── organization/
│   ├── page.tsx                    # Org chart (visual)
│   └── departments/page.tsx        # Department management
│
└── compliance/
    ├── page.tsx                    # Compliance alerts
    └── reports/page.tsx            # Government reports
```

**Employee Self-Service Portal**
```
app/(employee)/
├── my-profile/page.tsx             # Personal info (read-only + update)
├── my-attendance/page.tsx          # Clock in/out + history
├── my-leave/page.tsx               # Request leave + balance
├── my-payslips/page.tsx            # Download payslips
├── my-performance/page.tsx         # Goals + reviews
└── my-documents/page.tsx           # Upload documents
```

### Security (RLS Policies)

```sql
-- Employees: Only employer who hired them + employee self
CREATE POLICY "employer_access_employees" ON employees
  FOR SELECT USING (employer_id = auth.uid_to_employer_id());

CREATE POLICY "employee_self_access" ON employees
  FOR SELECT USING (user_id = auth.uid());

-- Attendance: Employee can insert (clock in/out), employer can view all
CREATE POLICY "attendance_employee_insert" ON attendance_records
  FOR INSERT USING (employee_id = auth.uid_to_employee_id());

CREATE POLICY "attendance_employer_view" ON attendance_records
  FOR SELECT USING (employer_id = auth.uid_to_employer_id());

-- Leave: Employee + manager + HR
CREATE POLICY "leave_request_visibility" ON leave_requests
  FOR SELECT USING (
    employee_id = auth.uid_to_employee_id() OR
    approver_id = auth.uid_to_employee_id() OR
    is_hr_admin(auth.uid())
  );

-- Payroll: Only HR admins + employee self (own payslip only)
CREATE POLICY "payroll_privacy" ON payroll_components
  FOR SELECT USING (
    employee_id = auth.uid_to_employee_id() OR
    is_hr_admin(auth.uid())
  );

-- Documents: Employee self + HR
CREATE POLICY "documents_access" ON employee_documents
  FOR ALL USING (
    employee_id = auth.uid_to_employee_id() OR
    is_hr_admin(auth.uid())
  );
```

### Performance Optimization

**Indexes:**
```sql
CREATE INDEX idx_attendance_employee_date ON attendance_records(employee_id, date DESC);
CREATE INDEX idx_leave_requests_status ON leave_requests(status, start_date);
CREATE INDEX idx_payroll_period_employee ON payroll_components(payroll_period_id, employee_id);
CREATE INDEX idx_documents_expiry ON employee_documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_compliance_unresolved ON compliance_alerts(due_date) WHERE resolved_at IS NULL;
```

**Caching (TanStack Query):**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Attendance: 5 min stale time (changes frequently)
      staleTime: 5 * 60 * 1000,
      // Leave balance: 30 min
      staleTime: 30 * 60 * 1000,
      // Org structure: 1 hour (rarely changes)
      staleTime: 60 * 60 * 1000
    }
  }
})
```

---

## 8. PRICING & MONETIZATION

### Pricing Tiers (Per Employee Per Month)

**Starter** (1-50 employees)
- Price: IDR 50K/employee/month
- Modules: 3 of 8 (choose any)
- AI Credits: 10/employee/month (auto-approvals, extractions)
- Support: Email only

**Growth** (51-200 employees)
- Price: IDR 40K/employee/month (20% discount)
- Modules: 5 of 8
- AI Credits: 20/employee/month
- Support: Email + Chat

**Enterprise** (201+ employees)
- Price: IDR 30K/employee/month (40% discount)
- Modules: All 8
- AI Credits: Unlimited
- Support: Dedicated account manager + phone

### Module Add-Ons (À La Carte)

If want extra modules beyond tier:
- Employee Master: Included in all tiers
- Time & Attendance: +IDR 20K/employee/month
- Leave Management: +IDR 15K/employee/month
- Payroll Prep: +IDR 25K/employee/month
- Performance: +IDR 20K/employee/month
- Documents: +IDR 10K/employee/month
- Org Structure: +IDR 10K/employee/month
- Compliance: +IDR 15K/employee/month

### AI Credit Packs (Pay-As-You-Go)

1 credit = 1 AI task (auto-approval, extraction, error detection)

- 100 credits: IDR 500K (IDR 5K/credit)
- 500 credits: IDR 2M (IDR 4K/credit, 20% discount)
- 1000 credits: IDR 3M (IDR 3K/credit, 40% discount)

### Revenue Model

**Primary:** Monthly subscription per employee
**Secondary:** AI credit purchases (for heavy users)
**Tertiary:** Premium integrations (payroll bank APIs, custom workflows)

### Example Customer Economics

**50-person F&B chain (Growth tier):**
- 50 employees × IDR 40K = IDR 2M/month
- AI credits included: 1,000/month
- Modules: Time & Attendance, Leave, Payroll, Documents, Compliance
- Annual contract value: IDR 24M/year

**Comparison to Gadjian:**
- Gadjian: IDR 50K/employee × 50 = IDR 2.5M/month (all modules, many unused)
- Talixa: IDR 2M/month (only 5 modules needed) = **20% savings**
- Plus: AI automation saves 60% HR time (qualitative value)

### Retention Strategy (Anti-Turnover)

**Lock-In Mechanisms:**

1. **Network Effect**
   - More usage → AI learns company patterns → Better automation
   - Historical data (3+ years of payroll, performance) hard to migrate

2. **Integration Depth**
   - Connected to payroll bank APIs (setup cost high)
   - Synced with government systems (BPJS, tax)
   - Employee portal (high user adoption = switching resistance)

3. **Gradual Value Increase**
   - Month 1: 30% time savings (data entry reduction)
   - Month 3: 50% time savings (auto-approvals working)
   - Month 6: 70% time savings (AI trained on patterns)
   - Year 1: 80% time savings (predictive insights)

4. **Modular Expansion**
   - Start with 1 module (low commitment)
   - Add module every quarter as ROI proven
   - Each module = +20% switching cost

**Target Retention:** 90% annual retention (vs. industry 60%)

---

## 9. SUCCESS METRICS

### Product Metrics (First 6 Months)

**Adoption:**
- 20 companies using HRIS modules
- 1,500+ employees managed in system
- 80% of companies use 3+ modules

**Engagement:**
- 60% of leave requests auto-approved (AI)
- 95% attendance anomaly detection accuracy
- 100% payroll error detection (zero mistakes in production)

**Efficiency:**
- 70% reduction in HR admin time (measured via time-tracking survey)
- <5 min average time to approve leave (vs. 2 days manual)
- <1 hour monthly payroll processing (vs. 1 week manual)

**Retention:**
- 90% customer retention (vs. industry 60%)
- 50% customers upgrade tier within 6 months
- NPS score >50

### Business Metrics

**Revenue:**
- IDR 30M monthly recurring revenue (MRR)
- 15% month-over-month growth
- Average customer value: IDR 1.5M/month (75 employees)

**Unit Economics:**
- Customer acquisition cost (CAC): IDR 5M
- Lifetime value (LTV): IDR 36M (24 months × IDR 1.5M)
- LTV:CAC ratio: 7:1 (healthy SaaS)

**Costs:**
- OpenAI API costs: <IDR 1K/employee/month (1% of revenue)
- Supabase hosting: IDR 2M/month (flat)
- Support: 1 person per 500 employees (scales)

---

## 10. IMPLEMENTATION ROADMAP

### Phase 1: Core HR (Weeks 1-4)

**Deliverables:**
- Employee Master Data module (CRUD, org chart)
- Document Management (upload, AI extraction)
- Database migrations (12 tables)
- API routes (employee, documents)
- Employer UI (employee list, detail, create)
- Employee UI (profile page)

**Success Criteria:**
- Can create employee from hired candidate
- Can upload KTP and auto-extract NIK
- Org chart auto-generates from manager relationships

### Phase 2: Operations (Weeks 5-8)

**Deliverables:**
- Time & Attendance module (clock in/out, GPS, anomaly detection)
- Leave Management (request, approval, balance tracking, AI auto-approve)
- Workflow engine (generic approval chains)
- API routes (attendance, leave, workflows)
- Employer UI (attendance dashboard, leave requests, anomaly review)
- Employee UI (clock in/out page, leave request page)

**Success Criteria:**
- Attendance anomaly detection working (95% accuracy)
- Leave auto-approval working (70% approval rate, 85% confidence threshold)
- Mobile clock in/out functional (PWA)

### Phase 3: Intelligence (Weeks 9-12)

**Deliverables:**
- Payroll Preparation module (components, BPJS, PPh21, error detection)
- Performance Management (goals, reviews, 360°)
- Compliance & Reporting (alerts, government reports)
- API routes (payroll, performance, compliance)
- Employer UI (payroll dashboard, performance reviews, compliance alerts)
- Employee UI (payslip download, goals page)

**Success Criteria:**
- Payroll error detection working (100% accuracy)
- BPJS and PPh21 auto-calculation correct
- Contract expiry alerts working (30-day advance)

### Phase 4: Polish & Launch (Weeks 13-14)

**Deliverables:**
- Mobile app optimization (PWA performance)
- Email notifications (leave approved, payslip ready, alerts)
- Onboarding wizard for new employers (module selection, setup)
- Documentation (user guides, API docs)
- Beta testing with 5 pilot customers

**Success Criteria:**
- Lighthouse score >85 (mobile)
- All user flows tested end-to-end
- Pilot customers successfully process payroll

**Total:** 14 weeks to MVP launch

---

## 11. RISKS & MITIGATIONS

### Risk 1: AI Accuracy Below Expectations
**Impact:** High (core value prop is AI automation)
**Probability:** Medium
**Mitigation:**
- Set conservative confidence thresholds (85%+)
- Always provide manual override/review
- Track accuracy metrics and improve prompts
- Fallback to manual approval if AI fails

### Risk 2: Complex Payroll Requirements
**Impact:** High (payroll errors = legal risk)
**Probability:** Medium
**Mitigation:**
- Start with payroll *preparation* only (not execution)
- Integrate with existing payroll vendors (not replace)
- Extensive testing with accountant validation
- Clear disclaimer: "Review before bank transfer"

### Risk 3: Low Adoption (Employees Don't Use Portal)
**Impact:** Medium (reduces stickiness)
**Probability:** Medium
**Mitigation:**
- Mobile-first design (employees are mobile)
- WhatsApp notifications (not just email)
- Incentives (gamification for clock in/out)
- Manager push (require employees to use for leave)

### Risk 4: Data Migration from Existing HRIS
**Impact:** Medium (barrier to switching)
**Probability:** High
**Mitigation:**
- Provide migration service (CSV import templates)
- Dedicated onboarding support (1-on-1 calls)
- Parallel running (use Talixa alongside old system for 1 month)

### Risk 5: Competition from Established Players
**Impact:** Medium (Gadjian, Mekari have brand)
**Probability:** High
**Mitigation:**
- Differentiate on AI (they have none)
- Target underserved SMBs (big players focus on enterprise)
- Leverage existing hiring platform (seamless integration)
- Modular pricing (lower entry barrier)

---

## 12. FUTURE ENHANCEMENTS (Post-MVP)

### Short-Term (3-6 Months)
- Shift scheduling (auto-generate based on demand forecast)
- Loan/advance management (employee salary advances)
- Training management (courses, certifications, tracking)
- Recruitment ATS integration (full hiring + HR lifecycle)

### Medium-Term (6-12 Months)
- Payroll execution (direct bank transfer via APIs)
- Expense management (claims, approvals, reimbursements)
- Benefits administration (health insurance, pension)
- Employee engagement surveys (pulse surveys, NPS)

### Long-Term (12+ Months)
- Predictive analytics (turnover prediction, flight risk)
- Workforce planning (headcount forecasting, budget)
- Learning management system (LMS for training)
- Native mobile apps (iOS/Android, not just PWA)

---

## 13. APPENDIX

### A. Indonesian Compliance Requirements

**BPJS Rates (2025):**
- JKK (Work Accident): 0.24% - 1.74% of gross (industry-based)
- JKM (Death): 0.30% of gross
- JHT (Old Age): 5.7% (3.7% employer + 2% employee)
- JP (Pension): 3% (2% employer + 1% employee)
- Kesehatan (Health): 4% employer + 1% employee

**PPh21 Tax Brackets (2025):**
- 0 - 60M: 5%
- 60M - 250M: 15%
- 250M - 500M: 25%
- 500M+: 30%

**PTKP (Non-Taxable Income, 2025):**
- TK/0: IDR 54M (single, no dependents)
- K/0: IDR 58.5M (married, no dependents)
- K/1: IDR 63M (married, 1 dependent)
- K/2: IDR 67.5M (married, 2 dependents)
- K/3: IDR 72M (married, 3 dependents)

**Employment Types:**
- PKWT (Perjanjian Kerja Waktu Tertentu): Fixed-term contract (max 2 years, can renew once)
- PKWTT (Perjanjian Kerja Waktu Tidak Tertentu): Permanent contract

**Labor Law (UU Cipta Kerja):**
- Max work hours: 8h/day, 40h/week (5-day) or 7h/day, 40h/week (6-day)
- Overtime: Max 4h/day, 18h/week
- Overtime pay: 1.5x first hour, 2x subsequent hours (weekday); 2x all hours (weekend)
- Annual leave: Minimum 12 days/year (after 12 months employment)
- Sick leave: No limit, require doctor's note after 2 days

### B. Competitive Landscape

| Feature | Talixa HRIS | Gadjian | Mekari Talenta | Sleekr |
|---------|-------------|---------|----------------|--------|
| **Pricing** | IDR 30-50K/employee | IDR 50K/employee | IDR 60K/employee | IDR 40K/employee |
| **Modules** | Modular (pay for what you use) | All-in bundle | Tiered bundles | All-in bundle |
| **AI Automation** | ✅ Core feature | ❌ None | ⚠️ Basic (no auto-approve) | ❌ None |
| **Hiring Integration** | ✅ Native (same platform) | ❌ No | ❌ No | ❌ No |
| **Target Market** | SMB (1-500) | SMB (10-500) | Mid-market (50-1000) | SMB (10-300) |
| **Attendance** | GPS + anomaly detection | GPS only | GPS only | GPS only |
| **Payroll** | Prep + error detection | Full execution | Full execution | Prep only |
| **Performance** | OKRs + 360° + AI | Basic reviews | OKRs | Basic |
| **Mobile App** | PWA | Native iOS/Android | PWA | Native |
| **Setup Time** | <1 day (auto from hiring) | 3-5 days | 1 week | 2-3 days |
| **Support** | Chat + Email | Email | Phone (Enterprise) | Chat |

**Differentiation:**
1. **Only HRIS with AI-first automation** (auto-approve, anomaly detection, error checking)
2. **Only platform with native hiring → HR integration** (zero duplicate data entry)
3. **Only modular pricing** (start small, expand as needed)
4. **Built for Indonesian SMBs** (not localized enterprise product)

### C. User Personas (Detailed)

**HR Manager (Primary User)**
- Age: 28-40
- Role: HR Manager, HR Generalist, People Operations
- Company: 50-300 employees, F&B/retail/logistics
- Pain: 60% of time on admin, slow approvals, manual payroll errors
- Goals: Automate routine tasks, reduce errors, improve employee experience
- Tech savvy: Medium (uses Excel, basic HR software)
- Decision power: Recommends, needs CFO/CEO approval for purchase

**Finance/Operations Lead (Economic Buyer)**
- Age: 35-50
- Role: CFO, COO, Finance Manager
- Company: 50-500 employees
- Pain: Current HRIS too expensive, payroll errors costly, compliance risk
- Goals: Reduce costs, improve accuracy, mitigate legal risk
- Tech savvy: Low-Medium (focuses on ROI, not features)
- Decision power: Final say on software purchases

**Employee (End User)**
- Age: 22-45
- Role: Frontline workers (cashiers, warehouse staff, drivers)
- Company: Any size
- Pain: Hard to request leave, can't access payslips, unclear attendance
- Goals: Easy leave request, transparent pay, mobile access
- Tech savvy: Low (smartphone user, WhatsApp heavy)
- Decision power: None (but high adoption = HR keeps product)

### D. Go-To-Market Strategy

**Phase 1: Beta (Months 1-2)**
- Target: 5 existing Talixa hiring customers
- Offer: Free HRIS for 3 months (in exchange for feedback)
- Goal: Validate product-market fit, gather testimonials

**Phase 2: Early Adopters (Months 3-6)**
- Target: 20 companies (50-200 employees, Jakarta/Bandung)
- Channel: Direct sales (existing customer base + referrals)
- Pricing: 50% discount (Starter/Growth tier)
- Goal: Prove ROI, build case studies

**Phase 3: Growth (Months 7-12)**
- Target: 50 companies
- Channel: Inbound (SEO, content marketing) + Outbound (LinkedIn, cold email)
- Pricing: Full price (Starter/Growth/Enterprise)
- Goal: Scale revenue to IDR 50M/month MRR

**Marketing Channels:**
1. **Content Marketing** (SEO-driven blog posts on HR topics)
2. **LinkedIn Ads** (target HR managers, CFOs)
3. **Referral Program** (existing customers refer, get 1 month free)
4. **Webinars** (monthly HR best practices + product demo)
5. **Partnerships** (accounting firms, HR consultants)

### E. Technical Dependencies

**Required Services:**
- Supabase (database, auth, storage, realtime) - Already in use
- OpenAI API (GPT-4o, GPT-4o-mini) - Already in use for CV parsing
- Vercel (hosting) - Already in use
- PostHog (analytics) - Already in use
- Sentry (error tracking) - Already in use

**New Integrations:**
- Bank APIs (BCA, Mandiri) - For payroll execution (Phase 2)
- Government APIs (BPJS, tax reporting) - For compliance automation (Phase 3)
- WhatsApp Business API (Twilio/MessageBird) - For notifications (Phase 2)
- E-signature API (Privy, OnlinePajak) - For digital contracts (Phase 3)

**Cost Estimate:**
- OpenAI: IDR 1K/employee/month (100 API calls/month @ IDR 10/call)
- Supabase: IDR 2M/month (flat, covers 10K employees)
- Vercel: IDR 3M/month (Pro plan)
- WhatsApp: IDR 100/message (avg 10 messages/employee/month = IDR 1K)

**Total:** IDR 7M/month fixed + IDR 2K/employee variable

---

**END OF PRD**

**Next Steps:**
1. Review and approve PRD
2. Create detailed technical specifications (HRIS_TECHNICAL.md already exists)
3. Begin Phase 1 implementation (database migrations + employee module)
4. Recruit 5 beta customers from existing Talixa hiring platform users
