# HRIS Design Pattern Guide

> **Purpose:** Visual design patterns for HRIS modules based on existing Talixa design system
> **Design System:** Extends [tailwind.config.js](../../tailwind.config.js) + HeroUI components
> **Target:** Desktop (employer) + Mobile (employee self-service)

---

## 1. DESIGN SYSTEM FOUNDATION

### Brand Colors (From Tailwind Config)

```typescript
// Primary Brand
talixa-indigo: #0047AB      // CTAs, links, primary actions
talixa-indigo-light: #9AC7F7 // Backgrounds, progress bars

// Secondary Accent
talixa-amber: #FFA500        // Highlights, badges, warnings
talixa-amber-light: #FFBF69  // Lighter variations

// Text
talixa-navy-dark: #002366    // Headers, dark text
talixa-text-dark: #1F2537    // Body copy
talixa-text-light: #6B7280   // Helper text, metadata

// Status Colors (HRIS-specific)
talixa-status-active: #4CAF50    // Active employees, approved
talixa-status-pending: #FFA500   // Pending approvals
talixa-status-inactive: #6B7280  // Resigned, rejected
talixa-status-alert: #EF4444     // Anomalies, errors
```

### Typography Scale

```typescript
// Headers
text-page-title: 32px/40px font-bold  // Page titles (e.g., "Employees", "Attendance")
text-h2: 36px/1.4 font-bold           // Section headings
text-h3: 24px/1.5 font-semibold       // Card titles

// Body
text-base: 16px/1.5 font-normal       // Body text
text-sm: 14px/1.5 font-normal         // Metadata, labels
text-xs: 12px/1.5 font-normal         // Captions, helper text

// Display
text-display: 60px/1.2 font-bold      // Large stats, KPIs
```

### Spacing System (4px base)

```typescript
// Common spacings
p-6: 24px   // Card padding
p-4: 16px   // Inner sections
gap-4: 16px // Grid gaps
mb-6: 24px  // Section margins
```

### Shadows

```typescript
shadow-talixa-sm: 0 2px 4px rgba(0,0,0,0.05)   // Subtle
shadow-talixa: 0 4px 12px rgba(0,0,0,0.08)     // Default cards
shadow-talixa-lg: 0 8px 24px rgba(0,0,0,0.12)  // Hover/elevated
shadow-talixa-xl: 0 12px 32px rgba(0,0,0,0.15) // Modals
```

### Border Radius

```typescript
rounded-xl: 12px    // Buttons, inputs
rounded-2xl: 16px   // Medium cards
rounded-3xl: 24px   // Large cards
```

---

## 2. LAYOUT PATTERNS

### 2.1 Dashboard Layout (Employer Desktop)

**Structure:**
```
┌─────────────────────────────────────────────────┐
│ Header: Title + Actions (Top-right)            │
├─────────────────────────────────────────────────┤
│ Date/Filter Bar (Optional)                      │
├─────────────────────────────────────────────────┤
│ Stats Grid (4 columns)                          │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │
│ │ KPI  │ │ KPI  │ │ KPI  │ │ KPI  │            │
│ └──────┘ └──────┘ └──────┘ └──────┘            │
├─────────────────────────────────────────────────┤
│ Main Content (Charts/Tables/Cards)              │
│ ┌─────────────────┐ ┌─────────────────┐        │
│ │ Chart/Data      │ │ Chart/Data      │        │
│ └─────────────────┘ └─────────────────┘        │
└─────────────────────────────────────────────────┘
```

**Code Example (HR Dashboard):**
```tsx
export default function HRDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-page-title text-talixa-navy-dark">
          Employee Management
        </h1>
        <div className="flex items-center gap-3">
          <Button
            className="bg-talixa-indigo text-white font-medium h-9 px-4"
            startContent={<UserPlus className="h-4 w-4" />}
          >
            Add Employee
          </Button>
          <Button
            isIconOnly
            className="bg-talixa-indigo text-white h-9 w-9"
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          value="156"
          label="Active Employees"
          trend="+12%"
          trendUp
        />
        <StatCard
          value="8"
          label="On Leave Today"
          trend="-3%"
        />
        <StatCard
          value="142"
          label="Clocked In"
          trend="91%"
        />
        <StatCard
          value="5"
          label="Pending Approvals"
          trend="urgent"
          variant="warning"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Charts, tables, etc. */}
      </div>
    </div>
  );
}
```

