# HRIS AI Platform - CMS Admin Panel
## Product Requirements Document: Multi-Tenant Administration System

**Version:** 1.0
**Date:** 2025-11-18
**Status:** Planning
**Priority:** CRITICAL for SaaS Launch

---

## 🎯 Executive Summary

### **Business Objective**
Transform the HRIS platform into a **multi-tenant SaaS product** that can be sold to multiple companies/SMEs, with a powerful admin panel for platform management, tenant provisioning, billing, and support.

### **Target Users**
1. **Super Admins** (Platform owners - you/your team)
2. **Company Admins** (Customer company administrators)
3. **Support Team** (Customer success & technical support)
4. **Sales Team** (For demos and onboarding)

### **Key Requirements**
- Multi-tenant data isolation
- Role-Based Access Control (RBAC)
- Self-service company onboarding
- Billing & subscription management
- Platform monitoring & analytics
- Support ticketing system
- White-label capabilities

---

## 🏗️ Architecture Overview

### **Multi-Tenant Model**

```
Platform Level (Super Admin)
├── Tenant 1 (Company A)
│   ├── Company Admin
│   ├── HR Managers
│   ├── Employees
│   └── Data (isolated)
├── Tenant 2 (Company B)
│   ├── Company Admin
│   ├── HR Managers
│   ├── Employees
│   └── Data (isolated)
└── Tenant N (Company N)
```

### **Data Isolation Strategy**

**Option 1: Shared Database, Tenant Column (Recommended for MVP)**
```sql
-- Every table has tenant_id
CREATE TABLE employees (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  employee_number VARCHAR,
  -- ... other fields
);

-- Row Level Security (RLS) in Supabase
CREATE POLICY tenant_isolation ON employees
  FOR ALL
  USING (tenant_id = auth.jwt() -> 'tenant_id');
```

**Benefits:**
- Simple to implement
- Cost-effective
- Easy migrations
- Supabase RLS handles isolation automatically

**Option 2: Database per Tenant (Future - Enterprise)**
- Complete data isolation
- Better performance at scale
- Higher cost
- More complex management

---

## 🎭 Role-Based Access Control (RBAC) System

### **Role Hierarchy**

```
1. Platform Roles (Internal)
   ├── Super Admin (Full platform access)
   ├── Platform Support (View tenant data, assist customers)
   ├── Platform Sales (Create demo tenants, view analytics)
   └── Platform Developer (Access logs, debugging)

2. Tenant Roles (Customer Company)
   ├── Company Admin (Tenant owner, full company access)
   ├── HR Manager (HR module access, employee management)
   ├── Payroll Manager (Payroll module access)
   ├── Department Manager (View own department)
   └── Employee (Self-service access only)
```

### **Permission Matrix**

| Permission | Super Admin | Platform Support | Company Admin | HR Manager | Employee |
|------------|-------------|------------------|---------------|------------|----------|
| Create Tenant | ✅ | ❌ | ❌ | ❌ | ❌ |
| View All Tenants | ✅ | ✅ | ❌ | ❌ | ❌ |
| Billing Management | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage Company Users | ✅ | ✅ | ✅ | ❌ | ❌ |
| Employee CRUD | ✅ | ✅ | ✅ | ✅ | ❌ |
| Payroll Processing | ✅ | ✅ | ✅ | ✅ (if role) | ❌ |
| View Own Profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit Leave | ✅ | ✅ | ✅ | ✅ | ✅ |

### **RBAC Database Schema**

```typescript
// Roles Table
interface Role {
  id: string;
  name: string;
  type: 'platform' | 'tenant';
  description: string;
  permissions: string[]; // Array of permission slugs
  isSystemRole: boolean; // Cannot be deleted
  createdAt: Date;
}

// Permissions Table
interface Permission {
  id: string;
  slug: string; // e.g., 'employee.create', 'payroll.approve'
  module: string; // e.g., 'employee', 'payroll', 'platform'
  action: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'execute';
  resource: string; // e.g., 'employee', 'payroll_period'
  description: string;
}

// User Roles (Many-to-Many)
interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  tenantId?: string; // null for platform roles
  assignedBy: string;
  assignedAt: Date;
}

// Permission Checks
interface PermissionCheck {
  userId: string;
  permission: string; // e.g., 'employee.create'
  tenantId?: string;
  resourceId?: string; // For resource-level permissions
}
```

### **Pre-Defined Roles**

**Platform Roles:**
```typescript
const PLATFORM_ROLES = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    permissions: ['*'], // All permissions
  },
  PLATFORM_SUPPORT: {
    name: 'Platform Support',
    permissions: [
      'tenant.read',
      'tenant.update',
      'user.read',
      'support_ticket.*',
      'audit_log.read',
    ],
  },
  PLATFORM_SALES: {
    name: 'Platform Sales',
    permissions: [
      'tenant.create',
      'tenant.read',
      'demo.create',
      'analytics.read',
    ],
  },
};
```

