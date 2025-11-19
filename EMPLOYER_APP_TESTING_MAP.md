# EMPLOYER APPLICATION - COMPREHENSIVE TESTING MAP

## PROJECT STRUCTURE OVERVIEW

### Base Directory
- **App Pages**: `/src/app/(employer)/`
  - Main layout: `/src/app/(employer)/layout.tsx`
  - HR Module: `/src/app/(employer)/hr/` (14 submodules)
  - Manager Module: `/src/app/(employer)/manager/`

### Components
- **HR Components**: `/src/components/hr/` (24 components)
- **Employee Components**: `/src/components/employees/`, `/src/components/employee/`
- **Payroll Components**: `/src/components/payroll/`
- **Leave Components**: `/src/components/leave/`
- **Attendance Components**: `/src/components/attendance/`
- **Performance Components**: `/src/components/performance/`
- **Manager Components**: `/src/components/manager/`
- **Workflow Components**: `/src/components/workflows/`
- **Analytics Components**: `/src/components/analytics/`
- **Integrations Components**: `/src/components/integrations/`
- **Compliance Components**: `/src/components/compliance/`
- **Forms**: `/src/components/forms/` (14 form components)

### API Layer
- **Services**: `/src/lib/api/services/` (9 service files)
- **API Types**: `/src/lib/api/types.ts`
- **API Client**: `/src/lib/api/client.ts`
- **API Response**: `/src/lib/api/response.ts`

### Domain Layer (Clean Architecture)
- **Use Cases**: `/src/modules/hr/application/use-cases/` (30+ use cases)
- **DTOs**: `/src/modules/hr/application/dto/` (8 DTO files)
- **Entities**: `/src/modules/hr/domain/entities/` (16 entities)
- **Repositories**: `/src/modules/hr/domain/repositories/` (8 repository interfaces)
- **Infrastructure**: `/src/modules/hr/infrastructure/repositories/` (Supabase implementations)
- **Services**: `/src/modules/hr/infrastructure/services/` (AI services, calculators)

---

## MODULE 1: EMPLOYEE MANAGEMENT

### Overview
Complete employee lifecycle management including creation, editing, viewing, and deletion.

### File Locations - Pages
| Feature | File Path |
|---------|-----------|
| Employee List | `/src/app/(employer)/hr/employees/page.tsx` |
| Create Employee | `/src/app/(employer)/hr/employees/new/page.tsx` |
| Employee Detail | `/src/app/(employer)/hr/employees/[id]/page.tsx` |
| Edit Employee | `/src/app/(employer)/hr/employees/[id]/edit/page.tsx` |
| Employee Layout | `/src/app/(employer)/hr/employees/layout.tsx` |

### Components
| Component | Path | Features |
|-----------|------|----------|
| EmployeeListTable | `/src/components/hr/EmployeeListTable.tsx` | Table with sorting, filtering, pagination, CRUD actions |
| EmployeeDetailView | `/src/components/hr/EmployeeDetailView.tsx` | Comprehensive employee profile display |
| EmployeeProfile | `/src/components/hr/EmployeeProfile.tsx` | Profile card component |
| EmployeeSearchFilter | `/src/components/hr/EmployeeSearchFilter.tsx` | Search and filter UI |
| EmployeeTimeline | `/src/components/hr/EmployeeTimeline.tsx` | Event timeline display |
| EmployeePayrollHistory | `/src/components/hr/EmployeePayrollHistory.tsx` | Salary history visualization |
| EmployeePerformanceHistory | `/src/components/hr/EmployeePerformanceHistory.tsx` | Performance history |
| EmployeeAttendanceSummary | `/src/components/hr/EmployeeAttendanceSummary.tsx` | Attendance stats |
| EmployeeDocumentsList | `/src/components/hr/EmployeeDocumentsList.tsx` | Associated documents |
| EmployeeTable | `/src/components/employees/EmployeeTable.tsx` | Alternative table view |

### Forms
| Form | Path | Fields |
|------|------|--------|
| EmployeeForm | `/src/components/forms/EmployeeForm.tsx` | Master form (create/edit) |
| EmployeeBasicInfo | `/src/components/forms/EmployeeBasicInfo.tsx` | Name, DOB, gender, contact |
| EmployeeEmployment | `/src/components/forms/EmployeeEmployment.tsx` | Position, department, status |
| EmployeeSalary | `/src/components/forms/EmployeeSalary.tsx` | Salary, allowances, deductions |
| EmployeeBPJS | `/src/components/forms/EmployeeBPJS.tsx` | BPJS insurance details |
| EmployeeDocuments | `/src/components/forms/EmployeeDocuments.tsx` | Document uploads |

### API Endpoints
```
GET    /api/v1/employees              # List with filters
POST   /api/v1/employees              # Create employee
GET    /api/v1/employees/{id}         # Get by ID
PATCH  /api/v1/employees/{id}         # Update employee
DELETE /api/v1/employees/{id}         # Delete employee
```

### Domain Models - Entities
- **Employee**: `/src/modules/hr/domain/entities/Employee.ts`
- **Position**: `/src/modules/hr/domain/entities/Position.ts`
- **Department**: `/src/modules/hr/domain/entities/Department.ts`

### Use Cases
| Use Case | File |
|----------|------|
| Create Employee | `/src/modules/hr/application/use-cases/CreateEmployee.ts` |
| Get Employee | `/src/modules/hr/application/use-cases/GetEmployee.ts` |
| List Employees | `/src/modules/hr/application/use-cases/ListEmployees.ts` |
| Update Employee | `/src/modules/hr/application/use-cases/UpdateEmployee.ts` |
| Delete Employee | `/src/modules/hr/application/use-cases/DeleteEmployee.ts` |

### Key Features & Workflows
- Multi-step employee registration form
- Advanced filtering (status, department, position, employment type)
- Search by name, email, ID
- Pagination with configurable page size
- Sort by any column
- Inline edit capabilities
- Bulk actions
- Employee status management (active, inactive, terminated, resigned)
- Profile photo upload
- Document attachment and management
- Historical data tracking