### 2.2 List/Table Layout (Employee List, Attendance Records)

**Structure:**
```
┌─────────────────────────────────────────────────┐
│ Header + Search + Filters                       │
├─────────────────────────────────────────────────┤
│ Active Filters (Chips)                          │
├─────────────────────────────────────────────────┤
│ Table/Card Grid                                 │
│ ┌───────────────────────────────────────────┐  │
│ │ Row 1                              Actions│  │
│ ├───────────────────────────────────────────┤  │
│ │ Row 2                              Actions│  │
│ ├───────────────────────────────────────────┤  │
│ │ Row 3                              Actions│  │
│ └───────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│ Pagination                                      │
└─────────────────────────────────────────────────┘
```

**Code Example (Employee List):**
```tsx
export default function EmployeeList() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-page-title text-talixa-navy-dark">Employees</h1>
        <Button className="bg-talixa-indigo text-white">
          Add Employee
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by name, employee ID..."
          startContent={<Search className="h-4 w-4 text-gray-400" />}
          className="flex-1"
        />
        <Select placeholder="Department" className="w-48">
          <SelectItem key="all">All Departments</SelectItem>
          <SelectItem key="sales">Sales</SelectItem>
          <SelectItem key="ops">Operations</SelectItem>
        </Select>
        <Select placeholder="Status" className="w-48">
          <SelectItem key="active">Active</SelectItem>
          <SelectItem key="probation">Probation</SelectItem>
          <SelectItem key="resigned">Resigned</SelectItem>
        </Select>
      </div>

      {/* Active Filters */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Filters:</span>
        <Chip
          onClose={() => {}}
          variant="flat"
          className="bg-talixa-indigo-light"
        >
          Department: Sales
        </Chip>
      </div>

      {/* Table */}
      <Card className="shadow-talixa">
        <CardBody className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <EmployeeRow employee={employee} />
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
```

### 2.3 Detail View Layout (Employee Profile, Payslip)

**Structure:**
```
┌─────────────────────────────────────────────────┐
│ Back Button + Title + Actions                   │
├─────────────────────────────────────────────────┤
│ Info Card (Avatar + Summary)                    │
│ ┌─────────────────────────────────────────────┐ │
│ │ 👤 Photo   Name                    [Edit]   │ │
│ │           Position • Department             │ │
│ │           Status Badge                      │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ Tabs (Personal Info | Employment | Documents)  │
├─────────────────────────────────────────────────┤
│ Tab Content (Forms/Tables/Cards)                │
└─────────────────────────────────────────────────┘
```

**Code Example (Employee Detail):**
```tsx
export default function EmployeeDetail({ params }: { params: { id: string } }) {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-page-title text-talixa-navy-dark">
            Employee Detail
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="bordered">Edit</Button>
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly variant="light">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key="terminate">Terminate</DropdownItem>
              <DropdownItem key="export">Export Data</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="shadow-talixa">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <Avatar
              src={employee.photoUrl}
              size="lg"
              className="w-20 h-20"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {employee.fullName}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {employee.position} • {employee.department}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Chip
                  size="sm"
                  className="bg-green-50 text-green-700"
                >
                  Active
                </Chip>
                <Chip size="sm" variant="flat">
                  EMP-{employee.employeeNumber}
                </Chip>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Joined</p>
              <p className="text-base font-semibold">
                {formatDate(employee.joinDate)}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabs */}
      <Tabs aria-label="Employee sections">
        <Tab key="personal" title="Personal Info">
          <PersonalInfoTab employee={employee} />
        </Tab>
        <Tab key="employment" title="Employment">
          <EmploymentTab employee={employee} />
        </Tab>
        <Tab key="documents" title="Documents">
          <DocumentsTab employee={employee} />
        </Tab>
      </Tabs>
    </div>
  );
}
```

### 2.4 Mobile Layout (Employee Self-Service)

**Structure:**
```
┌─────────────────────┐
│ Top Bar (Title)     │
├─────────────────────┤
│ Quick Actions       │
│ ┌────┐ ┌────┐      │
│ │Clk │ │Leav│      │
│ │In  │ │e   │      │
│ └────┘ └────┘      │
├─────────────────────┤
│ Cards (Stack)       │
│ ┌─────────────────┐ │
│ │ Card 1          │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ Card 2          │ │
│ └─────────────────┘ │
├─────────────────────┤
│ Bottom Nav          │
└─────────────────────┘
```