**Tenant Roles:**
```typescript
const TENANT_ROLES = {
  COMPANY_ADMIN: {
    name: 'Company Admin',
    permissions: [
      'company.*',
      'user.*',
      'employee.*',
      'payroll.*',
      'performance.*',
      'billing.read',
      'settings.*',
    ],
  },
  HR_MANAGER: {
    name: 'HR Manager',
    permissions: [
      'employee.*',
      'leave.*',
      'attendance.*',
      'performance.*',
      'document.*',
    ],
  },
  PAYROLL_MANAGER: {
    name: 'Payroll Manager',
    permissions: [
      'employee.read',
      'payroll.*',
      'compliance.read',
    ],
  },
  DEPARTMENT_MANAGER: {
    name: 'Department Manager',
    permissions: [
      'employee.read', // Own department only
      'leave.approve', // Own team
      'performance.*', // Own team
    ],
    scope: 'department', // Scoped to specific department
  },
  EMPLOYEE: {
    name: 'Employee',
    permissions: [
      'profile.read',
      'profile.update',
      'attendance.own',
      'leave.own',
      'payslip.own',
      'performance.own',
    ],
    scope: 'self', // Can only access own data
  },
};
```

---

## 📋 CMS Admin Panel Features Breakdown

---

## 🎯 Sprint 13: Platform Admin Core (3 weeks)

### **1. Super Admin Dashboard**
**Priority:** CRITICAL
**Effort:** 5 days

**Features:**
- Platform-wide KPIs
  - Total tenants (active, trial, churned)
  - Total users across all tenants
  - Total revenue (MRR, ARR)
  - System health metrics
  - API usage statistics

**Widgets:**
```typescript
interface PlatformDashboard {
  tenantMetrics: {
    total: number;
    active: number;
    trial: number;
    paused: number;
    churned: number;
    newThisMonth: number;
  };

  userMetrics: {
    totalUsers: number;
    activeUsers: number; // Last 30 days
    newUsersToday: number;
  };

  revenueMetrics: {
    mrr: number; // Monthly Recurring Revenue
    arr: number; // Annual Recurring Revenue
    churnRate: number;
    averageRevenuePerTenant: number;
  };

  systemHealth: {
    uptime: number;
    apiLatency: number;
    errorRate: number;
    dbConnections: number;
  };

  recentActivity: {
    newSignups: Tenant[];
    upgrades: Tenant[];
    downgrades: Tenant[];
    cancellations: Tenant[];
  };
}
```

**Visualization:**
- Line charts (tenant growth, revenue trends)
- Pie charts (plan distribution)
- Bar charts (usage by feature)
- Real-time metrics (active users now)

---

### **2. Tenant Management**
**Priority:** CRITICAL
**Effort:** 7 days

**Features:**

#### **Tenant List View**
- Searchable table (company name, email, plan)
- Filters (status, plan, created date, region)
- Bulk actions (suspend, activate, email)
- Export to CSV
- Sorting (by revenue, users, activity)

#### **Tenant Detail View**
**Tabs:**
1. **Overview**
   - Company info (name, logo, industry, size)
   - Primary admin details
   - Subscription status
   - Usage statistics
   - Quick actions (suspend, upgrade, send email)

2. **Users**
   - User list with roles
   - Add/remove users
   - Reset passwords
   - Impersonate user (for support)

3. **Billing**
   - Current plan & pricing
   - Payment history
   - Invoices (download PDF)
   - Change plan
   - Apply coupon/discount
   - Cancel subscription

4. **Usage & Analytics**
   - Feature usage (which modules used)
   - API calls (count, rate limits)
   - Storage usage (documents, files)
   - Active users trend
   - Most used features

5. **Settings**
   - Tenant-specific configs
   - Feature flags (enable/disable modules)
   - Limits (max employees, max documents)
   - White-label settings (logo, colors)
   - Integrations enabled

6. **Audit Logs**
   - Who did what, when
   - Admin actions on this tenant
   - Critical events (data exports, deletions)

7. **Support**
   - Support tickets linked to tenant
   - Notes & communication history
   - Internal tags (VIP, churning, expanding)

#### **Tenant Creation Flow**
```typescript
interface TenantCreationWizard {
  step1: {
    companyName: string;
    industry: string;
    companySize: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
    country: string;
    timezone: string;
    currency: string;
  };

  step2: { // Admin User
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    sendWelcomeEmail: boolean;
  };

  step3: { // Subscription
    plan: 'trial' | 'starter' | 'professional' | 'enterprise';
    billingCycle: 'monthly' | 'annual';
    employeeLimit: number;
    startDate: Date;
    trialDays?: number;
  };

  step4: { // Initial Setup
    enabledModules: string[]; // All modules or selective
    sampleData: boolean; // Load demo data
    customDomain?: string;
    whiteLabel?: {
      logo: File;
      primaryColor: string;
      secondaryColor: string;
    };
  };
}
```

**Automated Tenant Provisioning:**
- Create tenant record
- Set up database schema (if database-per-tenant)
- Create admin user
- Send welcome email with credentials
- Set up default settings
- Apply trial period (if applicable)
- Trigger onboarding email sequence

---

### **3. User Management (Platform-Wide)**
**Priority:** HIGH
**Effort:** 3 days

**Features:**
- View all users across all tenants
- Filter by tenant, role, status
- User activity tracking
- Suspend/activate users
- Reset passwords
- Merge duplicate accounts
- View user's login history
- Impersonate user (for support with audit trail)

