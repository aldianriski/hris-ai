-- Onboarding/Offboarding Workflows Table
-- Separate from automation workflows (workflow_instances)
-- This table tracks employee onboarding and offboarding processes

CREATE TABLE onboarding_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,

    -- Employee Reference
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employee_name TEXT NOT NULL,

    -- Workflow Details
    workflow_type TEXT NOT NULL CHECK (workflow_type IN ('onboarding', 'offboarding')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),

    -- Steps (stored as JSONB array)
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    /* Example:
    [
        {
            "stepNumber": 1,
            "name": "Send Welcome Email",
            "status": "completed",
            "assignedTo": "HR Team",
            "completedBy": "hr@company.com",
            "completedAt": "2024-01-15T10:00:00Z",
            "notes": "Welcome email sent successfully"
        },
        {
            "stepNumber": 2,
            "name": "Prepare Workspace",
            "status": "in_progress",
            "assignedTo": "IT Team"
        },
        {
            "stepNumber": 3,
            "name": "Setup Equipment",
            "status": "pending",
            "assignedTo": "IT Team"
        }
    ]
    */

    -- Progress Tracking
    current_step INTEGER DEFAULT 1,

    -- Timeline
    start_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Creator
    created_by UUID NOT NULL,
    created_by_email TEXT NOT NULL,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT unique_active_workflow_per_employee UNIQUE (employee_id, workflow_type)
        WHERE status IN ('pending', 'in_progress')
);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_onboarding_workflows_updated_at
    BEFORE UPDATE ON onboarding_workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_onboarding_workflows_employer ON onboarding_workflows(employer_id);
CREATE INDEX idx_onboarding_workflows_employee ON onboarding_workflows(employee_id);
CREATE INDEX idx_onboarding_workflows_status ON onboarding_workflows(status);
CREATE INDEX idx_onboarding_workflows_type ON onboarding_workflows(workflow_type);
CREATE INDEX idx_onboarding_workflows_created ON onboarding_workflows(created_at DESC);

-- Comments
COMMENT ON TABLE onboarding_workflows IS 'Employee onboarding and offboarding workflow tracking';
COMMENT ON COLUMN onboarding_workflows.steps IS 'Array of workflow steps with status tracking';
COMMENT ON COLUMN onboarding_workflows.current_step IS 'Current active step number';
