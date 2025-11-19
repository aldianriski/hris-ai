# CMS Admin Panel - Detailed Test Scenarios

**Version:** 1.0  
**Last Updated:** 2025-11-19  
**Format:** Organized test cases for manual and automated testing

---

## Test Scenario Template

```
Scenario ID: [FEATURE]-[NUMBER]
Feature: [Feature Name]
Priority: [High/Medium/Low]
Preconditions:
- [User logged in as Admin]
- [Test data available]

Steps:
1. [Action 1]
2. [Action 2]
3. [Verification 1]

Expected Result:
- [Expected outcome 1]
- [Expected outcome 2]

Actual Result:
- [To be filled during testing]

Status: [Pass/Fail]
Notes:
```

---

## CMS ADMIN TEST SCENARIOS

### Feature: Demo Requests Management

#### TEST-DEM-001: View All Demo Requests
**Priority:** High  
**Preconditions:**
- Admin user logged in
- At least 5 demo requests exist in database

**Steps:**
1. Navigate to `/admin/cms/demo-requests`
2. Wait for page to load
3. Verify list displays

**Expected Result:**
- Page loads within 2 seconds
- All demo requests display in list
- Each request shows: company name, contact name, email, phone, employee count
- Status badges show (pending, scheduled, completed, cancelled)
- Statistics cards show correct counts (Total, Pending, Scheduled, Completed)

---

#### TEST-DEM-002: Search Demo Requests
**Priority:** High  
**Preconditions:**
- Admin on demo requests page
- Multiple demo requests in list

**Steps:**
1. Click search input field
2. Type company name "PT Maju"
3. Wait 1 second for search to execute
4. Verify results

**Expected Result:**
- List filters to show only requests matching "PT Maju"
- Search is case-insensitive
- Results update in real-time
- Clear search to show all again

---

#### TEST-DEM-003: Filter Demo Requests by Status
**Priority:** High  
**Preconditions:**
- Admin on demo requests page
- Mix of pending, scheduled, and completed requests

**Steps:**
1. Click "All Status" dropdown
2. Select "Pending"
3. Verify list updated
4. Select "Scheduled"
5. Verify list updated
6. Select "All Status"
7. Verify all requests show

**Expected Result:**
- Dropdown filters correctly by status
- Statistics update to reflect filtered count
- No requests show with wrong status
- Can switch between filters multiple times

---

#### TEST-DEM-004: Schedule a Demo Request
**Priority:** High  
**Preconditions:**
- Admin on demo requests page
- At least one "Pending" demo request

**Steps:**
1. Find pending demo request
2. Click "Schedule" button
3. Verify modal/form opens
4. Enter scheduled date: "2025-12-15"
5. Enter meeting URL: "https://zoom.us/j/12345678"
6. Click "Schedule" to submit
7. Verify status changes to "Scheduled"

**Expected Result:**
- Schedule form opens with date/URL fields
- Submit button disabled until fields filled
- After submit, request status changes to "Scheduled"
- Scheduled date displays on request
- Modal closes and list updates

---

#### TEST-DEM-005: Delete Demo Request
**Priority:** Medium  
**Preconditions:**
- Admin on demo requests page
- At least one demo request

**Steps:**
1. Find demo request to delete
2. Click "Delete" button
3. Verify confirmation prompt
4. Click "Yes" to confirm
5. Verify request removed from list

**Expected Result:**
- Confirmation dialog appears with warning
- After confirmation, request removed from list
- List count updates
- No request found if searching by that company

---

#### TEST-DEM-006: Export Demo Requests
**Priority:** Medium  
**Preconditions:**
- Admin on demo requests page
- At least 5 demo requests

**Steps:**
1. Look for "Export CSV" button
2. Click export button
3. Verify file download starts
4. Check CSV contents

**Expected Result:**
- CSV file downloads with filename like "demo-requests-2025-11-19.csv"
- CSV contains columns: ID, Company Name, Contact Name, Email, Phone, Status, Created Date
- All rows match data shown in list
- CSV opens correctly in Excel/Sheets

---

### Feature: Blog Posts Management

#### TEST-BLG-001: Create New Blog Post
**Priority:** High  
**Preconditions:**
- Admin on blog posts page
- No existing post with title "Test Post"

**Steps:**
1. Click "Create Blog Post" or "New Post" button
2. Wait for form to load
3. Fill form:
   - Title: "Test Blog Post"
   - Slug: "test-blog-post" (auto-generated)
   - Category: "HR Management"
   - Tags: "HR, Digital, Management"
   - Content: "This is a test blog post..."
   - Language: "English (en)"
   - Featured Image: Upload test image
   - SEO Title: "Test - HR Blog"
   - SEO Description: "Learn about HR management"
