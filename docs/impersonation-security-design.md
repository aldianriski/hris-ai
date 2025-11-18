# Platform Admin Impersonation - Security Design

## Overview
Platform administrators can impersonate tenant users to debug issues from the user's perspective. This feature requires comprehensive audit tracking to prevent fraud and ensure accountability.

## Use Cases
1. Debug issues from tenant admin perspective
2. View employee interface to troubleshoot
3. Investigate reported bugs in specific user context
4. Provide customer support by seeing exactly what user sees

## Security Requirements

### Access Control
- **Who can impersonate**: Only `super_admin` and `platform_admin` roles
- **Who can be impersonated**: Only tenant users (not other platform admins)
- **Reason required**: Must provide business justification before impersonation
- **Session timeout**: Auto-expire after 2 hours
- **No privilege escalation**: Impersonator gets exact permissions of target user

### Audit Requirements
- **Comprehensive logging**: Every action during impersonation must be logged
- **Session tracking**: Start time, end time, duration, reason
- **Identity tracking**: Who impersonated whom, from which IP
- **Action tracking**: All API calls, data access, modifications during session
- **Alert mechanism**: Optional notification to target user after session ends

## Database Schema

### Table: `platform_impersonation_sessions`
```sql
CREATE TABLE platform_impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_admin_id UUID NOT NULL REFERENCES users(id),
  target_user_id UUID NOT NULL REFERENCES users(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),

  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, ended, expired, terminated

  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL, -- Auto-expire after 2 hours

  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('active', 'ended', 'expired', 'terminated')),
  CONSTRAINT valid_duration CHECK (ended_at IS NULL OR ended_at > started_at)
);

-- Indexes
CREATE INDEX idx_impersonation_sessions_admin ON platform_impersonation_sessions(platform_admin_id);
CREATE INDEX idx_impersonation_sessions_target ON platform_impersonation_sessions(target_user_id);
CREATE INDEX idx_impersonation_sessions_tenant ON platform_impersonation_sessions(tenant_id);
CREATE INDEX idx_impersonation_sessions_status ON platform_impersonation_sessions(status);
CREATE INDEX idx_impersonation_sessions_active ON platform_impersonation_sessions(status, expires_at) WHERE status = 'active';
```

### Table: `platform_impersonation_actions`
Tracks all actions performed during impersonation session.

```sql
CREATE TABLE platform_impersonation_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES platform_impersonation_sessions(id) ON DELETE CASCADE,

  action VARCHAR(100) NOT NULL, -- e.g., 'page.viewed', 'data.read', 'data.modified'
  resource_type VARCHAR(50), -- e.g., 'employee', 'payroll', 'leave_request'
  resource_id UUID,

  method VARCHAR(10), -- GET, POST, PATCH, DELETE
  path TEXT, -- API endpoint or page path

  metadata JSONB, -- Additional context: query params, request body, etc.

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_impersonation_actions_session ON platform_impersonation_actions(session_id);
CREATE INDEX idx_impersonation_actions_created ON platform_impersonation_actions(created_at);
CREATE INDEX idx_impersonation_actions_resource ON platform_impersonation_actions(resource_type, resource_id);
```

## API Endpoints

### 1. Start Impersonation
**POST** `/api/platform/impersonate/start`

Request:
```json
{
  "targetUserId": "uuid",
  "tenantId": "uuid",
  "reason": "Investigating bug #1234 reported by user"
}
```

Response:
```json
{
  "sessionId": "uuid",
  "targetUser": {
    "id": "uuid",
    "email": "user@tenant.com",
    "full_name": "John Doe",
    "role": "employee"
  },
  "tenant": {
    "id": "uuid",
    "company_name": "ACME Corp"
  },
  "expiresAt": "2024-01-01T14:00:00Z",
  "redirectUrl": "/employee/dashboard"
}
```

**Security Checks:**
- Verify current user is super_admin or platform_admin
- Verify target user is not a platform admin
- Verify target user belongs to specified tenant
- Verify no active impersonation session exists for this admin
- Create session with 2-hour expiry
- Create audit log entry

### 2. End Impersonation
**POST** `/api/platform/impersonate/end`

Request:
```json
{
  "sessionId": "uuid"
}
```

Response:
```json
{
  "message": "Impersonation session ended",
  "duration": "1h 23m 45s",
  "actionsLogged": 156
}
```

**Actions:**
- Update session status to 'ended'
- Set ended_at timestamp
- Calculate session duration
- Return to platform admin dashboard
- Optional: Notify target user

### 3. Get Current Session
**GET** `/api/platform/impersonate/active`

Response:
```json
{
  "isImpersonating": true,
  "session": {
    "id": "uuid",
    "targetUser": {
      "id": "uuid",
      "email": "user@tenant.com",
      "full_name": "John Doe",
      "role": "employee"
    },
    "tenant": {
      "id": "uuid",
      "company_name": "ACME Corp"
    },
    "startedAt": "2024-01-01T12:00:00Z",
    "expiresAt": "2024-01-01T14:00:00Z",
    "reason": "Debugging issue #1234"
  }
}
```

### 4. List Impersonation Sessions
**GET** `/api/platform/impersonate/sessions`

