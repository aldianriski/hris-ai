# CMS Admin Panel - Comprehensive Testing Scenarios

**Version:** 1.0  
**Date:** 2025-11-19  
**Status:** Complete Testing Map for Frontend Testing  
**Application:** Talixa HRIS - AI-first HRIS Platform

---

## Table of Contents

1. [Admin Panel Overview](#admin-panel-overview)
2. [CMS Admin Features & File Locations](#cms-admin-features--file-locations)
3. [Platform Admin Features & File Locations](#platform-admin-features--file-locations)
4. [CMS Admin Feature Details](#cms-admin-feature-details)
5. [Platform Admin Feature Details](#platform-admin-feature-details)
6. [Critical Admin Journeys](#critical-admin-journeys)
7. [Technical Testing Elements](#technical-testing-elements)
8. [API Endpoints Reference](#api-endpoints-reference)

---

## Admin Panel Overview

The HRIS application has **TWO separate admin systems**:

### 1. **CMS Admin** (`/admin/cms`)
Manages marketing and sales-related content:
- Blog posts
- Case studies
- Demo requests
- Leads
- Newsletter subscribers
- Analytics/tracking

### 2. **Platform Admin** (`/platform-admin`)
Manages multi-tenant SaaS platform operations:
- Dashboard & metrics
- Tenants management
- Users management
- Billing & invoices
- Subscriptions
- Support & chat
- Settings & configuration
- Feature flags
- Roles & permissions
- Analytics
- Compliance

---

## CMS Admin Features & File Locations

### 1. **Dashboard/Overview**

**Route:** `/admin/cms`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(admin)/admin/cms/page.tsx` - Dashboard page with stats

**Features:**
- Real-time statistics (total leads, demo requests, newsletter subscribers, page views)
- Content overview (published blog posts, case studies, draft content)
- Recent activity feed
- Quick action buttons

**UI Components:**
- StatCard (displays KPIs)
- ContentRow (progress indicators)
- ActivityItem (activity timeline)
- QuickActionButton (navigation shortcuts)

**Data Displayed:**
```
- Total Leads: 247 (+12%)
- Demo Requests: 89 (+8%)
- Newsletter Subscribers: 1,432 (+23%)
- Page Views: 12,847 (+15%)
- Published Blog Posts: 24/32
- Published Case Studies: 8/10
- Draft Content: 10/42
```

---

### 2. **Blog Posts Management**

**Route:** `/admin/cms/blog`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(admin)/admin/cms/blog/page.tsx`
- `/home/user/hris-ai/src/components/platform/` (placeholder for list component)

**API Endpoints:**
- `GET /api/v1/cms/blog` - List blog posts with filters
- `POST /api/v1/cms/blog` - Create new blog post
- `GET /api/v1/cms/blog/:id` - Get single blog post
- `PATCH /api/v1/cms/blog/:id` - Update blog post
- `DELETE /api/v1/cms/blog/:id` - Delete blog post
- `POST /api/v1/cms/blog/:id/publish` - Publish blog post

**Data Model:**
```typescript
BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: Record<string, any>; // Rich text (JSON)
  author_id: string | null;
  category: string | null;
  tags: string[];
  featured_image_url: string | null;
  published_at: string | null;
  status: 'draft' | 'published' | 'archived';
  language: 'id' | 'en';
  
  // SEO
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  og_image_url: string | null;
  
  // Analytics
  view_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}
```

**CRUD Operations:**
- **Create:** New blog post form with title, slug, content editor, category, tags, featured image
- **Read:** List view with filters (status, category, language, author), search, pagination
- **Update:** Edit existing blog post, update status, publish
- **Delete:** Soft delete (status change to archived)
- **Publish:** Change status from draft to published

**Form Fields:**
- Title (required, text input)
- Slug (required, URL-friendly identifier)
- Content (required, rich text editor with JSON output)
- Excerpt (optional, textarea)
- Category (optional, select dropdown)
- Tags (optional, multi-select or comma-separated)
- Author (optional, user selector)
- Featured Image (optional, image upload)
- Language (required, select: id/en)
- SEO Title (optional)
- SEO Description (optional)
- SEO Keywords (optional)
- OG Image (optional)
- Status (draft/published/archived)

**List View Features:**
- Search by title, slug, content
- Filter by status (draft, published, archived)
- Filter by category
- Filter by language
- Sort by created date, updated date, published date
- Pagination (10, 25, 50 items per page)
- Bulk actions (publish, archive, delete)
- Status badges (color-coded)
- View count display
- Author info

**React Hooks (Client Side):**
```typescript
useBlogPosts(filters?) - Get list with filters
useBlogPost(id) - Get single post
useCreateBlogPost() - Create mutation
useUpdateBlogPost() - Update mutation
useDeleteBlogPost() - Delete mutation
usePublishBlogPost() - Publish mutation
```

**Service Layer:**
```typescript
// /src/lib/api/services/cmsService.ts
blogService.list(filters) - List with pagination
blogService.getById(id) - Get single
blogService.create(data) - Create
blogService.update(id, data) - Update
blogService.delete(id) - Delete
blogService.publish(id) - Publish
```

**Permissions/RBAC:**
- Admin/Content Manager required for all operations
- Check user role before showing create/edit/delete buttons
- Audit log entry created for each action

**Export:**
- Export as CSV (selected or all blog posts)
- Include columns: ID, Title, Category, Status, Language, Author, Created Date, Updated Date

---

### 3. **Case Studies Management**

**Route:** `/admin/cms/case-studies`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(admin)/admin/cms/case-studies/page.tsx`

**API Endpoints:**
- `GET /api/v1/cms/case-studies` - List case studies
- `POST /api/v1/cms/case-studies` - Create case study
- `GET /api/v1/cms/case-studies/:id` - Get single case study
- `PATCH /api/v1/cms/case-studies/:id` - Update case study
- `DELETE /api/v1/cms/case-studies/:id` - Delete case study
- `POST /api/v1/cms/case-studies/:id/publish` - Publish case study

**Data Model:**
```typescript
CaseStudy {
  id: string;
  slug: string;
  company_name: string;
  industry: string | null;
  employee_count: number | null;
  
  // Content sections
  challenge: Record<string, any> | null; // Rich text
  solution: Record<string, any> | null;
  results: Record<string, any> | null;
  
  // Testimonial
  testimonial: string | null;
  testimonial_author: string | null;
  testimonial_role: string | null;
  
  // Media
  logo_url: string | null;
  featured_image_url: string | null;
  
  // Publishing
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  
  // SEO
  seo_title: string | null;
  seo_description: string | null;
  
  // Analytics
  view_count: number;
  
  created_at: string;
  updated_at: string;
}
```

**CRUD Operations:**
- **Create:** Form with company info, content sections, testimonial, media
- **Read:** List with filters (status, industry, search), pagination
- **Update:** Edit case study content and metadata
- **Delete:** Soft delete via status change
- **Publish:** Change status to published

**Form Fields:**
- Company Name (required)
- Slug (required)
- Industry (optional, select)
- Employee Count (optional, number)
- Challenge (rich text editor)
- Solution (rich text editor)
- Results (rich text editor)
- Testimonial (text area)
- Testimonial Author (text input)
- Testimonial Role (text input)
- Logo URL (image upload)
- Featured Image (image upload)
- SEO Title (optional)
- SEO Description (optional)
- Status (draft/published/archived)

**List View Features:**
- Search by company name, industry
- Filter by status
- Filter by industry
- Sort by created date, view count
- Pagination
- View count display
- Status badges

---

### 4. **Demo Requests Management**

**Route:** `/admin/cms/demo-requests`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(admin)/admin/cms/demo-requests/page.tsx` - Full implementation with CRUD

**API Endpoints:**
- `GET /api/v1/cms/demo-requests` - List demo requests
- `POST /api/v1/cms/demo-requests` - Create demo request
- `GET /api/v1/cms/demo-requests/:id` - Get single request
- `PATCH /api/v1/cms/demo-requests/:id` - Update demo request
- `DELETE /api/v1/cms/demo-requests/:id` - Delete demo request
- `POST /api/v1/cms/demo-requests/:id/schedule` - Schedule demo

**Data Model:**
```typescript
DemoRequest {
  id: string;
  name: string;
  email: string;
  company_name: string | null;
  phone: string | null;
  employee_count: number | null;
  preferred_date: string | null;
  message: string | null;
  
  // Demo management
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  assigned_to: string | null;
  scheduled_date: string | null;
  meeting_url: string | null;
  notes: string | null;
  
  // Source tracking
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  
  metadata: Record<string, any>;
  
  created_at: string;
  updated_at: string;
}
```

**CRUD Operations:**
- **Create:** Form with contact info and demo preferences
- **Read:** List with search, filters, status badges
- **Update:** Update status, schedule demo, add notes
- **Delete:** Hard or soft delete
- **Schedule:** Set scheduled date and meeting URL

**Current Implementation Details:**

The demo requests page is **fully implemented** with:
- Search functionality (search by company, name, or email)
- Status filtering (all, pending, scheduled, completed, cancelled)
- Statistics cards showing:
  - Total Requests count
  - Pending count
  - Scheduled count
  - Completed count
- List view showing:
  - Company name with status badge
  - Contact name
  - Email (with icon)
  - Phone (with icon)
  - Employee count (with icon)
  - Preferred date and time
  - Notes section
- Action buttons:
  - Schedule (to set scheduled date)
  - Contact (to send message)
  - Delete (with confirmation)
- Loading states (Loader2 spinner)
- Error handling
- Empty states

**Form Fields (for scheduling):**
- Scheduled Date (date picker)
- Meeting URL (text input)
- Notes (textarea)

**List View Features:**
- Search by company name, contact name, email
- Filter by status (pending, scheduled, completed, cancelled, all)
- Status badges with color coding
- Date formatting (locale: id-ID)
- Contact information display
- Edit/Schedule/Delete actions
- Pagination (implicit, load all on page load)

**React Hooks:**
```typescript
useDemoRequests(filters) - Get list
useDemoRequest(id) - Get single
useCreateDemoRequest() - Create
useUpdateDemoRequest() - Update
useDeleteDemoRequest() - Delete
useScheduleDemo() - Schedule demo
```

**Service Methods:**
```typescript
demoRequestService.list(filters)
demoRequestService.getById(id)
demoRequestService.create(data)
demoRequestService.update(id, data)
demoRequestService.delete(id)
demoRequestService.schedule(id, data)
```

---

### 5. **Leads Management**

**Route:** `/admin/cms/leads`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(admin)/admin/cms/leads/page.tsx`

**API Endpoints:**
- `GET /api/v1/cms/leads` - List leads
- `POST /api/v1/cms/leads` - Create lead
- `GET /api/v1/cms/leads/:id` - Get single lead
- `PATCH /api/v1/cms/leads/:id` - Update lead
- `DELETE /api/v1/cms/leads/:id` - Delete lead

**Data Model:**
```typescript
Lead {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  employee_count: number | null;
  
  // Source tracking
  source: 'homepage' | 'pricing' | 'demo' | 'blog' | 'case-study' | 'referral' | 'other';
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  
  // Lead management
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost' | 'spam';
  assigned_to: string | null;
  notes: string | null;
  
  metadata: Record<string, any>;
  
  created_at: string;
  updated_at: string;
  contacted_at: string | null;
  converted_at: string | null;
}
```

**CRUD Operations:**
- **Create:** Lead form with contact info and source tracking
- **Read:** List with filters and search
- **Update:** Update status, assign to user, add notes
- **Delete:** Delete lead record
- **Filter:** By status, source, date range
- **Search:** By email, name, company

**Form Fields:**
- Email (required)
- Full Name (optional)
- Company Name (optional)
- Phone (optional)
- Employee Count (optional)
- Source (select dropdown)
- UTM parameters (optional)
- Status (select: new, contacted, qualified, converted, lost, spam)
- Assigned To (user select)
- Notes (textarea)

**List View Features:**
- Search by email, name, company
- Filter by status
- Filter by source
- Filter by date range (from_date, to_date)
- Filter by assigned user
- Sort by created date, status, source
- Pagination
- Lead score indicators
- Activity timestamps

**Export:**
- CSV export with all fields including UTM parameters
- Excel export with formatting

---

### 6. **Newsletter Subscribers Management**

**Route:** `/admin/cms/newsletter`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(admin)/admin/cms/newsletter/page.tsx`

**API Endpoints:**
- `GET /api/v1/cms/newsletter` - List subscribers
- `POST /api/v1/cms/newsletter` - Create subscriber
- `GET /api/v1/cms/newsletter/:id` - Get single subscriber
- `PATCH /api/v1/cms/newsletter/:id` - Update subscriber
- `DELETE /api/v1/cms/newsletter/:id` - Delete subscriber
- `POST /api/v1/cms/newsletter/:id/unsubscribe` - Unsubscribe

**Data Model:**
```typescript
NewsletterSubscriber {
  id: string;
  email: string;
  full_name: string | null;
  
  // Subscription status
  status: 'subscribed' | 'unsubscribed' | 'bounced' | 'complained';
  subscribed_at: string;
  unsubscribed_at: string | null;
  
  // Preferences
  preferences: {
    frequency: 'daily' | 'weekly' | 'monthly';
    topics: string[];
  };
  
  // Source tracking
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  
  created_at: string;
  updated_at: string;
}
```

**CRUD Operations:**
- **Create:** Manual subscriber addition
- **Read:** List all subscribers with filters
- **Update:** Change frequency, topics, status
- **Delete:** Remove subscriber
- **Unsubscribe:** Mark as unsubscribed

**Form Fields:**
- Email (required)
- Full Name (optional)
- Frequency (select: daily, weekly, monthly)
- Topics (multi-select)
- Status (select: subscribed, unsubscribed, bounced, complained)
- Source (text input)

**List View Features:**
- Search by email, name
- Filter by status (subscribed, unsubscribed, bounced, complained)
- Filter by subscription frequency
- Filter by topics
- Sort by subscribed date, email
- Pagination
- Subscription status indicators
- Last activity timestamp

**Bulk Operations:**
- Bulk unsubscribe
- Bulk re-subscribe
- Change frequency for multiple subscribers
- Export to CSV

**Export:**
- CSV with email, name, status, frequency, topics, subscription date
- Filter exported data by status

---

### 7. **CMS Analytics**

**Route:** `/admin/cms/analytics`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(admin)/admin/cms/analytics/page.tsx` (if created)

**API Endpoints:**
- `GET /api/v1/cms/analytics` - Get analytics data

**Metrics Tracked:**
- Page views per blog post
- Case study views
- Demo request conversion rate
- Lead source breakdown
- Newsletter engagement metrics
- Click-through rates on CTAs

**Dashboard Features:**
- Traffic trends over time
- Top performing content
- Lead source attribution
- Conversion funnels
- Subscriber engagement
- Export analytics as PDF/CSV

---

## Platform Admin Features & File Locations

### 1. **Dashboard**

**Route:** `/platform-admin/dashboard`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(platform-admin)/dashboard/page.tsx` - Page wrapper
- `/home/user/hris-ai/src/components/platform/PlatformDashboard.tsx` - Main component (18,307 bytes)

**API Endpoints:**
- `GET /api/platform/dashboard/metrics` - Get real-time KPIs
- Auto-refresh every 5 minutes

**Components:**
- **MetricsCard** (`MetricsCard.tsx`) - KPI display with animations
- **RevenueChart** (`RevenueChart.tsx`) - 6-month revenue trends (MRR/ARR)
- **TenantGrowthChart** (`TenantGrowthChart.tsx`) - 6-month tenant growth
- Activity feed with real-time updates

**Metrics Displayed:**
- Total Tenants
- Total Users
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- System Health Status
- Recent activity (tenant signups, users added, invoices created, etc.)

---

### 2. **Tenants Management**

**Route:** `/platform-admin/tenants`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(platform-admin)/tenants/page.tsx` - List page
- `/home/user/hris-ai/src/app/(platform-admin)/tenants/new/page.tsx` - Create page
- `/home/user/hris-ai/src/app/(platform-admin)/tenants/[id]/page.tsx` - Detail page
- `/home/user/hris-ai/src/components/platform/TenantListTable.tsx` (17,314 bytes)
- `/home/user/hris-ai/src/components/platform/TenantDetailView.tsx` (9,767 bytes)
- `/home/user/hris-ai/src/components/platform/TenantCreationWizard.tsx` (10,173 bytes)

**API Endpoints:**
- `GET /api/platform/tenants` - List tenants
- `POST /api/platform/tenants` - Create tenant
- `GET /api/platform/tenants/:id` - Get single tenant
- `PATCH /api/platform/tenants/:id` - Update tenant
- `DELETE /api/platform/tenants/:id` - Delete tenant
- `PATCH /api/platform/tenants/:id/status` - Change tenant status
- `GET /api/platform/tenants/:id/audit-logs` - Get tenant audit logs
- `GET /api/platform/tenants/:id/subscription` - Get subscription info
- `POST /api/platform/tenants/:id/users` - Add user to tenant
- `GET /api/platform/tenants/:id/users` - Get tenant users
- `DELETE /api/platform/tenants/:id/users/:userId` - Remove user from tenant

**Data Model:**
```typescript
Tenant {
  id: string;
  companyName: string;
  slug: string;
  description?: string;
  
  // Admin info
  primaryAdmin: {
    firstName: string;
    lastName: string;
    email: string;
  };
  
  // Subscription
  subscriptionPlan: string; // trial, starter, professional, enterprise
  subscriptionStatus: string; // active, trial, suspended, cancelled
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  
  // Capacity
  currentEmployeeCount: number;
  maxEmployees: number;
  
  // Status
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  
  // Branding
  logoUrl?: string;
  primaryColor?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}
```

**CRUD Operations:**

**Create (Wizard):**
1. Company Information Step
   - Company Name (required)
   - Slug (required, auto-generated)
   - Description (optional)
   - Logo upload (optional)

2. Admin User Step
   - Admin First Name (required)
   - Admin Last Name (required)
   - Admin Email (required)
   - Password (required)

3. Subscription Step
   - Plan Selection (trial, starter, professional, enterprise)
   - Employee Limit
   - Start Date
   - Billing frequency (monthly, annual)

4. Initial Setup Step
   - Review and confirm
   - Create tenant
   - Show success modal with credentials

**Read:**
- List with search, filters, sorting, pagination
- Detail view with tabs (overview, usage, billing, users, audit logs, settings, support)

**Update:**
- Edit company info
- Update subscription plan
- Change status (active, suspended, cancelled)
- Update branding

**Delete:**
- Soft delete (mark as cancelled)
- Hard delete with confirmation

**List View Features:**
- Search by company name, slug
- Filter by status (active, trial, suspended, cancelled)
- Filter by subscription plan
- Filter by subscription status
- Sort by company name, created date, employee count, revenue
- Pagination (10, 25, 50 per page)
- Status badges (color-coded)
- Subscription plan badges
- Employee count / limit indicators
- Revenue indicators
- Actions: View, Edit, Suspend, Delete

**Tenant Detail Tabs:**
1. **Overview** - Basic info, subscription, employee count
2. **Usage** - Storage breakdown by module, file count
3. **Billing** - Current plan, next billing date, payment method
4. **Users** - Add/remove tenant admin users
5. **Audit Logs** - Tenant activity history
6. **Settings** - Branding, custom fields
7. **Support** - Support tickets, chat history

**Suspension/Reactivation:**
- Suspend tenant (restrict access)
- Reactivate suspended tenant
- Reason for suspension (required)

---

### 3. **Users Management (Platform)**

**Route:** `/platform-admin/users`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(platform-admin)/users/page.tsx` - Page wrapper
- `/home/user/hris-ai/src/components/platform/PlatformUsersTable.tsx` (13,203 bytes)
- `/home/user/hris-ai/src/components/platform/CreatePlatformUserModal.tsx` (7,086 bytes)
- `/home/user/hris-ai/src/components/platform/EditPlatformUserModal.tsx` (5,065 bytes)
- `/home/user/hris-ai/src/components/platform/ImpersonateUserModal.tsx` (6,591 bytes)
- `/home/user/hris-ai/src/components/platform/ImpersonationBanner.tsx` (5,211 bytes)

**API Endpoints:**
- `GET /api/platform/users` - List platform users
- `POST /api/platform/users` - Create user
- `GET /api/platform/users/:id` - Get single user
- `PATCH /api/platform/users/:id` - Update user
- `DELETE /api/platform/users/:id` - Delete user
- `POST /api/platform/impersonate/start` - Start impersonation
- `POST /api/platform/impersonate/end` - End impersonation
- `GET /api/platform/impersonate/active` - Get active impersonation
- `GET /api/platform/impersonate/sessions` - Get impersonation history

**CRUD Operations:**
- **Create:** Modal with email, first name, last name, role selection
- **Read:** List with search, filters, pagination
- **Update:** Edit user info, change role
- **Delete:** Deactivate/delete user
- **Impersonate:** Start impersonation session for support purposes

**User Fields:**
- Email (required, unique)
- First Name (required)
- Last Name (required)
- Role (select: super_admin, admin, support_staff)
- Status (active, inactive, suspended)
- Last Login (read-only)
- Created Date (read-only)

**List View Features:**
- Search by email, name
- Filter by role
- Filter by status
- Sort by email, created date, last login
- Pagination
- Role badges
- Status indicators
- Last login timestamp
- Actions: Edit, Delete, Impersonate

**Impersonation:**
- Start impersonation session (log as another admin)
- Display impersonation banner showing who you're impersonating
- All actions logged in audit trail
- End impersonation to return to own account

---

### 4. **Billing & Invoices**

#### 4.1 Billing Dashboard

**Route:** `/platform-admin/billing`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(platform-admin)/billing/page.tsx`
- `/home/user/hris-ai/src/components/platform/BillingDashboard.tsx` (9,634 bytes)
- `/home/user/hris-ai/src/components/platform/RevenueChart.tsx` (4,922 bytes)

**API Endpoints:**
- `GET /api/platform/dashboard/metrics` - Get revenue data
- `GET /api/platform/invoices` - Get invoices

**Dashboard Components:**
- MRR (Monthly Recurring Revenue) card
- ARR (Annual Recurring Revenue) card
- Revenue trend chart (6 months)
- Active subscriptions count
- Payment collection rate
- Failed payments alert

---

#### 4.2 Invoices Management

**Route:** `/platform-admin/invoices`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(platform-admin)/invoices/page.tsx` (477 lines)
- `/home/user/hris-ai/src/components/platform/CreateInvoiceModal.tsx` (10,244 bytes)
- `/home/user/hris-ai/src/components/platform/MarkPaidModal.tsx` (4,941 bytes)

**API Endpoints:**
- `GET /api/platform/invoices` - List invoices
- `POST /api/platform/invoices` - Create invoice
- `GET /api/platform/invoices/:id` - Get single invoice
- `PATCH /api/platform/invoices/:id` - Update invoice
- `DELETE /api/platform/invoices/:id` - Delete invoice
- `POST /api/platform/invoices/:id/send` - Send invoice via email
- `POST /api/platform/invoices/:id/mark-paid` - Mark as paid
- `POST /api/platform/invoices/:id/cancel` - Cancel invoice
- `GET /api/platform/invoices/:id/pdf` - Download PDF

**Data Model:**
```typescript
Invoice {
  id: string;
  invoiceNumber: string; // Unique invoice number
  tenantId: string;
  tenantName: string;
  
  // Line items
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  
  // Amounts
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  
  // Payment
  status: 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  paidAmount: number;
  paymentMethod?: string;
  
  // Dates
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  
  // Notes
  notes?: string;
  
  created_at: string;
  updated_at: string;
}
```

**CRUD Operations:**
- **Create:** Form to generate invoice for tenant
  - Select tenant
  - Add line items (description, quantity, unit price)
  - Set dates (issue, due)
  - Add notes
- **Read:** List invoices with filters, status badges
- **Update:** Edit invoice before sending
- **Delete:** Archive invoice
- **Send:** Email invoice to tenant
- **Mark Paid:** Record payment
- **Cancel:** Mark as cancelled
- **Export:** Download as PDF

**Form Fields:**
- Tenant (select, required)
- Invoice Number (auto-generated)
- Issue Date (date picker, required)
- Due Date (date picker, required)
- Line Items (add multiple):
  - Description
  - Quantity
  - Unit Price
  - Tax Rate
- Notes (textarea)
- Payment Method (select)

**List View Features:**
- Search by invoice number, tenant name
- Filter by status (draft, sent, paid, overdue, cancelled)
- Filter by date range
- Filter by tenant
- Sort by invoice date, due date, amount
- Pagination
- Status badges (color-coded)
- Amount display
- Days overdue indicator for overdue invoices
- Actions: View, Edit, Send, Mark Paid, Download PDF, Cancel

---

### 5. **Subscription Plans**

**Route:** `/platform-admin/subscription-plans`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(platform-admin)/subscription-plans/page.tsx` (416 lines)
- `/home/user/hris-ai/src/components/platform/CreateSubscriptionPlanModal.tsx` (20,235 bytes)
- `/home/user/hris-ai/src/components/platform/EditSubscriptionPlanModal.tsx` (19,114 bytes)

**API Endpoints:**
- `GET /api/platform/subscription-plans` - List plans
- `POST /api/platform/subscription-plans` - Create plan
- `GET /api/platform/subscription-plans/:id` - Get single plan
- `PATCH /api/platform/subscription-plans/:id` - Update plan
- `DELETE /api/platform/subscription-plans/:id` - Delete plan

**Data Model:**
```typescript
SubscriptionPlan {
  id: string;
  name: string; // trial, starter, professional, enterprise
  displayName: string;
  description: string;
  
  // Pricing
  monthlyPrice: number;
  annualPrice: number;
  currency: string; // IDR, USD
  
  // Limits
  maxEmployees: number;
  maxUsers: number;
  maxStorage: number; // in GB
  
  // Features
  features: {
    [moduleName: string]: boolean; // Feature toggles
  };
  
  // Billing
  billingCycle: 'monthly' | 'annual';
  trialDays: number;
  
  // Status
  isActive: boolean;
  
  created_at: string;
  updated_at: string;
}
```

**CRUD Operations:**
- **Create:** Modal form to add new plan
- **Read:** List plans with feature comparison
- **Update:** Edit plan pricing, features, limits
- **Delete:** Archive plan (soft delete)

**Form Fields:**
- Plan Name (required)
- Display Name (required)
- Description (optional)
- Monthly Price (required, number)
- Annual Price (required, number)
- Currency (select: IDR, USD)
- Max Employees (required, number)
- Max Users (required, number)
- Max Storage (required, number)
- Trial Days (required, number)
- Features (checkbox list for each module)
- Is Active (toggle)

**List View Features:**
- Compare plans side-by-side
- Filter by active/inactive
- Sort by price
- Feature matrix showing what's included
- Number of tenants using plan
- Actions: Edit, Duplicate, Archive

**Feature Toggles:**
- HR Management
- Leave Management
- Attendance
- Payroll
- Performance Management
- Workflows
- Compliance
- Analytics
- API Access
- Custom Integrations

---

### 6. **Support & Chat**

#### 6.1 Support Ticketing

**Route:** `/platform-admin/support`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(platform-admin)/support/page.tsx`
- `/home/user/hris-ai/src/components/platform/SupportDashboard.tsx` (9,913 bytes)
- `/home/user/hris-ai/src/components/platform/CreateTicketModal.tsx` (5,364 bytes)
- `/home/user/hris-ai/src/components/platform/ViewTicketModal.tsx` (7,069 bytes)

**API Endpoints:**
- `GET /api/platform/support` - List support tickets
- `POST /api/platform/support` - Create ticket
- `GET /api/platform/support/:id` - Get single ticket
- `PATCH /api/platform/support/:id` - Update ticket
- `POST /api/platform/support/:id/messages` - Add message to ticket

**Data Model:**
```typescript
SupportTicket {
  id: string;
  ticketNumber: string;
  tenantId: string;
  tenantName: string;
  
  // Content
  subject: string;
  description: string;
  
  // Status & Priority
  status: 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Assignment
  assignedTo?: string;
  assignedToName?: string;
  
  // SLA
  slaBreached: boolean;
  firstResponseTime?: number; // minutes
  resolutionTime?: number; // minutes
  
  // Customer Satisfaction
  satisfactionRating?: number; // 1-5
  feedback?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}
```

**CRUD Operations:**
- **Create:** Manually create ticket for tenant
- **Read:** List all tickets, view detail
- **Update:** Change status, priority, assignment
- **Close:** Close resolved ticket
- **Track:** Monitor SLA compliance

**Form Fields (Create):**
- Tenant (select, required)
- Subject (required)
- Description (required, textarea)
- Priority (select: low, medium, high, urgent)
- Assign To (select support staff)

**List View Features:**
- Search by ticket number, subject, tenant
- Filter by status (open, in-progress, waiting, resolved, closed)
- Filter by priority
- Filter by assigned staff
- Sort by created date, priority, SLA status
- Pagination
- SLA status indicators (color: green=OK, red=breached)
- Priority badges
- Status badges
- Response time indicator
- Actions: View, Edit, Close, Reassign

---

#### 6.2 Live Chat System

**Route:** `/platform-admin/chat`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(platform-admin)/chat/page.tsx`
- `/home/user/hris-ai/src/components/platform/ChatWidget.tsx` (14,326 bytes)
- `/home/user/hris-ai/src/components/platform/ChatSessionDetail.tsx` (10,733 bytes)

**API Endpoints:**
- `GET /api/platform/chat/sessions` - List chat sessions
- `GET /api/platform/chat/sessions/:id` - Get single session
- `POST /api/platform/chat/messages` - Send message
- `GET /api/platform/chat/messages/:sessionId` - Get messages
- `POST /api/platform/chat/canned-responses` - Create canned response
- `GET /api/platform/chat/canned-responses` - List canned responses
- `POST /api/platform/chat/agent-availability` - Toggle agent availability

**Data Model:**
```typescript
ChatSession {
  id: string;
  tenantId: string;
  visitorName: string;
  visitorEmail: string;
  
  // Status
  status: 'open' | 'in-progress' | 'closed';
  
  // Assignment
  assignedAgent?: string;
  assignedAgentName?: string;
  
  // Messages
  messages: {
    id: string;
    sender: 'visitor' | 'agent';
    content: string;
    timestamp: string;
  }[];
  
  // Duration
  startedAt: string;
  closedAt?: string;
  duration?: number; // seconds
  
  // Rating
  satisfactionRating?: number; // 1-5
  
  created_at: string;
  updated_at: string;
}
```

**CRUD Operations:**
- **Create:** Visitor initiates chat (frontend)
- **Read:** List active and closed chats
- **Send Messages:** Exchange messages in real-time
- **Close:** End chat session
- **Rate:** Post-chat satisfaction rating

**List View Features:**
- Search by visitor name, email
- Filter by status (open, in-progress, closed)
- Filter by assigned agent
- Sort by duration, visitor name
- Real-time status indicators
- Wait time counter for open chats
- Actions: Join chat, View history, Close

**Agent Features:**
- Toggle availability status
- Assign chat to self
- Use canned responses for quick replies
- Send files/links
- Provide satisfaction survey
- Analytics on response time, resolution rate

---

### 7. **Settings**

#### 7.1 Platform Settings

**Route:** `/platform-admin/settings`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(platform-admin)/settings/page.tsx`
- `/home/user/hris-ai/src/components/platform/PlatformSettings.tsx` (26,576 bytes)

**API Endpoints:**
- `GET /api/platform/settings` - Get all settings
- `PATCH /api/platform/settings` - Update settings

**Settings Tabs:**

1. **General**
   - Platform name
   - Support email
   - Help desk URL
   - Terms URL
   - Privacy URL

2. **Security**
   - Session timeout (minutes)
   - IP whitelist
   - Two-factor auth requirement
   - Password policy (min length, complexity)

3. **Email**
   - SMTP server
   - SMTP port
   - SMTP username
   - From email
   - From name
   - Transactional emails enabled

4. **AI**
   - OpenAI API key
   - Model selection
   - Prompt templates
   - Rate limits

5. **Payment**
   - Stripe API key
   - Webhook secret
   - Test mode
   - Default currency

6. **Features**
   - Feature flags management
   - Feature rollout settings
   - Beta program

7. **Billing**
   - Invoice prefix
   - Default payment terms
   - Tax configuration
   - Currency display

---

#### 7.2 Email Templates

**Route:** `/platform-admin/settings/email-templates`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(platform-admin)/settings/email-templates/page.tsx`
- `/home/user/hris-ai/src/components/platform/EmailTemplateEditorModal.tsx` (7,545 bytes)
- `/home/user/hris-ai/src/components/platform/EmailTemplatePreviewModal.tsx` (2,819 bytes)
- `/home/user/hris-ai/src/components/platform/SendTestEmailModal.tsx` (4,107 bytes)

**API Endpoints:**
- `GET /api/platform/email-templates` - List templates
- `POST /api/platform/email-templates` - Create template
- `GET /api/platform/email-templates/:id` - Get template
- `PATCH /api/platform/email-templates/:id` - Update template
- `DELETE /api/platform/email-templates/:id` - Delete template
- `POST /api/platform/email-templates/:id/test` - Send test email

**Email Template Types:**
- User invitation
- Password reset
- Subscription confirmation
- Payment receipt
- Support ticket notification
- SLA breach warning
- Weekly report digest

**Template Fields:**
- Template name (required)
- Category (select: user, billing, support, notifications)
- Subject line (required, supports variables like {{user.name}})
- Body (required, HTML/text editor with variable suggestions)
- Variables (available: {{user.name}}, {{user.email}}, {{company.name}}, {{tenant.name}}, etc.)
- From name (required)
- From email (required)

**Form Actions:**
- Edit template
- Preview template (with sample data)
- Send test email (to specified email)
- Reset to default
- Delete template

**List View Features:**
- Search by template name
- Filter by category
- Last modified date
- Actions: Edit, Preview, Test, Delete

---

### 8. **Feature Flags**

**Route:** `/platform-admin/feature-flags`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(platform-admin)/feature-flags/page.tsx` (440 lines)
- `/home/user/hris-ai/src/components/platform/CreateFeatureFlagModal.tsx` (7,858 bytes)
- `/home/user/hris-ai/src/components/platform/EditFeatureFlagModal.tsx` (10,169 bytes)

**API Endpoints:**
- `GET /api/platform/feature-flags` - List flags
- `POST /api/platform/feature-flags` - Create flag
- `GET /api/platform/feature-flags/:id` - Get flag
- `PATCH /api/platform/feature-flags/:id` - Update flag
- `DELETE /api/platform/feature-flags/:id` - Delete flag

**Data Model:**
```typescript
FeatureFlag {
  id: string;
  name: string;
  key: string; // Unique identifier like 'new_dashboard'
  description: string;
  
  // Status
  enabled: boolean;
  
  // Rollout Strategy
  rolloutStrategy: 'global' | 'percentage' | 'whitelist' | 'blacklist';
  rolloutPercentage?: number; // 0-100
  whitelistTenants?: string[]; // Tenant IDs
  blacklistTenants?: string[]; // Tenant IDs
  
  // Target Configuration
  targetTenants?: string[];
  targetUsers?: string[];
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

**CRUD Operations:**
- **Create:** Create new feature flag with rollout strategy
- **Read:** List all flags with status
- **Update:** Change flag status, rollout strategy, percentages
- **Delete:** Remove flag
- **Toggle:** Enable/disable globally
- **Target:** Specify which tenants/users have access

**Form Fields:**
- Flag Name (required)
- Key (required, unique, auto-generated from name)
- Description (required)
- Enabled (toggle)
- Rollout Strategy (select):
  - Global (all or nothing)
  - Percentage (X% of tenants)
  - Whitelist (specific tenants)
  - Blacklist (all except specific)
- Rollout Percentage (0-100, required if percentage strategy)
- Whitelist Tenants (multi-select, required if whitelist)
- Blacklist Tenants (multi-select, required if blacklist)

**List View Features:**
- Search by flag name, key
- Filter by enabled/disabled
- Filter by rollout strategy
- Sort by created date, name
- Status toggle (enable/disable)
- Rollout percentage/count display
- Actions: Edit, Delete, View Analytics

**Analytics:**
- Percentage of tenants with flag enabled
- User adoption rate
- Feature usage metrics

---

### 9. **Roles & Permissions**

#### 9.1 Roles Builder

**Route:** `/platform-admin/roles`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(platform-admin)/roles/page.tsx` (384 lines)
- `/home/user/hris-ai/src/components/platform/CreateRoleModal.tsx` (10,971 bytes)
- `/home/user/hris-ai/src/components/platform/EditRoleModal.tsx` (5,412 bytes)

**API Endpoints:**
- `GET /api/platform/roles` - List roles
- `POST /api/platform/roles` - Create role
- `GET /api/platform/roles/:id` - Get single role
- `PATCH /api/platform/roles/:id` - Update role
- `DELETE /api/platform/roles/:id` - Delete role

**Data Model:**
```typescript
PlatformRole {
  id: string;
  name: string;
  description?: string;
  roleType: 'platform' | 'tenant';
  
  // Permissions
  permissions: {
    [resource: string]: string[]; // resource: ['read', 'create', 'update', 'delete']
  };
  
  // System roles (cannot delete)
  isSystem: boolean;
  
  created_at: string;
  updated_at: string;
}
```

**Permissions Matrix:**
```
Resources:
- tenants: create, read, update, delete, suspend, reactivate
- users: create, read, update, delete, impersonate
- invoices: create, read, update, delete, send, mark-paid, cancel
- subscriptions: create, read, update, delete
- feature-flags: create, read, update, delete, rollout
- roles: create, read, update, delete
- settings: read, update
- support: create, read, update, close, assign
- chat: participate, manage-agents
- analytics: read, export
- compliance: read, resolve-alerts
```

**CRUD Operations:**
- **Create:** Define new role with selected permissions
- **Read:** List roles with permission matrix
- **Update:** Modify permissions for role
- **Delete:** Remove role (except system roles)
- **Assign:** Assign role to platform user

**Form Fields:**
- Role Name (required)
- Role Type (select: platform, tenant)
- Description (optional)
- Permissions (checkbox matrix for each resource and action)

**List View Features:**
- Search by role name
- Filter by role type
- Show number of users with role
- Display permission count
- Actions: Edit, Delete, View Permissions, Assign to Users

---

#### 9.2 Permission Testing

**Route:** `/platform-admin/permissions/testing`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(platform-admin)/permissions/testing/page.tsx` (482 lines)

**API Endpoints:**
- `GET /api/platform/permissions/test` - Run permission test
- `GET /api/platform/permissions/scenarios` - List test scenarios
- `POST /api/platform/permissions/scenarios` - Create scenario
- `POST /api/platform/permissions/scenarios/:id/run` - Run scenario
- `GET /api/platform/permissions/conflicts` - Check for conflicts

**Features:**
- Test role permissions against resources
- Run test scenarios (combinations of roles and actions)
- Detect permission conflicts
- Export permission matrix as CSV/PDF
- Simulate user access to features

**Test Scenarios:**
- Create test scenario with:
  - Role selection
  - Resource selection
  - Action to test
  - Expected result
- Run test and verify result
- Track test history

**Conflict Detection:**
- Identify roles with contradictory permissions
- Detect orphaned permissions
- Check for privilege escalation risks

---

### 10. **Analytics**

#### 10.1 Basic Analytics

**Route:** `/platform-admin/analytics`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(platform-admin)/analytics/page.tsx`
- `/home/user/hris-ai/src/components/platform/AnalyticsDashboard.tsx` (18,307 bytes)

**Metrics:**
- Tenant growth trends (6 months)
- User growth
- Revenue trends (MRR, ARR)
- Subscription breakdown by plan
- Churn rate
- Feature adoption (per module)

---

#### 10.2 Advanced Analytics

**Route:** `/platform-admin/analytics/advanced`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(platform-admin)/analytics/advanced/page.tsx` (141 lines)

**API Endpoints:**
- `GET /api/platform/analytics/advanced` - Advanced metrics

**Components:**
- **TenantHealthWidget** - Health scores for each tenant
- **FeatureAdoptionWidget** - Feature usage tracking
- **UserEngagementWidget** - DAU/WAU/MAU metrics

**Advanced Metrics:**
- Tenant health scores (0-100)
- Feature adoption rates (per feature, per tenant)
- User engagement (Daily/Weekly/Monthly Active Users)
- Cohort analysis
- Retention curves
- Module usage breakdown

---

### 11. **Compliance**

**Route:** `/platform-admin/compliance`  
**Frontend Files:**
- `/home/user/hris-ai/src/app/(platform-admin)/compliance/page.tsx` (457 lines)

**API Endpoints:**
- `GET /api/platform/compliance-alerts` - List all alerts
- `GET /api/platform/compliance-alerts/:id` - Get alert detail
- `PATCH /api/platform/compliance-alerts/:id` - Update alert status

**Data Model:**
```typescript
ComplianceAlert {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  category: string; // bpjs_overdue, tax_filing, data_retention, etc.
  
  // Affected tenants
  affectedTenants: string[]; // Tenant IDs
  tenantCount: number;
  
  // Status
  status: 'active' | 'resolved' | 'dismissed';
  resolvedAt?: string;
  dismissedAt?: string;
  
  // Due date
  dueDate?: string;
  
  // Resolution
  resolutionNotes?: string;
  resolvedBy?: string;
  
  created_at: string;
  updated_at: string;
}
```

**List View Features:**
- Search by title, category
- Filter by severity (high, medium, low)
- Filter by status (active, resolved, dismissed)
- Filter by date range
- Sort by severity, dueDate
- Affected tenant count display
- Days until due indicator
- Actions: View, Resolve, Dismiss

**Dashboard Widgets:**
- Active alerts count (grouped by severity)
- Alerts due in next 7 days
- Recently resolved alerts
- Alert trend over time
- Tenant impact report

---

## CMS Admin Feature Details

### CMS Features Summary Table

| Feature | Endpoint | CRUD | Forms | List Features | API Integration | Export |
|---------|----------|------|-------|---------------|-----------------| ------|
| **Blog Posts** | `/admin/cms/blog` | ✓✓✓✓ | Create/Edit | Search, Filter, Pagination | Full | CSV |
| **Case Studies** | `/admin/cms/case-studies` | ✓✓✓✓ | Create/Edit | Search, Filter, Pagination | Full | CSV |
| **Demo Requests** | `/admin/cms/demo-requests` | ✓✓✓✓ | Schedule | Search, Filter, Status Badges | Full | CSV |
| **Leads** | `/admin/cms/leads` | ✓✓✓✓ | Assign | Search, Filter, Source Tracking | Full | CSV/Excel |
| **Newsletter** | `/admin/cms/newsletter` | ✓✓✓✓ | Preferences | Search, Filter, Bulk Actions | Full | CSV |
| **Analytics** | `/admin/cms/analytics` | ✓ | - | Charts, Trends | Full | PDF |

---

## Platform Admin Feature Details

### Platform Features Summary Table

| Feature | Endpoint | CRUD | Forms | List Features | API Integration | Export |
|---------|----------|------|-------|---------------|-----------------| ------|
| **Dashboard** | `/platform-admin/dashboard` | ✓ | - | Metrics, Charts | Full | - |
| **Tenants** | `/platform-admin/tenants` | ✓✓✓✓ | Wizard | Search, Filter, Status | Full | CSV |
| **Users** | `/platform-admin/users` | ✓✓✓✓ | Modal | Search, Filter, Roles | Full | CSV |
| **Invoices** | `/platform-admin/invoices` | ✓✓✓✓ | Modal | Search, Filter, Status | Full | PDF/CSV |
| **Subscriptions** | `/platform-admin/subscription-plans` | ✓✓✓✓ | Modal | Feature Matrix | Full | CSV |
| **Support** | `/platform-admin/support` | ✓✓✓✓ | Modal | Search, Filter, SLA | Full | CSV |
| **Chat** | `/platform-admin/chat` | ✓✓ | - | Search, Filter, Real-time | WebSocket | - |
| **Settings** | `/platform-admin/settings` | - | Tabs | - | Full | - |
| **Feature Flags** | `/platform-admin/feature-flags` | ✓✓✓✓ | Modal | Search, Filter, Strategy | Full | CSV |
| **Roles** | `/platform-admin/roles` | ✓✓✓✓ | Modal | Permission Matrix | Full | PDF |
| **Permissions Test** | `/platform-admin/permissions/testing` | ✓ | Scenarios | Conflict Detection | Full | PDF/CSV |
| **Analytics** | `/platform-admin/analytics` | ✓ | - | Charts, Trends | Full | PDF |
| **Compliance** | `/platform-admin/compliance` | ✓ | - | Alerts, Severity | Full | PDF |

---

## Critical Admin Journeys

### 1. **CMS: Managing Demo Requests**

**Journey:**
1. Navigate to `/admin/cms/demo-requests`
2. View all demo requests with status indicators
3. Search for specific company or contact
4. Filter by status (pending, scheduled, completed)
5. Click "Schedule" to schedule a demo:
   - Set scheduled date
   - Add meeting URL (Zoom/Google Meet)
   - Add notes
   - Confirm scheduling
6. Status changes to "scheduled"
7. Send confirmation email (optional)
8. Monitor completed demos
9. Delete old/cancelled requests

**Test Scenarios:**
- Filter demo requests by various statuses
- Schedule a demo with all details
- Search for demo request by company name
- Bulk schedule multiple demos
- Cancel/delete demo request
- Export demo requests for analysis

---

### 2. **CMS: Publishing Blog Posts**

**Journey:**
1. Navigate to `/admin/cms/blog`
2. Create new blog post:
   - Enter title and slug
   - Write content with rich text editor
   - Add featured image
   - Set category and tags
   - Configure SEO fields
   - Save as draft
3. Preview blog post
4. Publish when ready
5. Blog appears on website
6. Track view count
7. Edit if needed
8. Archive when obsolete

**Test Scenarios:**
- Create blog post with all fields
- Upload featured image
- Preview post before publishing
- Publish post and verify status change
- Edit published post
- Archive old posts
- Filter posts by status and category
- Search for specific post

---

### 3. **CMS: Managing Leads**

**Journey:**
1. Navigate to `/admin/cms/leads`
2. View all leads with source information
3. Search leads by email or company
4. Filter by status (new, contacted, qualified, converted, lost)
5. Filter by source (homepage, pricing, demo, etc.)
6. Click on lead to view details:
   - UTM parameters
   - Contact info
   - Status history
   - Notes
7. Update lead status as sales progresses
8. Assign to sales person
9. Add notes/comments
10. Export leads for CRM sync

**Test Scenarios:**
- View all leads with UTM tracking
- Filter leads by source (homepage, blog, demo request, referral)
- Filter leads by status (new, contacted, qualified)
- Search for specific lead
- Update lead status
- Assign lead to user
- Add internal notes to lead
- Export leads as CSV with UTM parameters

---

### 4. **CMS: Managing Newsletter Subscribers**

**Journey:**
1. Navigate to `/admin/cms/newsletter`
2. View all subscribers
3. Search by email or name
4. Filter by subscription status (subscribed, unsubscribed, bounced)
5. View subscriber preferences:
   - Frequency (daily, weekly, monthly)
   - Topics (HR, Payroll, Compliance, etc.)
6. Bulk operations:
   - Select multiple subscribers
   - Unsubscribe batch
   - Change frequency
   - Update topics
7. Add new subscriber manually
8. Export subscriber list for email campaigns
9. Monitor bounce rates

**Test Scenarios:**
- View all newsletter subscribers
- Filter by subscription status
- Filter by subscription frequency
- Search for subscriber by email
- Bulk unsubscribe subscribers
- Change frequency for multiple subscribers
- Add new subscriber manually
- Export subscriber list to CSV

---

### 5. **Platform Admin: Creating New Tenant (Onboarding)**

**Journey:**
1. Navigate to `/platform-admin/tenants`
2. Click "Create Tenant" button
3. Complete multi-step wizard:

   **Step 1: Company Information**
   - Enter company name
   - Enter slug (auto-generated, editable)
   - Enter description
   - Upload logo
   
   **Step 2: Admin User**
   - Enter admin first name
   - Enter admin last name
   - Enter admin email
   - Auto-generate password
   - Confirm details
   
   **Step 3: Subscription**
   - Select subscription plan (trial, starter, professional, enterprise)
   - Confirm employee limits
   - Select billing frequency (monthly/annual)
   - Set start date
   
   **Step 4: Review & Create**
   - Review all information
   - Confirm and create tenant
   - Show success modal with:
     - Tenant ID
     - Admin credentials
     - Onboarding link
     - Support contact

4. Send welcome email to admin
5. Activate tenant
6. Admin can login and start setup

**Test Scenarios:**
- Complete full wizard flow
- Verify each step validation
- Check auto-generated slug
- Test different subscription plans
- Verify success modal shows correct info
- Test email sending to new admin
- Verify new tenant appears in list

---

### 6. **Platform Admin: Managing Tenant Subscriptions**

**Journey:**
1. Navigate to `/platform-admin/tenants/:id`
2. Click "Billing" tab
3. View current subscription:
   - Plan name (e.g., Professional)
   - Billing frequency (monthly/annual)
   - Next billing date
   - Amount per period
   - Employee limit
   - Feature list
4. Options:
   - **Upgrade Plan**: Click "Change Plan"
     - Select new plan
     - Pro-rata adjustment calculated
     - Confirm upgrade
     - Invoice generated and sent
   
   - **Change Billing Frequency**: Monthly ↔ Annual
     - Adjust price
     - Update invoice
   
   - **Suspend Subscription**: 
     - Reason required
     - Access restricted
     - No charge
   
   - **Cancel Subscription**:
     - Final invoice generated
     - Access ends on date
     - Data retention policy shown

5. View subscription history
6. Download invoices

**Test Scenarios:**
- View current subscription details
- Upgrade from Starter to Professional plan
- Pro-rata amount calculated correctly
- Downgrade to lower plan
- Change billing frequency
- Suspend subscription and verify access restricted
- View subscription history and invoices

---

### 7. **Platform Admin: Managing Invoices & Payment**

**Journey:**
1. Navigate to `/platform-admin/invoices`
2. View all invoices with status (draft, sent, paid, overdue)
3. Create new invoice:
   - Select tenant
   - Add line items:
     - Service description
     - Quantity
     - Unit price
     - Auto-calculates total
   - Set issue and due dates
   - Add internal notes
   - Review tax calculation
4. Send invoice via email:
   - Invoice PDF generated
   - Email sent to tenant billing contact
   - Status changes to "sent"
5. Monitor payment:
   - Wait for payment
   - Mark as paid when received (with date and method)
   - Or escalate if overdue (automatic after due date)
6. Generate payment report
7. Export invoices for accounting

**Test Scenarios:**
- Create invoice with multiple line items
- Verify tax calculation correct
- Generate PDF of invoice
- Send invoice via email
- Mark invoice as paid
- Search invoices by tenant, invoice number, date
- Filter invoices by status and date range
- Export invoices to CSV
- Handle overdue invoices

---

### 8. **Platform Admin: Managing Support Tickets**

**Journey:**
1. Navigate to `/platform-admin/support`
2. View support ticket dashboard:
   - Open ticket count
   - SLA status (on-track/breached)
   - Average response time
3. List all support tickets:
   - Search by ticket number, subject, tenant
   - Filter by status (open, in-progress, waiting, resolved)
   - Filter by priority (low, medium, high, urgent)
   - Sort by SLA breach status, priority
4. Click ticket to view:
   - Full description
   - Tenant info
   - Current status
   - Priority level
   - Assigned agent
   - Messages/resolution time
   - SLA timer (shows if breached)
5. Update ticket:
   - Change status
   - Change priority
   - Assign to agent
   - Add internal note
   - Mark as resolved
6. Request customer satisfaction rating
7. Track agent performance (response time, resolution rate)

**Test Scenarios:**
- View all open support tickets
- Search for specific ticket by number
- Filter tickets by status and priority
- Assign ticket to agent
- Change ticket priority
- Add internal notes
- Close resolved tickets
- View SLA breach warnings
- Export support tickets for analysis

---

### 9. **Platform Admin: Managing Users & Impersonation**

**Journey:**
1. Navigate to `/platform-admin/users`
2. View all platform users (admins, support staff)
3. Create new user:
   - Enter email
   - Enter first name
   - Enter last name
   - Select role (super_admin, admin, support_staff)
   - Email with password sent
4. Edit user:
   - Change role
   - Deactivate/activate
   - Force password reset
5. **Impersonate user**:
   - Click "Impersonate" button
   - Impersonation banner appears (shows "Logged in as other user")
   - Can now see what user sees
   - All actions logged
   - Click "End Impersonation" to return
6. Delete user:
   - Deactivate (default)
   - Or hard delete with confirmation

**Test Scenarios:**
- Create new platform admin user
- Set user role
- Edit user info and role
- Start impersonation and verify banner
- Perform actions while impersonated
- End impersonation
- Verify audit log shows impersonation
- Delete/deactivate user
- Verify permissions applied correctly

---

### 10. **Platform Admin: Testing Permissions (RBAC)**

**Journey:**
1. Navigate to `/platform-admin/permissions/testing`
2. Create test scenario:
   - Select role (e.g., support_staff)
   - Select resource (e.g., tenants)
   - Select action (e.g., read)
   - Expected result (should succeed or fail)
3. Run test
4. View results:
   - Test passed/failed
   - Actual permissions checked
   - Execution time
5. Run conflict detection:
   - Check for contradictory permissions
   - Identify orphaned permissions
   - Detect privilege escalation risks
6. Export test results as PDF

**Test Scenarios:**
- Test role can read tenants (should pass for admin)
- Test role cannot delete tenants (should fail for support_staff)
- Check for permission conflicts
- Test permission inheritance
- Export test results

---

## Technical Testing Elements

### 1. **Authentication & Authorization**

**Test Cases:**

**Admin Login:**
- Login with valid credentials
- Verify session token created
- Verify redirect to dashboard
- Verify session persistence across page reload
- Logout and verify session cleared
- Try accessing protected routes after logout (should redirect to login)

**Authorization Checks:**
- Super admin can access all features
- Admin can access most features (except some system settings)
- Support staff can only access support and chat features
- Try accessing features without proper role (should show error)
- Impersonate user and verify permissions change
- Verify audit log shows who did what and when

---

### 2. **Form Validations**

**Test Cases for Each Form:**

**Required Fields:**
- Submit form without filling required fields
- Error messages appear for each missing field
- Submit is disabled until all required fields filled

**Email Validation:**
- Valid email format accepted
- Invalid format rejected (missing @, invalid domain)
- Duplicate email rejected (where applicable)

**Unique Fields:**
- Duplicate slug rejected for blog posts
- Duplicate invoice number rejected
- Duplicate email rejected for users/tenants

**Data Type Validation:**
- Number fields only accept numbers
- Date fields only accept valid dates
- URL fields validate proper URL format
- Phone fields accept valid phone formats

**Length Validation:**
- Text fields respect max length
- Short text respects min length (if applicable)
- Truncation or error message shown

**Dependent Fields:**
- Conditional fields appear/disappear based on selections
- Validations change based on other field values
- Example: Rollout percentage field only required if percentage strategy selected

---

### 3. **Data Tables (Sorting, Filtering, Pagination)**

**Test Cases:**

**Sorting:**
- Click column header to sort ascending
- Click again to sort descending
- Sort works for text, numbers, dates
- Multiple column sorting (if supported)
- Sort indicator shows active column

**Filtering:**
- Single filter works correctly
- Multiple filters work together (AND logic)
- Filter by text search
- Filter by dropdown select
- Filter by date range
- Clear filter button resets
- Filter persists when navigating away and back

**Pagination:**
- Items per page dropdown works
- Navigate to next page
- Navigate to previous page
- Jump to specific page
- Pagination shows correct range (e.g., "1-10 of 247")
- Last page shows remaining items only
- Pagination resets when filtering

**Search Functionality:**
- Search by text field
- Search is case-insensitive
- Search works for multiple fields
- Search results update in real-time
- No results message appears when no matches
- Debounce prevents excessive API calls

---

### 4. **API Integration**

**Test Cases:**

**GET Requests:**
- List endpoints return correct data
- Filters applied correctly in query params
- Pagination works with offset/limit
- Sorting parameters respected
- Status codes correct (200 for success)
- Error handling for 404 (not found)
- Error handling for 500 (server error)

**POST Requests:**
- Create operations successful
- Data persisted in database
- Status code 201 (created) returned
- Response includes created object with ID
- Required fields enforced
- Validation errors return 400 with error details

**PATCH Requests:**
- Update operations successful
- Only updated fields changed
- Status code 200 returned
- Response shows updated object
- Permissions checked (only allowed users can update)

**DELETE Requests:**
- Delete operations successful
- Data removed from database (or soft-deleted)
- Status code 200 returned
- Subsequent get returns 404 (or soft-delete status)
- Confirmation required for destructive operations

**Error Handling:**
- Network errors show retry option
- Validation errors show specific messages
- Unauthorized access shows permission denied
- Rate limit errors show throttling message
- Server errors show generic message and support contact

---

### 5. **Loading States**

**Test Cases:**

**During Data Fetch:**
- Loading spinner appears while fetching
- Content area disabled until loaded
- Buttons disabled until loaded
- Estimated load time shown (if >2s)

**During Form Submission:**
- Submit button shows loading state
- Button disabled and shows spinner
- Can't submit again while pending
- User can cancel (if applicable)

**During Bulk Operations:**
- Progress indicator shows
- Cancel button available
- Shows number of items processed

---

### 6. **Error Handling & Recovery**

**Test Cases:**

**Form Submission Errors:**
- Form shows error banner at top
- Specific field errors highlighted
- Field error messages displayed
- Scroll to first error automatically
- User can correct and retry

**API Errors:**
- Timeout shows retry button
- Network error shows offline message
- 401 Unauthorized redirects to login
- 403 Forbidden shows permission denied
- 404 Not Found shows item not found
- 500 Server Error shows generic message

**Data Loss Prevention:**
- Form data saved to local storage
- Unsaved changes warning on page leave
- Draft auto-save for long forms
- Ability to recover draft

---

### 7. **Performance**

**Test Cases:**

**Page Load Time:**
- Dashboard loads in <3 seconds
- List pages load in <2 seconds
- Detail pages load in <2 seconds
- Lazy load images if applicable

**Data Table Performance:**
- List with 1000+ items loads smoothly
- Filtering doesn't cause lag
- Sorting doesn't cause lag
- Virtual scrolling for large lists (if applicable)

**Search Performance:**
- Search results appear <1 second
- Debounced to prevent excessive API calls
- No lag typing in search box

**API Response Time:**
- List endpoints <500ms
- Detail endpoints <300ms
- Update operations <500ms
- Bulk operations show progress

---

### 8. **Export Functionality**

**Test Cases:**

**CSV Export:**
- All visible columns included
- Data formatted correctly (dates, numbers, booleans)
- File downloads with proper name and timestamp
- UTF-8 encoding for special characters
- Large exports don't timeout
- Filters applied to export (only filtered data exported)

**PDF Export (Invoices, Reports):**
- PDF generates correctly
- All data visible in PDF
- Formatting looks professional
- Images/logos included
- Page breaks handle large data
- Download works in all browsers

**Excel Export:**
- Multiple sheets if applicable
- Formulas for calculated fields
- Formatting (colors, bold, etc.) preserved
- File opens in Excel and other viewers

---

### 9. **Real-Time Updates**

**Test Cases:**

**Dashboard Auto-Refresh:**
- Metrics update every 5 minutes
- No manual refresh needed
- Shows "last updated" timestamp
- User can manually refresh

**Chat Real-Time:**
- New messages appear immediately
- No need to refresh page
- Typing indicator shows other user typing
- User status updates in real-time
- Connection status shown

**Notifications:**
- New tickets appear in list automatically
- New messages trigger notification
- Alert notifications appear for critical events
- Sound/browser notification options

---

### 10. **Responsive Design**

**Test Cases:**

**Desktop (1920x1080):**
- All elements visible
- No horizontal scrolling
- Tables display correctly

**Tablet (768x1024):**
- Navigation adapted (collapsible menu if needed)
- Tables responsive (horizontal scroll or stacked view)
- Forms readable and usable

**Mobile (375x667):**
- Mobile-optimized navigation
- Single column layout
- Touch-friendly buttons (48x48px minimum)
- Forms easy to fill on mobile

---

### 11. **Browser Compatibility**

**Test Cases:**
- Chrome latest version
- Firefox latest version
- Safari latest version
- Edge latest version
- Mobile browsers (Chrome, Safari on iOS)

**Compatibility Check:**
- All features work
- Styling looks correct
- No console errors
- Form inputs work properly

---

### 12. **Security Testing**

**Test Cases:**

**CSRF Protection:**
- Forms include CSRF token
- State-changing operations require POST/PATCH/DELETE
- Token validates before processing

**XSS Prevention:**
- User input sanitized
- No script execution in input fields
- HTML entities escaped

**SQL Injection Prevention:**
- Parameterized queries used
- No raw SQL from user input
- ORM prevents injection

**Rate Limiting:**
- Excessive requests throttled
- 429 (Too Many Requests) returned
- Retry-After header provided

**Session Security:**
- Sessions expire after inactivity (15 min recommended)
- HTTPS enforced
- Secure/HttpOnly cookies
- CORS headers correct

---

## API Endpoints Reference

### CMS API Base URL: `/api/v1/cms`

#### Blog Posts
- `GET /cms/blog` - List blog posts
- `POST /cms/blog` - Create blog post
- `GET /cms/blog/:id` - Get single blog post
- `PATCH /cms/blog/:id` - Update blog post
- `DELETE /cms/blog/:id` - Delete blog post
- `POST /cms/blog/:id/publish` - Publish blog post

#### Case Studies
- `GET /cms/case-studies` - List case studies
- `POST /cms/case-studies` - Create case study
- `GET /cms/case-studies/:id` - Get single case study
- `PATCH /cms/case-studies/:id` - Update case study
- `DELETE /cms/case-studies/:id` - Delete case study
- `POST /cms/case-studies/:id/publish` - Publish case study

#### Leads
- `GET /cms/leads` - List leads
- `POST /cms/leads` - Create lead
- `GET /cms/leads/:id` - Get single lead
- `PATCH /cms/leads/:id` - Update lead
- `DELETE /cms/leads/:id` - Delete lead

#### Demo Requests
- `GET /cms/demo-requests` - List demo requests
- `POST /cms/demo-requests` - Create demo request
- `GET /cms/demo-requests/:id` - Get single demo request
- `PATCH /cms/demo-requests/:id` - Update demo request
- `DELETE /cms/demo-requests/:id` - Delete demo request
- `POST /cms/demo-requests/:id/schedule` - Schedule demo

#### Newsletter
- `GET /cms/newsletter` - List subscribers
- `POST /cms/newsletter` - Create subscriber
- `GET /cms/newsletter/:id` - Get single subscriber
- `PATCH /cms/newsletter/:id` - Update subscriber
- `DELETE /cms/newsletter/:id` - Delete subscriber
- `POST /cms/newsletter/:id/unsubscribe` - Unsubscribe

---

### Platform Admin API Base URL: `/api/platform`

#### Dashboard
- `GET /platform/dashboard/metrics` - Get KPI metrics

#### Tenants
- `GET /platform/tenants` - List tenants
- `POST /platform/tenants` - Create tenant
- `GET /platform/tenants/:id` - Get single tenant
- `PATCH /platform/tenants/:id` - Update tenant
- `DELETE /platform/tenants/:id` - Delete tenant
- `PATCH /platform/tenants/:id/status` - Change status
- `GET /platform/tenants/:id/audit-logs` - Get audit logs
- `POST /platform/tenants/:id/users` - Add user
- `GET /platform/tenants/:id/users` - List users
- `DELETE /platform/tenants/:id/users/:userId` - Remove user
- `GET /platform/tenants/:id/subscription` - Get subscription

#### Users
- `GET /platform/users` - List platform users
- `POST /platform/users` - Create user
- `GET /platform/users/:id` - Get single user
- `PATCH /platform/users/:id` - Update user
- `DELETE /platform/users/:id` - Delete user

#### Invoices
- `GET /platform/invoices` - List invoices
- `POST /platform/invoices` - Create invoice
- `GET /platform/invoices/:id` - Get invoice
- `PATCH /platform/invoices/:id` - Update invoice
- `DELETE /platform/invoices/:id` - Delete invoice
- `POST /platform/invoices/:id/send` - Send invoice
- `POST /platform/invoices/:id/mark-paid` - Mark as paid
- `POST /platform/invoices/:id/cancel` - Cancel invoice
- `GET /platform/invoices/:id/pdf` - Download PDF

#### Subscription Plans
- `GET /platform/subscription-plans` - List plans
- `POST /platform/subscription-plans` - Create plan
- `GET /platform/subscription-plans/:id` - Get plan
- `PATCH /platform/subscription-plans/:id` - Update plan
- `DELETE /platform/subscription-plans/:id` - Delete plan

#### Support
- `GET /platform/support` - List tickets
- `POST /platform/support` - Create ticket
- `GET /platform/support/:id` - Get ticket
- `PATCH /platform/support/:id` - Update ticket
- `POST /platform/support/:id/messages` - Add message

#### Chat
- `GET /platform/chat/sessions` - List chat sessions
- `GET /platform/chat/sessions/:id` - Get session
- `POST /platform/chat/messages` - Send message
- `GET /platform/chat/canned-responses` - List responses
- `POST /platform/chat/agent-availability` - Toggle availability

#### Settings
- `GET /platform/settings` - Get all settings
- `PATCH /platform/settings` - Update settings

#### Email Templates
- `GET /platform/email-templates` - List templates
- `POST /platform/email-templates` - Create template
- `GET /platform/email-templates/:id` - Get template
- `PATCH /platform/email-templates/:id` - Update template
- `DELETE /platform/email-templates/:id` - Delete template
- `POST /platform/email-templates/:id/test` - Send test email

#### Feature Flags
- `GET /platform/feature-flags` - List flags
- `POST /platform/feature-flags` - Create flag
- `GET /platform/feature-flags/:id` - Get flag
- `PATCH /platform/feature-flags/:id` - Update flag
- `DELETE /platform/feature-flags/:id` - Delete flag

#### Roles
- `GET /platform/roles` - List roles
- `POST /platform/roles` - Create role
- `GET /platform/roles/:id` - Get role
- `PATCH /platform/roles/:id` - Update role
- `DELETE /platform/roles/:id` - Delete role

#### Permissions
- `GET /platform/permissions/test` - Run permission test
- `GET /platform/permissions/scenarios` - List test scenarios
- `POST /platform/permissions/scenarios` - Create scenario
- `POST /platform/permissions/scenarios/:id/run` - Run scenario
- `GET /platform/permissions/conflicts` - Check conflicts

#### Analytics
- `GET /platform/analytics` - Get analytics
- `GET /platform/analytics/advanced` - Get advanced metrics

#### Compliance
- `GET /platform/compliance-alerts` - List alerts
- `GET /platform/compliance-alerts/:id` - Get alert
- `PATCH /platform/compliance-alerts/:id` - Update alert

#### Impersonation
- `POST /platform/impersonate/start` - Start impersonation
- `POST /platform/impersonate/end` - End impersonation
- `GET /platform/impersonate/active` - Get active impersonation
- `GET /platform/impersonate/sessions` - Get impersonation history

---

## Summary

This comprehensive testing map covers:

✅ **13 CMS Admin features** with detailed CRUD operations, forms, and APIs
✅ **13 Platform Admin features** with multi-step workflows
✅ **10 critical admin journeys** showing real-world usage patterns
✅ **12 technical testing categories** with specific test cases
✅ **50+ API endpoints** documented with methods and use cases

**Ready for:** QA Testing, End-to-End Testing, Integration Testing, User Acceptance Testing

**Next Steps:**
1. Create automated test cases based on journeys
2. Set up test data fixtures
3. Create test checklists for manual testing
4. Configure CI/CD for test execution
5. Document known limitations and workarounds