4. Click "Save as Draft"
5. Verify success message

**Expected Result:**
- All form fields required/optional as specified
- Slug auto-generates from title
- Form validates required fields
- After save, post appears in list with "Draft" status
- Success notification shows
- User redirected to draft post or list

---

#### TEST-BLG-002: Publish Blog Post
**Priority:** High  
**Preconditions:**
- At least one blog post in "Draft" status

**Steps:**
1. Navigate to blog posts list
2. Find draft post
3. Click on draft post to open
4. Click "Publish" button
5. Verify status changes to "Published"
6. Verify published date is set

**Expected Result:**
- Publish button only available for draft posts
- After publish, status changes to "Published"
- Published date shows current date/time
- Post appears in published section
- Can view on website if applicable

---

#### TEST-BLG-003: Edit Blog Post
**Priority:** Medium  
**Preconditions:**
- At least one blog post exists

**Steps:**
1. Open blog post list
2. Click on existing post
3. Click "Edit" button
4. Change title to "Updated Title"
5. Click "Save Changes"
6. Verify changes saved

**Expected Result:**
- Edit form opens with current data
- All fields editable
- Title updates in list and detail view
- Save notification shows
- Updated date reflects change time

---

#### TEST-BLG-004: Archive Blog Post
**Priority:** Low  
**Preconditions:**
- At least one published blog post

**Steps:**
1. Find blog post in list
2. Click "Archive" button
3. Verify confirmation
4. Click "Yes" to confirm
5. Verify post removed from active list
6. Check archived section

**Expected Result:**
- Confirmation dialog appears
- After confirming, post status changes to "Archived"
- Post no longer appears in main list
- Post appears in archived section
- Can restore from archived (if supported)

---

### Feature: Case Studies Management

#### TEST-CS-001: Create Case Study
**Priority:** High  
**Preconditions:**
- Admin on case studies page

**Steps:**
1. Click "Create Case Study" button
2. Fill form:
   - Company Name: "PT Digital Solutions"
   - Industry: "Software Development"
   - Employee Count: "50"
   - Challenge: "Challenges in managing HR at scale"
   - Solution: "Implemented HRIS system"
   - Results: "30% reduction in admin time"
   - Testimonial: "Great system!"
   - Testimonial Author: "CEO Name"
   - Logo Upload: Upload company logo
3. Click "Save as Draft"
4. Verify saved

**Expected Result:**
- Form loads with all fields
- Rich text editors available for Challenge/Solution/Results
- Image upload works for logo
- Case study saved as draft
- Can preview before publishing

---

#### TEST-CS-002: Publish Case Study
**Priority:** High  
**Preconditions:**
- At least one case study in draft status

**Steps:**
1. Find draft case study
2. Click "Publish" button
3. Verify status changes to "Published"
4. Verify appears on public site

**Expected Result:**
- Case study appears in published list
- Published date is set
- Company name and testimonial visible
- Can filter by published status

---

### Feature: Leads Management

#### TEST-LD-001: View All Leads
**Priority:** High  
**Preconditions:**
- At least 5 leads in database

**Steps:**
1. Navigate to leads page
2. Wait for page to load
3. Verify list displays

**Expected Result:**
- List shows all leads
- Each lead shows: email, name, company, phone, status
- Status badges show (new, contacted, qualified, converted, lost)
- Source information visible (if configured)

---

#### TEST-LD-002: Filter Leads by Status
**Priority:** High  
**Preconditions:**
- Leads with different statuses exist

**Steps:**
1. Click "Status" filter dropdown
2. Select "New"
3. Verify list shows only new leads
4. Select "Qualified"
5. Verify list shows only qualified

**Expected Result:**
- Dropdown filters by status correctly
- Lead count updates
- Can switch between status filters

---

#### TEST-LD-003: Filter Leads by Source
**Priority:** Medium  
**Preconditions:**
- Leads from different sources (homepage, demo, blog, etc.)

**Steps:**
1. Click "Source" filter dropdown
2. Select "homepage"
3. Verify list shows only homepage leads
4. Select "demo"
5. Verify list updates

**Expected Result:**
- Source filter works correctly
- UTM parameters visible if tracked
- Can see conversion funnel

---

#### TEST-LD-004: Update Lead Status
**Priority:** High  
**Preconditions:**
- At least one lead in list

**Steps:**
1. Click on lead to view details
2. Find status field
3. Change from "New" to "Contacted"
4. Click "Save"
5. Verify status updated in list

**Expected Result:**
- Status dropdown available
- Status changes in both detail and list view
- Updated timestamp recorded
- Audit log shows who changed status

---

