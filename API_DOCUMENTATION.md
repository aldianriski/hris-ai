# HRIS Platform API Documentation

## Overview

This document describes the API endpoints for the HRIS platform and how the frontend consumes them.

## Base Configuration

**Base URL**: `/api/v1` (configurable via `NEXT_PUBLIC_API_URL`)
**Authentication**: Bearer token (automatically injected from Supabase session)
**Content-Type**: `application/json`

## Enhanced API Client Features

The API client (`src/lib/api/client.ts`) provides:

✅ **Automatic Authentication** - Injects Supabase access token in all requests
✅ **Request/Response Interceptors** - Extensible middleware system
✅ **Retry Logic** - Configurable retry with exponential backoff
✅ **Request Logging** - Development-mode logging (🚀 requests, ✅ responses, ❌ errors)
✅ **Error Handling** - Standardized error responses with codes
✅ **Type Safety** - Full TypeScript support

### Client Usage Examples

```typescript
import { apiClient } from '@/lib/api/client';

// GET request
const data = await apiClient.get<ResponseType>('/endpoint', { param: 'value' });

// POST request
const result = await apiClient.post<ResponseType>('/endpoint', { field: 'value' });

// With retry logic
const data = await apiClient.get<ResponseType>('/endpoint', params, {
  retry: 3,          // Retry 3 times on failure
  retryDelay: 1000,  // Start with 1s delay (exponential backoff)
});

// Skip authentication (for public endpoints)
const data = await apiClient.get<ResponseType>('/public/endpoint', params, {
  skipAuth: true,
});
```

---

## 1. Workflows API

### 1.1 List Workflows

**Endpoint**: `GET /workflows`
**Service**: `workflowService.list()`
**Hook**: `useWorkflows(employerId, filters)`

**Query Parameters**:
- `status` (optional): `pending` | `in_progress` | `completed` | `failed`
- `workflowType` (optional): `onboarding` | `offboarding`

**Request Example**:
```typescript
const { data, isLoading } = useWorkflows('employer-123', {
  status: 'in_progress',
  workflowType: 'onboarding'
});
```

**Response**:
```json
{
  "workflows": [
    {
      "id": "wf-123",
      "workflowName": "Onboarding - John Doe",
      "workflowType": "onboarding",
      "status": "in_progress",
      "progressPercentage": 45,
      "totalSteps": 20,
      "completedSteps": 9,
      "currentStep": 10,
      "entityType": "employee",
      "entityId": "emp-456",
      "employerId": "employer-123",
      "startedAt": "2025-01-01T09:00:00Z",
      "autoApproved": false,
      "stepsConfig": [...]
    }
  ],
  "total": 1
}
```

### 1.2 Get Single Workflow

**Endpoint**: `GET /workflows/:id`
**Service**: `workflowService.getById()`
**Hook**: `useWorkflow(workflowId)`

**Response**: Single `WorkflowInstance` object

### 1.3 Create Workflow

**Endpoint**: `POST /workflows`
**Service**: `workflowService.create()`
**Hook**: `useCreateWorkflow()`

**Request Body**:
```json
{
  "workflowName": "Onboarding - John Doe",
  "workflowType": "onboarding",
  "entityType": "employee",
  "entityId": "emp-456",
  "employerId": "employer-123"
}
```

**Usage**:
```typescript
const createWorkflow = useCreateWorkflow();
createWorkflow.mutate({
  workflowName: "Onboarding - John Doe",
  workflowType: "onboarding",
  entityType: "employee",
  entityId: "emp-456",
  employerId: "employer-123"
});
```

### 1.4 Update Workflow Step

**Endpoint**: `PATCH /workflows/:workflowId/steps/:stepNumber`
**Service**: `workflowService.updateStep()`
**Hook**: `useUpdateWorkflowStep()`

**Request Body**:
```json
{
  "status": "completed"
}
```

**Usage**:
```typescript
const updateStep = useUpdateWorkflowStep();
updateStep.mutate({
  workflowId: "wf-123",
  stepNumber: 5,
  status: "completed"
});
```

### 1.5 Execute Workflow

**Endpoint**: `POST /workflows/:workflowId/execute`
**Service**: `workflowService.execute()`
**Hook**: `useExecuteWorkflow()`