### CRUD Operations
- **Create**: Full 5-step form with validation
- **Read**: List with filters, detailed view with history
- **Update**: Edit any field with change tracking
- **Delete**: Soft delete with audit logging

### Permissions/Role-Based Access
- HR/Admin: Full CRUD
- Manager: Read-only (own team)
- Employee: Read own record only

### Notifications
- New employee added notification
- Status change alerts
- Document expiry reminders

### Export/Import
- Export employee list to CSV/PDF
- Bulk import from CSV

---

## MODULE 2: ATTENDANCE TRACKING

### Overview
Clock in/out, anomaly detection, leave records, and attendance analytics.

### File Locations - Pages
| Feature | File Path |
|---------|-----------|
| Attendance Anomalies | `/src/app/(employer)/hr/attendance/anomalies/page.tsx` |

### Components
| Component | Path | Features |
|-----------|------|----------|
| AttendanceAnomalyDashboard | `/src/components/hr/AttendanceAnomalyDashboard.tsx` | AI-detected anomalies |
| AttendanceClockCard | `/src/components/hr/AttendanceClockCard.tsx` | Clock in/out card |
| AttendanceCalendar | `/src/components/attendance/AttendanceCalendar.tsx` | Calendar view |

### API Endpoints
```
POST   /api/v1/attendance/clock-in    # Clock in
POST   /api/v1/attendance/clock-out   # Clock out
GET    /api/v1/attendance             # Get records
GET    /api/v1/attendance/summary     # Get summary
GET    /api/v1/attendance/anomalies   # AI-detected anomalies
POST   /api/v1/attendance/anomalies/{id}/approve   # Approve anomaly
POST   /api/v1/attendance/anomalies/{id}/reject    # Reject anomaly
```

### Domain Models
- **AttendanceRecord**: `/src/modules/hr/domain/entities/AttendanceRecord.ts`
- **AttendanceShift**: `/src/modules/hr/domain/entities/AttendanceShift.ts`

### Use Cases
| Use Case | File |
|----------|------|
| Clock In | `/src/modules/hr/application/use-cases/ClockIn.ts` |
| Clock Out | `/src/modules/hr/application/use-cases/ClockOut.ts` |
| Get Attendance | `/src/modules/hr/application/use-cases/GetAttendance.ts` |

### Key Features
- GPS-based location tracking
- Geofencing validation
- Clock in/out with photo capture
- Attendance summary with charts
- AI anomaly detection (duplicate clocks, impossible locations, odd hours)
- Manual adjustment capabilities
- Shift management
- Work location tracking (office/remote)
- Overtime calculation
- Late arrival tracking

### AI Services
- **AIAnomalyDetector**: `/src/modules/hr/infrastructure/services/AIAnomalyDetector.ts`
  - Fraud detection
  - Pattern analysis
  - Outlier identification

### Permissions
- Employee: Clock in/out own record
- Manager: View team attendance
- HR: Full management

### Notifications
- Clock in/out confirmations
- Anomaly alerts
- Late arrival notifications

---

## MODULE 3: LEAVE MANAGEMENT

### Overview
Leave request submission, approval workflows, and balance tracking.

### File Locations - Pages
(Part of HR module, handled through manager dashboard and analytics)

### Components
| Component | Path | Features |
|-----------|------|----------|
| LeaveRequestCardWithAI | `/src/components/hr/LeaveRequestCardWithAI.tsx` | Smart leave cards |
| LeaveRequestCard | `/src/components/leave/LeaveRequestCard.tsx` | Individual leave card |

### API Endpoints
```
GET    /api/v1/leave/requests                           # List requests
POST   /api/v1/leave/requests                           # Create request
GET    /api/v1/leave/requests/{id}                      # Get request
PATCH  /api/v1/leave/requests/{id}                      # Update request
DELETE /api/v1/leave/requests/{id}                      # Cancel request
POST   /api/v1/leave/requests/{id}/approve              # Approve leave
POST   /api/v1/leave/requests/{id}/reject               # Reject leave
GET    /api/v1/leave/balances/{employeeId}              # Check balance
```

### Domain Models
- **LeaveRequest**: `/src/modules/hr/domain/entities/LeaveRequest.ts`
- **LeaveBalance**: `/src/modules/hr/domain/entities/LeaveBalance.ts`

### Use Cases
| Use Case | File |
|----------|------|
| Create Leave Request | `/src/modules/hr/application/use-cases/CreateLeaveRequest.ts` |

### Key Features
- Multiple leave types (annual, sick, unpaid, maternity, paternity, compassionate, other)
- Leave balance tracking
- AI-powered auto-approval
- Approval workflows
- Conflict detection (overlapping requests)
- Balance validation
- Email notifications
- Calendar integration
- Configurable policies per leave type

### AI Services
- **AILeaveApprovalEngine**: `/src/modules/hr/infrastructure/services/AILeaveApprovalEngine.ts`
  - Auto-approval decisions
  - Risk assessment

### Permissions
- Employee: Submit own leave
- Manager: Approve team leave
- HR: Override and manage balances

### Notifications
- Leave submission confirmation
- Approval/rejection notifications
- Remaining balance alerts
- Upcoming leave reminders

---

## MODULE 4: PAYROLL PROCESSING

### Overview
Salary calculation, payslip generation, BPJS/tax calculations.

### File Locations - Pages
| Feature | File Path |
|---------|-----------|
| Payroll Management | `/src/app/(employer)/hr/payroll/page.tsx` |
| Payroll Period Detail | `/src/app/(employer)/hr/payroll/periods/[id]/page.tsx` |