#### TEST-LD-005: Assign Lead to User
**Priority:** Medium  
**Preconditions:**
- Multiple leads and users exist

**Steps:**
1. Open lead detail
2. Click "Assign To" field
3. Select user from dropdown
4. Click "Save"
5. Verify assigned user shows

**Expected Result:**
- Dropdown shows all available users
- Can assign to single user
- Assigned user notification (if configured)
- List shows assigned user

---

#### TEST-LD-006: Export Leads
**Priority:** Low  
**Preconditions:**
- Multiple leads in system

**Steps:**
1. Click "Export CSV" button
2. Verify download starts
3. Check CSV contents

**Expected Result:**
- CSV file downloads
- Contains all lead columns including UTM parameters
- All data matches display in list
- CSV opens in Excel/Sheets

---

### Feature: Newsletter Subscribers Management

#### TEST-NL-001: View All Subscribers
**Priority:** High  
**Preconditions:**
- At least 10 newsletter subscribers

**Steps:**
1. Navigate to newsletter page
2. Wait for page to load
3. Verify list displays

**Expected Result:**
- All subscribers shown in list
- Email, name, status visible
- Subscription date shown
- Frequency preferences visible

---

#### TEST-NL-002: Filter Subscribers by Status
**Priority:** High  
**Preconditions:**
- Subscribers with different statuses

**Steps:**
1. Click "Status" filter
2. Select "subscribed"
3. Verify list shows only subscribed
4. Select "unsubscribed"
5. Verify list shows unsubscribed

**Expected Result:**
- Status filter works correctly
- Count updates to reflect filtered results
- Can toggle between statuses

---

#### TEST-NL-003: Bulk Unsubscribe Subscribers
**Priority:** Medium  
**Preconditions:**
- At least 5 subscribed subscribers

**Steps:**
1. Select multiple subscribers using checkboxes
2. Click "Bulk Actions" dropdown
3. Select "Unsubscribe Selected"
4. Confirm action
5. Verify selected subscribers unsubscribed

**Expected Result:**
- Checkboxes allow multiple selection
- Bulk action applies to all selected
- Status changes to "Unsubscribed"
- Unsubscribe date recorded
- Notification sent (if configured)

---

#### TEST-NL-004: Add Subscriber Manually
**Priority:** Medium  
**Preconditions:**
- Admin on newsletter page

**Steps:**
1. Click "Add Subscriber" button
2. Fill form:
   - Email: "test@example.com"
   - Name: "Test User"
   - Frequency: "weekly"
   - Topics: ["HR", "Payroll"]
3. Click "Add"
4. Verify subscriber appears in list

**Expected Result:**
- Form opens with all fields
- Email validation prevents invalid emails
- Subscriber added to list
- Status shows "subscribed"
- Subscription date recorded

---

#### TEST-NL-005: Export Subscribers
**Priority:** Low  
**Preconditions:**
- Multiple subscribers in system

**Steps:**
1. Click "Export CSV" button
2. Download completes
3. Check CSV contents

**Expected Result:**
- CSV downloads with current date
- Contains: Email, Name, Status, Frequency, Topics, Subscription Date
- All data matches displayed list
- Can import into email service

---

---

## PLATFORM ADMIN TEST SCENARIOS

### Feature: Tenant Management

#### TEST-TEN-001: View Tenant List
**Priority:** High  
**Preconditions:**
- Super admin logged in
- At least 5 tenants in system

**Steps:**
1. Navigate to `/platform-admin/tenants`
2. Wait for page to load
3. Verify list displays

**Expected Result:**
- List shows all tenants
- Columns: Company Name, Subscription Plan, Status, Employee Count, Created Date
- Status badges show (active, trial, suspended, cancelled)
- Plan badges show (starter, professional, enterprise)
- Action buttons visible (View, Edit, Suspend, Delete)

---

#### TEST-TEN-002: Create New Tenant (Complete Wizard)
**Priority:** High  
**Preconditions:**
- Admin on tenants page
- No tenant with slug "test-company"

**Steps:**

**Step 1: Company Information**
1. Click "Create Tenant" button
2. Enter company info:
   - Company Name: "PT Test Company"
   - Slug: "test-company" (or auto-generated)
   - Description: "Test company for QA"
3. Upload logo (optional)
4. Click "Next"

**Step 2: Admin User**
1. Enter admin details:
   - First Name: "John"
   - Last Name: "Doe"
   - Email: "john@testcompany.com"
   - Password: (auto-generated or manual)
2. Click "Next"

**Step 3: Subscription**
1. Select plan: "Professional"
2. Verify employee limit: 200
3. Select frequency: "Monthly"
4. Set start date: Today
5. Click "Next"