**Response**:
```json
{
  "success": true,
  "message": "Workflow executed successfully"
}
```

---

## 2. Compliance API

### 2.1 Get Compliance Alerts

**Endpoint**: `GET /compliance/alerts`
**Service**: `complianceService.getAlerts()`
**Hook**: `useComplianceAlerts(employerId, filters)`

**Query Parameters**:
- `status` (optional): `active` | `resolved` | `dismissed`
- `severity` (optional): `high` | `medium` | `low`

**Auto-Refresh**: Every 60 seconds

**Response**:
```json
{
  "alerts": [
    {
      "id": "alert-123",
      "title": "BPJS Overdue",
      "description": "BPJS payment overdue for 5 employees",
      "severity": "high",
      "status": "active",
      "dueDate": "2025-01-15",
      "employerId": "employer-123",
      "category": "bpjs_overdue",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

### 2.2 Resolve Alert

**Endpoint**: `POST /compliance/alerts/:alertId/resolve`
**Service**: `complianceService.resolveAlert()`
**Hook**: `useResolveAlert()`

**Request Body** (optional):
```json
{
  "resolution": "BPJS payments processed"
}
```

**Usage**:
```typescript
const resolveAlert = useResolveAlert();
resolveAlert.mutate({
  alertId: "alert-123",
  resolution: "Issue resolved"
});
```

### 2.3 Get Audit Logs

**Endpoint**: `GET /compliance/audit-logs`
**Service**: `complianceService.getAuditLogs()`
**Hook**: `useAuditLogs(employerId, filters)`

**Query Parameters**:
- `action` (optional): Action type filter
- `entityType` (optional): Entity type filter
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response**:
```json
{
  "logs": [
    {
      "id": "log-123",
      "action": "employee_created",
      "entityType": "employee",
      "entityId": "emp-456",
      "userId": "user-789",
      "userName": "John Admin",
      "employerId": "employer-123",
      "timestamp": "2025-01-01T10:30:00Z",
      "changes": {...},
      "ipAddress": "192.168.1.1"
    }
  ],
  "total": 100
}
```

---

## 3. Analytics API

### 3.1 Dashboard Analytics

**Endpoint**: `GET /analytics/dashboard`
**Service**: `analyticsService.getDashboard()`
**Hook**: `useDashboardAnalytics(employerId)`

**Response**:
```json
{
  "kpis": {
    "totalHeadcount": 250,
    "headcountGrowth": 12.5,
    "turnoverRate": 8.2,
    "turnoverTrend": -2.1,
    "avgTimeToHire": 28,
    "timeToHireTrend": -5.0,
    "costPerHire": 15000000,
    "costTrend": 3.5,
    "absenteeismRate": 2.8,
    "absenteeismTrend": -0.5,
    "overtimeHours": 1250,
    "overtimeTrend": 8.2
  },
  "headcountTrend": [
    { "month": "Jan", "count": 220, "target": 230 },
    { "month": "Feb", "count": 230, "target": 240 }
  ],
  "turnoverData": [...],
  "departmentDistribution": [...],
  "costTrends": [...]
}
```

### 3.2 Employee Analytics

**Endpoint**: `GET /analytics/employees`
**Service**: `analyticsService.getEmployees()`
**Hook**: `useEmployeeAnalytics(employerId)`

### 3.3 Attendance Analytics

**Endpoint**: `GET /analytics/attendance`
**Service**: `analyticsService.getAttendance()`
**Hook**: `useAttendanceAnalytics(employerId)`

### 3.4 Leave Analytics

**Endpoint**: `GET /analytics/leave`
**Service**: `analyticsService.getLeave()`
**Hook**: `useLeaveAnalytics(employerId)`

### 3.5 Payroll Analytics

**Endpoint**: `GET /analytics/payroll`
**Service**: `analyticsService.getPayroll()`
**Hook**: `usePayrollAnalytics(employerId)`

### 3.6 Performance Analytics

**Endpoint**: `GET /analytics/performance`
**Service**: `analyticsService.getPerformance()`
**Hook**: `usePerformanceAnalytics(employerId)`

---

## 4. Attendance Anomalies API

### 4.1 List Attendance Anomalies

**Endpoint**: `GET /attendance/anomalies`
**Service**: `attendanceAnomalyService.list()`
**Hook**: `useAttendanceAnomalies(employerId, filters)`

**Query Parameters**:
- `status` (optional): `pending` | `approved` | `rejected`
- `severity` (optional): `high` | `medium` | `low`
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Auto-Refresh**: Every 120 seconds

**Response**:
```json
{
  "anomalies": [
    {
      "id": "anomaly-123",
      "employeeId": "emp-456",
      "employeeName": "John Doe",
      "date": "2025-01-15",
      "type": "location_deviation",
      "severity": "high",
      "description": "Clock-in location 15km from usual office",
      "normalValue": "Office Building A",
      "anomalousValue": "Remote Location X",
      "aiConfidence": 0.92,
      "status": "pending",
      "location": {
        "normal": { "lat": -6.2, "lng": 106.8, "address": "Office A" },
        "anomalous": { "lat": -6.3, "lng": 106.9, "address": "Location X" },
        "distance": 15
      },
      "createdAt": "2025-01-15T08:30:00Z"
    }
  ],
  "total": 1
}
```

### 4.2 Approve Anomaly

**Endpoint**: `POST /attendance/anomalies/:anomalyId/approve`
**Service**: `attendanceAnomalyService.approve()`
**Hook**: `useApproveAnomaly()`

**Request Body** (optional):
```json
{
  "notes": "Approved after verification"
}
```

### 4.3 Reject Anomaly

**Endpoint**: `POST /attendance/anomalies/:anomalyId/reject`
**Service**: `attendanceAnomalyService.reject()`
**Hook**: `useRejectAnomaly()`

---

## 5. Existing APIs

The following APIs already have services and are documented in their respective service files:

- **Employees**: `employeeService` → `/employees`
- **Attendance**: `attendanceService` → `/attendance`
- **Leave**: `leaveService` → `/leave`
- **Payroll**: `payrollService` → `/payroll`
- **Performance**: `performanceService` → `/performance`

---

## Authentication Flow

1. User logs in via Supabase Auth
2. Frontend receives Supabase session with `access_token`
3. API client automatically injects token in all requests:
   ```typescript
   Authorization: Bearer <access_token>
   ```
4. Backend validates token using Supabase

---

## Error Handling

### Client-Side

All hooks include automatic error handling with toast notifications:

```typescript
const { data, error, isLoading } = useWorkflows(employerId);