**User Detail View:**
```typescript
interface PlatformUserView {
  basicInfo: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
  };

  tenantAffiliation: {
    tenantId: string;
    tenantName: string;
    roles: Role[];
    joinedAt: Date;
  };

  activity: {
    lastLogin: Date;
    loginCount: number;
    sessionsThisMonth: number;
    mostUsedFeatures: string[];
  };

  security: {
    mfaEnabled: boolean;
    lastPasswordChange: Date;
    failedLoginAttempts: number;
    suspendedUntil?: Date;
  };

  support: {
    ticketsCreated: number;
    lastTicketDate: Date;
    satisfaction: number; // 1-5
  };
}
```

---

## 💳 Sprint 14: Billing & Subscription Management (3 weeks)

### **1. Subscription Plans**
**Priority:** CRITICAL
**Effort:** 5 days

**Plan Structure:**
```typescript
interface SubscriptionPlan {
  id: string;
  name: string;
  slug: 'trial' | 'starter' | 'professional' | 'enterprise' | 'custom';
  description: string;

  pricing: {
    monthly: number;
    annual: number; // Usually discounted (e.g., 20% off)
    currency: 'IDR' | 'USD';
    perEmployee?: boolean; // Price per employee or flat rate
  };

  limits: {
    maxEmployees: number | null; // null = unlimited
    maxAdmins: number;
    maxStorageGB: number;
    maxAPICallsPerMonth: number;
  };

  features: {
    enabledModules: string[]; // Which modules included
    aiFeatures: boolean;
    customReports: boolean;
    apiAccess: boolean;
    sso: boolean;
    whiteLabel: boolean;
    dedicatedSupport: boolean;
    sla: string; // e.g., '99.9% uptime'
  };

  isActive: boolean;
  isPublic: boolean; // Show on pricing page
  sortOrder: number;
}
```

**Pre-Defined Plans:**
```typescript
const SUBSCRIPTION_PLANS = {
  TRIAL: {
    name: 'Free Trial',
    price: 0,
    duration: 14, // days
    limits: {
      maxEmployees: 10,
      maxStorageGB: 1,
    },
    features: ['all_modules', 'ai_features'],
  },

  STARTER: {
    name: 'Starter',
    pricing: {
      monthly: 99_000, // IDR per month
      annual: 950_400, // 20% discount
      perEmployee: false,
    },
    limits: {
      maxEmployees: 50,
      maxStorageGB: 10,
      maxAPICallsPerMonth: 10_000,
    },
    features: [
      'employee_management',
      'attendance',
      'leave',
      'basic_payroll',
      'email_support',
    ],
  },

  PROFESSIONAL: {
    name: 'Professional',
    pricing: {
      monthly: 299_000, // IDR
      annual: 2_870_400,
      perEmployee: false,
    },
    limits: {
      maxEmployees: 200,
      maxStorageGB: 50,
      maxAPICallsPerMonth: 50_000,
    },
    features: [
      'all_basic_features',
      'ai_leave_approval',
      'ai_anomaly_detection',
      'ai_payroll_error_detection',
      'performance_management',
      'custom_reports',
      'api_access',
      'priority_support',
    ],
  },

  ENTERPRISE: {
    name: 'Enterprise',
    pricing: {
      monthly: 'custom', // Contact sales
      annual: 'custom',
    },
    limits: {
      maxEmployees: null, // Unlimited
      maxStorageGB: 500,
      maxAPICallsPerMonth: null,
    },
    features: [
      'all_professional_features',
      'sso',
      'white_label',
      'dedicated_support',
      'custom_integrations',
      'sla_99_9',
      'onboarding_assistance',
      'account_manager',
    ],
  },
};
```

---

### **2. Billing Dashboard**
**Priority:** CRITICAL
**Effort:** 5 days

**Features:**
- Revenue overview (MRR, ARR, growth rate)
- Upcoming renewals
- Failed payments (dunning)
- Churn analysis
- Plan distribution
- Coupon usage tracking

**Integration: Stripe or Midtrans**
```typescript
interface BillingIntegration {
  provider: 'stripe' | 'midtrans' | 'xendit';

  createCustomer: (tenant: Tenant) => Promise<string>; // customer_id
  createSubscription: (params: {
    customerId: string;
    planId: string;
    quantity?: number;
  }) => Promise<Subscription>;

  updateSubscription: (params: {
    subscriptionId: string;
    planId: string;
  }) => Promise<Subscription>;

  cancelSubscription: (subscriptionId: string) => Promise<void>;

  handleWebhook: (event: WebhookEvent) => Promise<void>;
  // Events: payment_succeeded, payment_failed, subscription_cancelled
}
```

**Webhook Handlers:**
- `payment_succeeded`: Activate subscription
- `payment_failed`: Send dunning email, retry
- `subscription_cancelled`: Deactivate tenant
- `subscription_updated`: Update plan

---

### **3. Invoicing System**
**Priority:** MEDIUM
**Effort:** 4 days

**Features:**
- Auto-generate invoices (monthly/annual)
- Invoice PDF download
- Email invoices to customer
- Invoice history
- Tax calculation (PPN 11% for Indonesia)
- Credit notes (refunds)
- Custom invoice numbers

