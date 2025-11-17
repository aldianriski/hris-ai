-- Employees table (Module 1: Employee Master Data)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    employee_number TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,

    -- Personal Information
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
    address TEXT,
    city TEXT,
    postal_code TEXT,
    id_card_number TEXT, -- KTP

    -- Employment Information
    join_date DATE NOT NULL,
    employment_type TEXT NOT NULL CHECK (employment_type IN ('PKWT', 'PKWTT')),
    contract_start_date DATE,
    contract_end_date DATE,
    position TEXT NOT NULL,
    department TEXT NOT NULL,
    division TEXT,
    manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,

    -- Compensation
    salary_base NUMERIC(15, 2) NOT NULL DEFAULT 0,
    salary_components JSONB DEFAULT '{
        "allowances": [],
        "deductions": []
    }'::jsonb,

    -- Government Registration
    bpjs_kesehatan_number TEXT,
    bpjs_ketenagakerjaan_number TEXT,
    npwp TEXT,
    ptkp_status TEXT DEFAULT 'TK/0' CHECK (ptkp_status IN ('TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3')),

    -- Banking
    bank_name TEXT,
    bank_account_number TEXT,
    bank_account_holder TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'probation', 'resigned', 'terminated')),
    exit_date DATE,
    exit_reason TEXT,

    -- Metadata
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT unique_employee_number_per_employer UNIQUE (employer_id, employee_number),
    CONSTRAINT unique_email_per_employer UNIQUE (employer_id, email),
    CONSTRAINT valid_contract_dates CHECK (contract_end_date IS NULL OR contract_end_date >= contract_start_date),
    CONSTRAINT valid_exit_date CHECK (exit_date IS NULL OR exit_date >= join_date)
);

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update profiles to link employee_id
ALTER TABLE profiles
    ADD CONSTRAINT fk_profiles_employee
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_employees_employer ON employees(employer_id);
CREATE INDEX idx_employees_user ON employees(user_id);
CREATE INDEX idx_employees_number ON employees(employer_id, employee_number);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_manager ON employees(manager_id);
CREATE INDEX idx_employees_email ON employees(email);

-- Function to generate employee number
CREATE OR REPLACE FUNCTION generate_employee_number(p_employer_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_year TEXT;
    v_count INTEGER;
    v_number TEXT;
BEGIN
    v_year := TO_CHAR(CURRENT_DATE, 'YYYY');

    SELECT COUNT(*) + 1 INTO v_count
    FROM employees
    WHERE employer_id = p_employer_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);

    v_number := 'EMP-' || v_year || '-' || LPAD(v_count::TEXT, 3, '0');

    RETURN v_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE employees IS 'Employee master data';
COMMENT ON FUNCTION generate_employee_number IS 'Auto-generate employee number: EMP-2024-001';