**Code Example (Employee Home):**
```tsx
export default function EmployeeHome() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-primary p-6 pb-8 text-white">
        <h1 className="text-2xl font-bold">Hi, {employee.firstName}!</h1>
        <p className="text-sm opacity-90 mt-1">
          {formatDate(new Date())}
        </p>
      </div>

      {/* Quick Actions (Overlap header) */}
      <div className="px-6 -mt-4 grid grid-cols-2 gap-3 mb-6">
        <Card className="shadow-talixa bg-white">
          <CardBody className="p-4 text-center">
            <div className="w-12 h-12 mx-auto bg-talixa-indigo rounded-full flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <p className="text-xs text-gray-600">Clock In</p>
            <p className="text-lg font-bold text-talixa-indigo">8:05 AM</p>
          </CardBody>
        </Card>

        <Card className="shadow-talixa bg-white">
          <CardBody className="p-4 text-center">
            <div className="w-12 h-12 mx-auto bg-talixa-amber rounded-full flex items-center justify-center mb-2">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <p className="text-xs text-gray-600">Leave Balance</p>
            <p className="text-lg font-bold text-talixa-amber">12 days</p>
          </CardBody>
        </Card>
      </div>

      {/* Cards */}
      <div className="px-6 space-y-4 pb-20">
        <AttendanceSummaryCard />
        <UpcomingLeaveCard />
        <LatestPayslipCard />
      </div>

      {/* Bottom Nav (Fixed) */}
      <BottomNav />
    </div>
  );
}
```

---

## 3. COMPONENT PATTERNS

### 3.1 Stat Card (KPI Display)

**Usage:** Dashboard metrics (employee count, leave balance, pending approvals)

**Variants:**
- Default (neutral)
- Success (green trend)
- Warning (amber trend)
- Danger (red trend)

**Code:**
```tsx
interface StatCardProps {
  value: string | number;
  label: string;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function StatCard({
  value,
  label,
  trend,
  trendUp,
  icon,
  variant = 'default'
}: StatCardProps) {
  const trendColors = {
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    default: 'bg-gray-50 text-gray-700'
  };

  return (
    <Card className="shadow-talixa bg-white">
      <CardBody className="p-6">
        <div className="flex items-start justify-between mb-2">
          <p className="text-[32px] font-bold text-gray-900 leading-[40px]">
            {value}
          </p>
          {icon && (
            <div className="w-10 h-10 bg-talixa-indigo-light rounded-lg flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-600">{label}</p>
          {trend && (
            <Chip
              size="sm"
              variant="flat"
              className={`font-medium h-6 ${trendColors[variant]}`}
            >
              {trend}
            </Chip>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// Usage
<StatCard
  value="156"
  label="Active Employees"
  trend="+12%"
  variant="success"
  icon={<Users className="h-5 w-5 text-talixa-indigo" />}
/>
```

### 3.2 Status Badge

**Usage:** Employee status, leave status, attendance status

**Code:**
```tsx
const statusConfig = {
  // Employee Status
  active: { label: 'Active', color: 'bg-green-50 text-green-700 border-green-200' },
  probation: { label: 'Probation', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  resigned: { label: 'Resigned', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  terminated: { label: 'Terminated', color: 'bg-red-50 text-red-700 border-red-200' },

  // Leave Status
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Approved', color: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200' },

  // Attendance
  present: { label: 'Present', color: 'bg-green-50 text-green-700 border-green-200' },
  absent: { label: 'Absent', color: 'bg-red-50 text-red-700 border-red-200' },
  late: { label: 'Late', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  leave: { label: 'On Leave', color: 'bg-blue-50 text-blue-700 border-blue-200' },

  // Anomaly
  anomaly: { label: 'Flagged', color: 'bg-red-50 text-red-700 border-red-200' },
};

export function StatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const config = statusConfig[status];
  return (
    <Chip
      size="sm"
      variant="bordered"
      className={`${config.color} font-medium`}
    >
      {config.label}
    </Chip>
  );
}

// Usage
<StatusBadge status="active" />
<StatusBadge status="pending" />
<StatusBadge status="anomaly" />
```

### 3.3 Employee Row (Table/List Item)

**Usage:** Employee list, attendance records

