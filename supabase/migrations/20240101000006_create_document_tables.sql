-- Employee documents (Module 6: Document Management)
CREATE TABLE employee_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,

    -- Document Details
    document_type TEXT NOT NULL CHECK (document_type IN (
        'ktp', 'npwp', 'bpjs_kesehatan', 'bpjs_ketenagakerjaan',
        'contract', 'contract_amendment', 'offer_letter',
        'certificate', 'diploma', 'cv', 'photo',
        'warning_letter', 'resignation_letter', 'reference_letter',
        'custom'
    )),
    document_category TEXT, -- "personal", "employment", "certification", "legal"
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type TEXT,

    -- Storage
    storage_path TEXT NOT NULL, -- Supabase Storage path
    storage_bucket TEXT DEFAULT 'employee-documents',
    download_url TEXT,

    -- AI Extracted Data
    extracted_data JSONB,
    /* Example for KTP:
    {
        "nik": "1234567890123456",
        "name": "John Doe",
        "dob": "1990-01-01",
        "address": "Jakarta",
        "extraction_confidence": 0.95
    }
    */
    extraction_confidence NUMERIC(3, 2),
    extracted_at TIMESTAMPTZ,

    -- Validity
    issue_date DATE,
    expiry_date DATE,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,

    -- Reminders
    reminder_sent_at TIMESTAMPTZ,
    reminder_days_before INTEGER DEFAULT 30,

    -- Version Control
    version INTEGER DEFAULT 1,
    replaces_document_id UUID REFERENCES employee_documents(id) ON DELETE SET NULL,

    -- Access Control
    is_confidential BOOLEAN DEFAULT false,
    access_restricted_to TEXT[], -- Employee IDs who can access

    -- Metadata
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT valid_expiry_date CHECK (expiry_date IS NULL OR expiry_date >= issue_date)
);

CREATE TRIGGER update_employee_documents_updated_at
    BEFORE UPDATE ON employee_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Document templates (for contracts, letters, etc.)
CREATE TABLE document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,

    -- Template Details
    template_name TEXT NOT NULL,
    template_type TEXT NOT NULL CHECK (template_type IN (
        'employment_contract_pkwt',
        'employment_contract_pkwtt',
        'offer_letter',
        'warning_letter',
        'termination_letter',
        'reference_letter',
        'custom'
    )),
    description TEXT,

    -- Content
    content_html TEXT NOT NULL,
    content_variables JSONB DEFAULT '[]'::jsonb,
    /* Example variables:
    [
        {"key": "employee_name", "label": "Employee Name", "type": "text"},
        {"key": "start_date", "label": "Start Date", "type": "date"},
        {"key": "salary", "label": "Salary", "type": "number"}
    ]
    */

    -- Settings
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_template_name_per_employer UNIQUE (employer_id, template_name)
);

CREATE TRIGGER update_document_templates_updated_at
    BEFORE UPDATE ON document_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_employee_documents_employee ON employee_documents(employee_id);
CREATE INDEX idx_employee_documents_employer ON employee_documents(employer_id);
CREATE INDEX idx_employee_documents_type ON employee_documents(document_type);
CREATE INDEX idx_employee_documents_expiry ON employee_documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_employee_documents_expiring_soon ON employee_documents(expiry_date)
    WHERE expiry_date IS NOT NULL
    AND expiry_date <= CURRENT_DATE + INTERVAL '60 days'
    AND expiry_date >= CURRENT_DATE;
CREATE INDEX idx_document_templates_employer ON document_templates(employer_id);
CREATE INDEX idx_document_templates_type ON document_templates(template_type);

-- Function to check expiring documents
CREATE OR REPLACE FUNCTION get_expiring_documents(
    p_employer_id UUID,
    p_days_before INTEGER DEFAULT 30
)
RETURNS TABLE (
    document_id UUID,
    employee_id UUID,
    employee_name TEXT,
    document_type TEXT,
    file_name TEXT,
    expiry_date DATE,
    days_until_expiry INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ed.id AS document_id,
        ed.employee_id,
        e.full_name AS employee_name,
        ed.document_type,
        ed.file_name,
        ed.expiry_date,
        (ed.expiry_date - CURRENT_DATE)::INTEGER AS days_until_expiry
    FROM employee_documents ed
    JOIN employees e ON e.id = ed.employee_id
    WHERE ed.employer_id = p_employer_id
    AND ed.expiry_date IS NOT NULL
    AND ed.expiry_date >= CURRENT_DATE
    AND ed.expiry_date <= CURRENT_DATE + (p_days_before || ' days')::INTERVAL
    ORDER BY ed.expiry_date ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE employee_documents IS 'Employee documents with AI data extraction and expiry tracking';
COMMENT ON TABLE document_templates IS 'Document templates for auto-generation';
COMMENT ON FUNCTION get_expiring_documents IS 'Get documents expiring within specified days';
