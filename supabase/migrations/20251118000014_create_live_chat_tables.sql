-- Live Chat System
-- Enables real-time support chat between tenants and platform support team

-- Chat Sessions
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Participants
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id), -- Tenant user who initiated chat
  assigned_agent_id UUID REFERENCES users(id), -- Platform support agent

  -- Session Details
  status VARCHAR(50) NOT NULL DEFAULT 'open',
    -- 'open', 'active', 'waiting', 'resolved', 'closed'

  -- Metadata
  subject VARCHAR(500),
  category VARCHAR(50), -- 'technical', 'billing', 'general'
  priority VARCHAR(50) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'

  -- Tenant Plan (for routing)
  tenant_plan VARCHAR(50),

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_response_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,

  -- Rating
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  feedback TEXT,

  -- Metrics
  response_time_seconds INTEGER, -- Time to first response
  resolution_time_seconds INTEGER, -- Time to close

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('open', 'active', 'waiting', 'resolved', 'closed'))
);

-- Chat Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,

  -- Message Details
  sender_id UUID NOT NULL REFERENCES users(id),
  sender_type VARCHAR(50) NOT NULL, -- 'user', 'agent', 'system'

  message_type VARCHAR(50) NOT NULL DEFAULT 'text',
    -- 'text', 'file', 'image', 'system_notification'

  content TEXT,

  -- File Attachment
  file_url TEXT,
  file_name VARCHAR(500),
  file_size INTEGER,
  file_type VARCHAR(100),

  -- Message Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB, -- For additional data (e.g., typing indicators, reactions)

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_sender_type CHECK (sender_type IN ('user', 'agent', 'system')),
  CONSTRAINT valid_message_type CHECK (message_type IN ('text', 'file', 'image', 'system_notification'))
);

-- Canned Responses (Pre-written replies for agents)
CREATE TABLE chat_canned_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  shortcut VARCHAR(50) NOT NULL UNIQUE, -- e.g., '/greeting', '/thanks'
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,

  category VARCHAR(100), -- 'greeting', 'technical', 'billing', 'closing'

  -- Usage tracking
  usage_count INTEGER DEFAULT 0,

  -- Management
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent Availability
CREATE TABLE chat_agent_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  agent_id UUID NOT NULL REFERENCES users(id) UNIQUE,

  status VARCHAR(50) NOT NULL DEFAULT 'offline',
    -- 'online', 'away', 'busy', 'offline'

  custom_status_message VARCHAR(500),

  -- Capacity
  max_concurrent_chats INTEGER DEFAULT 5,
  current_active_chats INTEGER DEFAULT 0,

  -- Auto-assignment
  accepts_new_chats BOOLEAN DEFAULT TRUE,

  last_seen_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('online', 'away', 'busy', 'offline'))
);

-- Indexes for performance
CREATE INDEX idx_chat_sessions_tenant ON chat_sessions(tenant_id);
CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_agent ON chat_sessions(assigned_agent_id);
CREATE INDEX idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX idx_chat_sessions_created ON chat_sessions(created_at DESC);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at ASC);
CREATE INDEX idx_chat_messages_unread ON chat_messages(session_id, is_read) WHERE is_read = FALSE;

CREATE INDEX idx_canned_responses_shortcut ON chat_canned_responses(shortcut);
CREATE INDEX idx_canned_responses_category ON chat_canned_responses(category);

CREATE INDEX idx_agent_availability_status ON chat_agent_availability(status) WHERE status IN ('online', 'away');

-- Row Level Security (RLS)
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_canned_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_agent_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Chat Sessions
-- Users can view their own sessions
CREATE POLICY "Users can view own chat sessions"
  ON chat_sessions FOR SELECT
  USING (user_id = auth.uid());

-- Users can create new sessions
CREATE POLICY "Users can create chat sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Platform admins can view all sessions
CREATE POLICY "Platform admins can view all chat sessions"
  ON chat_sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug IN ('super_admin', 'platform_admin', 'platform_support')
    )
  );

-- RLS Policies for Chat Messages
-- Users can view messages in their sessions
CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions cs
      WHERE cs.id = chat_messages.session_id
      AND cs.user_id = auth.uid()
    )
  );

