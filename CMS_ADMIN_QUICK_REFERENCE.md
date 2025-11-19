# CMS Admin Panel - Quick Reference Guide

**Version:** 1.0  
**Last Updated:** 2025-11-19

---

## Quick Navigation Map

### CMS Admin (`/admin/cms`)

```
/admin/cms/
├── Dashboard (/page.tsx)
├── Blog (/blog/page.tsx)
├── Case Studies (/case-studies/page.tsx)
├── Demo Requests (/demo-requests/page.tsx)
├── Leads (/leads/page.tsx)
├── Newsletter (/newsletter/page.tsx)
└── Analytics (/analytics/page.tsx) - To be implemented
```

### Platform Admin (`/platform-admin`)

```
/platform-admin/
├── Dashboard (/dashboard/page.tsx)
├── Analytics (/analytics/page.tsx)
├── Advanced Analytics (/analytics/advanced/page.tsx)
├── Tenants (/tenants/page.tsx)
│   ├── List (/page.tsx)
│   ├── Create (/new/page.tsx)
│   └── Detail (/[id]/page.tsx)
├── Users (/users/page.tsx)
├── Invoices (/invoices/page.tsx)
├── Billing (/billing/page.tsx)
├── Subscription Plans (/subscription-plans/page.tsx)
├── Support (/support/page.tsx)
├── Chat (/chat/page.tsx)
├── Roles (/roles/page.tsx)
├── Feature Flags (/feature-flags/page.tsx)
├── Permissions Testing (/permissions/testing/page.tsx)
├── Compliance (/compliance/page.tsx)
└── Settings (/settings/page.tsx)
    └── Email Templates (/settings/email-templates/page.tsx)
```

---

## File Structure Reference

### Frontend Pages

#### CMS Admin Pages
| Feature | File Path | Lines | Status |
|---------|-----------|-------|--------|
| Dashboard | `src/app/(admin)/admin/cms/page.tsx` | 251 | ✅ Complete |
| Layout | `src/app/(admin)/admin/cms/layout.tsx` | 90 | ✅ Complete |
| Demo Requests | `src/app/(admin)/admin/cms/demo-requests/page.tsx` | 296 | ✅ Complete |
| Blog | `src/app/(admin)/admin/cms/blog/page.tsx` | - | 🟡 Partial |
| Case Studies | `src/app/(admin)/admin/cms/case-studies/page.tsx` | - | 🟡 Partial |
| Leads | `src/app/(admin)/admin/cms/leads/page.tsx` | - | 🟡 Partial |
| Newsletter | `src/app/(admin)/admin/cms/newsletter/page.tsx` | - | 🟡 Partial |

#### Platform Admin Pages
| Feature | File Path | Lines | Status |
|---------|-----------|-------|--------|
| Dashboard | `src/app/(platform-admin)/dashboard/page.tsx` | 25 | ✅ Complete |
| Tenants List | `src/app/(platform-admin)/tenants/page.tsx` | 41 | ✅ Complete |
| Tenants New | `src/app/(platform-admin)/tenants/new/page.tsx` | - | 🟡 Partial |
| Tenants Detail | `src/app/(platform-admin)/tenants/[id]/page.tsx` | - | 🟡 Partial |
| Users | `src/app/(platform-admin)/users/page.tsx` | 19 | ✅ Complete |
| Invoices | `src/app/(platform-admin)/invoices/page.tsx` | 477 | ✅ Complete |
| Billing | `src/app/(platform-admin)/billing/page.tsx` | - | 🟡 Partial |
| Subscription Plans | `src/app/(platform-admin)/subscription-plans/page.tsx` | 416 | ✅ Complete |
| Support | `src/app/(platform-admin)/support/page.tsx` | - | 🟡 Partial |
| Chat | `src/app/(platform-admin)/chat/page.tsx` | - | 🟡 Partial |
| Roles | `src/app/(platform-admin)/roles/page.tsx` | 384 | ✅ Complete |
| Feature Flags | `src/app/(platform-admin)/feature-flags/page.tsx` | 440 | ✅ Complete |
| Permissions Testing | `src/app/(platform-admin)/permissions/testing/page.tsx` | 482 | ✅ Complete |
| Compliance | `src/app/(platform-admin)/compliance/page.tsx` | 457 | ✅ Complete |
| Analytics | `src/app/(platform-admin)/analytics/page.tsx` | - | 🟡 Partial |
| Advanced Analytics | `src/app/(platform-admin)/analytics/advanced/page.tsx` | 141 | ✅ Complete |
| Settings | `src/app/(platform-admin)/settings/page.tsx` | - | 🟡 Partial |
| Email Templates | `src/app/(platform-admin)/settings/email-templates/page.tsx` | - | 🟡 Partial |