### Components
| Component | Path | Features |
|-----------|------|----------|
| PayrollPeriodList | `/src/components/hr/PayrollPeriodList.tsx` | Period listing and management |
| PayrollPeriodDetail | `/src/components/hr/PayrollPeriodDetail.tsx` | Detailed payroll period view |
| PayrollPeriodCard | `/src/components/payroll/PayrollPeriodCard.tsx` | Card component |
| PayslipViewer | `/src/components/payroll/PayslipViewer.tsx` | PDF/print payslip |
| PayrollErrorDetectionPanel | `/src/components/hr/PayrollErrorDetectionPanel.tsx` | Validation errors |
| CreatePeriodButton | `/src/components/hr/CreatePeriodButton.tsx` | Create new period |

### API Endpoints
```
GET    /api/v1/payroll/periods                                    # List periods
POST   /api/v1/payroll/periods                                    # Create period
GET    /api/v1/payroll/periods/{id}                               # Get period details
PATCH  /api/v1/payroll/periods/{id}                               # Update period
POST   /api/v1/payroll/periods/{id}/process                       # Process payroll
POST   /api/v1/payroll/periods/{id}/approve                       # Approve payroll
GET    /api/v1/payroll/summaries                                  # Get summaries
GET    /api/v1/payroll/payslips/{employeeId}/{periodId}/generate  # Generate payslip
GET    /api/v1/payroll/payslips/{employeeId}                      # Get payslips
```

### Domain Models
- **PayrollPeriod**: `/src/modules/hr/domain/entities/PayrollPeriod.ts`
- **PayrollComponent**: `/src/modules/hr/domain/entities/PayrollComponent.ts`
- **PayrollSummary**: `/src/modules/hr/domain/entities/PayrollSummary.ts`

### Use Cases
| Use Case | File |
|----------|------|
| Create Payroll Period | `/src/modules/hr/application/use-cases/CreatePayrollPeriod.ts` |
| Process Payroll | `/src/modules/hr/application/use-cases/ProcessPayroll.ts` |
| Approve Payroll | `/src/modules/hr/application/use-cases/ApprovePayroll.ts` |
| Generate Payslip | `/src/modules/hr/application/use-cases/GeneratePayslip.ts` |

### Key Features
- Monthly payroll period management (draft → processing → approved → paid)
- Salary calculations with base + allowances
- BPJS deductions (Kesehatan, JHT, JP)
- PPh21 tax calculations
- Overtime calculations
- Custom deductions
- Payslip generation (PDF export)
- Error detection and correction
- Approval workflows
- Payment status tracking
- Bulk disbursement
- Tax reporting

### Calculation Services
- **BPJSCalculator**: `/src/modules/hr/infrastructure/services/BPJSCalculator.ts`
- **PPh21Calculator**: `/src/modules/hr/infrastructure/services/PPh21Calculator.ts`
- **AIPayrollErrorDetector**: `/src/modules/hr/infrastructure/services/AIPayrollErrorDetector.ts`

### Permissions
- HR: Full management
- Finance: Approve
- Manager: View own team payroll

### Export/Import
- Export payroll to Excel
- Export payslips as PDF
- Bulk payment file export

### Notifications
- Payroll processed notifications
- Payment completion confirmations
- Approval required alerts

---

## MODULE 5: PERFORMANCE MANAGEMENT

### Overview
Goals setting, reviews, feedback, and performance ratings.

### File Locations - Pages
| Feature | File Path |
|---------|-----------|
| Performance Main | `/src/app/(employer)/hr/performance/page.tsx` |
| Performance Goals | `/src/app/(employer)/hr/performance/goals/page.tsx` |
| New Review | `/src/app/(employer)/hr/performance/reviews/new/page.tsx` |

### Components
| Component | Path | Features |
|-----------|------|----------|
| PerformanceReviewList | `/src/components/hr/PerformanceReviewList.tsx` | List all reviews |
| PerformanceReviewForm | `/src/components/hr/PerformanceReviewForm.tsx` | Create/edit review |
| PerformanceReviewCard | `/src/components/performance/PerformanceReviewCard.tsx` | Card view |
| GoalsList | `/src/components/hr/GoalsList.tsx` | Goals management |

### API Endpoints
```
GET    /api/v1/performance/reviews              # List reviews
POST   /api/v1/performance/reviews              # Create review
GET    /api/v1/performance/reviews/{id}         # Get review
PATCH  /api/v1/performance/reviews/{id}         # Update review
POST   /api/v1/performance/reviews/{id}/submit  # Submit review
GET    /api/v1/performance/goals                # List goals
POST   /api/v1/performance/goals                # Create goal
PATCH  /api/v1/performance/goals/{id}           # Update goal progress
```

### Domain Models
- **PerformanceReview**: `/src/modules/hr/domain/entities/PerformanceReview.ts`
- **PerformanceGoal**: `/src/modules/hr/domain/entities/PerformanceGoal.ts`

### Use Cases
| Use Case | File |
|----------|------|
| Create Performance Goal | `/src/modules/hr/application/use-cases/CreatePerformanceGoal.ts` |
| Create Performance Review | `/src/modules/hr/application/use-cases/CreatePerformanceReview.ts` |
| Submit Performance Review | `/src/modules/hr/application/use-cases/SubmitPerformanceReview.ts` |
| Update Goal Progress | `/src/modules/hr/application/use-cases/UpdateGoalProgress.ts` |

### Key Features
- OKR/KPI goal setting
- 360-degree feedback capability
- Rating scales (1-5)
- Competency assessment
- Review cycles and templates
- Performance analytics
- Calibration sessions
- Trend analysis
- AI sentiment analysis on feedback

### AI Services
- **AISentimentAnalyzer**: `/src/modules/hr/infrastructure/services/AISentimentAnalyzer.ts`

### Permissions
- Employee: Set own goals, view own reviews
- Manager: Create/rate team members
- HR: Full management and analytics
- Skip-level: View

### Notifications
- Review cycle reminders
- Feedback received alerts
- Rating completion requests

---

## MODULE 6: RECRUITMENT & ONBOARDING

### Overview
Onboarding workflows, document collection, task management.