**Step 4: Review & Create**
1. Review all information
2. Click "Create Tenant"
3. Verify success modal
4. Click "View Tenant" or "Go to List"

**Expected Result:**
- Each step validates required fields
- Can navigate back and forth (if supported)
- Slug auto-generates from company name
- Summary shows all entered data
- Success modal shows:
  - Tenant ID
  - Admin credentials
  - Onboarding link
  - Support contact
- New tenant appears in list

---

#### TEST-TEN-003: Search Tenants
**Priority:** High  
**Preconditions:**
- Multiple tenants with different names

**Steps:**
1. Click search input
2. Type "Maju"
3. Wait for filter to apply
4. Verify results

**Expected Result:**
- List filters to show only "PT Maju Bersama" and similar
- Search is case-insensitive
- Results update in real-time
- Clear search to show all

---

#### TEST-TEN-004: Filter Tenants by Status
**Priority:** High  
**Preconditions:**
- Tenants with different statuses (active, trial, suspended)

**Steps:**
1. Click "Status" filter dropdown
2. Select "Active"
3. Verify list shows only active
4. Select "Trial"
5. Verify list shows only trial tenants

**Expected Result:**
- Filter dropdown works correctly
- List updates to show selected status
- Count shows filtered results
- Can switch between filters

---

#### TEST-TEN-005: Filter Tenants by Subscription Plan
**Priority:** Medium  
**Preconditions:**
- Tenants on different subscription plans

**Steps:**
1. Click "Plan" filter dropdown
2. Select "Professional"
3. Verify list shows only professional plan
4. Select "Enterprise"
5. Verify list updates

**Expected Result:**
- Plan filter works correctly
- List shows only selected plan tenants
- Plan badges visible in filtered list

---

#### TEST-TEN-006: View Tenant Details
**Priority:** High  
**Preconditions:**
- At least one tenant exists

**Steps:**
1. Click on tenant in list
2. Wait for detail page to load
3. Verify all information displays

**Expected Result:**
- Detail page loads with all tenant info
- Shows tabs: Overview, Usage, Billing, Users, Audit Logs, Settings, Support
- Company name, subscription plan, status visible
- Admin user info visible
- Can navigate between tabs

---

#### TEST-TEN-007: Edit Tenant Information
**Priority:** Medium  
**Preconditions:**
- On tenant detail page

**Steps:**
1. Click "Edit" button on Overview tab
2. Change company description
3. Click "Save"
4. Verify changes saved

**Expected Result:**
- Edit form opens with current data
- Changes save successfully
- Updated date reflects change time
- Changes persist on page reload

---

#### TEST-TEN-008: Change Tenant Subscription Plan
**Priority:** High  
**Preconditions:**
- On tenant detail page
- Billing tab accessible

**Steps:**
1. Go to Billing tab
2. Click "Change Plan"
3. Select new plan: "Enterprise"
4. Verify pro-rata adjustment
5. Click "Confirm Upgrade"
6. Verify new plan shows

**Expected Result:**
- Plan change form shows available plans
- Pro-rata amount calculated correctly
- New invoice generated
- Subscription updated immediately
- Employee limit updates
- Billing tab shows new plan

---

#### TEST-TEN-009: Suspend Tenant
**Priority:** High  
**Preconditions:**
- Tenant with active status

**Steps:**
1. On tenant detail page
2. Click "Suspend Tenant" button
3. Enter suspension reason
4. Click "Confirm Suspend"
5. Verify status changes to "Suspended"

**Expected Result:**
- Suspension modal appears with reason field
- After confirm, status changes to "Suspended"
- Suspended reason recorded
- Tenant can't login (if implemented)
- Can reactivate later

---

#### TEST-TEN-010: Add User to Tenant
**Priority:** Medium  
**Preconditions:**
- On tenant Users tab

**Steps:**
1. Click "Add User" button
2. Fill form:
   - Email: "admin2@company.com"
   - First Name: "Jane"
   - Last Name: "Smith"
   - Role: "Admin"
3. Click "Add User"
4. Verify user appears in list

**Expected Result:**
- Add user form opens
- Email validation works
- New user appears in users list
- Invitation email sent (if configured)
- Can set user roles

---

### Feature: Users Management (Platform)

#### TEST-USR-001: View Platform Users
**Priority:** High  
**Preconditions:**
- Super admin logged in
- Multiple platform users exist

**Steps:**
1. Navigate to `/platform-admin/users`
2. Wait for page to load
3. Verify list displays

**Expected Result:**
- List shows all platform users
- Email, name, role, status visible
- Last login date shown
- Created date shown
- Action buttons visible (Edit, Delete, Impersonate)

---