**Invoice Template:**
```typescript
interface Invoice {
  id: string;
  invoiceNumber: string; // INV-2024-001
  tenantId: string;
  tenantName: string;

  billing: {
    name: string;
    address: string;
    taxId?: string; // NPWP for Indonesia
    email: string;
  };

  lineItems: Array<{
    description: string; // e.g., "Professional Plan - Nov 2024"
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;

  subtotal: number;
  tax: number; // PPN 11%
  discount: number;
  total: number;

  currency: string;
  billingPeriod: {
    start: Date;
    end: Date;
  };

  dueDate: Date;
  paidAt?: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
}
```

---

## 🔧 Sprint 15: Platform Configuration (2 weeks)

### **1. Platform Settings**
**Priority:** HIGH
**Effort:** 4 days

**Settings Categories:**

#### **General Settings**
```typescript
interface PlatformSettings {
  general: {
    platformName: string;
    supportEmail: string;
    salesEmail: string;
    defaultTimezone: string;
    defaultCurrency: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
  };

  security: {
    sessionTimeout: number; // minutes
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      expiryDays: number; // Force password change
    };
    mfaRequired: boolean;
    ipWhitelist: string[]; // For admin panel access
    maxLoginAttempts: number;
  };

  email: {
    provider: 'sendgrid' | 'resend' | 'ses';
    fromName: string;
    fromEmail: string;
    replyTo: string;
    templates: {
      welcome: string;
      passwordReset: string;
      invoice: string;
      // ... more templates
    };
  };

  ai: {
    openaiApiKey: string; // Encrypted
    model: string; // gpt-4o-mini
    leaveApprovalThreshold: number; // 0.85
    anomalyDetectionSensitivity: 'low' | 'medium' | 'high';
  };

  integrations: {
    stripe: {
      publicKey: string;
      secretKey: string; // Encrypted
      webhookSecret: string;
    };
    googleAnalytics: {
      trackingId: string;
    };
    sentry: {
      dsn: string;
    };
  };

  limits: {
    defaultTrialDays: number;
    maxEmployeesPerTenant: number;
    maxStoragePerTenantGB: number;
    rateLimitPerMinute: number;
  };
}
```

---

### **2. Feature Flags**
**Priority:** MEDIUM
**Effort:** 3 days

**Purpose:**
- Enable/disable features globally or per tenant
- A/B testing
- Gradual rollouts
- Emergency kill switches

**Implementation:**
```typescript
interface FeatureFlag {
  id: string;
  key: string; // e.g., 'ai_leave_approval'
  name: string;
  description: string;

  enabled: boolean;

  rollout: {
    type: 'global' | 'percentage' | 'whitelist' | 'blacklist';
    percentage?: number; // 0-100
    tenantWhitelist?: string[];
    tenantBlacklist?: string[];
  };

  schedule?: {
    enableAt?: Date;
    disableAt?: Date;
  };

  metadata: {
    createdBy: string;
    createdAt: Date;
    lastModifiedBy: string;
    lastModifiedAt: Date;
  };
}
```

**Feature Flag Dashboard:**
- List all flags
- Toggle on/off
- Set rollout percentage
- View usage statistics
- Audit log for changes

**Example Flags:**
```typescript
const FEATURE_FLAGS = {
  AI_LEAVE_APPROVAL: 'ai_leave_approval',
  AI_ANOMALY_DETECTION: 'ai_anomaly_detection',
  PAYROLL_ERROR_DETECTION: 'payroll_error_detection',
  MOBILE_PWA: 'mobile_pwa',
  SSO_LOGIN: 'sso_login',
  CUSTOM_REPORTS: 'custom_reports',
  API_ACCESS: 'api_access',
  WHITE_LABEL: 'white_label',
  WORKFLOW_AUTOMATION: 'workflow_automation',
};
```

---

### **3. Email Templates**
**Priority:** MEDIUM
**Effort:** 3 days

**Template Types:**

1. **Transactional Emails**
   - Welcome email (new tenant)
   - Password reset
   - Email verification
   - Invitation to join company
   - Leave request submitted
   - Leave approved/rejected
   - Payslip ready

2. **Marketing Emails**
   - Onboarding series (Day 1, 3, 7, 14)
   - Feature announcements
   - Product updates
   - Tips & best practices

3. **Billing Emails**
   - Invoice generated
   - Payment successful
   - Payment failed (dunning)
   - Subscription expiring
   - Trial ending reminder

**Template Editor:**
- Visual editor (drag-drop)
- Variable placeholders `{{companyName}}`, `{{userName}}`
- Preview with sample data
- Send test email
- Version history
- A/B testing support

**Technology:** React Email or MJML

---

## 📊 Sprint 16: Analytics & Monitoring (2 weeks)

### **1. Platform Analytics**
**Priority:** HIGH
**Effort:** 5 days

**Metrics to Track:**

