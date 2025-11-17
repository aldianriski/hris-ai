-- Payroll periods (Module 4: Payroll Preparation)
CREATE TABLE payroll_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,

    -- Period
    period_name TEXT NOT NULL, -- "January 2024", "2024-01"
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    payment_date DATE,

    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'approved', 'paid', 'cancelled')),

    -- Totals (aggregate from components)
    total_employees INTEGER DEFAULT 0,
    total_gross NUMERIC(15, 2) DEFAULT 0,
    total_allowances NUMERIC(15, 2) DEFAULT 0,
    total_deductions NUMERIC(15, 2) DEFAULT 0,
    total_bpjs_employee NUMERIC(15, 2) DEFAULT 0,
    total_bpjs_employer NUMERIC(15, 2) DEFAULT 0,
    total_tax NUMERIC(15, 2) DEFAULT 0,
    total_net NUMERIC(15, 2) DEFAULT 0,

    -- Approval
    approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,

    -- AI Error Detection
    errors_detected JSONB,
    errors_count INTEGER DEFAULT 0,

    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT unique_payroll_period_per_employer UNIQUE (employer_id, period_start, period_end),
    CONSTRAINT valid_period_dates CHECK (period_end >= period_start)
);

CREATE TRIGGER update_payroll_periods_updated_at
    BEFORE UPDATE ON payroll_periods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Payroll components (Module 4: Payroll Preparation)
CREATE TABLE payroll_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payroll_period_id UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,

    -- Component Details
    component_type TEXT NOT NULL CHECK (component_type IN ('base', 'allowance', 'deduction', 'bpjs_employee', 'bpjs_employer', 'tax')),
    component_name TEXT NOT NULL, -- "Base Salary", "Transport Allowance", "BPJS JHT", "PPh21"
    component_code TEXT, -- "BASE", "TRANS", "BPJS_JHT", "TAX"

    -- Amount
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    is_taxable BOOLEAN DEFAULT true,

    -- Calculation
    calculation_formula TEXT, -- "base_salary * 0.04" for BPJS
    calculated_from JSONB, -- Store reference data used in calculation

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT unique_component_per_employee_period UNIQUE (payroll_period_id, employee_id, component_code)
);

-- Payroll summaries (denormalized for quick access)
CREATE TABLE payroll_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payroll_period_id UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,

    -- Gross Calculation
    base_salary NUMERIC(15, 2) DEFAULT 0,
    total_allowances NUMERIC(15, 2) DEFAULT 0,
    gross_salary NUMERIC(15, 2) DEFAULT 0,

    -- Deductions
    total_deductions NUMERIC(15, 2) DEFAULT 0,
    bpjs_jkk NUMERIC(15, 2) DEFAULT 0, -- Jaminan Kecelakaan Kerja
    bpjs_jkm NUMERIC(15, 2) DEFAULT 0, -- Jaminan Kematian
    bpjs_jht NUMERIC(15, 2) DEFAULT 0, -- Jaminan Hari Tua
    bpjs_jp NUMERIC(15, 2) DEFAULT 0,  -- Jaminan Pensiun
    bpjs_kesehatan NUMERIC(15, 2) DEFAULT 0,
    pph21 NUMERIC(15, 2) DEFAULT 0,

    -- Net Pay
    net_salary NUMERIC(15, 2) DEFAULT 0,

    -- Attendance-based adjustments
    days_worked INTEGER,
    days_absent INTEGER,
    overtime_hours NUMERIC(5, 2),
    overtime_pay NUMERIC(15, 2) DEFAULT 0,
    late_deductions NUMERIC(15, 2) DEFAULT 0,

    -- Tax Information
    ptkp_status TEXT,
    annual_gross NUMERIC(15, 2),
    taxable_income NUMERIC(15, 2),

    -- AI Error Flags
    has_errors BOOLEAN DEFAULT false,
    error_details JSONB,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT unique_payroll_summary_per_employee_period UNIQUE (payroll_period_id, employee_id)
);

CREATE TRIGGER update_payroll_summaries_updated_at
    BEFORE UPDATE ON payroll_summaries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_payroll_periods_employer ON payroll_periods(employer_id);