### React Components

#### Platform Admin Components
| Component | File Path | Lines | Purpose |
|-----------|-----------|-------|---------|
| PlatformDashboard | `src/components/platform/PlatformDashboard.tsx` | 18,307 | Main dashboard with metrics |
| PlatformHeader | `src/components/platform/PlatformHeader.tsx` | 2,476 | Header navigation |
| PlatformSidebar | `src/components/platform/PlatformSidebar.tsx` | 9,628 | Side navigation |
| PlatformSettings | `src/components/platform/PlatformSettings.tsx` | 26,576 | Settings panel with tabs |
| TenantListTable | `src/components/platform/TenantListTable.tsx` | 17,314 | Tenants list with filters |
| TenantDetailView | `src/components/platform/TenantDetailView.tsx` | 9,767 | Tenant detail view |
| TenantCreationWizard | `src/components/platform/TenantCreationWizard.tsx` | 10,173 | Multi-step tenant creation |
| BillingDashboard | `src/components/platform/BillingDashboard.tsx` | 9,634 | Billing metrics |
| RevenueChart | `src/components/platform/RevenueChart.tsx` | 4,922 | Revenue trend chart |
| TenantGrowthChart | `src/components/platform/TenantGrowthChart.tsx` | 3,131 | Tenant growth chart |
| MetricsCard | `src/components/platform/MetricsCard.tsx` | 3,689 | KPI card component |
| AnalyticsDashboard | `src/components/platform/AnalyticsDashboard.tsx` | 18,307 | Analytics overview |
| SupportDashboard | `src/components/platform/SupportDashboard.tsx` | 9,913 | Support tickets dashboard |
| ChatWidget | `src/components/platform/ChatWidget.tsx` | 14,326 | Chat interface |
| ChatSessionDetail | `src/components/platform/ChatSessionDetail.tsx` | 10,733 | Chat session view |
| PlatformUsersTable | `src/components/platform/PlatformUsersTable.tsx` | 13,203 | Platform users list |
| WhiteLabelSettings | `src/components/platform/WhiteLabelSettings.tsx` | 19,137 | White-label configuration |
| StorageBreakdownWidget | `src/components/platform/StorageBreakdownWidget.tsx` | 11,161 | Storage usage widget |
| CreateInvoiceModal | `src/components/platform/CreateInvoiceModal.tsx` | 10,244 | Create invoice form |
| MarkPaidModal | `src/components/platform/MarkPaidModal.tsx` | 4,941 | Mark invoice as paid |
| CreateSubscriptionPlanModal | `src/components/platform/CreateSubscriptionPlanModal.tsx` | 20,235 | Create plan form |
| EditSubscriptionPlanModal | `src/components/platform/EditSubscriptionPlanModal.tsx` | 19,114 | Edit plan form |
| CreatePlatformUserModal | `src/components/platform/CreatePlatformUserModal.tsx` | 7,086 | Create user form |
| EditPlatformUserModal | `src/components/platform/EditPlatformUserModal.tsx` | 5,065 | Edit user form |
| ImpersonateUserModal | `src/components/platform/ImpersonateUserModal.tsx` | 6,591 | Impersonate user |
| ImpersonationBanner | `src/components/platform/ImpersonationBanner.tsx` | 5,211 | Active impersonation banner |
| CreateFeatureFlagModal | `src/components/platform/CreateFeatureFlagModal.tsx` | 7,858 | Create feature flag |
| EditFeatureFlagModal | `src/components/platform/EditFeatureFlagModal.tsx` | 10,169 | Edit feature flag |
| CreateRoleModal | `src/components/platform/CreateRoleModal.tsx` | 10,971 | Create role form |
| EditRoleModal | `src/components/platform/EditRoleModal.tsx` | 5,412 | Edit role form |
| CreateTicketModal | `src/components/platform/CreateTicketModal.tsx` | 5,364 | Create support ticket |
| ViewTicketModal | `src/components/platform/ViewTicketModal.tsx` | 7,069 | View ticket details |
| SuspendTenantModal | `src/components/platform/SuspendTenantModal.tsx` | 6,580 | Suspend tenant |
| ChangeSubscriptionModal | `src/components/platform/ChangeSubscriptionModal.tsx` | 10,147 | Change subscription |
| EmailTemplateEditorModal | `src/components/platform/EmailTemplateEditorModal.tsx` | 7,545 | Edit email template |
| EmailTemplatePreviewModal | `src/components/platform/EmailTemplatePreviewModal.tsx` | 2,819 | Preview email template |
| SendTestEmailModal | `src/components/platform/SendTestEmailModal.tsx` | 4,107 | Send test email |

