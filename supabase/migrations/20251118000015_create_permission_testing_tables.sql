-- Permission Testing & Simulation System
-- Allows platform admins to test and simulate user permissions

-- Permission Test Scenarios
CREATE TABLE permission_test_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Test Configuration
  test_user_id UUID REFERENCES users(id),
  test_role_id UUID REFERENCES platform_roles(id),
  test_tenant_id UUID REFERENCES tenants(id),

  -- Permissions to Test
  permissions_to_test JSONB NOT NULL,
    -- Array of permission objects: [{ permission: 'employee.create', expected: true }, ...]

  -- Test Results
  last_run_at TIMESTAMPTZ,
  last_run_result JSONB,
    -- { passed: 5, failed: 2, total: 7, details: [...] }

  -- Management
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Permission Test Results (Historical)
CREATE TABLE permission_test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  scenario_id UUID REFERENCES permission_test_scenarios(id) ON DELETE CASCADE,

  -- Test Context
  test_user_id UUID REFERENCES users(id),
  test_role_id UUID REFERENCES platform_roles(id),

  -- Results
  permissions_tested INTEGER NOT NULL,
  permissions_passed INTEGER NOT NULL,
  permissions_failed INTEGER NOT NULL,

  result_details JSONB NOT NULL,
    -- Detailed results for each permission tested

  -- Metadata
  executed_by UUID REFERENCES users(id),
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Permission Conflicts Log
CREATE TABLE permission_conflicts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Conflict Details
  user_id UUID REFERENCES users(id),
  permission VARCHAR(255) NOT NULL,

  -- Conflicting Roles
  granting_roles JSONB NOT NULL, -- Array of role IDs that grant this permission
  denying_roles JSONB, -- Array of role IDs that deny this permission

  conflict_type VARCHAR(100) NOT NULL,
    -- 'duplicate_grant', 'grant_and_deny', 'ambiguous_scope'

  resolution_status VARCHAR(50) DEFAULT 'open',
    -- 'open', 'resolved', 'ignored'

  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),

  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_conflict_type CHECK (conflict_type IN ('duplicate_grant', 'grant_and_deny', 'ambiguous_scope')),
  CONSTRAINT valid_resolution_status CHECK (resolution_status IN ('open', 'resolved', 'ignored'))
);

-- Indexes
CREATE INDEX idx_permission_test_scenarios_active ON permission_test_scenarios(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_permission_test_scenarios_user ON permission_test_scenarios(test_user_id);
CREATE INDEX idx_permission_test_scenarios_role ON permission_test_scenarios(test_role_id);

CREATE INDEX idx_permission_test_results_scenario ON permission_test_results(scenario_id);
CREATE INDEX idx_permission_test_results_executed ON permission_test_results(executed_at DESC);

CREATE INDEX idx_permission_conflicts_user ON permission_conflicts(user_id);
CREATE INDEX idx_permission_conflicts_permission ON permission_conflicts(permission);
CREATE INDEX idx_permission_conflicts_status ON permission_conflicts(resolution_status) WHERE resolution_status = 'open';

-- Row Level Security
ALTER TABLE permission_test_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_conflicts ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Platform admins only
CREATE POLICY "Platform admins can manage test scenarios"
  ON permission_test_scenarios FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug IN ('super_admin', 'platform_admin')
    )
  );

CREATE POLICY "Platform admins can view test results"
  ON permission_test_results FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug IN ('super_admin', 'platform_admin')
    )
  );

CREATE POLICY "Platform admins can manage conflicts"
  ON permission_conflicts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug IN ('super_admin', 'platform_admin')
    )
  );

-- Functions

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id UUID,
  p_permission VARCHAR,
  p_tenant_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN := FALSE;
  v_role_record RECORD;