**Code:**
```tsx
interface EmployeeRowProps {
  employee: {
    id: string;
    fullName: string;
    employeeNumber: string;
    position: string;
    department: string;
    photoUrl?: string;
    status: 'active' | 'probation' | 'resigned';
  };
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function EmployeeRow({ employee, onView, onEdit }: EmployeeRowProps) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={employee.photoUrl}
            name={employee.fullName}
            size="sm"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {employee.fullName}
            </p>
            <p className="text-xs text-gray-500">
              EMP-{employee.employeeNumber}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {employee.position}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {employee.department}
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={employee.status} />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="light"
            onPress={() => onView?.(employee.id)}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="bordered"
            onPress={() => onEdit?.(employee.id)}
          >
            Edit
          </Button>
        </div>
      </td>
    </tr>
  );
}
```

### 3.4 Leave Request Card

**Usage:** Leave request list, approvals

**Code:**
```tsx
interface LeaveRequestCardProps {
  request: {
    id: string;
    employee: {
      fullName: string;
      photoUrl?: string;
      position: string;
    };
    leaveType: string;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    autoApproved?: boolean;
    aiConfidence?: number;
  };
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function LeaveRequestCard({ request, onApprove, onReject }: LeaveRequestCardProps) {
  return (
    <Card className="shadow-talixa hover:shadow-talixa-lg transition-shadow">
      <CardBody className="p-4">
        <div className="flex items-start gap-3">
          <Avatar
            src={request.employee.photoUrl}
            name={request.employee.fullName}
            size="md"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {request.employee.fullName}
                </p>
                <p className="text-xs text-gray-500">
                  {request.employee.position}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={request.status} />
                {request.autoApproved && (
                  <Chip
                    size="sm"
                    variant="flat"
                    className="bg-purple-50 text-purple-700"
                    startContent={<Sparkles className="h-3 w-3" />}
                  >
                    AI Approved
                  </Chip>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <p className="text-xs text-gray-500">Leave Type</p>
                <p className="text-sm font-medium">{request.leaveType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-medium">{request.totalDays} days</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">From</p>
                <p className="text-sm">{formatDate(request.startDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">To</p>
                <p className="text-sm">{formatDate(request.endDate)}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              <span className="font-medium">Reason:</span> {request.reason}
            </p>

            {request.aiConfidence && (
              <div className="mb-3 p-2 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <p className="text-xs text-purple-700">
                    AI Confidence: {(request.aiConfidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            )}

            {request.status === 'pending' && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-green-600 text-white flex-1"
                  onPress={() => onApprove?.(request.id)}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="bordered"
                  className="border-red-600 text-red-600 flex-1"
                  onPress={() => onReject?.(request.id)}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
```

### 3.5 Attendance Clock In/Out Widget (Mobile)

**Usage:** Employee mobile self-service

**Code:**
```tsx
export function ClockInOutWidget() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleClockIn = async () => {
    // Get GPS location
    navigator.geolocation.getCurrentPosition((position) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      // Call API
      setIsClockedIn(true);
      toast.success('Clocked in successfully!');
    });
  };

  return (
    <Card className="shadow-talixa">
      <CardBody className="p-6">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-10"></div>
            <div className="absolute inset-4 bg-gradient-primary rounded-full flex items-center justify-center">
              <Clock className="h-12 w-12 text-white" />
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-1">Current Time</p>
          <p className="text-3xl font-bold text-gray-900 mb-6">
            {new Date().toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>

          {!isClockedIn ? (
            <Button
              size="lg"
              className="bg-gradient-primary text-white w-full"
              onPress={handleClockIn}
            >
              Clock In
            </Button>
          ) : (
            <>
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  ✓ Clocked in at 8:05 AM
                </p>
              </div>
              <Button
                size="lg"
                className="bg-red-600 text-white w-full"
                onPress={() => setIsClockedIn(false)}
              >
                Clock Out
              </Button>
            </>
          )}

          {location && (
            <p className="text-xs text-gray-500 mt-3">
              📍 Location verified
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
```

### 3.6 Payroll Summary Card

**Usage:** Payroll dashboard, payslip view

