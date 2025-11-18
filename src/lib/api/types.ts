/**
 * API Types and Interfaces
 */

// Employee Types
export interface Employee {
  id: string;
  employerId: string;
  employeeNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  nationality: string;
  nationalId?: string;
  taxId?: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  department: string;
  position: string;
  employmentType: 'permanent' | 'contract' | 'probation' | 'intern' | 'part_time';
  employmentStatus: 'active' | 'inactive' | 'terminated' | 'resigned';
  joinDate: string;
  manager?: string;
  workLocation: string;
  workSchedule: string;
  salary?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListEmployeesParams {
  employerId: string;
  status?: string;
  department?: string;
  position?: string;
  employmentType?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ListEmployeesResponse {
  employees: Employee[];
  total: number;
}

// Attendance Types
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employerId: string;
  employeeName: string;
  date: string;
  shiftId?: string;
  clockInTime?: string;
  clockOutTime?: string;
  clockInLocation?: string;
  clockOutLocation?: string;
  clockInGps?: { latitude: number; longitude: number };
  clockOutGps?: { latitude: number; longitude: number };
  workHours?: number;
  overtimeHours?: number;
  status: 'present' | 'late' | 'absent' | 'leave' | 'holiday';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClockInRequest {
  employeeId: string;
  employerId: string;
  clockInTime: string;
  clockInLocation?: string;
  clockInGps?: { latitude: number; longitude: number };
  clockInNotes?: string;
  shiftId?: string;
}

export interface ClockOutRequest {
  recordId: string;
  clockOutTime: string;
  clockOutLocation?: string;
  clockOutGps?: { latitude: number; longitude: number };
  clockOutNotes?: string;
}

// Leave Types
export interface LeaveRequest {
  id: string;
  employeeId: string;
  employerId: string;
  employeeName: string;
  leaveType: 'annual' | 'sick' | 'unpaid' | 'maternity' | 'paternity' | 'compassionate' | 'other';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  approvalNotes?: string;
  isAutoApproved: boolean;
  aiConfidence?: number;
  aiReview?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  employerId: string;
  year: number;
  annualQuota: number;
  annualUsed: number;
  annualCarryForward: number;
  sickUsed: number;
  unpaidUsed: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequestData {
  employeeId: string;
  employerId: string;
  employeeName: string;
  leaveType: 'annual' | 'sick' | 'unpaid' | 'maternity' | 'paternity' | 'compassionate' | 'other';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
}

export interface ListLeaveRequestsParams {
  employeeId?: string;
  employerId?: string;
  status?: string;
  leaveType?: string;
  year?: number;
  limit?: number;
  offset?: number;
}

export interface ListLeaveRequestsResponse {
  requests: LeaveRequest[];
  total: number;
}

// Dashboard Types
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  onLeaveToday: number;
  pendingLeaveRequests: number;
  expiringDocuments: number;
}

// Payroll Types
export interface PayrollPeriod {
  id: string;
  employerId: string;
  periodStart: string;
  periodEnd: string;
  month: number;
  year: number;
  status: 'draft' | 'processing' | 'approved' | 'paid';
  totalEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollDetail {
  id: string;
  periodId: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  baseSalary: number;
  allowances: number;
  overtime: number;
  grossSalary: number;
  bpjsKesehatan: number;
  bpjsJHT: number;
  bpjsJP: number;
  pph21: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  status: 'draft' | 'approved' | 'paid';
  errors?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePayrollPeriodData {
  employerId: string;
  periodStart: string;
  periodEnd: string;
  month: number;
  year: number;
}

export interface ListPayrollPeriodsParams {
  employerId: string;
  status?: string;
  year?: number;
  limit?: number;
  offset?: number;
}

export interface ListPayrollPeriodsResponse {
  periods: PayrollPeriod[];
  total: number;
}

// Performance Types
export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  employerId: string;
  reviewerId: string;
  reviewerName: string;
  reviewPeriod: string;
  reviewDate: string;
  overallRating: number;
  category: 'Exceeds Expectations' | 'Meets Expectations' | 'Needs Improvement' | 'Unsatisfactory';
  strengths: string[];
  areasForImprovement: string[];
  goals: string[];
  comments: string;
  aiSentimentScore?: number;
  aiSentimentAnalysis?: string;
  feedback360?: Feedback360[];
  status: 'draft' | 'submitted' | 'acknowledged';
  createdAt: string;
  updatedAt: string;
}

export interface Feedback360 {
  id: string;
  reviewId: string;
  feedbackProvider: string;
  feedbackProviderRole: 'peer' | 'manager' | 'subordinate' | 'self';
  rating: number;
  comments: string;
  createdAt: string;
}

export interface PerformanceGoal {
  id: string;
  employeeId: string;
  employerId: string;
  goalType: 'OKR' | 'KPI';
  title: string;
  description: string;
  targetDate: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  keyResults?: KeyResult[];
  createdAt: string;
  updatedAt: string;
}

export interface KeyResult {
  id: string;
  goalId: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface CreatePerformanceReviewData {
  employeeId: string;
  employerId: string;
  reviewerId: string;
  reviewPeriod: string;
  reviewDate: string;
  overallRating: number;
  strengths: string[];
  areasForImprovement: string[];
  goals: string[];
  comments: string;
}

// ============================================
// PLATFORM ADMIN TYPES (Multi-Tenant SaaS)
// ============================================

// User type (extending for tenant relationship)
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  tenantId?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

// Tenant (Company) Types
export interface Tenant {
  id: string;
  companyName: string;
  slug: string;
  industry: string | null;
  companySize: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null;

  // Contact
  primaryAdminId: string | null;
  supportEmail: string | null;
  billingEmail: string | null;

  // Subscription
  subscriptionPlan: 'trial' | 'starter' | 'professional' | 'enterprise';
  subscriptionStatus: 'active' | 'trial' | 'suspended' | 'cancelled';
  trialEndsAt: string | null;
  subscriptionStartsAt: string | null;
  subscriptionEndsAt: string | null;

  // Limits
  maxEmployees: number;
  maxStorageGb: number;
  maxApiCallsPerMonth: number;

  // Usage
  currentEmployeeCount: number;
  currentStorageGb: number;
  currentApiCalls: number;

  // Billing
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;

  // White-label
  customDomain: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;

  // Location
  country: string;
  timezone: string;
  currency: string;

  // Status
  status: 'active' | 'suspended' | 'cancelled' | 'deleted';
  suspendedAt: string | null;
  suspendedReason: string | null;

  // Metadata
  onboardingCompleted: boolean;
  onboardingProgress: number;
  featureFlags: Record<string, boolean>;
  settings: Record<string, any>;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TenantWithAdmin extends Tenant {
  primaryAdmin: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface PlatformDashboardMetrics {
  tenantMetrics: {
    total: number;
    active: number;
    trial: number;
    paused: number;
    churned: number;
    newThisMonth: number;
    growthRate: number; // percentage
  };

  userMetrics: {
    totalUsers: number;
    activeUsers: number; // Last 30 days
    newUsersToday: number;
    averageUsersPerTenant: number;
  };

  revenueMetrics: {
    mrr: number; // Monthly Recurring Revenue
    arr: number; // Annual Recurring Revenue
    churnRate: number;
    averageRevenuePerTenant: number;
  };

  systemHealth: {
    uptime: number; // percentage
    apiLatency: number; // ms
    errorRate: number; // percentage
    dbConnections: number;
  };
}

export interface TenantStats {
  tenantId: string;

  users: {
    total: number;
    active: number;
    invited: number;
  };

  employees: {
    total: number;
    active: number;
    onLeave: number;
  };

  usage: {
    storageUsedGb: number;
    apiCallsThisMonth: number;
    lastActivityAt: string;
  };

  modules: {
    attendance: { enabled: boolean; usage: number };
    leave: { enabled: boolean; usage: number };
    payroll: { enabled: boolean; usage: number };
    performance: { enabled: boolean; usage: number };
  };
}

// RBAC Types
export interface PlatformRole {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: 'platform' | 'tenant';
  permissions: string[];
  isSystemRole: boolean;
  scope: 'global' | 'tenant' | 'department' | 'self';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  tenantId: string | null;
  scopeType: string | null;
  scopeId: string | null;
  assignedBy: string | null;
  assignedAt: string;
  expiresAt: string | null;

  // Expanded relations
  role?: PlatformRole;
  user?: User;
  tenant?: Tenant;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  tenantId: string | null;

  actorId: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  actorIp: string | null;

  action: string;

  resourceType: string | null;
  resourceId: string | null;
  resourceName: string | null;

  changes: {
    before: Record<string, any>;
    after: Record<string, any>;
  } | null;

  userAgent: string | null;
  method: string | null;
  endpoint: string | null;

  severity: 'info' | 'warning' | 'critical';

  createdAt: string;
}

// Feature Flag Types
export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  rolloutType: 'global' | 'percentage' | 'whitelist' | 'blacklist';
  rolloutPercentage: number;
  tenantWhitelist: string[];
  tenantBlacklist: string[];
  enableAt: string | null;
  disableAt: string | null;
  createdBy: string | null;
  lastModifiedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface CreateTenantData {
  // Step 1: Company Info
  companyName: string;
  industry: string;
  companySize: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  country: string;
  timezone: string;
  currency: string;

  // Step 2: Admin User
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string | null;
  sendWelcomeEmail: boolean;

  // Step 3: Subscription
  subscriptionPlan: 'trial' | 'starter' | 'professional' | 'enterprise';
  billingCycle: 'monthly' | 'annual';
  maxEmployees: number;
  trialDays?: number;

  // Step 4: Initial Setup
  enabledModules: string[];
  loadSampleData: boolean;
  customDomain?: string;
  primaryColor?: string;
}

export interface UpdateTenantData {
  companyName?: string;
  industry?: string;
  companySize?: string;
  supportEmail?: string;
  billingEmail?: string;
  status?: 'active' | 'suspended' | 'cancelled';
  suspendedReason?: string;
  subscriptionPlan?: string;
  maxEmployees?: number;
  maxStorageGb?: number;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  settings?: Record<string, any>;
  featureFlags?: Record<string, boolean>;
}

export interface TenantFilters {
  status?: 'active' | 'trial' | 'suspended' | 'cancelled';
  plan?: 'trial' | 'starter' | 'professional' | 'enterprise';
  search?: string;
  sortBy?: 'createdAt' | 'companyName' | 'currentEmployeeCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ListTenantsResponse {
  tenants: TenantWithAdmin[];
  total: number;
  page: number;
  limit: number;
}

export interface PlatformUserFilters {
  tenantId?: string;
  roleSlug?: string;
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListPlatformUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditLogFilters {
  tenantId?: string;
  actorId?: string;
  action?: string;
  resourceType?: string;
  severity?: 'info' | 'warning' | 'critical';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ListAuditLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
}