#### Analytics Sub-Components
| Component | File Path | Purpose |
|-----------|-----------|---------|
| TenantHealthWidget | `src/components/platform/analytics/TenantHealthWidget.tsx` | Tenant health scores |
| FeatureAdoptionWidget | `src/components/platform/analytics/FeatureAdoptionWidget.tsx` | Feature adoption tracking |
| UserEngagementWidget | `src/components/platform/analytics/UserEngagementWidget.tsx` | User engagement metrics |

#### Tenant Detail Tabs
| Component | File Path | Purpose |
|-----------|-----------|---------|
| TenantOverviewTab | `src/components/platform/tenant-detail-tabs/TenantOverviewTab.tsx` | Overview section |
| TenantUsageTab | `src/components/platform/tenant-detail-tabs/TenantUsageTab.tsx` | Usage and storage |
| TenantBillingTab | `src/components/platform/tenant-detail-tabs/TenantBillingTab.tsx` | Billing info |
| TenantUsersTab | `src/components/platform/tenant-detail-tabs/TenantUsersTab.tsx` | Tenant users |
| TenantAuditLogsTab | `src/components/platform/tenant-detail-tabs/TenantAuditLogsTab.tsx` | Audit logs |
| TenantSettingsTab | `src/components/platform/tenant-detail-tabs/TenantSettingsTab.tsx` | Branding settings |
| TenantSupportTab | `src/components/platform/tenant-detail-tabs/TenantSupportTab.tsx` | Support tickets |
| AddTenantUserModal | `src/components/platform/tenant-detail-tabs/AddTenantUserModal.tsx` | Add user to tenant |

#### Wizard Steps
| Component | File Path | Purpose |
|-----------|-----------|---------|
| CompanyInfoStep | `src/components/platform/wizard-steps/CompanyInfoStep.tsx` | Step 1: Company info |
| AdminUserStep | `src/components/platform/wizard-steps/AdminUserStep.tsx` | Step 2: Admin user |
| SubscriptionStep | `src/components/platform/wizard-steps/SubscriptionStep.tsx` | Step 3: Subscription |
| InitialSetupStep | `src/components/platform/wizard-steps/InitialSetupStep.tsx` | Step 4: Review & create |

### API Routes

#### CMS API Routes
| Endpoint | File Path | Method | Purpose |
|----------|-----------|--------|---------|
| /cms/blog | `src/app/api/v1/cms/blog/route.ts` | GET, POST | List/create blogs |
| /cms/case-studies | `src/app/api/v1/cms/case-studies/route.ts` | GET, POST | List/create case studies |
| /cms/leads | `src/app/api/v1/cms/leads/route.ts` | GET, POST | List/create leads |
| /cms/demo-requests | `src/app/api/v1/cms/demo-requests/route.ts` | GET, POST | List/create demos |
| /cms/newsletter | `src/app/api/v1/cms/newsletter/route.ts` | GET, POST | List/create subscribers |
| /cms/analytics | `src/app/api/v1/cms/analytics/route.ts` | GET | Get analytics data |