### File Locations - Pages
| Feature | File Path |
|---------|-----------|
| Workflows | `/src/app/(employer)/hr/workflows/page.tsx` |
| Onboarding Workflow | `/src/app/(employer)/hr/workflows/onboarding/page.tsx` |
| Offboarding Workflow | `/src/app/(employer)/hr/workflows/offboarding/page.tsx` |
| Workflow Builder | `/src/app/(employer)/hr/workflows/builder/page.tsx` |

### Components
| Component | Path | Features |
|-----------|------|----------|
| WorkflowList | `/src/components/workflows/WorkflowList.tsx` | Workflow management |
| WorkflowBuilder | `/src/components/workflows/WorkflowBuilder.tsx` | Visual workflow editor |
| OnboardingWorkflow | `/src/components/workflows/OnboardingWorkflow.tsx` | Onboarding specific |
| OnboardingWorkflowIntegrated | `/src/components/workflows/OnboardingWorkflowIntegrated.tsx` | Integrated version |
| OffboardingWorkflow | `/src/components/workflows/OffboardingWorkflow.tsx` | Exit process |

### API Endpoints
```
GET    /api/v1/onboarding/workflows                    # List workflows
POST   /api/v1/onboarding/workflows                    # Create workflow
GET    /api/v1/onboarding/workflows/{id}               # Get workflow
PATCH  /api/v1/onboarding/workflows/{id}               # Update workflow
DELETE /api/v1/onboarding/workflows/{id}               # Delete workflow
POST   /api/v1/onboarding/workflows/{id}/execute       # Execute workflow
POST   /api/v1/onboarding/workflows/{id}/steps/{stepNumber}  # Complete step
GET    /api/v1/workflows                               # Generic workflows
POST   /api/v1/workflows                               # Create workflow
POST   /api/v1/workflows/{id}/execute                  # Execute workflow
```

### Key Features
- Pre-boarding tasks (document collection)
- Day 1 onboarding checklist
- First month milestones
- Hardware/access provisioning
- Training assignments
- Buddy/mentor assignment
- Offboarding checklist
- Exit interviews
- Knowledge transfer tasks
- Equipment return tracking
- Workflow automation with conditions
- Email notifications at each step
- Task dependencies

### Permissions
- HR: Create/manage workflows
- Manager: Execute steps for team
- Employee: Complete assigned tasks

### Notifications
- Task assignments
- Step completions
- Workflow milestone alerts
- Pending action reminders

---

## MODULE 7: ANALYTICS & REPORTING

### Overview
Dashboard, data visualization, predictive insights, and executive reports.

### File Locations - Pages
| Feature | File Path |
|---------|-----------|
| HR Analytics | `/src/app/(employer)/hr/analytics/page.tsx` |

### Components
| Component | Path | Features |
|-----------|------|----------|
| ExecutiveDashboard | `/src/components/analytics/ExecutiveDashboard.tsx` | KPI dashboard |
| HRAnalyticsHub | `/src/components/analytics/HRAnalyticsHub.tsx` | Detailed analytics |
| PredictiveInsights | `/src/components/analytics/PredictiveInsights.tsx` | AI predictions |

### API Endpoints
```
GET    /api/v1/analytics/dashboard         # Executive dashboard
GET    /api/v1/analytics/employees         # Employee analytics
GET    /api/v1/analytics/attendance        # Attendance analytics
GET    /api/v1/analytics/leave             # Leave analytics
GET    /api/v1/analytics/payroll           # Payroll analytics
GET    /api/v1/analytics/performance       # Performance analytics
GET    /api/v1/platform/analytics          # Platform-level analytics
GET    /api/v1/platform/analytics/advanced # Advanced analytics
```

### Key Features
- Employee headcount trends
- Turnover analysis
- Attendance trends
- Leave usage patterns
- Payroll analytics
- Performance distributions
- Predictive analytics (attrition risk)
- Custom dashboards
- Report scheduling
- Data export (PDF, Excel)
- Real-time metrics
- Charts and visualizations

### Permissions
- Executive: Full access
- Manager: Team-level only
- HR: Company-level

---

## MODULE 8: COMPLIANCE & DOCUMENTS

### Overview
Document management, GDPR compliance, audit trails, compliance alerts.

### File Locations - Pages
| Feature | File Path |
|---------|-----------|
| Documents | `/src/app/(employer)/hr/documents/page.tsx` |
| Compliance | `/src/app/(employer)/hr/compliance/page.tsx` |
| Audit & GDPR | `/src/app/(employer)/hr/audit-gdpr/page.tsx` |

### Components
| Component | Path | Features |
|-----------|------|----------|
| ComplianceDashboard | `/src/components/hr/ComplianceDashboard.tsx` | Compliance overview |
| DocumentExpiryAlerts | `/src/components/hr/DocumentExpiryAlerts.tsx` | Expiry tracking |
| AuditTrailViewer | `/src/components/compliance/AuditTrailViewer.tsx` | Audit log viewer |
| GDPRCompliance | `/src/components/compliance/GDPRCompliance.tsx` | GDPR management |

### API Endpoints
```
GET    /api/v1/documents                     # List documents
POST   /api/v1/documents                     # Upload document
GET    /api/v1/documents/{id}                # Get document
PATCH  /api/v1/documents/{id}                # Update document
DELETE /api/v1/documents/{id}                # Delete document
GET    /api/v1/documents/{id}/download       # Download document
GET    /api/v1/compliance/alerts             # Get compliance alerts
POST   /api/v1/compliance/alerts/{id}/resolve # Resolve alert
GET    /api/v1/compliance/audit-logs         # Get audit logs
```

### Domain Models
- **EmployeeDocument**: `/src/modules/hr/domain/entities/EmployeeDocument.ts`
- **ComplianceAlert**: `/src/modules/hr/domain/entities/ComplianceAlert.ts`
- **AuditLog**: `/src/modules/hr/domain/entities/AuditLog.ts`

