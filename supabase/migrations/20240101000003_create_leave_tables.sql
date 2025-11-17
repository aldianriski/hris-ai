-- Leave requests (Module 3: Leave Management)
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,

    -- Leave Details
    leave_type TEXT NOT NULL CHECK (leave_type IN ('annual', 'sick', 'unpaid', 'maternity', 'paternity', 'custom')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC(4, 1) NOT NULL, -- Support half-days: 2.5
    reason TEXT NOT NULL,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),

    -- Approval
    approver_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    approval_notes TEXT,
    approved_at TIMESTAMPTZ,

    -- AI Auto-approval
    auto_approved BOOLEAN DEFAULT false,
    ai_confidence NUMERIC(3, 2), -- 0.87 = 87%
    ai_reasoning TEXT,

    -- Attachments (e.g., sick leave doctor's note)
    attachment_urls TEXT[],

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT valid_leave_dates CHECK (end_date >= start_date),
    CONSTRAINT valid_total_days CHECK (total_days > 0),
    CONSTRAINT approved_requires_approver CHECK (
        (status = 'approved' AND approver_id IS NOT NULL) OR
        (status != 'approved')
    )
);

CREATE TRIGGER update_leave_requests_updated_at
    BEFORE UPDATE ON leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Leave balances (Module 3: Leave Management)
CREATE TABLE leave_balances (
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,

    -- Annual Leave
    annual_quota NUMERIC(5, 1) DEFAULT 12, -- Indonesian law: minimum 12 days/year
    annual_used NUMERIC(5, 1) DEFAULT 0,
    annual_carry_forward NUMERIC(5, 1) DEFAULT 0,
    carry_forward_expires_at DATE,

    -- Sick Leave (no limit, but tracked)
    sick_used NUMERIC(5, 1) DEFAULT 0,

    -- Unpaid Leave
    unpaid_used NUMERIC(5, 1) DEFAULT 0,

    -- Custom quotas
    custom_quotas JSONB DEFAULT '{}'::jsonb,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    PRIMARY KEY (employee_id, year),
    CONSTRAINT valid_year CHECK (year >= 2000 AND year <= 2100),
    CONSTRAINT non_negative_balances CHECK (
        annual_quota >= 0 AND
        annual_used >= 0 AND
        annual_carry_forward >= 0 AND
        sick_used >= 0 AND
        unpaid_used >= 0
    )
);

CREATE TRIGGER update_leave_balances_updated_at
    BEFORE UPDATE ON leave_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Leave types configuration
CREATE TABLE leave_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    is_paid BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT true,
    requires_attachment BOOLEAN DEFAULT false,
    max_days_per_request INTEGER,
    is_active BOOLEAN DEFAULT true,
    color_hex TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_leave_type_code_per_employer UNIQUE (employer_id, code)
);

CREATE TRIGGER update_leave_types_updated_at
    BEFORE UPDATE ON leave_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_employer ON leave_requests(employer_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_requests_pending ON leave_requests(approver_id) WHERE status = 'pending';
CREATE INDEX idx_leave_balances_employee_year ON leave_balances(employee_id, year DESC);
CREATE INDEX idx_leave_types_employer ON leave_types(employer_id);

-- Function to calculate available leave balance
CREATE OR REPLACE FUNCTION get_leave_balance(
    p_employee_id UUID,
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
RETURNS TABLE (
    quota NUMERIC,
    used NUMERIC,
    carry_forward NUMERIC,
    available NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        lb.annual_quota,
        lb.annual_used,
        lb.annual_carry_forward,
        (lb.annual_quota + lb.annual_carry_forward - lb.annual_used) AS available
    FROM leave_balances lb
    WHERE lb.employee_id = p_employee_id
    AND lb.year = p_year;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically deduct leave balance on approval
CREATE OR REPLACE FUNCTION deduct_leave_balance_on_approval()
RETURNS TRIGGER AS $$
DECLARE
    v_year INTEGER;
BEGIN
    -- Only deduct when changing to approved status
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        v_year := EXTRACT(YEAR FROM NEW.start_date)::INTEGER;

        -- Update balance based on leave type
        IF NEW.leave_type = 'annual' THEN
            UPDATE leave_balances
            SET annual_used = annual_used + NEW.total_days,
                updated_at = CURRENT_TIMESTAMP
            WHERE employee_id = NEW.employee_id
            AND year = v_year;
        ELSIF NEW.leave_type = 'sick' THEN
            UPDATE leave_balances
            SET sick_used = sick_used + NEW.total_days,
                updated_at = CURRENT_TIMESTAMP
            WHERE employee_id = NEW.employee_id
            AND year = v_year;
        ELSIF NEW.leave_type = 'unpaid' THEN
            UPDATE leave_balances
            SET unpaid_used = unpaid_used + NEW.total_days,
                updated_at = CURRENT_TIMESTAMP
            WHERE employee_id = NEW.employee_id
            AND year = v_year;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_deduct_leave_balance
    AFTER UPDATE ON leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION deduct_leave_balance_on_approval();

COMMENT ON TABLE leave_requests IS 'Leave requests with AI auto-approval';
COMMENT ON TABLE leave_balances IS 'Employee leave balances per year';
COMMENT ON TABLE leave_types IS 'Custom leave type configurations per employer';