Query Params:
- `adminId` (optional) - Filter by platform admin
- `targetUserId` (optional) - Filter by target user
- `tenantId` (optional) - Filter by tenant
- `status` (optional) - Filter by status
- `limit` (default: 20)
- `offset` (default: 0)

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "platformAdmin": {
        "id": "uuid",
        "full_name": "Admin Name",
        "email": "admin@platform.com"
      },
      "targetUser": {
        "id": "uuid",
        "full_name": "John Doe",
        "email": "john@tenant.com",
        "role": "employee"
      },
      "tenant": {
        "id": "uuid",
        "company_name": "ACME Corp"
      },
      "reason": "Debugging issue #1234",
      "status": "ended",
      "startedAt": "2024-01-01T12:00:00Z",
      "endedAt": "2024-01-01T13:23:45Z",
      "duration": "1h 23m 45s",
      "actionsCount": 156
    }
  ],
  "pagination": {
    "total": 543,
    "limit": 20,
    "offset": 0
  }
}
```

## UI Components

### 1. Impersonation Banner
Persistent banner at top of screen during impersonation.

**Features:**
- Bright warning color (orange/yellow)
- Shows "Impersonating: John Doe (john@tenant.com) at ACME Corp"
- Shows time remaining before auto-expiry
- "Exit Impersonation" button
- Cannot be dismissed

### 2. Impersonate User Modal
Modal to start impersonation session.

**Features:**
- Select tenant (if not in tenant context)
- Select user from tenant
- Required reason field (min 10 characters)
- Warning about audit logging
- Confirm button

### 3. Impersonate Button
Button in tenant detail view and user list.

**Placement:**
- Tenant detail view header actions
- Tenant users tab - each user row
- Platform users list (for testing tenant users)

### 4. Impersonation Sessions Table
View all past and active impersonation sessions.

**Features:**
- Columns: Admin, Target User, Tenant, Reason, Duration, Actions Count, Status
- Filters: Admin, Tenant, Status, Date range
- Expandable rows showing action logs
- Export to CSV for compliance

## Session Management

### Session Lifecycle

1. **Start Session**
   - Admin clicks "Impersonate" button
   - Modal shows warning and requires reason
   - Admin confirms
   - Session created in database
   - Admin redirected to tenant app as target user
   - Banner appears at top

2. **Active Session**
   - All requests include impersonation context
   - Every action logged to `platform_impersonation_actions`
   - Banner shows countdown timer
   - Warning at 15 minutes before expiry

3. **End Session**
   - Admin clicks "Exit Impersonation"
   - OR Session expires (2 hours)
   - OR Admin closes browser (session marked as terminated)
   - Session status updated
   - Admin returned to platform admin view
   - Summary shown (duration, actions count)

### Middleware Integration

Authentication middleware must:
1. Check for active impersonation session
2. If impersonating:
   - Use target user's permissions
   - Log action to impersonation_actions
   - Include impersonation context in all audit logs
   - Enforce session expiry

## Security Considerations

### Preventing Abuse

1. **Rate Limiting**: Max 5 impersonation sessions per admin per day
2. **Suspicious Pattern Detection**: Alert if admin impersonates same user multiple times
3. **Restricted Actions**: Some sensitive actions may be blocked during impersonation:
   - Changing passwords
   - Updating security settings
   - Deleting users
4. **Session Monitoring**: Real-time alerts for platform super_admin when impersonation starts

### Compliance

1. **GDPR**: User right to know - optional notification after impersonation
2. **Audit Trail**: Immutable logs with 7-year retention
3. **Access Reports**: Monthly reports of all impersonation sessions
4. **Justification Review**: Periodic review of impersonation reasons

## Implementation Phases

### Phase 1: Database & Core API (Current Sprint)
- [ ] Create database tables and migrations
- [ ] Implement start/end impersonation API endpoints
- [ ] Implement session tracking API
- [ ] Add middleware for impersonation context

### Phase 2: UI Components (Current Sprint)
- [ ] Create ImpersonationBanner component
- [ ] Create ImpersonateUserModal component
- [ ] Add Impersonate button to tenant detail view
- [ ] Add Impersonate button to tenant users list

### Phase 3: Audit & Monitoring (Current Sprint)
- [ ] Implement action logging during impersonation
- [ ] Create impersonation sessions table/view
- [ ] Add session detail view with action logs
- [ ] Implement auto-expiry cron job

### Phase 4: Advanced Features (Future)
- [ ] Email notifications to target users
- [ ] Real-time alerts for super admins
- [ ] Export audit logs to CSV
- [ ] Session recording/replay (screen recording)
- [ ] AI-based anomaly detection

## Testing Checklist

- [ ] Only platform admins can start impersonation
- [ ] Cannot impersonate other platform admins
- [ ] Session expires after 2 hours
- [ ] All actions during impersonation are logged
- [ ] Banner displays correctly
- [ ] Exit impersonation works
- [ ] Auto-expiry works
- [ ] Concurrent sessions prevented
- [ ] Session survives page refresh
- [ ] Session cleared on browser close
- [ ] Audit logs are immutable
- [ ] Performance impact is minimal
