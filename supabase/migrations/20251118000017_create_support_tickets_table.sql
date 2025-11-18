-- Support Ticketing System
-- Complements Live Chat with structured ticket management and SLA tracking

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Ticket Identification
  ticket_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., "TKT-2024-001234"

  -- Requester
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),

  -- Assignment
  assigned_to UUID REFERENCES users(id), -- Support agent
  assigned_at TIMESTAMPTZ,

  -- Ticket Details
  subject VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'technical', 'billing', 'feature_request', 'bug_report', 'general'
  priority VARCHAR(50) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status VARCHAR(50) NOT NULL DEFAULT 'open',
    -- 'open', 'in_progress', 'waiting_customer', 'waiting_internal', 'resolved', 'closed', 'cancelled'

  -- SLA Tracking
  sla_due_at TIMESTAMPTZ, -- When ticket must be resolved
  first_response_at TIMESTAMPTZ,
  first_response_sla_met BOOLEAN,
  resolution_sla_met BOOLEAN,

  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  resolution_notes TEXT,

  -- Customer Satisfaction
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  satisfaction_feedback TEXT,
  rated_at TIMESTAMPTZ,

  -- Tags
  tags TEXT[], -- Array of tags for organization

  -- Related Resources
  related_chat_session_id UUID, -- Link to chat session if escalated from chat
  related_invoice_id UUID,  -- If ticket is about a specific invoice

  -- Closure
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES users(id),

  -- Metadata
  metadata JSONB, -- Additional custom fields

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_category CHECK (category IN ('technical', 'billing', 'feature_request', 'bug_report', 'general')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  CONSTRAINT valid_status CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'waiting_internal', 'resolved', 'closed', 'cancelled'))
);

-- Ticket Comments/Replies
CREATE TABLE support_ticket_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,

  -- Author
  user_id UUID NOT NULL REFERENCES users(id),
  user_type VARCHAR(50) NOT NULL, -- 'customer', 'agent', 'system'

  -- Content
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE, -- Internal notes not visible to customer

  -- Attachments
  attachments JSONB, -- Array of attachment objects

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_user_type CHECK (user_type IN ('customer', 'agent', 'system'))
);

-- Ticket Attachments
CREATE TABLE support_ticket_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES support_ticket_comments(id) ON DELETE CASCADE,

  -- File Details
  file_name VARCHAR(500) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- bytes
  file_type VARCHAR(100) NOT NULL,

  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ticket Status History
CREATE TABLE support_ticket_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,

  from_status VARCHAR(50),
  to_status VARCHAR(50) NOT NULL,

  changed_by UUID NOT NULL REFERENCES users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  notes TEXT
);

-- SLA Policies
CREATE TABLE support_sla_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Applicability
  applies_to_plan VARCHAR(50), -- 'starter', 'professional', 'enterprise', 'all'
  applies_to_priority VARCHAR(50), -- 'low', 'medium', 'high', 'urgent', 'all'

  -- SLA Targets (in minutes)
  first_response_time_minutes INTEGER NOT NULL,
  resolution_time_minutes INTEGER NOT NULL,

  -- Business Hours
  use_business_hours BOOLEAN DEFAULT FALSE,
  business_hours_start TIME,
  business_hours_end TIME,
  business_days INTEGER[], -- 1-7 (Monday-Sunday)

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_support_tickets_ticket_number ON support_tickets(ticket_number);
CREATE INDEX idx_support_tickets_tenant ON support_tickets(tenant_id);
CREATE INDEX idx_support_tickets_created_by ON support_tickets(created_by);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX idx_support_tickets_sla_due ON support_tickets(sla_due_at) WHERE status NOT IN ('resolved', 'closed', 'cancelled');

CREATE INDEX idx_support_ticket_comments_ticket ON support_ticket_comments(ticket_id);
CREATE INDEX idx_support_ticket_comments_created ON support_ticket_comments(created_at ASC);

CREATE INDEX idx_support_ticket_attachments_ticket ON support_ticket_attachments(ticket_id);
CREATE INDEX idx_support_ticket_status_history_ticket ON support_ticket_status_history(ticket_id);

-- Row Level Security
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_sla_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Tickets
-- Users can view tickets they created or are assigned to
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  USING (
    created_by = auth.uid() OR
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug IN ('super_admin', 'platform_admin', 'platform_support')
    )
  );

-- Users can create tickets
CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Platform admins can manage all tickets
CREATE POLICY "Platform admins can manage tickets"
  ON support_tickets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug IN ('super_admin', 'platform_admin', 'platform_support')
    )
  );