### Use Cases
| Use Case | File |
|----------|------|
| Upload Document | `/src/modules/hr/application/use-cases/UploadDocument.ts` |
| Extract Document Data | `/src/modules/hr/application/use-cases/ExtractDocumentData.ts` |
| Create Compliance Alert | `/src/modules/hr/application/use-cases/CreateComplianceAlert.ts` |
| Create Audit Log | `/src/modules/hr/application/use-cases/CreateAuditLog.ts` |

### Key Features
- Document upload and storage
- OCR and document data extraction
- Document verification workflow
- Expiry date tracking with alerts
- Document types (KTP, NPWP, BPJS, contracts)
- Compliance checklist
- Audit log tracking (all changes)
- GDPR data request handling
- Data export for compliance
- User consent management
- Data retention policies

### AI Services
- **AIDocumentExtractor**: `/src/modules/hr/infrastructure/services/AIDocumentExtractor.ts`

### Permissions
- HR/Compliance: Full management
- Manager: View team documents
- Employee: Upload own documents

### Notifications
- Document expiry alerts
- Verification required notices
- Compliance issue alerts

---

## MODULE 9: ORGANIZATION & SETTINGS

### Overview
Organization structure, departments, positions, company settings.

### File Locations - Pages
| Feature | File Path |
|---------|-----------|
| Organization Chart | `/src/app/(employer)/hr/organization/page.tsx` |
| Calendar | `/src/app/(employer)/hr/calendar/page.tsx` |

### Components
| Component | Path | Features |
|-----------|------|----------|
| OrgChartPlaceholder | `/src/components/hr/OrgChartPlaceholder.tsx` | Org structure |
| HolidayCalendar | `/src/components/calendar/HolidayCalendar.tsx` | Holiday management |

### API Endpoints
```
GET    /api/v1/departments      # List departments
POST   /api/v1/departments      # Create department
PATCH  /api/v1/departments/{id} # Update department
GET    /api/v1/positions        # List positions
POST   /api/v1/positions        # Create position
PATCH  /api/v1/positions/{id}   # Update position
```

### Domain Models
- **Department**: `/src/modules/hr/domain/entities/Department.ts`
- **Position**: `/src/modules/hr/domain/entities/Position.ts`

### Use Cases
| Use Case | File |
|----------|------|
| Create Department | `/src/modules/hr/application/use-cases/CreateDepartment.ts` |
| Create Position | `/src/modules/hr/application/use-cases/CreatePosition.ts` |

### Key Features
- Organization chart visualization
- Department hierarchy
- Position management
- Reporting lines
- Holiday calendar
- Working hours settings
- Shift templates
- Location management

---

## MODULE 10: INTEGRATIONS

### Overview
Third-party integrations, webhooks, API management, developer portal.

### File Locations - Pages
| Feature | File Path |
|---------|-----------|
| Integrations | `/src/app/(employer)/hr/integrations/page.tsx` |

### Components
| Component | Path | Features |
|-----------|------|----------|
| IntegrationMarketplace | `/src/components/integrations/IntegrationMarketplace.tsx` | Available integrations |
| WebhookManagement | `/src/components/integrations/WebhookManagement.tsx` | Webhook configuration |
| APIDeveloperPortal | `/src/components/integrations/APIDeveloperPortal.tsx` | Developer tools |

### API Endpoints
```
GET    /api/v1/integrations                        # List available integrations
POST   /api/v1/integrations/provider/install       # Install integration
POST   /api/v1/integrations/provider/disconnect    # Disconnect integration
GET    /api/v1/integrations/installed              # List installed integrations
GET    /api/v1/integrations/{id}/install           # Install specific integration
POST   /api/v1/integrations/{id}/uninstall         # Uninstall integration
POST   /api/v1/integrations/callback/{provider}    # OAuth callback handler
POST   /api/v1/integrations/webhook/slack          # Slack webhook handler
GET    /api/v1/webhooks                            # List webhooks
POST   /api/v1/webhooks                            # Create webhook
DELETE /api/v1/webhooks/{id}                       # Delete webhook
```

### Key Features
- Marketplace of pre-built integrations
- OAuth integration support
- Webhook management
- API documentation
- Developer API keys
- API rate limiting
- Slack integration (notifications)
- Custom webhook handlers
- Event-based triggers

### Permissions
- Admin: Full integration management
- HR: Manage installed integrations

---

## MODULE 11: MANAGER DASHBOARD

### Overview
Team management, pending approvals, attendance overview.

### File Locations - Pages
| Feature | File Path |
|---------|-----------|
| Manager Dashboard | `/src/app/(employer)/manager/dashboard/page.tsx` |

### Components
| Component | Path | Features |
|-----------|------|----------|
| ManagerDashboardEnhanced | `/src/components/manager/ManagerDashboardEnhanced.tsx` | Team overview |

### Key Features
- Team member list with status
- Today's attendance overview
- Pending approvals (leave, overtime, expenses)
- Upcoming team events (birthdays, anniversaries, new joiners)
- Performance ratings
- Team sentiment/mood
- Quick actions
- Team statistics
- Engagement metrics

### Permissions
- Manager: Own team only
- HR/Admin: All teams

---

## MODULE 12: GAMIFICATION & RECOGNITION

### Overview
Points, badges, leaderboards, achievements.

### API Endpoints
```
GET    /api/v1/gamification/points              # Get user points
POST   /api/v1/gamification/points/award        # Award points
GET    /api/v1/gamification/badges              # List badges
GET    /api/v1/gamification/badges/earned       # Get earned badges
POST   /api/v1/gamification/badges              # Award badge
GET    /api/v1/gamification/leaderboard         # Get leaderboard
GET    /api/v1/gamification/achievements        # List achievements
```

### Components
| Component | Path | Features |
|-----------|------|----------|
| (Gamification components) | `/src/components/gamification/` | Engagement features |

### Key Features
- Points accumulation
- Badge achievements
- Leaderboard
- Recognition system
- Engagement tracking

---

---

# CRITICAL USER JOURNEYS FOR TESTING

## Journey 1: HR Manager Onboarding New Employee