-- Users can send messages in their sessions
CREATE POLICY "Users can send chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_sessions cs
      WHERE cs.id = session_id
      AND cs.user_id = auth.uid()
    )
  );

-- Platform admins can view all messages
CREATE POLICY "Platform admins can view all chat messages"
  ON chat_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug IN ('super_admin', 'platform_admin', 'platform_support')
    )
  );

-- RLS Policies for Canned Responses
-- Platform admins can manage canned responses
CREATE POLICY "Platform admins can manage canned responses"
  ON chat_canned_responses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug IN ('super_admin', 'platform_admin', 'platform_support')
    )
  );

-- RLS Policies for Agent Availability
-- Platform admins can view all agent availability
CREATE POLICY "Platform admins can view agent availability"
  ON chat_agent_availability FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug IN ('super_admin', 'platform_admin', 'platform_support')
    )
  );

-- Agents can update their own availability
CREATE POLICY "Agents can update own availability"
  ON chat_agent_availability FOR ALL
  USING (agent_id = auth.uid());

-- Functions

-- Function to auto-assign chat to available agent
CREATE OR REPLACE FUNCTION auto_assign_chat_agent()
RETURNS TRIGGER AS $$
DECLARE
  available_agent_id UUID;
BEGIN
  -- Only auto-assign for new sessions
  IF NEW.assigned_agent_id IS NULL THEN
    -- Find available agent with capacity
    SELECT agent_id INTO available_agent_id
    FROM chat_agent_availability
    WHERE status = 'online'
      AND accepts_new_chats = TRUE
      AND current_active_chats < max_concurrent_chats
    ORDER BY current_active_chats ASC, last_seen_at DESC
    LIMIT 1;

    IF available_agent_id IS NOT NULL THEN
      NEW.assigned_agent_id := available_agent_id;
      NEW.status := 'active';

      -- Increment agent's active chat count
      UPDATE chat_agent_availability
      SET current_active_chats = current_active_chats + 1
      WHERE agent_id = available_agent_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_assign_chat_agent
  BEFORE INSERT ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_chat_agent();

-- Function to update first response time
CREATE OR REPLACE FUNCTION update_first_response_time()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is the first agent message
  IF NEW.sender_type = 'agent' THEN
    UPDATE chat_sessions
    SET
      first_response_at = NOW(),
      response_time_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER
    WHERE id = NEW.session_id
      AND first_response_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_first_response_time
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_first_response_time();

-- Seed some canned responses
INSERT INTO chat_canned_responses (shortcut, title, content, category) VALUES
  ('/hi', 'Greeting', 'Hi there! 👋 How can I help you today?', 'greeting'),
  ('/thanks', 'Thank You', 'Thank you for contacting us! Is there anything else I can help you with?', 'closing'),
  ('/wait', 'Please Wait', 'Please give me a moment while I look into this for you.', 'general'),
  ('/billing', 'Billing Info', 'For billing-related questions, you can view your invoices and subscription details in Settings > Billing.', 'billing'),
  ('/tech', 'Technical Support', 'I understand you''re experiencing a technical issue. Let me help you troubleshoot this.', 'technical'),
  ('/resolved', 'Issue Resolved', 'Great! I''m glad we could resolve this for you. Feel free to reach out if you need anything else!', 'closing');

-- Create chat notification function
CREATE OR REPLACE FUNCTION notify_new_chat_message()
RETURNS TRIGGER AS $$
DECLARE
  session_data JSONB;
BEGIN
  -- Get session data
  SELECT to_jsonb(cs.*) INTO session_data
  FROM chat_sessions cs
  WHERE cs.id = NEW.session_id;

  -- Notify via pg_notify for real-time updates
  PERFORM pg_notify(
    'chat_message',
    json_build_object(
      'message', NEW,
      'session', session_data
    )::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_chat_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_chat_message();

COMMENT ON TABLE chat_sessions IS 'Live chat sessions between tenants and support agents';
COMMENT ON TABLE chat_messages IS 'Messages within chat sessions';
COMMENT ON TABLE chat_canned_responses IS 'Pre-written responses for support agents';
COMMENT ON TABLE chat_agent_availability IS 'Real-time availability status of support agents';