CREATE INDEX idx_payroll_periods_status ON payroll_periods(status);
CREATE INDEX idx_payroll_periods_dates ON payroll_periods(period_start DESC, period_end DESC);
CREATE INDEX idx_payroll_components_period ON payroll_components(payroll_period_id);
CREATE INDEX idx_payroll_components_employee ON payroll_components(employee_id);
CREATE INDEX idx_payroll_components_type ON payroll_components(component_type);
CREATE INDEX idx_payroll_summaries_period ON payroll_summaries(payroll_period_id);
CREATE INDEX idx_payroll_summaries_employee ON payroll_summaries(employee_id);
CREATE INDEX idx_payroll_summaries_errors ON payroll_summaries(has_errors) WHERE has_errors = true;

-- Function to calculate BPJS contributions (2025 rates)
CREATE OR REPLACE FUNCTION calculate_bpjs(
    p_gross_salary NUMERIC,
    p_component TEXT -- 'jkk', 'jkm', 'jht', 'jp', 'kesehatan'
)
RETURNS NUMERIC AS $$
DECLARE
    v_rate NUMERIC;
    v_max_base NUMERIC := 13710732; -- BPJS max base 2025
    v_base NUMERIC;
BEGIN
    v_base := LEAST(p_gross_salary, v_max_base);

    v_rate := CASE p_component
        WHEN 'jkk' THEN 0.0024  -- 0.24% (employer)
        WHEN 'jkm' THEN 0.003   -- 0.30% (employer)
        WHEN 'jht' THEN 0.057   -- 5.7% (3.7% employer + 2% employee)
        WHEN 'jp' THEN 0.03     -- 3% (2% employer + 1% employee)
        WHEN 'kesehatan' THEN 0.05 -- 5% (4% employer + 1% employee)
        ELSE 0
    END;

    RETURN ROUND(v_base * v_rate, 0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate PPh21 (Indonesian income tax)
CREATE OR REPLACE FUNCTION calculate_pph21(
    p_annual_gross NUMERIC,
    p_ptkp_status TEXT DEFAULT 'TK/0'
)
RETURNS NUMERIC AS $$
DECLARE
    v_ptkp NUMERIC;
    v_taxable_income NUMERIC;
    v_tax NUMERIC := 0;
BEGIN
    -- PTKP (Penghasilan Tidak Kena Pajak) 2025
    v_ptkp := CASE p_ptkp_status
        WHEN 'TK/0' THEN 54000000
        WHEN 'TK/1' THEN 58500000
        WHEN 'TK/2' THEN 63000000
        WHEN 'TK/3' THEN 67500000
        WHEN 'K/0' THEN 58500000
        WHEN 'K/1' THEN 63000000
        WHEN 'K/2' THEN 67500000
        WHEN 'K/3' THEN 72000000
        ELSE 54000000
    END;

    v_taxable_income := p_annual_gross - v_ptkp;

    IF v_taxable_income <= 0 THEN
        RETURN 0;
    END IF;

    -- Progressive tax rates (2025)
    IF v_taxable_income <= 60000000 THEN
        v_tax := v_taxable_income * 0.05;
    ELSIF v_taxable_income <= 250000000 THEN
        v_tax := 60000000 * 0.05 + (v_taxable_income - 60000000) * 0.15;
    ELSIF v_taxable_income <= 500000000 THEN
        v_tax := 60000000 * 0.05 + 190000000 * 0.15 + (v_taxable_income - 250000000) * 0.25;
    ELSE
        v_tax := 60000000 * 0.05 + 190000000 * 0.15 + 250000000 * 0.25 + (v_taxable_income - 500000000) * 0.30;
    END IF;

    RETURN ROUND(v_tax / 12, 0); -- Monthly tax
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON TABLE payroll_periods IS 'Monthly payroll processing periods';
COMMENT ON TABLE payroll_components IS 'Detailed salary components per employee';
COMMENT ON TABLE payroll_summaries IS 'Payroll summary per employee (denormalized for performance)';
COMMENT ON FUNCTION calculate_bpjs IS 'Calculate BPJS contributions based on 2025 rates';
COMMENT ON FUNCTION calculate_pph21 IS 'Calculate PPh21 income tax based on 2025 rates';
