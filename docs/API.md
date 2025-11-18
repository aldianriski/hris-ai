# API Documentation

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

All API endpoints (except auth endpoints) require authentication via JWT token.

### Headers

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_1001` | Invalid credentials |
| `AUTH_1002` | Token expired |
| `AUTH_1003` | Unauthorized access |
| `VAL_2001` | Validation error |
| `RES_3001` | Resource not found |
| `BIZ_4001` | Business logic error |
| `RATE_4003` | Rate limit exceeded |
| `SRV_9001` | Internal server error |

## Endpoints

### Authentication

#### POST /api/v1/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "employee"
    }
  }
}
```

#### POST /api/v1/auth/register
Register new user account.

#### POST /api/v1/auth/logout
Logout current user.

#### POST /api/v1/auth/refresh
Refresh access token.

---

### Employees

#### GET /api/v1/employees
List all employees.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search by name or email
- `status` (string): Filter by status (active|inactive)
- `department` (string): Filter by department

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "position": "Software Engineer",
      "department": "Engineering",
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### GET /api/v1/employees/:id
Get employee by ID.

#### POST /api/v1/employees
Create new employee.

**Request:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "position": "Software Engineer",
  "department": "Engineering",
  "hire_date": "2024-01-01"
}
```

#### PUT /api/v1/employees/:id
Update employee.

#### DELETE /api/v1/employees/:id
Delete employee.

---

### Leave Management

#### GET /api/v1/leave/requests
List leave requests.

**Query Parameters:**
- `status` (string): Filter by status (pending|approved|rejected)
- `employee_id` (string): Filter by employee
- `start_date` (string): Filter by start date
- `end_date` (string): Filter by end date

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employee_id": "uuid",
      "employee_name": "John Doe",
      "leave_type": "Annual Leave",
      "start_date": "2024-01-10",
      "end_date": "2024-01-15",
      "days_count": 5,
      "status": "pending",
      "reason": "Family vacation"
    }
  ]
}
```

#### POST /api/v1/leave/requests
Create leave request.

**Request:**
```json
{
  "leave_type": "Annual Leave",
  "start_date": "2024-01-10",
  "end_date": "2024-01-15",
  "reason": "Family vacation"
}
```

#### POST /api/v1/leave/requests/:id/approve
Approve leave request (Manager/HR only).

**Request:**
```json
{
  "notes": "Approved for annual leave"
}
```

#### POST /api/v1/leave/requests/:id/reject
Reject leave request (Manager/HR only).

**Request:**
```json
{
  "reason": "Insufficient leave balance"
}
```

---

### Payroll

#### GET /api/v1/payroll/periods
List payroll periods.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "month": 11,
      "year": 2024,
      "status": "calculated",
      "period_start": "2024-11-01",
      "period_end": "2024-11-30",
      "employee_count": 50
    }
  ]
}
```

#### POST /api/v1/payroll/periods
Create payroll period.

#### GET /api/v1/payroll/payslips/:employeeId/:periodId
Get payslip details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "employee": {
      "id": "uuid",
      "full_name": "John Doe"
    },
    "period": {
      "month": 11,
      "year": 2024
    },
    "payroll_detail": {
      "base_salary": 10000000,
      "allowances": 2000000,
      "overtime": 500000,
      "gross_salary": 12500000,
      "bpjs_kesehatan": 125000,
      "bpjs_jht": 250000,
      "bpjs_jp": 125000,
      "pph21": 625000,
      "total_deductions": 1125000,
      "net_salary": 11375000
    },
    "pdf_url": "https://storage.url/payslip.pdf"
  }
}
```

#### POST /api/v1/payroll/payslips/:employeeId/:periodId/generate
Generate payslip PDF and send notification.

---

### Attendance

#### GET /api/v1/attendance
List attendance records.

**Query Parameters:**
- `employee_id` (string): Filter by employee
- `date` (string): Filter by specific date
- `start_date` (string): Filter by date range start
- `end_date` (string): Filter by date range end

#### POST /api/v1/attendance/clock-in
Clock in for the day.

**Request:**
```json
{
  "location": {
    "latitude": -6.2088,
    "longitude": 106.8456
  }
}
```

