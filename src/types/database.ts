/**
 * Database types generated from Supabase schema
 * This file will be auto-generated after running migrations
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type EmploymentType = 'PKWT' | 'PKWTT';
export type EmployeeStatus = 'active' | 'probation' | 'resigned' | 'terminated';
export type LeaveType = 'annual' | 'sick' | 'unpaid' | 'custom';
export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type PayrollStatus = 'draft' | 'processing' | 'approved' | 'paid';
export type WorkflowStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type DocumentType = 'ktp' | 'npwp' | 'bpjs' | 'contract' | 'certificate';
export type ComponentType = 'base' | 'allowance' | 'deduction' | 'tax';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Database {
  public: {
    Tables: {
      employees: Employee;
      attendance_records: AttendanceRecord;
      leave_requests: LeaveRequest;
      leave_balances: LeaveBalance;
      payroll_periods: PayrollPeriod;
      payroll_components: PayrollComponent;
      employee_documents: EmployeeDocument;
      performance_reviews: PerformanceReview;
      compliance_alerts: ComplianceAlert;
      workflow_instances: WorkflowInstance;
    };
  };
}

export interface Employee {
  Row: {
    id: string;
    user_id: string | null;
    employer_id: string;
    employee_number: string;
    full_name: string;
    email: string;
    phone: string;
    join_date: string;
    employment_type: EmploymentType;
    position: string;
    department: string;
    manager_id: string | null;
    salary_base: number;
    salary_components: Json;
    bpjs_number: string | null;
    npwp: string | null;
    status: EmployeeStatus;
    exit_date: string | null;
    exit_reason: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: Omit<Employee['Row'], 'id' | 'created_at' | 'updated_at'>;
  Update: Partial<Employee['Insert']>;
}

export interface AttendanceRecord {
  Row: {
    id: string;
    employee_id: string;
    employer_id: string;
    date: string;
    clock_in: string;
    clock_out: string | null;
    location_lat: number;
    location_lng: number;
    work_hours_decimal: number | null;
    overtime_hours: number | null;
    is_anomaly: boolean;
    anomaly_reason: string | null;
    approved_by: string | null;
    approved_at: string | null;
    created_at: string;
  };
  Insert: Omit<AttendanceRecord['Row'], 'id' | 'created_at'>;
  Update: Partial<AttendanceRecord['Insert']>;
}

export interface LeaveRequest {
  Row: {
    id: string;
    employee_id: string;
    employer_id: string;
    leave_type: LeaveType;
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
    status: RequestStatus;
    approver_id: string | null;
    approval_notes: string | null;
    auto_approved: boolean;
    ai_confidence: number | null;
    created_at: string;
    approved_at: string | null;
  };
  Insert: Omit<LeaveRequest['Row'], 'id' | 'created_at'>;
  Update: Partial<LeaveRequest['Insert']>;
}

export interface LeaveBalance {
  Row: {
    employee_id: string;
    employer_id: string;
    year: number;
    annual_quota: number;
    annual_used: number;
    sick_used: number;
    unpaid_used: number;
    carry_forward: number;
    expires_at: string | null;
  };
  Insert: LeaveBalance['Row'];
  Update: Partial<LeaveBalance['Row']>;
}

export interface PayrollPeriod {
  Row: {
    id: string;
    employer_id: string;
    period_start: string;
    period_end: string;
    status: PayrollStatus;
    total_employees: number;
    total_gross: number;
    total_deductions: number;
    total_net: number;
    approved_by: string | null;
    approved_at: string | null;
    created_at: string;
  };
  Insert: Omit<PayrollPeriod['Row'], 'id' | 'created_at'>;
  Update: Partial<PayrollPeriod['Insert']>;
}

export interface PayrollComponent {
  Row: {
    id: string;
    payroll_period_id: string;
    employee_id: string;
    component_type: ComponentType;
    component_name: string;
    amount: number;
    is_taxable: boolean;
    calculation_formula: string | null;
    created_at: string;
  };
  Insert: Omit<PayrollComponent['Row'], 'id' | 'created_at'>;
  Update: Partial<PayrollComponent['Insert']>;
}

export interface EmployeeDocument {
  Row: {
    id: string;
    employee_id: string;
    document_type: DocumentType;
    file_name: string;
    storage_path: string;
    extracted_data: Json | null;
    issue_date: string | null;
    expiry_date: string | null;
    reminder_sent_at: string | null;
    created_at: string;
  };
  Insert: Omit<EmployeeDocument['Row'], 'id' | 'created_at'>;
  Update: Partial<EmployeeDocument['Insert']>;
}

export interface PerformanceReview {
  Row: {
    id: string;
    employee_id: string;
    reviewer_id: string;
    review_period: string;
    review_type: string;
    goals_achieved: Json;
    competencies: Json;
    rating_overall: number;
    comments: string;
    status: string;
    created_at: string;
  };
  Insert: Omit<PerformanceReview['Row'], 'id' | 'created_at'>;
  Update: Partial<PerformanceReview['Insert']>;
}

export interface ComplianceAlert {
  Row: {
    id: string;
    employer_id: string;
    alert_type: string;
    severity: AlertSeverity;
    message: string;
    related_entity_id: string | null;
    due_date: string | null;
    resolved_at: string | null;
    auto_generated: boolean;
    created_at: string;
  };
  Insert: Omit<ComplianceAlert['Row'], 'id' | 'created_at'>;
  Update: Partial<ComplianceAlert['Insert']>;
}

export interface WorkflowInstance {
  Row: {
    id: string;
    employer_id: string;
    workflow_name: string;
    entity_type: string;
    entity_id: string;
    current_step: number;
    total_steps: number;
    status: WorkflowStatus;
    ai_confidence_score: number | null;
    auto_approved: boolean;
    started_at: string;
    completed_at: string | null;
  };
  Insert: Omit<WorkflowInstance['Row'], 'id'>;
  Update: Partial<WorkflowInstance['Insert']>;
}