#### Platform Admin API Routes
| Endpoint | File Path | Method | Purpose |
|----------|-----------|--------|---------|
| /platform/dashboard/metrics | `src/app/api/platform/dashboard/metrics/route.ts` | GET | Dashboard KPIs |
| /platform/tenants | `src/app/api/platform/tenants/route.ts` | GET, POST | List/create tenants |
| /platform/tenants/:id | `src/app/api/platform/tenants/[id]/route.ts` | GET, PATCH, DELETE | Manage tenant |
| /platform/tenants/:id/status | `src/app/api/platform/tenants/[id]/status/route.ts` | PATCH | Change status |
| /platform/tenants/:id/users | `src/app/api/platform/tenants/[id]/users/route.ts` | GET, POST | Manage tenant users |
| /platform/tenants/:id/audit-logs | `src/app/api/platform/tenants/[id]/audit-logs/route.ts` | GET | Get audit logs |
| /platform/users | `src/app/api/platform/users/route.ts` | GET, POST | List/create users |
| /platform/users/:id | `src/app/api/platform/users/[id]/route.ts` | GET, PATCH, DELETE | Manage user |
| /platform/invoices | `src/app/api/platform/invoices/route.ts` | GET, POST | List/create invoices |
| /platform/invoices/:id | `src/app/api/platform/invoices/[id]/route.ts` | GET, PATCH, DELETE | Manage invoice |
| /platform/invoices/:id/send | `src/app/api/platform/invoices/[id]/send/route.ts` | POST | Send invoice |
| /platform/invoices/:id/mark-paid | `src/app/api/platform/invoices/[id]/mark-paid/route.ts` | POST | Mark as paid |
| /platform/invoices/:id/cancel | `src/app/api/platform/invoices/[id]/cancel/route.ts` | POST | Cancel invoice |
| /platform/invoices/:id/pdf | `src/app/api/platform/invoices/[id]/pdf/route.ts` | GET | Download PDF |
| /platform/subscription-plans | `src/app/api/platform/subscription-plans/route.ts` | GET, POST | List/create plans |
| /platform/subscription-plans/:id | `src/app/api/platform/subscription-plans/[id]/route.ts` | GET, PATCH, DELETE | Manage plan |
| /platform/support | `src/app/api/platform/support/route.ts` | GET, POST | List/create tickets |
| /platform/support/:id | `src/app/api/platform/support/[id]/route.ts` | GET, PATCH | Manage ticket |
| /platform/support/:id/messages | `src/app/api/platform/support/[id]/messages/route.ts` | POST | Add ticket message |
| /platform/chat/sessions | `src/app/api/platform/chat/sessions/route.ts` | GET, POST | List/create sessions |
| /platform/chat/sessions/:id | `src/app/api/platform/chat/sessions/[id]/route.ts` | GET | Get session |
| /platform/chat/messages | `src/app/api/platform/chat/messages/route.ts` | POST | Send message |
| /platform/chat/canned-responses | `src/app/api/platform/chat/canned-responses/route.ts` | GET, POST | Manage responses |
| /platform/chat/agent-availability | `src/app/api/platform/chat/agent-availability/route.ts` | PATCH | Toggle availability |
| /platform/roles | `src/app/api/platform/roles/route.ts` | GET, POST | List/create roles |
| /platform/roles/:id | `src/app/api/platform/roles/[id]/route.ts` | GET, PATCH, DELETE | Manage role |
| /platform/feature-flags | `src/app/api/platform/feature-flags/route.ts` | GET, POST | List/create flags |
| /platform/feature-flags/:id | `src/app/api/platform/feature-flags/[id]/route.ts` | GET, PATCH, DELETE | Manage flag |
| /platform/email-templates | `src/app/api/platform/email-templates/route.ts` | GET, POST | List/create templates |
| /platform/email-templates/:id | `src/app/api/platform/email-templates/[id]/route.ts` | GET, PATCH, DELETE | Manage template |
| /platform/email-templates/:id/test | `src/app/api/platform/email-templates/[id]/test/route.ts` | POST | Send test email |
| /platform/settings | `src/app/api/platform/settings/route.ts` | GET, PATCH | Get/update settings |
| /platform/analytics | `src/app/api/platform/analytics/route.ts` | GET | Get analytics |
| /platform/analytics/advanced | `src/app/api/platform/analytics/advanced/route.ts` | GET | Advanced analytics |
| /platform/compliance-alerts | `src/app/api/platform/compliance-alerts/route.ts` | GET | List alerts |
| /platform/compliance-alerts/:id | `src/app/api/platform/compliance-alerts/[id]/route.ts` | GET, PATCH | Manage alert |
| /platform/impersonate/start | `src/app/api/platform/impersonate/start/route.ts` | POST | Start impersonation |
| /platform/impersonate/end | `src/app/api/platform/impersonate/end/route.ts` | POST | End impersonation |
| /platform/impersonate/active | `src/app/api/platform/impersonate/active/route.ts` | GET | Get active impersonation |
| /platform/impersonate/sessions | `src/app/api/platform/impersonate/sessions/route.ts` | GET | Get sessions history |
| /platform/permissions/test | `src/app/api/platform/permissions/test/route.ts` | GET | Run permission test |
| /platform/permissions/scenarios | `src/app/api/platform/permissions/scenarios/route.ts` | GET, POST | Manage scenarios |
| /platform/permissions/scenarios/:id/run | `src/app/api/platform/permissions/scenarios/[id]/run/route.ts` | POST | Run scenario |
| /platform/permissions/conflicts | `src/app/api/platform/permissions/conflicts/route.ts` | GET | Check conflicts |

