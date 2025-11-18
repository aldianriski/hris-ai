-- Migration: Create Platform Impersonation Tables
-- Description: Tables for tracking platform admin impersonation sessions and actions
-- Created: 2024-11-18

-- Table: platform_impersonation_sessions
-- Tracks all impersonation sessions by platform admins
CREATE TABLE IF NOT EXISTS platform_impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Who and what
  platform_admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Session details
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,

  -- Tracking
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('active', 'ended', 'expired', 'terminated')),
  CONSTRAINT valid_duration CHECK (ended_at IS NULL OR ended_at > started_at),
  CONSTRAINT valid_expiry CHECK (expires_at > started_at)
);

-- Indexes for platform_impersonation_sessions
CREATE INDEX idx_impersonation_sessions_admin ON platform_impersonation_sessions(platform_admin_id);
CREATE INDEX idx_impersonation_sessions_target ON platform_impersonation_sessions(target_user_id);
CREATE INDEX idx_impersonation_sessions_tenant ON platform_impersonation_sessions(tenant_id);
CREATE INDEX idx_impersonation_sessions_status ON platform_impersonation_sessions(status);
CREATE INDEX idx_impersonation_sessions_active ON platform_impersonation_sessions(status, expires_at) WHERE status = 'active';
CREATE INDEX idx_impersonation_sessions_created ON platform_impersonation_sessions(created_at DESC);

-- Table: platform_impersonation_actions
-- Tracks all actions performed during impersonation sessions
CREATE TABLE IF NOT EXISTS platform_impersonation_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES platform_impersonation_sessions(id) ON DELETE CASCADE,

  -- Action details
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,

  -- Request details
  method VARCHAR(10),
  path TEXT,

  -- Additional context
  metadata JSONB,

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for platform_impersonation_actions
CREATE INDEX idx_impersonation_actions_session ON platform_impersonation_actions(session_id);
CREATE INDEX idx_impersonation_actions_created ON platform_impersonation_actions(created_at DESC);
CREATE INDEX idx_impersonation_actions_resource ON platform_impersonation_actions(resource_type, resource_id);
CREATE INDEX idx_impersonation_actions_action ON platform_impersonation_actions(action);

-- Row Level Security Policies
ALTER TABLE platform_impersonation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_impersonation_actions ENABLE ROW LEVEL SECURITY;

-- Only platform admins can view impersonation sessions
CREATE POLICY "Platform admins can view all impersonation sessions"
  ON platform_impersonation_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_users
      WHERE platform_users.user_id = auth.uid()
      AND platform_users.role IN ('super_admin', 'platform_admin', 'support_admin')
    )
  );

-- Only platform admins can insert impersonation sessions
CREATE POLICY "Platform admins can create impersonation sessions"
  ON platform_impersonation_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_users
      WHERE platform_users.user_id = auth.uid()
      AND platform_users.role IN ('super_admin', 'platform_admin')
    )
    AND platform_admin_id = auth.uid()
  );

-- Only the session creator can update their sessions
CREATE POLICY "Platform admins can update their own sessions"
  ON platform_impersonation_sessions
  FOR UPDATE
  TO authenticated
  USING (platform_admin_id = auth.uid())
  WITH CHECK (platform_admin_id = auth.uid());

-- Platform admins can view all impersonation actions
CREATE POLICY "Platform admins can view all impersonation actions"
  ON platform_impersonation_actions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_users
      WHERE platform_users.user_id = auth.uid()
      AND platform_users.role IN ('super_admin', 'platform_admin', 'support_admin')
    )
  );

-- Only system can insert actions (through API)
CREATE POLICY "System can insert impersonation actions"
  ON platform_impersonation_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_impersonation_sessions
      WHERE platform_impersonation_sessions.id = session_id
      AND platform_impersonation_sessions.platform_admin_id = auth.uid()
    )
  );

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_impersonation_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_update_impersonation_session_updated_at
  BEFORE UPDATE ON platform_impersonation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_impersonation_session_updated_at();

-- Function to expire old sessions
CREATE OR REPLACE FUNCTION expire_old_impersonation_sessions()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE platform_impersonation_sessions
  SET status = 'expired',
      ended_at = expires_at,
      updated_at = NOW()
  WHERE status = 'active'
    AND expires_at < NOW();

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE platform_impersonation_sessions IS 'Tracks all platform admin impersonation sessions for security and compliance';
COMMENT ON TABLE platform_impersonation_actions IS 'Audit log of all actions performed during impersonation sessions';

COMMENT ON COLUMN platform_impersonation_sessions.reason IS 'Business justification for impersonation (required for compliance)';
COMMENT ON COLUMN platform_impersonation_sessions.status IS 'Session status: active, ended (manually), expired (timeout), terminated (browser close)';
COMMENT ON COLUMN platform_impersonation_sessions.expires_at IS 'Auto-expiry timestamp (default 2 hours from start)';
COMMENT ON COLUMN platform_impersonation_actions.metadata IS 'Additional context: query params, request body, response status, etc.';