#### **Business Metrics**
```typescript
interface BusinessAnalytics {
  tenants: {
    totalTenants: number;
    newTenants: TimeSeries; // By day/week/month
    churnedTenants: TimeSeries;
    churnRate: number;
    ltv: number; // Lifetime value
    cac: number; // Customer acquisition cost
  };

  revenue: {
    mrr: number;
    mrrGrowth: TimeSeries;
    arr: number;
    arrGrowth: TimeSeries;
    revenueByPlan: Record<string, number>;
    averageRevenuePerUser: number;
  };

  users: {
    totalUsers: number;
    activeUsers: TimeSeries; // DAU, WAU, MAU
    newUsers: TimeSeries;
    userRetention: {
      day7: number;
      day30: number;
      day90: number;
    };
  };

  engagement: {
    featureAdoption: Record<string, number>; // % tenants using each feature
    averageSessionDuration: number;
    pagesPerSession: number;
    mostUsedFeatures: Array<{feature: string, usage: number}>;
  };
}
```

#### **Technical Metrics**
```typescript
interface TechnicalAnalytics {
  performance: {
    averagePageLoadTime: number;
    apiLatency: {
      p50: number;
      p95: number;
      p99: number;
    };
    errorRate: number;
    slowestEndpoints: Array<{endpoint: string, latency: number}>;
  };

  infrastructure: {
    dbConnections: number;
    dbQueryTime: number;
    cacheHitRate: number;
    storageUsed: number;
    bandwidthUsed: number;
  };

  reliability: {
    uptime: number; // 99.9%
    incidents: number;
    meanTimeToResolve: number;
  };
}
```

---

### **2. Real-Time Monitoring**
**Priority:** HIGH
**Effort:** 4 days

**Monitoring Dashboard:**
- Active users right now
- Requests per minute
- Error rate (last hour)
- Database query performance
- API rate limit usage
- Background job queue status

**Alerts:**
```typescript
interface Alert {
  id: string;
  name: string;
  type: 'threshold' | 'anomaly' | 'downtime';

  condition: {
    metric: string; // e.g., 'error_rate'
    operator: '>' | '<' | '==' | '!=';
    threshold: number;
    duration: number; // minutes
  };

  notifications: {
    channels: ('email' | 'slack' | 'sms' | 'pagerduty')[];
    recipients: string[];
  };

  enabled: boolean;
}
```

**Example Alerts:**
- Error rate > 1% for 5 minutes
- API latency p95 > 2 seconds
- Database connections > 90% of limit
- Failed payments > 10 in 1 hour
- Active tenants dropped > 20%

**Integration:** Sentry, Logtail, or custom

---

### **3. Audit Logs & Activity Tracking**
**Priority:** MEDIUM
**Effort:** 3 days

**Audit Log Structure:**
```typescript
interface AuditLog {
  id: string;
  timestamp: Date;

  actor: {
    userId: string;
    userName: string;
    userRole: string;
    tenantId?: string;
  };

  action: string; // e.g., 'tenant.created', 'user.deleted'
  resource: {
    type: string; // e.g., 'tenant', 'user', 'subscription'
    id: string;
    name: string;
  };

  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };

  metadata: {
    ipAddress: string;
    userAgent: string;
    geolocation?: string;
    method: string; // API method
    endpoint: string;
  };

  severity: 'info' | 'warning' | 'critical';
}
```

**Tracked Events:**
- Tenant created/updated/deleted
- User created/updated/deleted/suspended
- Subscription changed
- Payment processed
- Settings changed
- Data exported
- Support ticket created
- Feature flag toggled

**Audit Log Viewer:**
- Search & filter
- Filter by user, tenant, action, date range
- Export to CSV
- Retention policy (7 years for compliance)

---

## 🎫 Sprint 17: Support & Help Desk (2 weeks)

### **1. Support Ticketing System**
**Priority:** HIGH
**Effort:** 5 days

**Ticket Management:**
```typescript
interface SupportTicket {
  id: string;
  ticketNumber: string; // TKT-2024-001

  tenant: {
    id: string;
    name: string;
    plan: string;
  };

  creator: {
    userId: string;
    name: string;
    email: string;
  };

  details: {
    subject: string;
    description: string;
    category: 'technical' | 'billing' | 'feature_request' | 'bug' | 'general';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  };

  assignment: {
    assignedTo?: string; // Support agent
    assignedAt?: Date;
    team?: string; // e.g., 'technical', 'billing'
  };

  sla: {
    firstResponseDue: Date;
    resolutionDue: Date;
    breached: boolean;
  };

  resolution?: {
    resolvedBy: string;
    resolvedAt: Date;
    solution: string;
    satisfactionRating?: number; // 1-5
  };

  timeline: Array<{
    timestamp: Date;
    type: 'message' | 'status_change' | 'assignment' | 'note';
    author: string;
    content: string;
  }>;

  metadata: {
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    attachments: File[];
  };
}
```

**Support Dashboard:**
- Ticket queue (by status, priority)
- My tickets (assigned to me)
- Unassigned tickets
- Overdue tickets
- SLA compliance rate
- Average response time
- Customer satisfaction

**Ticket Actions:**
- Reply to customer (email integration)
- Add internal note
- Change status
- Reassign
- Merge tickets
- Convert to feature request
- Close with solution

**SLA Policies by Plan:**
```typescript
const SLA_POLICIES = {
  STARTER: {
    firstResponse: 48, // hours
    resolution: 7 * 24, // 7 days
  },
  PROFESSIONAL: {
    firstResponse: 24,
    resolution: 3 * 24,
  },
  ENTERPRISE: {
    firstResponse: 4,
    resolution: 24,
  },
};
```