**Code:**
```tsx
interface PayrollSummaryProps {
  period: {
    startDate: Date;
    endDate: Date;
  };
  components: {
    baseSalary: number;
    allowances: number;
    deductions: number;
    bpjs: number;
    tax: number;
    netPay: number;
  };
}

export function PayrollSummaryCard({ period, components }: PayrollSummaryProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);

  return (
    <Card className="shadow-talixa">
      <CardBody className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Payroll Summary
          </h3>
          <Chip size="sm" variant="flat">
            {formatDate(period.startDate)} - {formatDate(period.endDate)}
          </Chip>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Base Salary</span>
            <span className="text-sm font-medium">
              {formatCurrency(components.baseSalary)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Allowances</span>
            <span className="text-sm font-medium text-green-600">
              + {formatCurrency(components.allowances)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">BPJS</span>
            <span className="text-sm font-medium text-red-600">
              - {formatCurrency(components.bpjs)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">PPh21 Tax</span>
            <span className="text-sm font-medium text-red-600">
              - {formatCurrency(components.tax)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Other Deductions</span>
            <span className="text-sm font-medium text-red-600">
              - {formatCurrency(components.deductions)}
            </span>
          </div>

          <div className="pt-3 border-t-2 border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-gray-900">
                Net Pay
              </span>
              <span className="text-2xl font-bold text-talixa-indigo">
                {formatCurrency(components.netPay)}
              </span>
            </div>
          </div>
        </div>

        <Button
          className="w-full mt-4 bg-talixa-indigo text-white"
          startContent={<Download className="h-4 w-4" />}
        >
          Download Payslip
        </Button>
      </CardBody>
    </Card>
  );
}
```

### 3.7 Anomaly Alert Card

**Usage:** Attendance anomaly review

**Code:**
```tsx
interface AnomalyAlertProps {
  alert: {
    id: string;
    employee: {
      fullName: string;
      photoUrl?: string;
      employeeNumber: string;
    };
    date: Date;
    clockIn: Date;
    location: { lat: number; lng: number };
    anomalyType: 'location' | 'time' | 'hours';
    anomalyReason: string;
    confidence: number;
  };
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function AnomalyAlertCard({ alert, onApprove, onReject }: AnomalyAlertProps) {
  const anomalyIcons = {
    location: MapPin,
    time: Clock,
    hours: AlertTriangle
  };

  const Icon = anomalyIcons[alert.anomalyType];

  return (
    <Card className="shadow-talixa border-l-4 border-red-500">
      <CardBody className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-red-600" />
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {alert.employee.fullName}
                </p>
                <p className="text-xs text-gray-500">
                  EMP-{alert.employee.employeeNumber}
                </p>
              </div>
              <Chip
                size="sm"
                className="bg-red-50 text-red-700"
                startContent={<AlertCircle className="h-3 w-3" />}
              >
                Anomaly Detected
              </Chip>
            </div>

            <div className="mb-3 p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800 font-medium mb-1">
                {alert.anomalyReason}
              </p>
              <div className="flex items-center gap-4 text-xs text-red-600">
                <span>📅 {formatDate(alert.date)}</span>
                <span>🕐 {alert.clockIn.toLocaleTimeString()}</span>
                <span>🎯 Confidence: {(alert.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="bordered"
                className="border-green-600 text-green-600 flex-1"
                onPress={() => onApprove?.(alert.id)}
              >
                Approve (Valid)
              </Button>
              <Button
                size="sm"
                className="bg-red-600 text-white flex-1"
                onPress={() => onReject?.(alert.id)}
              >
                Reject (Invalid)
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
```

---

## 4. PAGE-SPECIFIC PATTERNS

### 4.1 Employee List Page

**Layout:**
- Search bar (full-width, sticky top)
- Filters (department, status, position) - horizontal chips
- Table view (desktop) / Card grid (mobile)
- Pagination (bottom)

**Key Features:**
- Real-time search (debounced 300ms)
- Multi-filter support (combine filters)
- Bulk actions (select multiple, export CSV)
- Quick view modal (click row → modal, not navigate)

**Code Structure:**
```tsx
// app/(employer)/hr/employees/page.tsx
'use client';

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>({});
  const { data, isLoading } = useEmployees({ search, filters });

  return (
    <div className="p-6 space-y-6">
      <Header />
      <SearchAndFilters />
      <ActiveFilters />
      <EmployeeTable data={data} />
      <Pagination />
    </div>
  );
}
```

### 4.2 Attendance Dashboard

**Layout:**
- Date selector (top, prominent)
- Stats row (clocked in, absent, late, on leave)
- Live feed (auto-refresh every 30s, show latest clock ins)
- Anomaly alerts (separate section, red border)

**Key Features:**
- Real-time updates (Supabase Realtime)
- Date range picker (today, this week, this month)
- Export to Excel (attendance report)
- Anomaly review workflow (approve/reject)

