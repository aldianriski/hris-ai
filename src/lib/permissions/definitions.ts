/**
 * Comprehensive Permission Definitions for HRIS Platform
 * This file defines all available permissions in the system
 */

export interface Permission {
  slug: string;
  name: string;
  description: string;
  module: string;
  category: 'platform' | 'tenant';
}

export interface PermissionModule {
  id: string;
  name: string;
  description: string;
  category: 'platform' | 'tenant';
  permissions: Permission[];
}

/**
 * All available permissions organized by module
 */
export const PERMISSION_MODULES: PermissionModule[] = [
  // ============= PLATFORM PERMISSIONS =============
  {
    id: 'platform_admin',
    name: 'Platform Administration',
    description: 'Platform-level administration and management',
    category: 'platform',
    permissions: [
      {
        slug: 'platform.manage_tenants',
        name: 'Manage Tenants',
        description: 'Create, update, suspend, and delete tenants',
        module: 'platform_admin',
        category: 'platform',
      },
      {
        slug: 'platform.view_tenants',
        name: 'View Tenants',
        description: 'View all tenant information',
        module: 'platform_admin',
        category: 'platform',
      },
      {
        slug: 'platform.manage_users',
        name: 'Manage Platform Users',
        description: 'Create and manage platform admin users',
        module: 'platform_admin',
        category: 'platform',
      },
      {
        slug: 'platform.manage_roles',
        name: 'Manage Roles',
        description: 'Create and modify role definitions',
        module: 'platform_admin',
        category: 'platform',
      },
      {
        slug: 'platform.view_audit_logs',
        name: 'View Audit Logs',
        description: 'Access platform-wide audit logs',
        module: 'platform_admin',
        category: 'platform',
      },
      {
        slug: 'platform.impersonate_users',
        name: 'Impersonate Users',
        description: 'Log in as tenant users for support',
        module: 'platform_admin',
        category: 'platform',
      },
    ],
  },
  {
    id: 'billing',
    name: 'Billing & Subscriptions',
    description: 'Billing, invoicing, and subscription management',
    category: 'platform',
    permissions: [
      {
        slug: 'billing.manage_plans',
        name: 'Manage Subscription Plans',
        description: 'Create and modify subscription plans',
        module: 'billing',
        category: 'platform',
      },
      {
        slug: 'billing.view_plans',
        name: 'View Subscription Plans',
        description: 'View all subscription plans',
        module: 'billing',
        category: 'platform',
      },
      {
        slug: 'billing.manage_invoices',
        name: 'Manage Invoices',
        description: 'Create, send, and manage invoices',
        module: 'billing',
        category: 'platform',
      },
      {
        slug: 'billing.view_invoices',
        name: 'View Invoices',
        description: 'View all invoices',
        module: 'billing',
        category: 'platform',
      },
      {
        slug: 'billing.process_payments',
        name: 'Process Payments',
        description: 'Mark invoices as paid, process refunds',
        module: 'billing',
        category: 'platform',
      },
    ],
  },
  {
    id: 'feature_management',
    name: 'Feature Management',
    description: 'Feature flags and rollout control',
    category: 'platform',
    permissions: [
      {
        slug: 'features.manage_flags',
        name: 'Manage Feature Flags',
        description: 'Create and modify feature flags',
        module: 'feature_management',
        category: 'platform',
      },
      {
        slug: 'features.view_flags',
        name: 'View Feature Flags',
        description: 'View feature flag configurations',
        module: 'feature_management',
        category: 'platform',
      },
      {
        slug: 'features.toggle_flags',
        name: 'Toggle Feature Flags',
        description: 'Enable/disable feature flags',
        module: 'feature_management',
        category: 'platform',
      },
    ],
  },
  {
    id: 'support',
    name: 'Support & Help Desk',
    description: 'Customer support and ticketing',
    category: 'platform',
    permissions: [
      {
        slug: 'support.manage_tickets',
        name: 'Manage Support Tickets',
        description: 'Create, assign, and resolve support tickets',
        module: 'support',
        category: 'platform',
      },
      {
        slug: 'support.view_tickets',
        name: 'View Support Tickets',
        description: 'View all support tickets',
        module: 'support',
        category: 'platform',
      },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics & Reporting',
    description: 'Platform analytics and reports',
    category: 'platform',
    permissions: [
      {
        slug: 'analytics.view_platform',
        name: 'View Platform Analytics',
        description: 'Access platform-wide analytics',
        module: 'analytics',
        category: 'platform',
      },
      {
        slug: 'analytics.view_tenant',
        name: 'View Tenant Analytics',
        description: 'Access individual tenant analytics',
        module: 'analytics',
        category: 'platform',
      },
      {
        slug: 'analytics.export_data',
        name: 'Export Analytics Data',
        description: 'Export analytics data to CSV/Excel',
        module: 'analytics',
        category: 'platform',
      },
    ],
  },

  // ============= TENANT PERMISSIONS =============
  {
    id: 'employee_management',
    name: 'Employee Management',
    description: 'Manage employee data and records',
    category: 'tenant',
    permissions: [
      {
        slug: 'employee.create',
        name: 'Create Employees',
        description: 'Add new employees to the system',
        module: 'employee_management',
        category: 'tenant',
      },
      {
        slug: 'employee.read',
        name: 'View Employees',
        description: 'View employee information',
        module: 'employee_management',
        category: 'tenant',
      },
      {
        slug: 'employee.update',
        name: 'Update Employees',
        description: 'Edit employee information',
        module: 'employee_management',
        category: 'tenant',
      },
      {
        slug: 'employee.delete',
        name: 'Delete Employees',
        description: 'Remove employees from the system',
        module: 'employee_management',
        category: 'tenant',
      },
      {
        slug: 'employee.view_salary',
        name: 'View Salaries',
        description: 'View employee salary information',
        module: 'employee_management',
        category: 'tenant',
      },
    ],
  },
  {
    id: 'attendance',
    name: 'Time & Attendance',
    description: 'Attendance tracking and shift management',
    category: 'tenant',
    permissions: [
      {
        slug: 'attendance.create',
        name: 'Create Attendance Records',
        description: 'Record employee attendance',
        module: 'attendance',
        category: 'tenant',
      },
      {
        slug: 'attendance.read',
        name: 'View Attendance',
        description: 'View attendance records',
        module: 'attendance',
        category: 'tenant',
      },
      {
        slug: 'attendance.update',
        name: 'Update Attendance',
        description: 'Edit attendance records',
        module: 'attendance',
        category: 'tenant',
      },
      {
        slug: 'attendance.approve',
        name: 'Approve Attendance',
        description: 'Approve or reject attendance records',
        module: 'attendance',
        category: 'tenant',
      },
      {
        slug: 'attendance.manage_shifts',
        name: 'Manage Shifts',
        description: 'Create and assign work shifts',
        module: 'attendance',
        category: 'tenant',
      },
    ],
  },
  {
    id: 'leave',
    name: 'Leave Management',
    description: 'Leave requests and balance tracking',
    category: 'tenant',
    permissions: [
      {
        slug: 'leave.request',
        name: 'Submit Leave Requests',
        description: 'Create leave requests',
        module: 'leave',
        category: 'tenant',
      },
      {
        slug: 'leave.read',
        name: 'View Leave Requests',
        description: 'View leave request information',
        module: 'leave',
        category: 'tenant',
      },
      {
        slug: 'leave.approve',
        name: 'Approve Leave',
        description: 'Approve or reject leave requests',
        module: 'leave',
        category: 'tenant',
      },
      {
        slug: 'leave.manage_balances',
        name: 'Manage Leave Balances',
        description: 'Adjust employee leave balances',
        module: 'leave',
        category: 'tenant',
      },
      {
        slug: 'leave.manage_types',
        name: 'Manage Leave Types',
        description: 'Create and configure leave types',
        module: 'leave',
        category: 'tenant',
      },
    ],
  },
  {
    id: 'payroll',
    name: 'Payroll',
    description: 'Payroll processing and management',
    category: 'tenant',
    permissions: [
      {
        slug: 'payroll.create',
        name: 'Create Payroll',
        description: 'Generate payroll periods',
        module: 'payroll',
        category: 'tenant',
      },
      {
        slug: 'payroll.read',
        name: 'View Payroll',
        description: 'View payroll information',
        module: 'payroll',
        category: 'tenant',
      },
      {
        slug: 'payroll.update',
        name: 'Update Payroll',
        description: 'Edit payroll records',
        module: 'payroll',
        category: 'tenant',
      },
      {
        slug: 'payroll.approve',
        name: 'Approve Payroll',
        description: 'Approve payroll for processing',
        module: 'payroll',
        category: 'tenant',
      },
      {
        slug: 'payroll.process',
        name: 'Process Payroll',
        description: 'Execute payroll processing',
        module: 'payroll',
        category: 'tenant',
      },
    ],
  },
  {
    id: 'performance',
    name: 'Performance Management',
    description: 'Performance reviews and goals',
    category: 'tenant',
    permissions: [
      {
        slug: 'performance.create_review',
        name: 'Create Reviews',
        description: 'Create performance reviews',
        module: 'performance',
        category: 'tenant',
      },
      {
        slug: 'performance.read',
        name: 'View Performance Data',
        description: 'View performance reviews and goals',
        module: 'performance',
        category: 'tenant',
      },
      {
        slug: 'performance.update',
        name: 'Update Performance Data',
        description: 'Edit performance reviews',
        module: 'performance',
        category: 'tenant',
      },
      {
        slug: 'performance.manage_goals',
        name: 'Manage Goals',
        description: 'Create and assign performance goals',
        module: 'performance',
        category: 'tenant',
      },
    ],
  },
  {
    id: 'documents',
    name: 'Document Management',
    description: 'Employee documents and templates',
    category: 'tenant',
    permissions: [
      {
        slug: 'documents.upload',
        name: 'Upload Documents',
        description: 'Upload employee documents',
        module: 'documents',
        category: 'tenant',
      },
      {
        slug: 'documents.read',
        name: 'View Documents',
        description: 'View employee documents',
        module: 'documents',
        category: 'tenant',
      },
      {
        slug: 'documents.delete',
        name: 'Delete Documents',
        description: 'Remove documents from the system',
        module: 'documents',
        category: 'tenant',
      },
      {
        slug: 'documents.manage_templates',
        name: 'Manage Templates',
        description: 'Create and edit document templates',
        module: 'documents',
        category: 'tenant',
      },
    ],
  },
  {
    id: 'compliance',
    name: 'Compliance & Reporting',
    description: 'Compliance monitoring and statutory reports',
    category: 'tenant',
    permissions: [
      {
        slug: 'compliance.view_alerts',
        name: 'View Compliance Alerts',
        description: 'View compliance alerts and warnings',
        module: 'compliance',
        category: 'tenant',
      },
      {
        slug: 'compliance.manage_alerts',
        name: 'Manage Compliance Alerts',
        description: 'Create and resolve compliance alerts',
        module: 'compliance',
        category: 'tenant',
      },
      {
        slug: 'compliance.generate_reports',
        name: 'Generate Reports',
        description: 'Generate compliance and statutory reports',
        module: 'compliance',
        category: 'tenant',
      },
    ],
  },
  {
    id: 'company_settings',
    name: 'Company Settings',
    description: 'Company-wide configuration',
    category: 'tenant',
    permissions: [
      {
        slug: 'settings.manage_company',
        name: 'Manage Company Settings',
        description: 'Edit company information and settings',
        module: 'company_settings',
        category: 'tenant',
      },
      {
        slug: 'settings.manage_users',
        name: 'Manage Users',
        description: 'Create and manage company users',
        module: 'company_settings',
        category: 'tenant',
      },
      {
        slug: 'settings.manage_roles',
        name: 'Manage Roles',
        description: 'Assign roles to users',
        module: 'company_settings',
        category: 'tenant',
      },
      {
        slug: 'settings.view_billing',
        name: 'View Billing',
        description: 'View billing and subscription information',
        module: 'company_settings',
        category: 'tenant',
      },
    ],
  },
];

/**
 * Get all permissions as a flat array
 */
export function getAllPermissions(): Permission[] {
  return PERMISSION_MODULES.flatMap(module => module.permissions);
}

/**
 * Get permissions by category
 */
export function getPermissionsByCategory(category: 'platform' | 'tenant'): Permission[] {
  return getAllPermissions().filter(p => p.category === category);
}

/**
 * Get permissions by module
 */
export function getPermissionsByModule(moduleId: string): Permission[] {
  const module = PERMISSION_MODULES.find(m => m.id === moduleId);
  return module?.permissions || [];
}

/**
 * Check if a permission slug is valid
 */
export function isValidPermission(slug: string): boolean {
  return getAllPermissions().some(p => p.slug === slug);
}

/**
 * Get permission details by slug
 */
export function getPermissionBySlug(slug: string): Permission | undefined {
  return getAllPermissions().find(p => p.slug === slug);
}