### Steps
1. Navigate to Employees → Add Employee
2. Fill Basic Information form
   - Name, DOB, email, phone
   - Validate date formats
   - Check email uniqueness
3. Fill Employment Information
   - Select department and position
   - Set salary and benefits
   - Assign manager
4. Add Documents
   - Upload KTP, NPWP
   - Verify documents
5. Configure BPJS
   - BPJS Kesehatan
   - BPJS JHT, JP
6. Save and trigger onboarding workflow
7. System assigns onboarding tasks
8. Employee receives welcome email
9. Manager receives team assignment notification

### Test Points
- Form validation (required fields, formats)
- Duplicate email detection
- Salary calculation preview
- Document upload and verification
- Workflow triggering
- Email delivery
- Data consistency across modules

### API Calls
```
POST /api/v1/employees
POST /api/v1/documents
POST /api/v1/onboarding/workflows/{id}/execute
```

---

## Journey 2: Processing Monthly Payroll

### Steps
1. Navigate to Payroll Management
2. Create New Payroll Period
   - Select start and end dates
   - Validate no overlapping periods
3. View Period Details
   - See all employees with base salary
   - Review allowances and deductions
4. Process Payroll
   - Calculate BPJS (Kesehatan, JHT, JP)
   - Calculate PPh21 tax
   - Calculate overtime
   - Detect errors (negative net, invalid deductions)
5. Review and Approve
   - HR approves payroll
   - Finance approves payment
6. Generate Payslips
   - PDF generation for each employee
7. Submit for Payment
   - Export to payment file
8. Mark as Paid
   - Update status and payment date

### Test Points
- Date range validation
- Employee salary data presence
- BPJS calculation accuracy (Indonesian formulas)
- PPh21 tax calculation accuracy
- Allowance and deduction handling
- Overtime hour calculations
- Error detection (missing data, invalid values)
- PDF generation and content accuracy
- Approval workflow
- Status transitions
- Payment file format

### API Calls
```
POST /api/v1/payroll/periods
GET /api/v1/payroll/periods/{id}
POST /api/v1/payroll/periods/{id}/process
POST /api/v1/payroll/periods/{id}/approve
GET /api/v1/payroll/payslips/{employeeId}/{periodId}/generate
```

---

## Journey 3: Approving Leave Requests

### Steps
1. Employee submits leave request
   - Select leave type (annual, sick, unpaid)
   - Select dates
   - Add reason/notes
   - System checks balance
   - System checks conflicts
2. Notification sent to manager
3. Manager receives in pending approvals
4. Manager reviews request
   - See employee details
   - See remaining balance
   - See approval AI confidence
5. Manager approves or rejects
   - Add approval notes
6. Employee receives notification
7. Calendar updated
8. Attendance records updated

### Test Points
- Leave balance validation
- Date range logic (inclusive/exclusive)
- Conflict detection
- Email notifications (submission, approval, rejection)
- Calendar integration
- AI approval confidence scoring
- Manager override functionality
- Balance updates
- Status transitions

### API Calls
```
POST /api/v1/leave/requests
GET /api/v1/leave/balances/{employeeId}
POST /api/v1/leave/requests/{id}/approve
POST /api/v1/leave/requests/{id}/reject
```

---

## Journey 4: Conducting Performance Review

### Steps
1. Manager initiates new performance review
   - Select employee
   - Select review period (quarterly, annual)
   - Set template
2. Fill review form
   - Rate competencies (1-5)
   - Set goals for next period
   - Provide feedback text
3. Review AI sentiment analysis
   - System analyzes feedback tone
4. Submit for employee review
5. Employee reviews and adds self-assessment
6. Manager finalizes review
7. Review marked complete
8. Performance data updated in analytics

### Test Points
- Form completion validation
- Rating scales (1-5)
- Feedback text validation
- AI sentiment analysis functionality
- Review cycle management
- Template application
- Email notifications
- Data persistence
- Analytics updates

### API Calls
```
POST /api/v1/performance/reviews
POST /api/v1/performance/reviews/{id}
POST /api/v1/performance/reviews/{id}/submit
GET /api/v1/analytics/performance
```

---

## Journey 5: Viewing Analytics/Reports

### Steps
1. Navigate to HR Analytics
2. View Executive Dashboard
   - Headcount
   - Turnover rate
   - Attendance rate
   - Performance avg
3. Switch to Analytics Hub
   - Employee metrics
   - Attendance trends
   - Leave patterns
   - Payroll costs
4. View Predictive Insights
   - Attrition risk scores
   - Recommendations
5. Export Report
   - Select metrics
   - Choose format (PDF, Excel)
   - Download

### Test Points
- Dashboard data accuracy
- Chart rendering
- Filter functionality
- Real-time data updates
- Export format correctness
- Permission-based data access
- Performance (large datasets)

### API Calls
```
GET /api/v1/analytics/dashboard
GET /api/v1/analytics/employees
GET /api/v1/analytics/attendance
GET /api/v1/analytics/leave
GET /api/v1/analytics/payroll
GET /api/v1/analytics/performance
```

---

## Journey 6: Managing Attendance

### Steps
1. Employee clocks in (morning)
   - Opens app/web
   - Clicks clock in
   - Location captured (GPS)
   - Photo taken (optional)
2. System validates location (geofencing)
3. System checks shift
4. Clock in recorded
5. Employee works
6. Employee clocks out (evening)
   - Clicks clock out
   - Duration calculated
   - Overtime if > 8 hours
7. Manager views team attendance
   - See who's present, absent, on leave
   - See timestamps
8. System detects anomalies
   - Two clock-ins same minute
   - Impossible travel distances
   - Unusual patterns
9. Manager reviews anomalies
10. Manager approves or rejects

### Test Points
- GPS location capture and validation
- Geofencing logic
- Shift validation
- Clock in/out timestamps
- Duration calculations
- Overtime detection
- Anomaly detection accuracy
- Photo upload and storage
- Email notifications
- Offline functionality (PWA)