#### TEST-USR-002: Create Platform User
**Priority:** High  
**Preconditions:**
- Admin on users page

**Steps:**
1. Click "Create User" button
2. Fill form:
   - Email: "support@example.com"
   - First Name: "Support"
   - Last Name: "Staff"
   - Role: "support_staff"
3. Click "Create"
4. Verify success notification
5. Verify user appears in list

**Expected Result:**
- Form validates email format
- Prevents duplicate emails
- Role dropdown shows all available roles
- User created with correct role
- Password reset email sent (if configured)

---

#### TEST-USR-003: Edit Platform User
**Priority:** Medium  
**Preconditions:**
- At least one platform user exists

**Steps:**
1. Click on user to edit
2. Change role to "admin"
3. Click "Save"
4. Verify role updated

**Expected Result:**
- Edit form opens with current data
- Role can be changed
- Changes save successfully
- List updates with new role

---

#### TEST-USR-004: Impersonate User
**Priority:** Medium  
**Preconditions:**
- Multiple platform users

**Steps:**
1. Click on user
2. Click "Impersonate" button
3. Verify impersonation banner appears
4. Navigate to some page
5. Verify viewing as impersonated user
6. Click "End Impersonation"
7. Verify back to own account

**Expected Result:**
- Impersonation banner shows at top
- All actions performed as impersonated user
- Audit log records impersonation
- End impersonation returns to own account
- No access to other users' data

---

#### TEST-USR-005: Delete User
**Priority:** Low  
**Preconditions:**
- At least one user to delete

**Steps:**
1. Find user to delete
2. Click "Delete" button
3. Confirm deletion
4. Verify user removed from list

**Expected Result:**
- Confirmation dialog appears
- After confirm, user removed (deactivated or deleted)
- User no longer in active users list
- Can't login with deleted account

---

### Feature: Invoices Management

#### TEST-INV-001: View Invoices List
**Priority:** High  
**Preconditions:**
- Multiple invoices in system

**Steps:**
1. Navigate to `/platform-admin/invoices`
2. Wait for page to load
3. Verify list displays

**Expected Result:**
- List shows all invoices
- Columns: Invoice Number, Tenant, Amount, Status, Due Date
- Status badges (draft, sent, paid, overdue, cancelled)
- Can see which are overdue
- Amount formatted with currency

---

#### TEST-INV-002: Create Invoice
**Priority:** High  
**Preconditions:**
- Admin on invoices page

**Steps:**
1. Click "Create Invoice" button
2. Select tenant: "PT Maju Bersama"
3. Add line items:
   - Item 1: "Professional Plan (Monthly)" - Qty: 1 - Price: 500000
   - Item 2: "Custom Integration" - Qty: 1 - Price: 2000000
4. Set issue date: Today
5. Set due date: 30 days from today
6. Enter tax rate: 10%
7. Add notes: "November 2025 Invoice"
8. Click "Create"
9. Verify success

**Expected Result:**
- Tenant selector works
- Line items can be added/removed
- Tax calculated automatically
- Total amount shows correctly
- Invoice created with status "draft"
- Appears in list

---

#### TEST-INV-003: Send Invoice
**Priority:** High  
**Preconditions:**
- Invoice in draft status

**Steps:**
1. Find invoice in list
2. Click "Send" button
3. Verify email recipient shows
4. Click "Send" to confirm
5. Verify status changes to "sent"

**Expected Result:**
- Send confirmation shows email address
- PDF generated and sent
- Status changes from "draft" to "sent"
- Invoice record updated
- Can resend if needed

---

#### TEST-INV-004: Mark Invoice as Paid
**Priority:** High  
**Preconditions:**
- Invoice with status "sent" or "overdue"

**Steps:**
1. Find invoice in list
2. Click "Mark Paid" button
3. Enter payment date: (today or past date)
4. Enter payment amount: (equal to invoice total)
5. Select payment method: "Bank Transfer"
6. Click "Mark Paid"
7. Verify status changes to "paid"

**Expected Result:**
- Mark paid form opens with payment fields
- Payment date defaults to today
- Amount defaults to invoice total
- Payment method dropdown available
- Status changes to "paid"
- Payment record created

---

#### TEST-INV-005: Download Invoice PDF
**Priority:** Medium  
**Preconditions:**
- Invoice exists

**Steps:**
1. Find invoice in list
2. Click "Download PDF" button
3. Verify PDF download starts

**Expected Result:**
- PDF file downloads with filename like "INV-001-2025-11-19.pdf"
- PDF opens correctly
- Shows invoice details, line items, tax, total
- Company logo included
- Professional formatting

---

#### TEST-INV-006: Filter Invoices by Status
**Priority:** Medium  
**Preconditions:**
- Invoices with different statuses