// Errors are automatically displayed via toast
// No need to handle manually
```

### Error Response Format

```json
{
  "error": "Error message",
  "details": "Detailed error description",
  "code": "ERROR_CODE"
}
```

### Error Codes

- `AUTH_1001`: Unauthorized
- `AUTH_1004`: Forbidden
- `VAL_2001`: Validation error
- `RES_3001`: Resource not found
- `RATE_5001`: Rate limit exceeded
- `SRV_9001`: Internal server error

---

## Development Tools

### Enable/Disable Logging

```typescript
import { apiClient } from '@/lib/api/client';

// Disable logging in production
apiClient.setLogging(false);
```

### Custom Interceptors

```typescript
// Add custom request interceptor
apiClient.addRequestInterceptor(async (config) => {
  config.headers = {
    ...config.headers,
    'X-Custom-Header': 'value',
  };
  return config;
});

// Add custom response interceptor
apiClient.addResponseInterceptor(async (response) => {
  // Custom response handling
  return response;
});

// Add custom error interceptor
apiClient.addErrorInterceptor(async (error) => {
  // Custom error handling
  return error;
});
```

---

## Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=/api/v1  # API base URL (default: /api/v1)
NODE_ENV=development          # Enables request logging

# Supabase (for authentication)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Testing

All services and hooks have comprehensive test coverage:

- Unit tests: `src/lib/hooks/__tests__/`
- Integration tests: `src/components/**/__tests__/`
- E2E tests: `e2e/`

Run tests:
```bash
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:coverage     # Coverage report
```

---

## Next Steps for Backend Implementation

To complete the full-stack integration, implement these endpoints on the backend:

1. **Workflows endpoints** (see section 1)
2. **Compliance endpoints** (see section 2)
3. **Analytics endpoints** (see section 3)
4. **Attendance anomalies endpoints** (see section 4)

The frontend is fully ready to consume these APIs with automatic authentication, error handling, and type safety.