**Code Structure:**
```tsx
// app/(employer)/hr/attendance/page.tsx
'use client';

export default function AttendancePage() {
  const [date, setDate] = useState(new Date());
  const { data: summary } = useAttendanceSummary(date);
  const { data: liveData } = useAttendanceLive(); // Realtime subscription
  const { data: anomalies } = useAttendanceAnomalies();

  return (
    <div className="p-6 space-y-6">
      <Header />
      <DateSelector date={date} onChange={setDate} />
      <StatsGrid summary={summary} />
      <LiveFeed data={liveData} />
      {anomalies.length > 0 && <AnomalySection anomalies={anomalies} />}
    </div>
  );
}
```

### 4.3 Leave Management Page

**Layout:**
- Tabs (Pending | Approved | All Requests)
- Calendar view (team leave calendar, month view)
- Request cards (stack, sorted by date)
- Quick approve button (AI confidence badge)

**Key Features:**
- AI auto-approve indicator (purple badge)
- Team conflict warning (if 2+ people same dates)
- Calendar heatmap (visualize leave density)
- Bulk approve (select multiple, approve all)

**Code Structure:**
```tsx
// app/(employer)/hr/leave/page.tsx
'use client';

export default function LeavePage() {
  const [tab, setTab] = useState<'pending' | 'approved' | 'all'>('pending');
  const { data: requests } = useLeaveRequests({ status: tab });

  return (
    <div className="p-6 space-y-6">
      <Header />
      <Tabs value={tab} onChange={setTab} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LeaveRequestList requests={requests} />
        </div>
        <div>
          <TeamCalendar />
        </div>
      </div>
    </div>
  );
}
```

### 4.4 Payroll Processing Page

**Layout:**
- Period selector (month picker, prominent)
- Status indicator (draft, processing, approved, paid)
- Employee table (name, gross, deductions, net, errors)
- Error summary (top, red background if errors detected)
- Approve button (bottom-right, disabled if errors)