#### POST /api/v1/attendance/clock-out
Clock out for the day.

---

### File Upload

#### POST /api/v1/upload
Upload file to storage.

**Request:** `multipart/form-data`
- `file` (file): File to upload
- `fileType` (string): document|payslip|avatar

**Response:**
```json
{
  "success": true,
  "data": {
    "path": "company-id/documents/file.pdf",
    "url": "https://storage.url/file.pdf",
    "fileName": "document.pdf",
    "fileSize": 1024000,
    "mimeType": "application/pdf"
  }
}
```

#### GET /api/v1/documents/:id/download
Download document with signed URL.

**Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://signed-url",
    "expiresAt": "2024-11-18T12:00:00Z"
  }
}
```

---

### Integrations

#### GET /api/v1/integrations
List available integrations.

#### GET /api/v1/integrations/installed
List installed integrations.

#### POST /api/v1/integrations/:provider/install
Initiate OAuth flow for integration.

**Response:**
```json
{
  "success": true,
  "data": {
    "authUrl": "https://oauth-provider.com/authorize?...",
    "provider": "slack"
  }
}
```

#### DELETE /api/v1/integrations/:provider/disconnect
Disconnect integration.

---

### Notifications

#### POST /api/v1/notifications/register
Register device token for push notifications.

**Request:**
```json
{
  "token": "fcm-device-token",
  "deviceType": "web",
  "deviceName": "Chrome on Windows"
}
```

#### POST /api/v1/notifications/unregister
Unregister device token.

#### GET /api/v1/notifications/preferences
Get notification preferences.

#### PUT /api/v1/notifications/preferences
Update notification preferences.

**Request:**
```json
{
  "leaveApproved": true,
  "leaveRejected": true,
  "payslipReady": true,
  "documentVerified": false,
  "announcements": true
}
```

#### POST /api/v1/notifications/test
Send test notification.

---

### Admin / Jobs

#### POST /api/v1/admin/jobs/payroll/process
Queue payroll processing job (HR only).

**Request:**
```json
{
  "payrollPeriodId": "uuid"
}
```

**Response:** `202 Accepted`
```json
{
  "success": true,
  "data": {
    "message": "Payroll processing queued successfully",
    "payrollPeriodId": "uuid",
    "status": "processing"
  }
}
```

---

## Rate Limiting

Rate limits are applied per IP address:

- **Standard endpoints**: 100 requests per minute
- **Strict endpoints** (auth, upload): 10 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

## Pagination

Default pagination:
- `page`: 1
- `limit`: 20 (max: 100)

## Sorting

Use query parameters:
- `sortBy`: Field name
- `sortOrder`: asc|desc

Example:
```
GET /api/v1/employees?sortBy=full_name&sortOrder=asc
```

## Filtering

Use query parameters with field names:
```
GET /api/v1/employees?department=Engineering&status=active
```

## Best Practices

1. **Always handle errors**: Check `success` field in response
2. **Use pagination**: Don't fetch all records at once
3. **Implement retry logic**: With exponential backoff
4. **Cache responses**: Where appropriate
5. **Validate inputs**: Before sending requests
6. **Use HTTPS**: In production
7. **Store tokens securely**: Never in localStorage for sensitive apps
8. **Refresh tokens**: Before they expire
9. **Log requests**: For debugging
10. **Handle rate limits**: Implement backoff strategy

## SDKs and Libraries

### JavaScript/TypeScript

```typescript
import { HRISClient } from '@hris/client';

const client = new HRISClient({
  baseUrl: 'https://api.hris.com',
  apiKey: 'your-api-key',
});

// List employees
const employees = await client.employees.list({
  page: 1,
  limit: 20,
  status: 'active',
});

// Create leave request
const leave = await client.leave.create({
  leave_type: 'Annual Leave',
  start_date: '2024-01-10',
  end_date: '2024-01-15',
  reason: 'Vacation',
});
```

## Webhooks

Subscribe to events:

- `employee.created`
- `employee.updated`
- `leave.submitted`
- `leave.approved`
- `payslip.generated`

Configure webhook URL in admin panel.

## Support

For API support:
- Email: api-support@hris.com
- Documentation: https://docs.hris.com
- Status: https://status.hris.com
