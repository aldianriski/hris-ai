-- Compliance alerts (Module 8: Compliance & Reporting)
CREATE TABLE compliance_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,

    -- Alert Details
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'contract_expiry',
        'document_expiry',
        'bpjs_payment_overdue',
        'tax_filing_due',
        'overtime_limit_exceeded',
        'leave_quota_exceeded',
        'attendance_anomaly',
        'payroll_error',
        'custom'
    )),
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),

    -- Message
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_required TEXT,

    -- Related Entity
    related_entity_type TEXT, -- "employee", "document", "payroll_period", etc.
    related_entity_id UUID,
    related_entity_data JSONB,

    -- Due Date
    due_date DATE,
    days_until_due INTEGER,

    -- Resolution
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    resolution_notes TEXT,

    -- Auto-generated
    auto_generated BOOLEAN DEFAULT true,
    auto_generation_rule TEXT,

    -- Notifications
    notification_sent BOOLEAN DEFAULT false,
    notification_sent_at TIMESTAMPTZ,
    notification_recipients TEXT[],

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_compliance_alerts_updated_at
    BEFORE UPDATE ON compliance_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Audit log (for compliance tracking)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID REFERENCES employers(id) ON DELETE SET NULL,

    -- Who
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    user_email TEXT,
    user_role TEXT,

    -- What
    action TEXT NOT NULL, -- "create", "update", "delete", "approve", "reject", "export"
    entity_type TEXT NOT NULL, -- "employee", "leave_request", "payroll_period", etc.
    entity_id UUID,

    -- Details
    description TEXT NOT NULL,
    changes JSONB, -- Before/after diff
    metadata JSONB, -- IP address, user agent, etc.

    -- When
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Reports configuration
CREATE TABLE report_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,

    -- Template Details
    report_name TEXT NOT NULL,
    report_type TEXT NOT NULL CHECK (report_type IN (
        'headcount',
        'turnover',
        'attendance_summary',
        'leave_summary',
        'payroll_summary',
        'bpjs_monthly',
        'tax_annual',
        'custom'
    )),
    description TEXT,

    -- Configuration
    report_config JSONB NOT NULL,
    /* Example:
    {
        "filters": {"department": "Engineering", "status": "active"},
        "columns": ["name", "position", "salary"],
        "groupBy": "department",
        "aggregations": ["sum", "avg", "count"]
    }
    */

    -- Schedule (for auto-generation)
    schedule_enabled BOOLEAN DEFAULT false,
    schedule_frequency TEXT CHECK (schedule_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually')),
    last_generated_at TIMESTAMPTZ,
    next_generation_at TIMESTAMPTZ,

    -- Recipients
    recipients TEXT[], -- Email addresses

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_report_name_per_employer UNIQUE (employer_id, report_name)
);

CREATE TRIGGER update_report_templates_updated_at
    BEFORE UPDATE ON report_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_compliance_alerts_employer ON compliance_alerts(employer_id);
CREATE INDEX idx_compliance_alerts_type ON compliance_alerts(alert_type);
CREATE INDEX idx_compliance_alerts_severity ON compliance_alerts(severity);
CREATE INDEX idx_compliance_alerts_unresolved ON compliance_alerts(resolved) WHERE resolved = false;
CREATE INDEX idx_compliance_alerts_due_date ON compliance_alerts(due_date) WHERE resolved = false AND due_date IS NOT NULL;
CREATE INDEX idx_audit_logs_employer ON audit_logs(employer_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_report_templates_employer ON report_templates(employer_id);

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
    p_employer_id UUID,
    p_user_id UUID,
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID,
    p_description TEXT,
    p_changes JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
    v_employee_id UUID;
    v_user_email TEXT;
    v_user_role TEXT;
BEGIN
    -- Get user details
    SELECT
        p.employee_id,
        p.email,
        p.role
    INTO v_employee_id, v_user_email, v_user_role
    FROM profiles p
    WHERE p.id = p_user_id;

    -- Insert audit log
    INSERT INTO audit_logs (
        employer_id,
        user_id,
        employee_id,
        user_email,
        user_role,
        action,
        entity_type,
        entity_id,
        description,
        changes,
        metadata
    ) VALUES (
        p_employer_id,
        p_user_id,
        v_employee_id,
        v_user_email,
        v_user_role,
        p_action,
        p_entity_type,
        p_entity_id,
        p_description,
        p_changes,
        p_metadata
    ) RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE compliance_alerts IS 'Proactive compliance alerts for contracts, documents, payments';
COMMENT ON TABLE audit_logs IS 'Complete audit trail for compliance and security';
COMMENT ON TABLE report_templates IS 'Configurable report templates with auto-generation';
COMMENT ON FUNCTION create_audit_log IS 'Create audit log entry with user context';