**Steps:**
1. Click "Status" filter
2. Select "Paid"
3. Verify list shows only paid invoices
4. Select "Overdue"
5. Verify list shows only overdue

**Expected Result:**
- Status filter works correctly
- List shows only selected status
- Count updates
- Can toggle between filters

---

#### TEST-INV-007: Cancel Invoice
**Priority:** Low  
**Preconditions:**
- Invoice in draft or sent status

**Steps:**
1. Find invoice to cancel
2. Click "Cancel" button
3. Confirm cancellation
4. Verify status changes to "cancelled"

**Expected Result:**
- Confirmation dialog appears
- After confirm, status changes to "cancelled"
- Cancelled date recorded
- Can still view but not modify

---

### Feature: Subscription Plans

#### TEST-SUB-001: View Subscription Plans
**Priority:** High  
**Preconditions:**
- Multiple subscription plans exist

**Steps:**
1. Navigate to `/platform-admin/subscription-plans`
2. Wait for page to load
3. Verify list displays

**Expected Result:**
- List shows all plans
- Name, monthly price, annual price, max employees visible
- Feature comparison available
- Active/inactive status shown

---

#### TEST-SUB-002: Create Subscription Plan
**Priority:** High  
**Preconditions:**
- Admin on subscription plans page

**Steps:**
1. Click "Create Plan" button
2. Fill form:
   - Name: "Starter Plus"
   - Display Name: "Starter Plus"
   - Description: "For growing companies"
   - Monthly Price: 750000
   - Annual Price: 8000000
   - Max Employees: 100
   - Max Users: 10
   - Max Storage: 50 (GB)
   - Trial Days: 30
   - Features: Select applicable features
3. Click "Create"
4. Verify plan added to list

**Expected Result:**
- Form validates all required fields
- Price inputs accept numbers only
- Feature checkboxes available
- Plan created and appears in list
- Can edit immediately if needed

---

#### TEST-SUB-003: Edit Subscription Plan
**Priority:** Medium  
**Preconditions:**
- At least one plan exists

**Steps:**
1. Click on plan to edit
2. Change monthly price to 800000
3. Change max employees to 150
4. Toggle a feature on/off
5. Click "Save"
6. Verify changes saved

**Expected Result:**
- Edit form opens with current plan data
- Changes save successfully
- No tenants affected if changing limit (or pro-rata applied)
- List shows updated price

---

#### TEST-SUB-004: View Plan Details
**Priority:** Medium  
**Preconditions:**
- Plan exists

**Steps:**
1. Click on plan in list
2. Verify detail view shows:
   - All plan fields
   - Features included
   - Number of tenants on this plan
   - Usage limits

**Expected Result:**
- Detail view displays complete plan information
- Feature matrix shows what's included
- Tenant count on plan visible
- Can edit or delete plan

---

#### TEST-SUB-005: Compare Plans
**Priority:** Medium  
**Preconditions:**
- At least 2 plans exist

**Steps:**
1. View plans list
2. Look for comparison view or matrix
3. Verify can see all plans side-by-side
4. Compare prices, features, limits

**Expected Result:**
- Comparison matrix shows all plans
- Easy to see differences
- Feature included/excluded clear
- Pricing comparison visible

---

### Feature: Support Tickets

#### TEST-SUP-001: View Support Tickets
**Priority:** High  
**Preconditions:**
- Multiple support tickets in system

**Steps:**
1. Navigate to `/platform-admin/support`
2. Wait for page to load
3. Verify dashboard displays

**Expected Result:**
- Dashboard shows metrics:
  - Open tickets count
  - SLA status (on-track/breached)
  - Average response time
- Tickets list shows
- Columns: Ticket Number, Subject, Tenant, Status, Priority, Assigned To

---

#### TEST-SUP-002: Create Support Ticket
**Priority:** High  
**Preconditions:**
- Admin on support page

**Steps:**
1. Click "Create Ticket" button
2. Fill form:
   - Tenant: "PT Maju Bersama"
   - Subject: "Email integration not working"
   - Description: "Emails not sending from system"
   - Priority: "High"
   - Assign To: Support staff member
3. Click "Create"
4. Verify ticket appears in list

**Expected Result:**
- Form opens with all fields
- Tenant dropdown populated
- Priority levels: low, medium, high, urgent
- Ticket created and assigned
- Appears in list with correct status

---

#### TEST-SUP-003: Update Ticket Status
**Priority:** High  
**Preconditions:**
- Open support ticket exists

**Steps:**
1. Click on ticket
2. Change status: "in-progress"
3. Click "Save"
4. Verify status updated in list