-- RLS for Comments (same as tickets)
CREATE POLICY "Users can view ticket comments"
  ON support_ticket_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets st
      WHERE st.id = ticket_id
      AND (
        st.created_by = auth.uid() OR
        st.assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM user_roles ur
          JOIN platform_roles pr ON ur.role_id = pr.id
          WHERE ur.user_id = auth.uid()
          AND pr.slug IN ('super_admin', 'platform_admin', 'platform_support')
        )
      )
    )
  );

CREATE POLICY "Users can add comments to their tickets"
  ON support_ticket_comments FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Remaining RLS policies (similar pattern)
CREATE POLICY "Platform admins manage attachments"
  ON support_ticket_attachments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug IN ('super_admin', 'platform_admin', 'platform_support')
    )
  );

CREATE POLICY "Platform admins manage SLA policies"
  ON support_sla_policies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug IN ('super_admin', 'platform_admin', 'platform_support')
    )
  );

-- Functions

-- Generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  year_str TEXT;
  seq_num INTEGER;
  ticket_num TEXT;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');

  -- Get next sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 10) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM support_tickets
  WHERE ticket_number LIKE 'TKT-' || year_str || '-%';

  ticket_num := 'TKT-' || year_str || '-' || LPAD(seq_num::TEXT, 6, '0');

  RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate ticket number on insert
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_number
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();

-- Calculate SLA due date based on priority and plan
CREATE OR REPLACE FUNCTION calculate_sla_due_date(
  p_priority VARCHAR,
  p_plan VARCHAR,
  p_created_at TIMESTAMPTZ
)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_resolution_minutes INTEGER;
  v_sla_policy RECORD;
BEGIN
  -- Get applicable SLA policy
  SELECT * INTO v_sla_policy
  FROM support_sla_policies
  WHERE is_active = TRUE
    AND (applies_to_priority = p_priority OR applies_to_priority = 'all')
    AND (applies_to_plan = p_plan OR applies_to_plan = 'all')
  ORDER BY
    CASE WHEN applies_to_priority = p_priority THEN 1 ELSE 2 END,
    CASE WHEN applies_to_plan = p_plan THEN 1 ELSE 2 END
  LIMIT 1;

  IF v_sla_policy IS NULL THEN
    -- Default SLA if no policy found
    CASE p_priority
      WHEN 'urgent' THEN v_resolution_minutes := 240; -- 4 hours
      WHEN 'high' THEN v_resolution_minutes := 480; -- 8 hours
      WHEN 'medium' THEN v_resolution_minutes := 1440; -- 24 hours
      ELSE v_resolution_minutes := 4320; -- 72 hours
    END CASE;
  ELSE
    v_resolution_minutes := v_sla_policy.resolution_time_minutes;
  END IF;

  RETURN p_created_at + (v_resolution_minutes || ' minutes')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Set SLA due date on ticket creation
CREATE OR REPLACE FUNCTION set_sla_due_date()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_plan VARCHAR(50);
BEGIN
  -- Get tenant plan
  SELECT subscription_plan INTO v_tenant_plan
  FROM tenants
  WHERE id = NEW.tenant_id;

  NEW.sla_due_at := calculate_sla_due_date(NEW.priority, v_tenant_plan, NEW.created_at);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_sla_due_date
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_sla_due_date();

-- Track status changes
CREATE OR REPLACE FUNCTION track_ticket_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO support_ticket_status_history (
      ticket_id,
      from_status,
      to_status,
      changed_by
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      NEW.assigned_to -- Simplified; in real app track actual user making change
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_ticket_status_change
  AFTER UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION track_ticket_status_change();

-- Seed default SLA policies
INSERT INTO support_sla_policies (name, description, applies_to_plan, applies_to_priority, first_response_time_minutes, resolution_time_minutes) VALUES
  ('Enterprise Urgent', 'Enterprise plan urgent tickets', 'enterprise', 'urgent', 30, 240),
  ('Enterprise High', 'Enterprise plan high priority', 'enterprise', 'high', 60, 480),
  ('Professional Urgent', 'Professional plan urgent tickets', 'professional', 'urgent', 60, 480),
  ('Professional High', 'Professional plan high priority', 'professional', 'high', 120, 960),
  ('Standard Urgent', 'Standard plan urgent tickets', 'starter', 'urgent', 120, 960),
  ('Default Medium', 'Default medium priority', 'all', 'medium', 240, 1440),
  ('Default Low', 'Default low priority', 'all', 'low', 1440, 4320);

COMMENT ON TABLE support_tickets IS 'Support ticket management system with SLA tracking';
COMMENT ON TABLE support_ticket_comments IS 'Comments and replies on support tickets';
COMMENT ON TABLE support_sla_policies IS 'SLA policies for different plans and priorities';