---

### **2. Live Chat (Optional)**
**Priority:** LOW
**Effort:** 3 days

**Features:**
- Embedded chat widget
- Real-time messaging
- Agent availability status
- Chat history
- File sharing
- Canned responses
- Chat routing (by plan tier)

**Integration:** Intercom, Crisp, or custom

---

### **3. Knowledge Base & FAQ**
**Priority:** MEDIUM
**Effort:** 4 days

**Structure:**
```typescript
interface KnowledgeBaseArticle {
  id: string;
  title: string;
  slug: string;
  content: string; // Markdown or HTML

  category: {
    id: string;
    name: string; // e.g., 'Getting Started', 'Payroll', 'Troubleshooting'
  };

  metadata: {
    views: number;
    helpful: number;
    notHelpful: number;
    createdBy: string;
    createdAt: Date;
    lastUpdated: Date;
  };

  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };

  relatedArticles: string[];
  tags: string[];

  visibility: 'public' | 'customers_only' | 'specific_plans';
}
```

**Knowledge Base Features:**
- Article search (full-text)
- Category browsing
- Article voting (helpful/not helpful)
- Related articles
- Print/PDF export
- Multi-language support

---

## 🔐 Sprint 18: Advanced RBAC & Security (2 weeks)

### **1. Advanced Permission System**
**Priority:** HIGH
**Effort:** 5 days

**Granular Permissions:**
```typescript
interface AdvancedPermission {
  // Resource-level permissions
  resource: {
    type: string; // 'employee', 'department', 'payroll_period'
    id?: string; // Specific resource ID
  };

  // Field-level permissions
  fields?: {
    allowed: string[]; // Can access these fields
    denied: string[]; // Cannot access these fields
  };

  // Conditional permissions
  conditions?: {
    department?: string; // Only for specific department
    employmentType?: string[]; // Only for certain employee types
    dateRange?: {
      start: Date;
      end: Date;
    };
  };

  // Time-based permissions
  schedule?: {
    daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
    timeRange: {
      start: string; // HH:MM
      end: string; // HH:MM
    };
  };
}
```

**Permission Examples:**
```typescript
// Department Manager can only view employees in their department
{
  permission: 'employee.read',
  conditions: {
    department: user.department,
  },
}

// Payroll Manager can only process payroll during business hours
{
  permission: 'payroll.process',
  schedule: {
    daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
    timeRange: {
      start: '09:00',
      end: '17:00',
    },
  },
}

// HR can view employee salary but not edit
{
  permission: 'employee.read',
  fields: {
    allowed: ['*'],
  },
}
{
  permission: 'employee.update',
  fields: {
    denied: ['salary', 'bankAccount'],
  },
}
```

---

### **2. Permission Groups (Custom Roles)**
**Priority:** MEDIUM
**Effort:** 4 days

**Allow tenants to create custom roles:**
```typescript
interface CustomRole {
  id: string;
  tenantId: string;
  name: string;
  description: string;

  inheritFrom?: string; // Base role to inherit permissions

  permissions: string[]; // Array of permission slugs

  restrictions?: {
    maxUsers: number; // Limit how many users can have this role
    requireApproval: boolean; // Needs admin approval to assign
  };

  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}
```

**Custom Role Builder UI:**
- Select base role (HR Manager, etc.)
- Add/remove permissions
- Set restrictions
- Preview permission matrix
- Test with sample scenarios

---

### **3. Permission Testing & Simulation**
**Priority:** LOW
**Effort:** 2 days

**Features:**
- Test if user has permission
- Simulate user access
- Permission conflict detection
- Audit permission changes

---

## 🌐 Sprint 19: Multi-Tenancy Enhancements (2 weeks)

### **1. Tenant Isolation & Security**
**Priority:** CRITICAL
**Effort:** 4 days

**Security Measures:**
- Row Level Security (RLS) in Supabase
- API-level tenant validation
- URL-based tenant identification
- Cross-tenant data leak prevention
- Audit all queries for tenant_id

**RLS Policies:**
```sql
-- Ensure all queries filter by tenant_id
CREATE POLICY tenant_isolation ON employees
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Platform admins can access all tenants
CREATE POLICY platform_admin_access ON employees
  FOR ALL
  USING (
    current_setting('app.user_role') = 'platform_admin'
    OR tenant_id = current_setting('app.current_tenant_id')::uuid
  );
```

**API Middleware:**
```typescript
// Validate tenant ID on every request
async function tenantMiddleware(req, res, next) {
  const tenantId = req.headers['x-tenant-id'] || req.user.tenantId;

  // Validate tenant exists and is active
  const tenant = await db.tenants.findById(tenantId);
  if (!tenant || tenant.status !== 'active') {
    return res.status(403).json({ error: 'Tenant not active' });
  }

  // Set tenant context for RLS
  await db.query(`SET app.current_tenant_id = '${tenantId}'`);

  req.tenant = tenant;
  next();
}
```

---

### **2. Tenant Branding (White-Label)**
**Priority:** MEDIUM
**Effort:** 5 days

