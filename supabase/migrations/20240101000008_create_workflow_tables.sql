-- Workflow instances (for tracking multi-step processes)
CREATE TABLE workflow_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,

    -- Workflow Details
    workflow_name TEXT NOT NULL, -- "employee-onboarding", "leave-approval", "payroll-processing"
    workflow_type TEXT NOT NULL CHECK (workflow_type IN (
        'onboarding',
        'offboarding',
        'leave_approval',
        'document_approval',
        'performance_review',
        'payroll_processing',
        'custom'
    )),

    -- Entity Reference
    entity_type TEXT NOT NULL, -- "employee", "leave_request", "payroll_period"
    entity_id UUID NOT NULL,

    -- Progress
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER NOT NULL,
    completed_steps INTEGER DEFAULT 0,
    progress_percentage NUMERIC(5, 2) DEFAULT 0,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),

    -- Steps Configuration
    steps_config JSONB NOT NULL,
    /* Example:
    [
        {
            "step": 1,
            "name": "Upload Documents",
            "type": "document_upload",
            "required_docs": ["ktp", "npwp"],
            "status": "completed",
            "completed_at": "2024-01-15T10:00:00Z"
        },
        {
            "step": 2,
            "name": "BPJS Registration",
            "type": "form_submission",
            "status": "in_progress"
        }
    ]
    */

    -- AI Decision
    ai_confidence_score NUMERIC(3, 2),
    ai_decision TEXT, -- "auto_approve", "manual_review", "escalate"
    ai_reasoning TEXT,
    auto_approved BOOLEAN DEFAULT false,

    -- Assignments
    assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ,

    -- Timeline
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    due_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT valid_progress CHECK (current_step <= total_steps),
    CONSTRAINT valid_progress_percentage CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);

CREATE TRIGGER update_workflow_instances_updated_at
    BEFORE UPDATE ON workflow_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Workflow templates (reusable workflow definitions)
CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE, -- NULL for system templates

    -- Template Details
    template_name TEXT NOT NULL,
    workflow_type TEXT NOT NULL,
    description TEXT,

    -- Steps Definition
    steps JSONB NOT NULL,
    /* Example:
    [
        {
            "step": 1,
            "name": "Document Upload",
            "type": "document_upload",
            "required_docs": ["ktp", "npwp", "bpjs"],
            "ai_extraction": true,
            "timeout_days": 3
        },
        {
            "step": 2,
            "name": "Manager Approval",
            "type": "approval",
            "approver_role": "manager",
            "auto_approve_if_confidence": 0.85
        }
    ]
    */

    -- Settings
    is_active BOOLEAN DEFAULT true,
    is_system_template BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_template_name UNIQUE (employer_id, template_name)
);

CREATE TRIGGER update_workflow_templates_updated_at
    BEFORE UPDATE ON workflow_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_workflow_instances_employer ON workflow_instances(employer_id);
CREATE INDEX idx_workflow_instances_entity ON workflow_instances(entity_type, entity_id);
CREATE INDEX idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX idx_workflow_instances_assigned ON workflow_instances(assigned_to) WHERE status = 'in_progress';
CREATE INDEX idx_workflow_templates_employer ON workflow_templates(employer_id);
CREATE INDEX idx_workflow_templates_type ON workflow_templates(workflow_type);

-- Function to calculate workflow progress
CREATE OR REPLACE FUNCTION calculate_workflow_progress(
    p_steps_config JSONB
)
RETURNS NUMERIC AS $$
DECLARE
    v_total_steps INTEGER;
    v_completed_steps INTEGER;
BEGIN
    v_total_steps := jsonb_array_length(p_steps_config);

    SELECT COUNT(*)::INTEGER INTO v_completed_steps
    FROM jsonb_array_elements(p_steps_config) AS step
    WHERE step->>'status' = 'completed';

    IF v_total_steps = 0 THEN
        RETURN 0;
    END IF;

    RETURN ROUND((v_completed_steps::NUMERIC / v_total_steps::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-update workflow progress
CREATE OR REPLACE FUNCTION auto_update_workflow_progress()
RETURNS TRIGGER AS $$
BEGIN
    NEW.completed_steps := (
        SELECT COUNT(*)::INTEGER
        FROM jsonb_array_elements(NEW.steps_config) AS step
        WHERE step->>'status' = 'completed'
    );

    NEW.progress_percentage := calculate_workflow_progress(NEW.steps_config);

    -- Auto-complete workflow if all steps done
    IF NEW.completed_steps = NEW.total_steps AND NEW.status != 'completed' THEN
        NEW.status := 'completed';
        NEW.completed_at := CURRENT_TIMESTAMP;
    END IF;

    -- Update current step to first incomplete step
    SELECT COALESCE(
        (step->>'step')::INTEGER,
        NEW.total_steps + 1
    ) INTO NEW.current_step
    FROM jsonb_array_elements(NEW.steps_config) AS step
    WHERE step->>'status' != 'completed'
    ORDER BY (step->>'step')::INTEGER
    LIMIT 1;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workflow_progress
    BEFORE INSERT OR UPDATE ON workflow_instances
    FOR EACH ROW
    EXECUTE FUNCTION auto_update_workflow_progress();

COMMENT ON TABLE workflow_instances IS 'Multi-step workflow tracking with AI automation';
COMMENT ON TABLE workflow_templates IS 'Reusable workflow definitions';
COMMENT ON FUNCTION calculate_workflow_progress IS 'Calculate workflow completion percentage';