**Key Features:**
- AI error detection (red row highlight if anomaly)
- Drill-down (click row → see salary breakdown)
- Export options (CSV, PDF, bank format)
- Lock mechanism (once approved, can't edit)

**Code Structure:**
```tsx
// app/(employer)/hr/payroll/page.tsx
'use client';

export default function PayrollPage() {
  const [period, setPeriod] = useState<PayrollPeriod | null>(null);
  const { data: payroll } = usePayrollPeriod(period?.id);
  const { data: errors } = usePayrollErrors(period?.id);

  return (
    <div className="p-6 space-y-6">
      <Header />
      <PeriodSelector period={period} onChange={setPeriod} />

      {errors.length > 0 && (
        <ErrorSummary errors={errors} />
      )}

      <PayrollTable data={payroll} errors={errors} />

      <div className="flex justify-end gap-3">
        <Button variant="bordered">Export</Button>
        <Button
          className="bg-talixa-indigo text-white"
          isDisabled={errors.length > 0 || payroll?.status !== 'draft'}
        >
          Approve Payroll
        </Button>
      </div>
    </div>
  );
}
```

### 4.5 Employee Mobile Self-Service (My Attendance)

**Layout:**
- Clock in/out widget (prominent, center)
- Today's summary (work hours, overtime)
- This month summary (total days, hours)
- History (list, paginated)

**Key Features:**
- GPS verification (show map pin)
- Offline support (queue clock in/out, sync later)
- Push notifications (remind to clock out)
- Photo verification (optional, take selfie)

**Code Structure:**
```tsx
// app/(employee)/my-attendance/page.tsx
'use client';

export default function MyAttendancePage() {
  const { data: todayRecord } = useTodayAttendance();
  const { data: monthlySummary } = useMonthlyAttendance();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="My Attendance" />

      <div className="p-6 space-y-6">
        <ClockInOutWidget record={todayRecord} />
        <TodaySummaryCard record={todayRecord} />
        <MonthlySummaryCard summary={monthlySummary} />
        <AttendanceHistory />
      </div>

      <BottomNav />
    </div>
  );
}
```

---

## 5. INTERACTION PATTERNS

### 5.1 Form Patterns

**Standard Form Layout:**
```tsx
<form onSubmit={handleSubmit}>
  <div className="space-y-6">
    {/* Section */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Personal Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Full Name" {...register('fullName')} />
        <Input label="Email" {...register('email')} />
      </div>
    </div>

    {/* Section */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Employment Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Employment Type">
          <SelectItem key="PKWT">PKWT (Contract)</SelectItem>
          <SelectItem key="PKWTT">PKWTT (Permanent)</SelectItem>
        </Select>
        <DatePicker label="Join Date" />
      </div>
    </div>

    {/* Actions */}
    <div className="flex justify-end gap-3">
      <Button variant="bordered" type="button">Cancel</Button>
      <Button className="bg-talixa-indigo text-white" type="submit">
        Save Employee
      </Button>
    </div>
  </div>
</form>
```

### 5.2 Modal Patterns

**Confirmation Modal (Approve/Reject):**
```tsx
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalContent>
    <ModalHeader>Approve Leave Request?</ModalHeader>
    <ModalBody>
      <p className="text-sm text-gray-600">
        Approve leave request for <strong>{employee.name}</strong> from{' '}
        {formatDate(startDate)} to {formatDate(endDate)}?
      </p>
      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <p className="text-sm text-green-800">
          ✓ Balance sufficient (12 days remaining)
        </p>
        <p className="text-sm text-green-800">
          ✓ No team conflicts
        </p>
      </div>
    </ModalBody>
    <ModalFooter>
      <Button variant="light" onPress={onClose}>Cancel</Button>
      <Button className="bg-green-600 text-white" onPress={handleApprove}>
        Approve
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

**Detail Modal (Quick View):**
```tsx
<Modal size="lg" isOpen={isOpen} onClose={onClose}>
  <ModalContent>
    <ModalHeader>
      <div className="flex items-center gap-3">
        <Avatar src={employee.photoUrl} />
        <div>
          <p className="font-semibold">{employee.fullName}</p>
          <p className="text-sm text-gray-500">{employee.position}</p>
        </div>
      </div>
    </ModalHeader>
    <ModalBody>
      <Tabs>
        <Tab title="Personal">...</Tab>
        <Tab title="Employment">...</Tab>
        <Tab title="Documents">...</Tab>
      </Tabs>
    </ModalBody>
  </ModalContent>
</Modal>
```

### 5.3 Toast Notifications

**Success/Error Patterns:**
```tsx
// Success (green)
toast.success('Leave request approved!', {
  description: 'Employee notified via email',
  duration: 3000
});

// Error (red)
toast.error('Failed to clock in', {
  description: 'GPS location not available',
  duration: 5000
});

// Warning (amber)
toast.warning('Attendance anomaly detected', {
  description: 'Location 8km from usual office',
  action: {
    label: 'Review',
    onClick: () => router.push('/hr/attendance/anomalies')
  }
});

// Info (blue) - AI Auto-approve
toast.info('Leave request auto-approved', {
  description: 'AI confidence: 92%',
  icon: <Sparkles className="h-5 w-5 text-purple-600" />
});
```

### 5.4 Loading States

**Skeleton Loader (List):**
```tsx
export function EmployeeListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="shadow-talixa">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
```

**Spinner (Full Page):**
```tsx
if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-talixa-indigo"></div>
    </div>
  );
}
```

### 5.5 Empty States

**No Data Pattern:**
```tsx
export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <p className="text-lg font-semibold text-gray-900 mb-2">{title}</p>
      <p className="text-sm text-gray-600 mb-6">{description}</p>
      {action && (
        <Button className="bg-talixa-indigo text-white">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Usage
<EmptyState
  icon={Users}
  title="No employees yet"
  description="Get started by adding your first employee"
  action={{ label: "Add Employee", onClick: handleAdd }}
/>
```

---

## 6. RESPONSIVE BREAKPOINTS

### Tailwind Breakpoints (Same as Talixa)

```typescript
// Mobile-first approach
sm: 640px   // Small tablets
md: 768px   // Tablets
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large

// Common patterns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 1 column mobile, 2 tablet, 4 desktop */}
</div>

<div className="flex flex-col lg:flex-row gap-4">
  {/* Stack mobile, horizontal desktop */}
</div>

<div className="hidden lg:block">
  {/* Desktop only */}
</div>

<div className="lg:hidden">
  {/* Mobile only */}
</div>
```

---

## 7. ICON SYSTEM (Lucide React)

### Common HRIS Icons

```tsx
import {
  // Navigation
  Home, Briefcase, Users, FileText, Settings, Bell,

  // Actions
  Plus, Edit, Trash2, Download, Upload, Share2, MoreVertical,

  // Status
  Check, X, AlertCircle, AlertTriangle, Info, Sparkles,

  // Data
  Calendar, Clock, MapPin, TrendingUp, TrendingDown,

  // HR-specific
  UserPlus, UserMinus, UserCheck, Building2, FileCheck,

  // Features
  Brain, Zap, Target, Award, Shield
} from 'lucide-react';

// Usage
<Button startContent={<UserPlus className="h-4 w-4" />}>
  Add Employee
</Button>

<Chip startContent={<Sparkles className="h-3 w-3" />}>
  AI Approved
</Chip>
```

---

## 8. ANIMATION GUIDELINES

### Micro-interactions (Framer Motion)

```tsx
import { motion } from 'framer-motion';

// Card hover
<motion.div
  whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
  transition={{ duration: 0.2 }}
>
  <Card>...</Card>
</motion.div>

// Button press
<motion.button
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.1 }}
>
  Submit