**Customization Options:**
```typescript
interface TenantBranding {
  tenantId: string;

  logo: {
    main: string; // URL
    favicon: string;
    loginPage: string;
  };

  colors: {
    primary: string; // #6366f1
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };

  typography: {
    fontFamily: string; // 'Inter', 'Roboto', etc.
    headingFont: string;
  };

  customDomain?: string; // e.g., hr.company.com

  emailSettings: {
    fromName: string; // Company name
    replyTo: string;
    emailFooter: string;
  };

  customCSS?: string; // Advanced customization
}
```

**White-Label Features:**
- Custom logo (header, login, emails)
- Brand colors (primary, secondary)
- Custom domain (CNAME setup)
- Custom email sender
- Remove "Powered by HRIS AI" (Enterprise plan)

---

### **3. Data Export & Portability**
**Priority:** MEDIUM
**Effort:** 3 days

**Export Options:**
- Export all tenant data (GDPR compliance)
- Format: JSON, CSV, Excel
- Include: employees, attendance, payroll, documents
- Scheduled exports (daily, weekly, monthly)
- Export to cloud storage (Google Drive, Dropbox)

**Data Retention:**
- Soft delete (data kept for 30 days)
- Hard delete (permanent removal)
- Anonymization (GDPR right to be forgotten)

---

## 📈 Sprint 20: Onboarding & Customer Success (1 week)

### **1. Guided Onboarding**
**Priority:** HIGH
**Effort:** 3 days

**Onboarding Checklist:**
```typescript
interface OnboardingChecklist {
  tenantId: string;

  steps: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
    completedAt?: Date;
    order: number;
  }>;

  progress: number; // 0-100
}
```

**Onboarding Steps:**
1. ✅ Create company profile
2. ✅ Add company logo & branding
3. ✅ Invite team members (HR, managers)
4. ✅ Import employees (CSV or manual)
5. ✅ Set up departments & positions
6. ✅ Configure payroll settings (BPJS, tax)
7. ✅ Set up leave policies
8. ✅ Configure attendance rules
9. ✅ Explore AI features (demo)
10. ✅ Generate first payroll (test)

**Onboarding UI:**
- Progress bar
- Interactive checklist
- In-app tutorials
- Video guides
- Skip to specific step
- Mark as complete
- Celebrate completion (confetti!)

---

### **2. Product Tours & Tooltips**
**Priority:** MEDIUM
**Effort:** 2 days

**Features:**
- Feature tours (new features)
- Contextual tooltips
- Keyboard shortcuts guide
- "What's New" announcements
- Changelog viewer

**Technology:** Shepherd.js or Driver.js

---

### **3. Usage Analytics & Health Score**
**Priority:** LOW
**Effort:** 2 days

**Tenant Health Score:**
```typescript
interface TenantHealthScore {
  tenantId: string;

  score: number; // 0-100

  metrics: {
    featureAdoption: number; // % of features used
    activeUsers: number; // % of users active monthly
    dataCompleteness: number; // % of profiles completed
    engagement: number; // Logins per user per week
    supportTickets: number; // Negative score
  };

  riskLevel: 'low' | 'medium' | 'high' | 'churn_risk';

  recommendations: string[]; // Actions to improve score
}
```

**Customer Success Dashboard:**
- Health score for all tenants
- At-risk tenants (low health score)
- Expansion opportunities (high usage)
- Engagement trends
- Feature adoption rates

---

## 🎨 CMS Admin Panel UI/UX

### **Layout Structure**

```
┌─────────────────────────────────────────────────────┐
│ [Logo] Platform Admin    [Notifications] [Profile] │ Top Bar
├─────────────────────────────────────────────────────┤
│        │                                            │
│  Nav   │           Main Content Area               │
│  Bar   │                                            │
│        │                                            │
│ ─────  │  ┌────────────────────────────────────┐  │
│ Dash.  │  │                                    │  │
│ Tenants│  │         Dashboard Widgets          │  │
│ Users  │  │                                    │  │
│ Billing│  └────────────────────────────────────┘  │
│ Support│                                            │
│ Analyze│  ┌────────────────────────────────────┐  │
│ Setting│  │                                    │  │
│        │  │         Data Tables / Forms        │  │
│        │  │                                    │  │
│        │  └────────────────────────────────────┘  │
└────────┴────────────────────────────────────────────┘
```

### **Navigation Structure**

```
Platform Admin Panel
├── 📊 Dashboard
│   ├── Overview (KPIs)
│   └── Real-time Activity
│
├── 🏢 Tenants
│   ├── All Tenants
│   ├── Active
│   ├── Trial
│   ├── Churned
│   └── Create New
│
├── 👥 Users
│   ├── All Users
│   └── Platform Admins
│
├── 💳 Billing
│   ├── Subscriptions
│   ├── Invoices
│   ├── Plans
│   └── Coupons
│
├── 🎫 Support
│   ├── Tickets
│   ├── Live Chat
│   └── Knowledge Base
│
├── 📈 Analytics
│   ├── Business Metrics
│   ├── Technical Metrics
│   └── Reports
│
├── ⚙️ Settings
│   ├── Platform Settings
│   ├── Feature Flags
│   ├── Email Templates
│   ├── Integrations
│   └── Security
│
└── 👤 Account
    ├── Profile
    └── Logout
```