### API Calls
```
POST /api/v1/attendance/clock-in
POST /api/v1/attendance/clock-out
GET /api/v1/attendance
GET /api/v1/attendance/anomalies
POST /api/v1/attendance/anomalies/{id}/approve
```

---

## Journey 7: Document Management & Compliance

### Steps
1. HR uploads employee documents
   - KTP (ID card)
   - NPWP (tax ID)
   - BPJS Kesehatan
   - BPJS Ketenagakerjaan
   - Employment contract
2. System extracts data from documents
   - OCR processing
   - Data validation
3. System sets expiry dates
4. Documents marked verified
5. Employee receives document expiry alerts
   - 30 days before expiry
   - 7 days before expiry
   - On expiry date
6. HR tracks compliance status
   - See all document status
   - See upcoming expiries
   - Generate compliance report

### Test Points
- File upload validation (type, size)
- OCR accuracy
- Data extraction
- Expiry date management
- Email notifications
- Compliance reporting
- Document storage and retrieval

### API Calls
```
POST /api/v1/documents
GET /api/v1/documents
PATCH /api/v1/documents/{id}
GET /api/v1/compliance/alerts
POST /api/v1/compliance/alerts/{id}/resolve
```

---

# TECHNICAL ELEMENTS TO TEST

## 1. AUTHENTICATION & AUTHORIZATION

### Files
- `/src/lib/middleware/auth.ts` - Auth middleware
- `/src/app/api/v1/auth/login/route.ts` - Login endpoint
- `/src/app/api/v1/auth/logout/route.ts` - Logout
- `/src/app/api/v1/auth/refresh/route.ts` - Token refresh
- `/src/app/api/v1/auth/mfa/setup/route.ts` - MFA setup
- `/src/app/api/v1/auth/mfa/verify/route.ts` - MFA verification

### Test Scenarios
- Valid credentials
- Invalid credentials
- Expired tokens
- Token refresh
- MFA setup and verification
- MFA disabled
- Session management
- Logout and session cleanup
- Role-based access control
- Permission denied scenarios

### Key Tests
```
✓ Login with valid credentials
✓ Login with invalid credentials
✓ Token expiration handling
✓ Token refresh workflow
✓ MFA setup and verification
✓ MFA bypass attempts
✓ Permission checking per role
✓ Session timeout
✓ Logout clears session
✓ Cross-site request forgery (CSRF) protection
```

---

## 2. FORM VALIDATIONS

### Files
- `/src/components/forms/EmployeeForm.tsx`
- `/src/components/forms/EmployeeBasicInfo.tsx`
- `/src/components/forms/EmployeeEmployment.tsx`
- `/src/components/forms/EmployeeSalary.tsx`
- `/src/components/forms/EmployeeBPJS.tsx`
- `/src/components/forms/EmployeeDocuments.tsx`
- `/src/components/hr/PerformanceReviewForm.tsx`

### Validation Types
- Required field validation
- Email format validation
- Phone number format
- Date format (DD/MM/YYYY)
- Number ranges (salary, age)
- Unique email check
- Dependent field validation
- Custom business logic

### Test Cases
```
✓ Empty required fields
✓ Invalid email format
✓ Invalid phone numbers
✓ Invalid date formats
✓ Negative salary
✓ Age validation (minimum, maximum)
✓ Duplicate email detection
✓ File upload validations (size, type)
✓ Cross-field validations
✓ Real-time validation feedback
```

---

## 3. API INTEGRATIONS

### Service Layer Files
- `/src/lib/api/services/employeeService.ts`
- `/src/lib/api/services/leaveService.ts`
- `/src/lib/api/services/payrollService.ts`
- `/src/lib/api/services/attendanceService.ts`
- `/src/lib/api/services/performanceService.ts`
- `/src/lib/api/services/analyticsService.ts`
- `/src/lib/api/services/complianceService.ts`
- `/src/lib/api/services/workflowService.ts`
- `/src/lib/api/services/attendanceAnomalyService.ts`

### Test Scenarios
```
✓ GET requests with various filters
✓ POST create operations
✓ PATCH update operations
✓ DELETE operations
✓ Pagination handling
✓ Sorting capabilities
✓ Error response handling
✓ Network timeouts
✓ Retry logic
✓ Rate limiting
✓ Request/response validation
✓ Cache invalidation
✓ Concurrent requests
```

---

## 4. REAL-TIME FEATURES (WebSockets)

### Files
- `/src/lib/realtime/client.ts`
- `/src/lib/realtime/provider.tsx`
- `/src/lib/realtime/hooks.ts`
- `/src/lib/realtime/use-realtime-tenants.ts`

### Features to Test
```
✓ Real-time notifications
✓ Live dashboard updates
✓ Presence indicators
✓ Connection state management
✓ Reconnection handling
✓ Message delivery guarantees
✓ Conflict resolution
✓ Bandwidth optimization
```

---

## 5. FILE OPERATIONS

### Test Scenarios
```
✓ File upload validation (type, size, count)
✓ File storage (S3/cloud)
✓ File retrieval
✓ PDF generation (payslips, reports)
✓ Excel export
✓ CSV export
✓ Concurrent uploads
✓ Large file handling
✓ File deletion
✓ Virus scanning
✓ File permissions
```

### Components
- Document upload in employee forms
- Payslip PDF generation
- Report exports
- Bulk import functionality

---

## 6. DATA EXPORTS

### Formats
```
✓ CSV export
✓ Excel export with formatting
✓ PDF reports
✓ JSON API responses
```

### Features
```
✓ Column selection
✓ Date range filtering
✓ Encoding (UTF-8)
✓ Formula injection prevention
✓ Large dataset handling
✓ Async download generation
```

---

## 7. ERROR HANDLING

### Files
- `/src/lib/middleware/errorHandler.ts`
- `/src/lib/api/response.ts`

### Error Types
```
✓ 400 Bad Request (validation)
✓ 401 Unauthorized
✓ 403 Forbidden
✓ 404 Not Found
✓ 409 Conflict (duplicate, state)
✓ 422 Unprocessable Entity
✓ 429 Rate Limit Exceeded
✓ 500 Internal Server Error
✓ 503 Service Unavailable
```

