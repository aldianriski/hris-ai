-- Enable Row Level Security on all tables
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION auth.uid_to_employer_id()
RETURNS UUID AS $$
    SELECT employer_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION auth.uid_to_employee_id()
RETURNS UUID AS $$
    SELECT employee_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT role = 'admin' FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_hr_manager_or_admin()
RETURNS BOOLEAN AS $$
    SELECT role IN ('admin', 'hr_manager') FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_manager()
RETURNS BOOLEAN AS $$
    SELECT role IN ('admin', 'hr_manager', 'manager') FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- EMPLOYERS POLICIES
-- ============================================
CREATE POLICY "Admins can view all employers"
    ON employers FOR SELECT
    USING (is_admin());

CREATE POLICY "Users can view own employer"
    ON employers FOR SELECT
    USING (id = auth.uid_to_employer_id());

CREATE POLICY "Admins can manage all employers"
    ON employers FOR ALL
    USING (is_admin());

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (is_admin());

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Admins can manage all profiles"
    ON profiles FOR ALL
    USING (is_admin());

-- ============================================
-- EMPLOYEES POLICIES
-- ============================================
CREATE POLICY "Admins can view all employees"
    ON employees FOR SELECT
    USING (is_admin());

CREATE POLICY "Employer staff can view own company employees"
    ON employees FOR SELECT
    USING (employer_id = auth.uid_to_employer_id());

CREATE POLICY "Employee can view own record"
    ON employees FOR SELECT
    USING (id = auth.uid_to_employee_id());

CREATE POLICY "HR managers and admins can create employees"
    ON employees FOR INSERT
    WITH CHECK (
        is_admin() OR
        (is_hr_manager_or_admin() AND employer_id = auth.uid_to_employer_id())
    );

CREATE POLICY "HR managers and admins can update employees"
    ON employees FOR UPDATE
    USING (
        is_admin() OR
        (is_hr_manager_or_admin() AND employer_id = auth.uid_to_employer_id())
    );

CREATE POLICY "Admins can delete employees"
    ON employees FOR DELETE
    USING (is_admin());

-- ============================================
-- ATTENDANCE POLICIES
-- ============================================
CREATE POLICY "Admins can view all attendance"
    ON attendance_records FOR SELECT
    USING (is_admin());

CREATE POLICY "Employer staff can view own company attendance"
    ON attendance_records FOR SELECT
    USING (employer_id = auth.uid_to_employer_id());

CREATE POLICY "Employee can view own attendance"
    ON attendance_records FOR SELECT
    USING (employee_id = auth.uid_to_employee_id());

CREATE POLICY "Employee can create own attendance"
    ON attendance_records FOR INSERT
    WITH CHECK (employee_id = auth.uid_to_employee_id());

CREATE POLICY "Employee can update own pending attendance"
    ON attendance_records FOR UPDATE
    USING (
        employee_id = auth.uid_to_employee_id() AND
        clock_out IS NULL
    );

CREATE POLICY "Managers can approve attendance"
    ON attendance_records FOR UPDATE
    USING (
        is_admin() OR
        is_manager() AND employer_id = auth.uid_to_employer_id()
    );

-- ============================================
-- LEAVE POLICIES
-- ============================================
CREATE POLICY "Admins can view all leave requests"
    ON leave_requests FOR SELECT
    USING (is_admin());

CREATE POLICY "Employee can view own leave requests"
    ON leave_requests FOR SELECT
    USING (employee_id = auth.uid_to_employee_id());

CREATE POLICY "Approvers can view assigned leave requests"
    ON leave_requests FOR SELECT
    USING (
        approver_id = auth.uid_to_employee_id() OR
        is_hr_manager_or_admin() AND employer_id = auth.uid_to_employer_id()
    );

CREATE POLICY "Employee can create own leave requests"
    ON leave_requests FOR INSERT
    WITH CHECK (employee_id = auth.uid_to_employee_id());

CREATE POLICY "Employee can update own pending leave"
    ON leave_requests FOR UPDATE
    USING (
        employee_id = auth.uid_to_employee_id() AND
        status = 'pending'
    );

CREATE POLICY "Managers can approve leave requests"
    ON leave_requests FOR UPDATE
    USING (
        is_admin() OR
        (
            (approver_id = auth.uid_to_employee_id() OR is_hr_manager_or_admin()) AND
            employer_id = auth.uid_to_employer_id()
        )
    );