### React Hooks (Client-Side Data Management)

#### CMS Hooks (`src/lib/hooks/useCms.ts`)
```typescript
// Blog Posts
useBlogPosts(filters?) - Get list of blog posts
useBlogPost(id) - Get single blog post
useCreateBlogPost() - Create blog post mutation
useUpdateBlogPost() - Update blog post mutation
useDeleteBlogPost() - Delete blog post mutation
usePublishBlogPost() - Publish blog post mutation

// Case Studies
useCaseStudies(filters?) - Get list of case studies
useCaseStudy(id) - Get single case study
useCreateCaseStudy() - Create case study mutation
useUpdateCaseStudy() - Update case study mutation
useDeleteCaseStudy() - Delete case study mutation

// Leads
useLeads(filters?) - Get list of leads
useLead(id) - Get single lead
useCreateLead() - Create lead mutation
useUpdateLead() - Update lead mutation
useDeleteLead() - Delete lead mutation

// Demo Requests
useDemoRequests(filters?) - Get list of demo requests
useDemoRequest(id) - Get single demo request
useCreateDemoRequest() - Create demo request mutation
useUpdateDemoRequest() - Update demo request mutation
useDeleteDemoRequest() - Delete demo request mutation
useScheduleDemo() - Schedule demo mutation

// Newsletter Subscribers
useNewsletterSubscribers(filters?) - Get list of subscribers
useNewsletterSubscriber(id) - Get single subscriber
useCreateNewsletterSubscriber() - Create subscriber mutation
useUpdateNewsletterSubscriber() - Update subscriber mutation
useDeleteNewsletterSubscriber() - Delete subscriber mutation
useUnsubscribeNewsletter() - Unsubscribe mutation
```

---

## Common Testing Patterns

### List Page Pattern (Tenants, Users, Invoices, etc.)

```typescript
// 1. Render list page
<TenantListTable />

// 2. Features tested:
- Search input filters data
- Status filter dropdown works
- Plan filter dropdown works
- Sorting by columns (optional)
- Pagination works
- Action buttons visible (View, Edit, Delete)
- Loading state while fetching
- Error state if fetch fails
- Empty state if no data
```

### Modal Form Pattern (Create/Edit)

```typescript
// 1. Click "Create" or "Edit" button
// 2. Modal opens with form
// 3. Test features:
- All form fields render correctly
- Required fields marked
- Form validates on submit
- Error messages show for invalid input
- Submit button disabled until form valid
- Submit button shows loading state
- Success message on completion
- Modal closes on success
- List updates with new/updated item
```

### Detail View Pattern

```typescript
// 1. Click item in list
// 2. Navigate to detail page
// 3. Test features:
- All details display correctly
- Related data loads (users, audit logs, etc.)
- Tabs/sections accessible
- Edit buttons for each section
- Delete/archive buttons available
- Status indicators show correctly
- Timestamps display in correct format
```

---

## Test Data Setup

### Sample Tenants
```json
{
  "companyName": "PT Maju Bersama",
  "slug": "maju-bersama",
  "subscriptionPlan": "professional",
  "maxEmployees": 200,
  "currentEmployeeCount": 45
}
```

### Sample Demo Request
```json
{
  "company_name": "PT Tech Startup",
  "contact_name": "John Doe",
  "email": "john@techstartup.com",
  "phone": "+62812345678",
  "employee_count": 15,
  "preferred_date": "2025-12-01",
  "preferred_time": "10:00",
  "status": "pending"
}
```

### Sample Blog Post
```json
{
  "title": "5 Tips Mengelola HR di Era Digital",
  "slug": "5-tips-hr-digital",
  "content": {...},
  "category": "HR Management",
  "tags": ["HR", "Digital", "Management"],
  "status": "draft",
  "language": "id"
}
```