</motion.button>

// List item entrance
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: index * 0.1 }}
>
  <EmployeeRow />
</motion.div>

// AI Badge pulse (attention)
<motion.div
  animate={{ scale: [1, 1.05, 1] }}
  transition={{ duration: 2, repeat: Infinity }}
>
  <Chip>AI Approved</Chip>
</motion.div>
```

### Performance Guidelines

- Use `transform` and `opacity` (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Keep duration < 300ms for interactions
- Use `will-change` sparingly

---

## 9. ACCESSIBILITY (a11y)

### Keyboard Navigation

```tsx
// All interactive elements must be keyboard accessible
<Button onPress={handleClick}>
  {/* Automatically handles Enter/Space */}
</Button>

// Custom interactive elements need tabIndex
<div
  tabIndex={0}
  role="button"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Custom Button
</div>
```

### ARIA Labels

```tsx
// Icon-only buttons
<Button isIconOnly aria-label="Delete employee">
  <Trash2 className="h-4 w-4" />
</Button>

// Status badges
<Chip aria-label="Employee status: Active">
  Active
</Chip>

// Loading states
<div role="status" aria-live="polite">
  {isLoading && <p>Loading employees...</p>}
</div>
```

### Color Contrast (WCAG AA)

```typescript
// All text must meet 4.5:1 contrast ratio
text-gray-900 on white: ✅ 16:1
text-gray-600 on white: ✅ 7:1
text-talixa-indigo on white: ✅ 8.6:1

// Status badges use sufficient contrast
bg-green-50 text-green-700: ✅ 4.6:1
bg-red-50 text-red-700: ✅ 4.7:1
```

---

## 10. PRINT STYLES (Payslips, Reports)

### Print-friendly CSS

```css
@media print {
  /* Hide navigation, sidebars */
  .no-print {
    display: none !important;
  }

  /* Expand content to full width */
  .print-full-width {
    width: 100% !important;
    margin: 0 !important;
  }

  /* Remove shadows, borders for ink saving */
  .shadow-talixa {
    box-shadow: none !important;
  }

  /* Force black text for readability */
  body {
    color: #000 !important;
  }

  /* Page breaks */
  .page-break {
    page-break-before: always;
  }
}
```

**Usage:**
```tsx
<div className="print:hidden">
  <Button onClick={() => window.print()}>Print Payslip</Button>
</div>

<div className="print-full-width">
  <PayslipContent />
</div>
```

---

## SUMMARY

**Design System Foundation:**
- Colors: talixa-indigo (primary), talixa-amber (accent)
- Typography: text-page-title (32px), text-h3 (24px)
- Spacing: 4px base scale
- Components: HeroUI (Card, Button, Input, Select, etc.)

**Key Patterns Defined:**
- Dashboard layout (4-column stats grid)
- List/table layout (search + filters + table)
- Detail view (back button + tabs)
- Mobile self-service (cards + bottom nav)

**Component Library:**
- StatCard (KPI display)
- StatusBadge (employee/leave/attendance status)
- EmployeeRow (table row)
- LeaveRequestCard (approval workflow)
- ClockInOutWidget (mobile attendance)
- PayrollSummaryCard (salary breakdown)
- AnomalyAlertCard (flagged attendance)

**Interaction Patterns:**
- Form layouts (2-column grid, sections)
- Modal patterns (confirmation, detail view)
- Toast notifications (success, error, AI)
- Loading states (skeleton, spinner)
- Empty states (no data)

**All patterns extend existing Talixa design system.** Reuse components, colors, and layouts for consistency.

**Next Step:** Implement components in `components/hr/` directory following these patterns.