-- Leave Balances
CREATE POLICY "Admins can view all leave balances"
    ON leave_balances FOR SELECT
    USING (is_admin());

CREATE POLICY "Employee can view own leave balance"
    ON leave_balances FOR SELECT
    USING (employee_id = auth.uid_to_employee_id());

CREATE POLICY "HR can view company leave balances"
    ON leave_balances FOR SELECT
    USING (
        is_hr_manager_or_admin() AND
        employer_id = auth.uid_to_employer_id()
    );

CREATE POLICY "HR can manage leave balances"
    ON leave_balances FOR ALL
    USING (
        is_admin() OR
        (is_hr_manager_or_admin() AND employer_id = auth.uid_to_employer_id())
    );

-- ============================================
-- PAYROLL POLICIES
-- ============================================
CREATE POLICY "Admins can view all payroll"
    ON payroll_periods FOR SELECT
    USING (is_admin());

CREATE POLICY "HR can view company payroll"
    ON payroll_periods FOR SELECT
    USING (
        is_hr_manager_or_admin() AND
        employer_id = auth.uid_to_employer_id()
    );

CREATE POLICY "HR can manage payroll"
    ON payroll_periods FOR ALL
    USING (
        is_admin() OR
        (is_hr_manager_or_admin() AND employer_id = auth.uid_to_employer_id())
    );

-- Payroll Components
CREATE POLICY "Admins can view all payroll components"
    ON payroll_components FOR SELECT
    USING (is_admin());

CREATE POLICY "Employee can view own payroll components"
    ON payroll_components FOR SELECT
    USING (employee_id = auth.uid_to_employee_id());

CREATE POLICY "HR can view company payroll components"
    ON payroll_components FOR SELECT
    USING (
        is_hr_manager_or_admin() AND
        EXISTS (
            SELECT 1 FROM payroll_periods pp
            WHERE pp.id = payroll_components.payroll_period_id
            AND pp.employer_id = auth.uid_to_employer_id()
        )
    );

CREATE POLICY "HR can manage payroll components"
    ON payroll_components FOR ALL
    USING (
        is_admin() OR
        (
            is_hr_manager_or_admin() AND
            EXISTS (
                SELECT 1 FROM payroll_periods pp
                WHERE pp.id = payroll_components.payroll_period_id
                AND pp.employer_id = auth.uid_to_employer_id()
            )
        )
    );

-- Payroll Summaries (same as components)
CREATE POLICY "Admins can view all payroll summaries"
    ON payroll_summaries FOR SELECT
    USING (is_admin());

CREATE POLICY "Employee can view own payroll summary"
    ON payroll_summaries FOR SELECT
    USING (employee_id = auth.uid_to_employee_id());

CREATE POLICY "HR can view company payroll summaries"
    ON payroll_summaries FOR SELECT
    USING (
        is_hr_manager_or_admin() AND
        EXISTS (
            SELECT 1 FROM payroll_periods pp
            WHERE pp.id = payroll_summaries.payroll_period_id
            AND pp.employer_id = auth.uid_to_employer_id()
        )
    );

CREATE POLICY "HR can manage payroll summaries"
    ON payroll_summaries FOR ALL
    USING (
        is_admin() OR
        (
            is_hr_manager_or_admin() AND
            EXISTS (
                SELECT 1 FROM payroll_periods pp
                WHERE pp.id = payroll_summaries.payroll_period_id
                AND pp.employer_id = auth.uid_to_employer_id()
            )
        )
    );

-- ============================================
-- PERFORMANCE POLICIES
-- ============================================
CREATE POLICY "Admins can view all performance reviews"
    ON performance_reviews FOR SELECT
    USING (is_admin());

CREATE POLICY "Employee can view own performance reviews"
    ON performance_reviews FOR SELECT
    USING (employee_id = auth.uid_to_employee_id());

CREATE POLICY "Reviewers can view assigned reviews"
    ON performance_reviews FOR SELECT
    USING (
        reviewer_id = auth.uid_to_employee_id() OR
        is_hr_manager_or_admin() AND employer_id = auth.uid_to_employer_id()
    );

CREATE POLICY "Managers can create performance reviews"
    ON performance_reviews FOR INSERT
    WITH CHECK (
        is_admin() OR
        (is_manager() AND employer_id = auth.uid_to_employer_id())
    );

CREATE POLICY "Reviewers can update own reviews"
    ON performance_reviews FOR UPDATE
    USING (
        is_admin() OR
        (reviewer_id = auth.uid_to_employee_id() AND employer_id = auth.uid_to_employer_id())
    );