---

## 🗄️ Database Schema for CMS Admin

```sql
-- Tenants (Companies)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  industry VARCHAR(100),
  company_size VARCHAR(50),

  -- Contact
  primary_admin_id UUID REFERENCES users(id),
  support_email VARCHAR(255),

  -- Subscription
  subscription_plan VARCHAR(50) NOT NULL,
  subscription_status VARCHAR(50) NOT NULL,
  trial_ends_at TIMESTAMP,
  subscription_starts_at TIMESTAMP,
  subscription_ends_at TIMESTAMP,

  -- Limits
  max_employees INTEGER,
  max_storage_gb INTEGER,
  max_api_calls_per_month INTEGER,

  -- Billing
  stripe_customer_id VARCHAR(255),
  billing_email VARCHAR(255),

  -- White-label
  custom_domain VARCHAR(255),
  logo_url VARCHAR(500),
  primary_color VARCHAR(7),

  -- Status
  status VARCHAR(50) DEFAULT 'active',
  suspended_at TIMESTAMP,
  suspended_reason TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Platform Roles
CREATE TABLE platform_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'platform' or 'tenant'
  permissions JSONB NOT NULL,
  is_system_role BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Roles (Many-to-Many)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  role_id UUID REFERENCES platform_roles(id),
  tenant_id UUID REFERENCES tenants(id), -- null for platform roles
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, role_id, tenant_id)
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),

  plan_slug VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL, -- active, cancelled, past_due

  billing_cycle VARCHAR(50), -- monthly, annual
  amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'IDR',

  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,

  stripe_subscription_id VARCHAR(255),

  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  tenant_id UUID REFERENCES tenants(id),

  amount_subtotal DECIMAL(10, 2),
  amount_tax DECIMAL(10, 2),
  amount_total DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'IDR',

  status VARCHAR(50), -- draft, sent, paid, overdue, cancelled
  due_date TIMESTAMP,
  paid_at TIMESTAMP,

  billing_name VARCHAR(255),
  billing_email VARCHAR(255),
  billing_address TEXT,

  line_items JSONB,

  stripe_invoice_id VARCHAR(255),

  created_at TIMESTAMP DEFAULT NOW()
);

-- Support Tickets
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number VARCHAR(50) UNIQUE NOT NULL,

  tenant_id UUID REFERENCES tenants(id),
  creator_id UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),

  subject VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  priority VARCHAR(50),
  status VARCHAR(50),

  first_response_at TIMESTAMP,
  resolved_at TIMESTAMP,

  satisfaction_rating INTEGER,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),

  actor_id UUID REFERENCES users(id),
  actor_role VARCHAR(100),

  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,

  changes JSONB,

  ip_address VARCHAR(45),
  user_agent TEXT,

  severity VARCHAR(50),

  created_at TIMESTAMP DEFAULT NOW()
);

-- Feature Flags
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,

  enabled BOOLEAN DEFAULT false,

  rollout_type VARCHAR(50), -- global, percentage, whitelist
  rollout_percentage INTEGER,
  tenant_whitelist UUID[],

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Implementation Timeline

### **Aggressive (3 months)**
- Sprint 13: Platform Admin Core (3 weeks)
- Sprint 14: Billing & Subscriptions (3 weeks)
- Sprint 15: Platform Configuration (2 weeks)
- Sprint 16: Analytics & Monitoring (2 weeks)
- Sprint 17: Support & Help Desk (2 weeks)
- Sprint 18: Advanced RBAC (1 week)
- Sprint 19: Multi-Tenancy (1 week)
- Sprint 20: Onboarding (1 week)

### **Realistic (4-5 months)**
- Add 30-50% buffer for testing, bug fixes, iterations
- Parallel workstreams for faster delivery

---

## 🎯 Success Metrics

### **Admin Panel KPIs**
- Time to create new tenant: <2 minutes
- Support ticket response time: <4 hours
- Platform uptime: 99.9%
- Admin task completion rate: 95%+

### **Business KPIs**
- Tenant activation rate: 80%+ (trial → paid)
- Monthly churn rate: <5%
- Customer lifetime value: >24 months
- Net Promoter Score (NPS): >50

---

## 💡 Nice-to-Have Features (Future)

1. **Advanced Reporting Builder**
   - Drag-drop report creator
   - Custom charts
   - Scheduled reports

2. **Tenant Impersonation**
   - View platform as specific tenant
   - Debug customer issues
   - Audit trail

3. **API Usage Dashboard**
   - Track API calls per tenant
   - Rate limit monitoring
   - API key management

4. **Automated Dunning**
   - Smart retry logic for failed payments
   - Graduated email campaigns
   - Payment method update prompts

5. **Tenant Segmentation**
   - Create customer segments
   - Targeted campaigns
   - Custom pricing

6. **A/B Testing Framework**
   - Test pricing plans
   - Test features
   - Conversion optimization

---

**This CMS Admin Panel will transform your HRIS platform into a fully scalable SaaS product ready for the Indonesian SME market! 🚀**

---

*Last Updated: 2025-11-18*
*Version: 1.0*
*Status: Planning - Ready for Implementation*