### User Feedback
```
✓ Error messages clear and helpful
✓ Toast notifications
✓ Inline field errors
✓ Error logging
✓ Error tracking (Sentry)
✓ User-friendly error messages
```

---

## 8. LOADING STATES

### Components
```
✓ Skeleton screens
✓ Spinners
✓ Progress bars
✓ Placeholder content
✓ Graceful degradation
✓ Progressive loading
```

### Test Cases
```
✓ First load
✓ Data refresh
✓ Search/filter
✓ Pagination
✓ File upload progress
✓ Download progress
✓ Long operations (payroll processing)
```

---

## 9. OFFLINE FUNCTIONALITY (PWA)

### Files
- `/src/components/pwa/` - PWA components

### Features
```
✓ Service worker registration
✓ Cache strategies
✓ Offline access
✓ Sync queuing
✓ Offline indicators
✓ Data sync on reconnect
```

### Test Cases
```
✓ Works offline (cached pages)
✓ Queues actions when offline
✓ Syncs when online
✓ Conflict resolution
✓ Cache updates
✓ Installation prompts
```

---

## 10. PUSH NOTIFICATIONS

### Files
- `/src/app/api/v1/notifications/register/route.ts`
- `/src/app/api/v1/notifications/test/route.ts`
- `/src/app/api/v1/notifications/preferences/route.ts`
- `/src/app/api/push/subscribe/route.ts`
- `/src/app/api/push/unsubscribe/route.ts`

### Test Cases
```
✓ Notification registration
✓ Notification preferences
✓ Test notifications
✓ Notification delivery
✓ Notification sound/vibration
✓ Notification badges
✓ Click-through tracking
✓ Unsubscribe functionality
```

---

## 11. PERFORMANCE & SCALABILITY

### Metrics to Test
```
✓ Page load time
✓ Time to Interactive (TTI)
✓ Core Web Vitals (LCP, FID, CLS)
✓ Database query performance
✓ API response time
✓ Large list rendering (1000+ items)
✓ Memory usage
✓ Network waterfall
```

### Optimization Tests
```
✓ Pagination effectiveness
✓ Lazy loading
✓ Image optimization
✓ Code splitting
✓ CSS-in-JS performance
✓ Bundle size
✓ Caching headers
```

---

## 12. SECURITY TESTING

### Files
- `/src/lib/ratelimit/middleware.ts` - Rate limiting

### Test Cases
```
✓ SQL injection prevention
✓ XSS prevention
✓ CSRF protection
✓ Rate limiting
✓ Input sanitization
✓ Output encoding
✓ Authentication bypass attempts
✓ Authorization bypass attempts
✓ Session hijacking prevention
✓ Data exposure prevention
✓ File upload security
✓ API key rotation
```

---

## 13. RESPONSIVE DESIGN

### Breakpoints
```
✓ Mobile (320px, 375px, 425px)
✓ Tablet (768px)
✓ Desktop (1024px, 1440px)
✓ Large (1920px)
```

### Test Cases
```
✓ Layout adjustments
✓ Touch targets (min 44x44px)
✓ Font readability
✓ Image scaling
✓ Navigation accessibility
✓ Form input usability
✓ Modal dialogs
✓ Dropdown menus
```

---

## 14. BROWSER COMPATIBILITY

### Browsers to Test
```
✓ Chrome (latest 2)
✓ Firefox (latest 2)
✓ Safari (latest 2)
✓ Edge (latest 2)
✓ Mobile Chrome
✓ Mobile Safari
```

### Test Cases
```
✓ Layout rendering
✓ Form functionality
✓ JavaScript execution
✓ CSS support
✓ API support
✓ Storage (localStorage, indexedDB)
```

---

## 15. ACCESSIBILITY (A11Y)

### Test Cases
```
✓ Keyboard navigation
✓ Screen reader compatibility
✓ Color contrast ratios
✓ ARIA labels
✓ Focus indicators
✓ Alt text for images
✓ Form labels
✓ Error announcements
✓ Tab order
```

---

# TESTING TOOLS RECOMMENDATIONS

## Frontend Testing
- **Unit Tests**: Jest, React Testing Library
- **E2E Tests**: Playwright, Cypress
- **Visual Tests**: Percy, Chromatic
- **Accessibility**: axe-core, WAVE
- **Performance**: Lighthouse, WebPageTest

## Backend Testing
- **API Testing**: Postman, Insomnia, REST Client
- **Load Testing**: k6, Artillery, JMeter
- **Security**: OWASP ZAP, Burp Suite
- **Database**: Direct SQL queries, migrations

## CI/CD Integration
- **GitHub Actions** for test automation
- **Pre-commit hooks** for validation
- **SonarQube** for code quality

---

# CRITICAL BUG SCENARIOS

## High Priority
1. Payroll calculation errors (financial impact)
2. Leave balance corruption
3. Attendance data loss
4. Permission bypass (security)
5. Data corruption in updates

## Medium Priority
1. Slow page loads
2. Export format errors
3. Email notification failures
4. Search/filter not working
5. Duplicate record creation

## Low Priority
1. UI alignment issues
2. Typos
3. Missing animations
4. Color scheme issues

---

# DATA MIGRATION & SEEDING

### Test Data Requirements
- 100+ employees (various statuses, departments)
- 6+ months of attendance records
- 20+ completed payroll periods
- 50+ leave requests
- 30+ performance reviews
- 100+ documents
- Complete organization structure

### Seed Data Files
- Check `/src/` for seed scripts
- Database migrations setup
- Test fixture creation

---

# AUDIT & COMPLIANCE

### Audit Logging
- `/src/lib/utils/auditLog.ts` - Audit log creation
- All user actions logged
- Data changes tracked
- API requests logged
- Error logging with Sentry

### GDPR Compliance
- Data export functionality
- Data deletion workflows
- Consent management
- Privacy policies