-- Performance Goals
CREATE POLICY "Admins can view all performance goals"
    ON performance_goals FOR SELECT
    USING (is_admin());

CREATE POLICY "Employee can view own performance goals"
    ON performance_goals FOR SELECT
    USING (employee_id = auth.uid_to_employee_id());

CREATE POLICY "Managers can view team performance goals"
    ON performance_goals FOR SELECT
    USING (
        is_manager() AND employer_id = auth.uid_to_employer_id()
    );

CREATE POLICY "Managers can create performance goals"
    ON performance_goals FOR INSERT
    WITH CHECK (
        is_admin() OR
        (is_manager() AND employer_id = auth.uid_to_employer_id())
    );

CREATE POLICY "Employee can update own goals"
    ON performance_goals FOR UPDATE
    USING (employee_id = auth.uid_to_employee_id());

-- ============================================
-- DOCUMENTS POLICIES
-- ============================================
CREATE POLICY "Admins can view all documents"
    ON employee_documents FOR SELECT
    USING (is_admin());

CREATE POLICY "Employee can view own documents"
    ON employee_documents FOR SELECT
    USING (employee_id = auth.uid_to_employee_id());

CREATE POLICY "HR can view company documents"
    ON employee_documents FOR SELECT
    USING (
        is_hr_manager_or_admin() AND
        employer_id = auth.uid_to_employer_id()
    );

CREATE POLICY "Employee can upload own documents"
    ON employee_documents FOR INSERT
    WITH CHECK (employee_id = auth.uid_to_employee_id());

CREATE POLICY "HR can upload employee documents"
    ON employee_documents FOR INSERT
    WITH CHECK (
        is_admin() OR
        (is_hr_manager_or_admin() AND employer_id = auth.uid_to_employer_id())
    );

CREATE POLICY "HR can manage documents"
    ON employee_documents FOR UPDATE
    USING (
        is_admin() OR
        (is_hr_manager_or_admin() AND employer_id = auth.uid_to_employer_id())
    );

-- ============================================
-- COMPLIANCE POLICIES
-- ============================================
CREATE POLICY "Admins can view all compliance alerts"
    ON compliance_alerts FOR SELECT
    USING (is_admin());

CREATE POLICY "HR can view company compliance alerts"
    ON compliance_alerts FOR SELECT
    USING (
        is_hr_manager_or_admin() AND
        employer_id = auth.uid_to_employer_id()
    );

CREATE POLICY "HR can manage compliance alerts"
    ON compliance_alerts FOR ALL
    USING (
        is_admin() OR
        (is_hr_manager_or_admin() AND employer_id = auth.uid_to_employer_id())
    );

-- Audit Logs (read-only for most users)
CREATE POLICY "Admins can view all audit logs"
    ON audit_logs FOR SELECT
    USING (is_admin());

CREATE POLICY "HR can view company audit logs"
    ON audit_logs FOR SELECT
    USING (
        is_hr_manager_or_admin() AND
        employer_id = auth.uid_to_employer_id()
    );

-- ============================================
-- WORKFLOW POLICIES
-- ============================================
CREATE POLICY "Admins can view all workflows"
    ON workflow_instances FOR SELECT
    USING (is_admin());

CREATE POLICY "Employer staff can view company workflows"
    ON workflow_instances FOR SELECT
    USING (employer_id = auth.uid_to_employer_id());

CREATE POLICY "Assigned users can view assigned workflows"
    ON workflow_instances FOR SELECT
    USING (assigned_to = auth.uid_to_employee_id());

CREATE POLICY "HR can manage workflows"
    ON workflow_instances FOR ALL
    USING (
        is_admin() OR
        (is_hr_manager_or_admin() AND employer_id = auth.uid_to_employer_id())
    );

-- ============================================
-- BYPASS FOR SERVICE ROLE (for server-side operations)
-- ============================================
-- Service role bypasses all RLS policies automatically

COMMENT ON FUNCTION auth.uid_to_employer_id IS 'Get employer_id for current user';
COMMENT ON FUNCTION auth.uid_to_employee_id IS 'Get employee_id for current user';
COMMENT ON FUNCTION auth.user_role IS 'Get role for current user';
COMMENT ON FUNCTION is_admin IS 'Check if current user is admin';
COMMENT ON FUNCTION is_hr_manager_or_admin IS 'Check if current user is HR manager or admin';
COMMENT ON FUNCTION is_manager IS 'Check if current user has manager role';