**Expected Result:**
- Status dropdown shows available statuses
- Status updates in both detail and list view
- Updated timestamp recorded
- SLA timer updates

---

#### TEST-SUP-004: Assign Ticket
**Priority:** Medium  
**Preconditions:**
- Unassigned ticket exists

**Steps:**
1. Click on ticket
2. Click "Assign To" dropdown
3. Select support staff member
4. Click "Save"
5. Verify assigned person shows

**Expected Result:**
- Dropdown shows available support staff
- Assignment notification sent (if configured)
- List shows assigned agent
- Can reassign to different agent

---

#### TEST-SUP-005: Monitor SLA Status
**Priority:** High  
**Preconditions:**
- Tickets with different ages exist

**Steps:**
1. View support dashboard
2. Look for SLA indicators
3. Find ticket with SLA breached (if any)
4. Verify color warning (red for breached)

**Expected Result:**
- SLA status visible on ticket
- Green if on-track
- Red if breached
- Time remaining shown
- Urgent tickets escalated

---

### Feature: Feature Flags

#### TEST-FLG-001: View Feature Flags
**Priority:** High  
**Preconditions:**
- Multiple feature flags in system

**Steps:**
1. Navigate to `/platform-admin/feature-flags`
2. Wait for page to load
3. Verify list displays

**Expected Result:**
- List shows all feature flags
- Name, key, status, rollout strategy visible
- Enabled/disabled toggle available
- Action buttons visible

---

#### TEST-FLG-002: Create Feature Flag
**Priority:** High  
**Preconditions:**
- Admin on feature flags page

**Steps:**
1. Click "Create Flag" button
2. Fill form:
   - Name: "New Dashboard V2"
   - Key: "new_dashboard_v2" (auto-generated)
   - Description: "Beta version of new dashboard"
   - Enabled: ON
   - Rollout Strategy: "Percentage"
   - Rollout Percentage: 25
3. Click "Create"
4. Verify flag appears in list

**Expected Result:**
- Form opens with all fields
- Key auto-generates from name
- Strategy options: Global, Percentage, Whitelist, Blacklist
- Percentage field appears when percentage selected
- Flag created and enabled

---

#### TEST-FLG-003: Toggle Feature Flag
**Priority:** High  
**Preconditions:**
- Enabled feature flag exists

**Steps:**
1. Find flag in list
2. Click toggle to disable
3. Verify status changes
4. Click toggle to enable
5. Verify status changes back

**Expected Result:**
- Toggle switches flag on/off
- Status updates immediately
- No page reload needed
- Changes take effect immediately for users

---

#### TEST-FLG-004: Change Rollout Strategy
**Priority:** Medium  
**Preconditions:**
- Feature flag with percentage strategy

**Steps:**
1. Click on flag to edit
2. Change strategy: "Whitelist"
3. Select specific tenants to enable for
4. Click "Save"
5. Verify strategy changed

**Expected Result:**
- Strategy dropdown available
- Appropriate fields appear for each strategy
- Whitelist allows selecting tenants
- Changes save successfully

---

#### TEST-FLG-005: View Flag Analytics
**Priority:** Low  
**Preconditions:**
- Feature flag with usage data

**Steps:**
1. Click on flag
2. View analytics section
3. See adoption rate and usage metrics

**Expected Result:**
- Analytics show percentage of users with flag
- Usage charts visible (if applicable)
- Can see rollout progress
- Option to expand rollout if successful

---

### Feature: Roles & Permissions

#### TEST-ROL-001: View Roles
**Priority:** High  
**Preconditions:**
- Multiple roles exist (admin, support_staff, etc.)

**Steps:**
1. Navigate to `/platform-admin/roles`
2. Wait for page to load
3. Verify list displays

**Expected Result:**
- List shows all roles
- Role name, type (platform/tenant), description visible
- User count for each role shown
- Permission count displayed

---

#### TEST-ROL-002: Create Custom Role
**Priority:** High  
**Preconditions:**
- Admin on roles page

**Steps:**
1. Click "Create Role" button
2. Fill form:
   - Name: "Sales Manager"
   - Type: "Platform"
   - Description: "Manages sales and tenants"
3. Select permissions:
   - Tenants: read, update
   - Invoices: read, mark-paid
   - Support: read, close
4. Click "Create"
5. Verify role appears in list

**Expected Result:**
- Form opens with all fields
- Permission matrix shows available permissions
- Can select/deselect permissions
- Role created with selected permissions
- Can view permission list for role

---

#### TEST-ROL-003: Edit Role Permissions
**Priority:** Medium  
**Preconditions:**
- Custom role exists