BEGIN
  -- Get all roles for the user
  FOR v_role_record IN
    SELECT pr.permissions
    FROM user_roles ur
    JOIN platform_roles pr ON ur.role_id = pr.id
    WHERE ur.user_id = p_user_id
      AND (p_tenant_id IS NULL OR ur.tenant_id = p_tenant_id OR ur.tenant_id IS NULL)
  LOOP
    -- Check if permission exists in role's permissions
    IF v_role_record.permissions ? p_permission THEN
      v_has_permission := TRUE;
      EXIT; -- Found permission, no need to continue
    END IF;

    -- Check for wildcard permissions
    IF v_role_record.permissions ? '*' THEN
      v_has_permission := TRUE;
      EXIT;
    END IF;

    -- Check for module wildcard (e.g., 'employee.*')
    IF position('.' IN p_permission) > 0 THEN
      DECLARE
        v_module VARCHAR;
      BEGIN
        v_module := split_part(p_permission, '.', 1) || '.*';
        IF v_role_record.permissions ? v_module THEN
          v_has_permission := TRUE;
          EXIT;
        END IF;
      END;
    END IF;
  END LOOP;

  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql;

-- Function to detect permission conflicts
CREATE OR REPLACE FUNCTION detect_permission_conflicts(p_user_id UUID)
RETURNS TABLE (
  permission VARCHAR,
  conflict_type VARCHAR,
  granting_roles JSONB,
  denying_roles JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH user_permissions AS (
    SELECT
      ur.user_id,
      pr.id AS role_id,
      pr.name AS role_name,
      jsonb_array_elements_text(pr.permissions) AS permission
    FROM user_roles ur
    JOIN platform_roles pr ON ur.role_id = pr.id
    WHERE ur.user_id = p_user_id
  ),
  permission_counts AS (
    SELECT
      up.permission,
      jsonb_agg(jsonb_build_object('role_id', up.role_id, 'role_name', up.role_name)) AS roles,
      COUNT(*) AS role_count
    FROM user_permissions up
    GROUP BY up.permission
  )
  SELECT
    pc.permission::VARCHAR,
    'duplicate_grant'::VARCHAR AS conflict_type,
    pc.roles AS granting_roles,
    NULL::JSONB AS denying_roles
  FROM permission_counts pc
  WHERE pc.role_count > 1; -- Same permission granted by multiple roles
END;
$$ LANGUAGE plpgsql;

-- Seed some example test scenarios
INSERT INTO permission_test_scenarios (name, description, permissions_to_test, created_by) VALUES
  (
    'Basic Employee Management',
    'Test basic employee CRUD permissions',
    jsonb_build_array(
      jsonb_build_object('permission', 'employee.create', 'expected', true),
      jsonb_build_object('permission', 'employee.read', 'expected', true),
      jsonb_build_object('permission', 'employee.update', 'expected', true),
      jsonb_build_object('permission', 'employee.delete', 'expected', false)
    ),
    NULL
  ),
  (
    'Payroll Access',
    'Test payroll module access permissions',
    jsonb_build_array(
      jsonb_build_object('permission', 'payroll.read', 'expected', true),
      jsonb_build_object('permission', 'payroll.process', 'expected', true),
      jsonb_build_object('permission', 'payroll.approve', 'expected', true)
    ),
    NULL
  ),
  (
    'Platform Admin Access',
    'Test platform administrator permissions',
    jsonb_build_array(
      jsonb_build_object('permission', 'tenant.create', 'expected', true),
      jsonb_build_object('permission', 'tenant.read', 'expected', true),
      jsonb_build_object('permission', 'tenant.update', 'expected', true),
      jsonb_build_object('permission', 'tenant.delete', 'expected', true),
      jsonb_build_object('permission', 'user.impersonate', 'expected', true)
    ),
    NULL
  );

COMMENT ON TABLE permission_test_scenarios IS 'Test scenarios for permission testing and simulation';
COMMENT ON TABLE permission_test_results IS 'Historical results of permission tests';
COMMENT ON TABLE permission_conflicts IS 'Detected permission conflicts requiring resolution';
COMMENT ON FUNCTION check_user_permission IS 'Check if a user has a specific permission';
COMMENT ON FUNCTION detect_permission_conflicts IS 'Detect permission conflicts for a user';