---

## Key URLs for Testing

| Page | URL | Login Required |
|------|-----|----------------|
| CMS Dashboard | `/admin/cms` | ✅ Yes |
| Demo Requests | `/admin/cms/demo-requests` | ✅ Yes |
| Blog Posts | `/admin/cms/blog` | ✅ Yes |
| Leads | `/admin/cms/leads` | ✅ Yes |
| Newsletter | `/admin/cms/newsletter` | ✅ Yes |
| Platform Dashboard | `/platform-admin/dashboard` | ✅ Yes (Admin) |
| Tenants List | `/platform-admin/tenants` | ✅ Yes (Admin) |
| Tenants Create | `/platform-admin/tenants/new` | ✅ Yes (Admin) |
| Users | `/platform-admin/users` | ✅ Yes (Admin) |
| Invoices | `/platform-admin/invoices` | ✅ Yes (Admin) |
| Support | `/platform-admin/support` | ✅ Yes (Admin) |
| Roles | `/platform-admin/roles` | ✅ Yes (Admin) |
| Settings | `/platform-admin/settings` | ✅ Yes (Admin) |

---

## Common Issues & Workarounds

| Issue | Symptom | Workaround |
|-------|---------|-----------|
| Data not refreshing | List shows stale data | Manually refresh page (F5) or click refresh button |
| Modal not closing | Modal stays open after submit | Check browser console for errors, reload page |
| Filters not working | Filter selection ignored | Clear all filters and try again |
| Pagination broken | Can't navigate pages | Check pagination component in browser console |
| Slow load times | Pages take >5 seconds to load | Check API response times, may indicate backend issue |
| Search not working | Search input doesn't filter | Ensure API supports search parameter |

---

## Performance Benchmarks

| Page | Target Load Time | Acceptable Range |
|------|-----------------|-------------------|
| Dashboard | <2s | 1.5s - 2.5s |
| List Pages | <2s | 1.5s - 2.5s |
| Detail Pages | <2s | 1.5s - 2.5s |
| Modal Forms | <500ms | 300ms - 700ms |
| Search | <1s | 500ms - 1.5s |
| Bulk Operations | <5s | 3s - 7s |

---

## Browser Testing Checklist

### Chrome (Latest)
- [ ] All pages load correctly
- [ ] Forms submit successfully
- [ ] Modals open/close properly
- [ ] Responsive on mobile view
- [ ] Developer console: no errors
- [ ] Developer console: no warnings

### Firefox (Latest)
- [ ] All pages load correctly
- [ ] All forms work
- [ ] CSS styling matches Chrome
- [ ] Font rendering consistent

### Safari (Latest)
- [ ] All pages load correctly
- [ ] Date inputs work properly
- [ ] Modal animations smooth
- [ ] Touch interactions work on iPad

### Edge (Latest)
- [ ] All features functional
- [ ] No compatibility issues

---

## Automated Testing Recommendations

### E2E Tests (Playwright/Cypress)
1. CMS Admin workflow: Create → Read → Update → Delete blog post
2. Platform Admin workflow: Create tenant → Add user → Generate invoice
3. Demo request scheduling workflow
4. Lead management workflow
5. Newsletter subscriber management

### Unit Tests (Vitest)
1. Form validation logic
2. Data transformation functions
3. Permission checking logic
4. Number formatting (currency, percentages)

### Integration Tests
1. API endpoint responses
2. Database queries for complex operations
3. Authentication and authorization flows
4. Audit logging

---

## Debugging Tips

### Check Network Requests
1. Open Browser DevTools (F12)
2. Go to Network tab
3. Perform action
4. Check request/response:
   - Status code (200, 201, 400, 401, 500)
   - Request body (POST/PATCH)
   - Response body (check for errors)
   - Response time

### Check Console Errors
1. Open Browser DevTools
2. Go to Console tab
3. Look for red error messages
4. Check for warnings (yellow)
5. Note any stack traces

### Check Local Storage
1. Open Browser DevTools
2. Go to Application > Local Storage
3. Verify session tokens present
4. Check for cached data

---

## Support Contacts

- **Frontend Issues**: Check `/src/` directory for source code
- **API Issues**: Check `/src/app/api/` for route handlers
- **Database Issues**: Check migrations in `/supabase/migrations/`
- **Documentation**: Check root-level `.md` files for PRDs and implementation guides

