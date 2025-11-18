-- Support Tickets Table
-- Handles customer support tickets with SLA tracking

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(50) UNIQUE NOT NULL,

  -- Ticket Info
  subject VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open' NOT NULL,
    CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')),
  priority VARCHAR(50) DEFAULT 'medium' NOT NULL,
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category VARCHAR(100),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Relationships
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id),
  requester_email VARCHAR(255) NOT NULL,
  requester_name VARCHAR(255) NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),

  -- SLA Tracking
  sla_due_at TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,

  -- Metadata
  is_escalated BOOLEAN DEFAULT false,
  escalated_at TIMESTAMPTZ,
  escalated_to UUID REFERENCES auth.users(id),
  satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
  satisfaction_comment TEXT,
  internal_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  INDEX idx_support_tickets_tenant_id (tenant_id),
  INDEX idx_support_tickets_status (status),
  INDEX idx_support_tickets_priority (priority),
  INDEX idx_support_tickets_assigned_to (assigned_to),
  INDEX idx_support_tickets_created_at (created_at),
  INDEX idx_support_tickets_sla_due (sla_due_at)
);

-- Support Ticket Messages Table
CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,

  -- Message Content
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Internal notes vs customer-facing
  is_system BOOLEAN DEFAULT false, -- System generated message

  -- Author
  author_id UUID NOT NULL REFERENCES auth.users(id),
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255) NOT NULL,

  -- Attachments
  attachments JSONB DEFAULT '[]'::JSONB, -- [{url, name, size, type}]

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  INDEX idx_support_ticket_messages_ticket_id (ticket_id),
  INDEX idx_support_ticket_messages_created_at (created_at)
);

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number() RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  ticket_count INTEGER;
BEGIN
  -- Get count of tickets created today
  SELECT COUNT(*) INTO ticket_count
  FROM public.support_tickets
  WHERE DATE(created_at) = CURRENT_DATE;

  -- Generate ticket number: TKT-YYYYMMDD-###
  new_number := 'TKT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((ticket_count + 1)::TEXT, 4, '0');

  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate SLA due time based on priority
CREATE OR REPLACE FUNCTION calculate_sla_due(priority_level VARCHAR) RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN CASE priority_level
    WHEN 'urgent' THEN NOW() + INTERVAL '4 hours'
    WHEN 'high' THEN NOW() + INTERVAL '8 hours'
    WHEN 'medium' THEN NOW() + INTERVAL '24 hours'
    WHEN 'low' THEN NOW() + INTERVAL '48 hours'
    ELSE NOW() + INTERVAL '24 hours'
  END;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ticket number
CREATE OR REPLACE FUNCTION auto_generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_ticket_number
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_ticket_number();

-- Trigger to auto-set SLA due time
CREATE OR REPLACE FUNCTION auto_set_sla_due()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sla_due_at IS NULL THEN
    NEW.sla_due_at := calculate_sla_due(NEW.priority);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_set_sla_due
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_sla_due();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_support_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();

  -- Set first_response_at if status changed from 'open'
  IF OLD.status = 'open' AND NEW.status != 'open' AND NEW.first_response_at IS NULL THEN
    NEW.first_response_at = NOW();
  END IF;

  -- Set resolved_at if status changed to 'resolved'
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at = NOW();
  END IF;

  -- Set closed_at if status changed to 'closed'
  IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    NEW.closed_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_support_ticket_timestamp
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_updated_at();

-- Trigger for ticket messages timestamp
CREATE OR REPLACE FUNCTION update_support_ticket_message_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_support_ticket_message_timestamp
  BEFORE UPDATE ON public.support_ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_message_updated_at();

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
-- Platform admins and support admins can see all tickets
CREATE POLICY "Platform admins can view all support tickets"
  ON public.support_tickets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug IN ('super_admin', 'platform_admin', 'support_admin')
    )
  );

-- Platform admins and support staff can manage tickets
CREATE POLICY "Platform admins can manage support tickets"
  ON public.support_tickets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug IN ('super_admin', 'platform_admin', 'support_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug IN ('super_admin', 'platform_admin', 'support_admin')
    )
  );

-- Tenant users can view their own tenant's tickets
CREATE POLICY "Tenant users can view own tenant tickets"
  ON public.support_tickets
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT ut.tenant_id FROM public.user_tenants ut
      WHERE ut.user_id = auth.uid()
    )
  );

-- Tenant users can create tickets for their tenant
CREATE POLICY "Tenant users can create tickets"
  ON public.support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT ut.tenant_id FROM public.user_tenants ut
      WHERE ut.user_id = auth.uid()
    )
  );

-- RLS Policies for support_ticket_messages
-- Platform admins can view all messages
CREATE POLICY "Platform admins can view all ticket messages"
  ON public.support_ticket_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug IN ('super_admin', 'platform_admin', 'support_admin')
    )
  );

-- Platform admins can create/update messages
CREATE POLICY "Platform admins can manage ticket messages"
  ON public.support_ticket_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug IN ('super_admin', 'platform_admin', 'support_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug IN ('super_admin', 'platform_admin', 'support_admin')
    )
  );

-- Tenant users can view non-internal messages for their tickets
CREATE POLICY "Tenant users can view ticket messages"
  ON public.support_ticket_messages
  FOR SELECT
  TO authenticated
  USING (
    NOT is_internal AND
    ticket_id IN (
      SELECT st.id FROM public.support_tickets st
      JOIN public.user_tenants ut ON st.tenant_id = ut.tenant_id
      WHERE ut.user_id = auth.uid()
    )
  );

-- Tenant users can create messages for their tickets
CREATE POLICY "Tenant users can create ticket messages"
  ON public.support_ticket_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    ticket_id IN (
      SELECT st.id FROM public.support_tickets st
      JOIN public.user_tenants ut ON st.tenant_id = ut.tenant_id
      WHERE ut.user_id = auth.uid()
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.support_ticket_messages TO authenticated;

-- Comments
COMMENT ON TABLE public.support_tickets IS 'Customer support tickets with SLA tracking';
COMMENT ON TABLE public.support_ticket_messages IS 'Messages/comments for support tickets';
COMMENT ON COLUMN public.support_tickets.sla_due_at IS 'SLA deadline based on priority';
COMMENT ON COLUMN public.support_tickets.first_response_at IS 'First response from support team';
COMMENT ON COLUMN public.support_ticket_messages.is_internal IS 'Internal note visible only to support staff';