**Steps:**
1. Click on role to edit
2. Uncheck "Invoices: create" permission
3. Check "Analytics: export" permission
4. Click "Save"
5. Verify permissions updated

**Expected Result:**
- Edit form shows current permissions
- Permissions can be changed
- Changes save successfully
- Affects users with this role immediately

---

#### TEST-ROL-004: View Permission Matrix
**Priority:** Medium  
**Preconditions:**
- Role exists

**Steps:**
1. Click on role
2. View permission matrix
3. See all resources and actions

**Expected Result:**
- Matrix shows all resources: tenants, users, invoices, etc.
- Actions for each: create, read, update, delete
- Checkmarks show what role can do
- Clear presentation of permissions

---

### Feature: Permissions Testing

#### TEST-PTM-001: Run Permission Test
**Priority:** Medium  
**Preconditions:**
- Admin on permissions testing page

**Steps:**
1. Navigate to `/platform-admin/permissions/testing`
2. Create test scenario:
   - Select role: "support_staff"
   - Select resource: "tenants"
   - Select action: "create"
   - Expected: "FAIL" (should not be allowed)
3. Click "Run Test"
4. Verify test result

**Expected Result:**
- Test runs and shows result
- Actual permission checked against expected
- Result shows pass/fail
- Can run multiple tests

---

#### TEST-PTM-002: Detect Permission Conflicts
**Priority:** Low  
**Preconditions:**
- Admin on permissions testing page

**Steps:**
1. Click "Check Conflicts" button
2. Wait for analysis
3. View results

**Expected Result:**
- System analyzes all roles
- Reports any contradictions
- Shows privilege escalation risks
- Suggests fixes

---

### Feature: Analytics & Compliance

#### TEST-ANA-001: View Dashboard Analytics
**Priority:** High  
**Preconditions:**
- Analytics data available

**Steps:**
1. Navigate to `/platform-admin/analytics`
2. Wait for dashboard to load
3. Verify charts display

**Expected Result:**
- Dashboard shows:
  - Tenant growth (6-month trend)
  - Revenue trends (MRR, ARR)
  - Subscription breakdown
  - Feature adoption
  - Churn rate

---

#### TEST-ANA-002: View Advanced Analytics
**Priority:** Medium  
**Preconditions:**
- Analytics data available

**Steps:**
1. Navigate to `/platform-admin/analytics/advanced`
2. Wait for page to load
3. View detailed metrics

**Expected Result:**
- Tenant health scores visible
- Feature adoption by feature shown
- User engagement metrics (DAU, WAU, MAU)
- Cohort analysis available

---

#### TEST-CMP-001: View Compliance Alerts
**Priority:** High  
**Preconditions:**
- Compliance alerts exist

**Steps:**
1. Navigate to `/platform-admin/compliance`
2. Wait for dashboard to load
3. Verify alerts display

**Expected Result:**
- Dashboard shows active alerts
- Alert severity color-coded
- Affected tenant count shown
- Days until due indicated

---

#### TEST-CMP-002: Resolve Compliance Alert
**Priority:** Medium  
**Preconditions:**
- Active compliance alert exists

**Steps:**
1. Click on alert
2. Click "Resolve" button
3. Add resolution notes
4. Click "Mark Resolved"
5. Verify status changes

**Expected Result:**
- Alert detail view shows full description
- Resolve form opens
- Resolution recorded
- Status changes to "Resolved"
- Resolved date recorded

---

## Test Execution Tracking

### Test Results Template

```markdown
## Test Execution Results - [Date]

| Test ID | Feature | Status | Notes | Time (min) |
|---------|---------|--------|-------|-----------|
| DEM-001 | Demo Requests | PASS | List loaded in 1.2s | 2 |
| DEM-002 | Demo Search | PASS | Search working | 3 |
| DEM-003 | Status Filter | FAIL | Filter not applying | 2 |
| ... | ... | ... | ... | ... |

**Summary:**
- Total Tests: 45
- Passed: 42
- Failed: 3
- Skipped: 0
- Pass Rate: 93%

**Failed Tests:**
1. DEM-003 - Status filter not applying to list
2. TEN-002 - Wizard doesn't validate email uniqueness
3. INV-006 - PDF download fails in Safari

**Regression Tests:**
- Previous failures: All cleared ✓
- New failures: 3 reported

**Recommendations:**
- Fix email validation in tenant wizard
- Test PDF download in multiple browsers
- Review filter state management
```

---

## Summary

This document provides **45+ specific test scenarios** organized by feature, with:
- ✅ Clear step-by-step instructions
- ✅ Expected outcomes
- ✅ Preconditions and setup
- ✅ Status tracking
- ✅ Common issues noted

**Ready for:** Manual testing, test plan creation, automation scripting

