# Frontend UI Components Guide

**Version:** 1.0
**Last Updated:** November 18, 2025
**Status:** Implementation Phase

---

## 📋 Overview

This guide documents the frontend UI components for Talixa HRIS. All components are built with:
- **Next.js 15** (App Router)
- **React 19** (Client Components)
- **TypeScript** (Strict mode)
- **Tailwind CSS** (Utility-first styling)
- **Lucide React** (Icons)

---

## 🏗️ Component Architecture

```
src/components/
├── dashboard/           # Dashboard components
│   ├── DashboardLayout.tsx
│   ├── DashboardStats.tsx
│   ├── RecentActivity.tsx
│   └── index.ts
├── employees/           # Employee management
│   ├── EmployeeTable.tsx
│   └── index.ts
├── leave/              # Leave management
│   ├── LeaveRequestCard.tsx
│   └── index.ts
├── attendance/         # Attendance tracking
│   ├── AttendanceCalendar.tsx
│   └── index.ts
└── realtime/           # Real-time features
    ├── LiveDashboard.tsx
    ├── LiveAttendance.tsx
    ├── LiveLeaveRequests.tsx
    └── index.ts
```

---

## 🎨 Dashboard Components

### DashboardLayout

**Purpose:** Main authenticated layout with sidebar and header

**Usage:**
```tsx
import { DashboardLayout } from '@/components/dashboard';

export default function DashboardPage() {
  return (
    <DashboardLayout
      user={{
        name: 'John Doe',
        email: 'john@company.com',
        role: 'HR Manager',
      }}
    >
      <h1>Dashboard Content</h1>
    </DashboardLayout>
  );
}
```

**Features:**
- Responsive sidebar (mobile + desktop)
- Top navigation bar
- User profile dropdown
- Notification bell
- Active page highlighting
- Collapsible mobile menu

**Navigation Items:**
- Dashboard
- Employees
- Attendance
- Leave
- Payroll
- Performance
- Settings

---

### DashboardStats

**Purpose:** Display key metrics in card format

**Usage:**
```tsx
import { DashboardStats } from '@/components/dashboard';

const stats = [
  {
    name: 'Total Employees',
    value: 248,
    change: 12,
    changeType: 'increase',
    icon: Users,
    color: 'blue',
  },
  // ... more stats
];

<DashboardStats stats={stats} />
```

**Features:**
- 4-column grid (responsive)
- Icon with colored background
- Value display
- Trend indicator (up/down)
- Hover effects

**Supported Colors:**
- blue, green, yellow, purple

---

### RecentActivity

**Purpose:** Show recent activities in the system

**Usage:**
```tsx
import { RecentActivity } from '@/components/dashboard';

const activities = [
  {
    id: '1',
    type: 'leave',
    title: 'Leave Request Approved',
    description: 'Sarah submitted a leave request',
    timestamp: new Date(),
    user: { name: 'Sarah' },
    status: 'approved',
  },
];

<RecentActivity activities={activities} maxItems={5} />
```

**Activity Types:**
- leave
- attendance
- employee
- document
- approval

**Status Types:**
- approved (green)
- rejected (red)
- pending (yellow)

---

## 👥 Employee Components

### EmployeeTable

**Purpose:** Display and manage employee list

**Usage:**
```tsx
import { EmployeeTable } from '@/components/employees';

<EmployeeTable
  employees={employees}
  onAdd={() => console.log('Add employee')}
  onEdit={(employee) => console.log('Edit:', employee)}
  onDelete={(employee) => console.log('Delete:', employee)}
/>
```

**Features:**
- Search functionality
- Department filter
- Status filter
- Sortable columns
- Avatar display
- Contact information
- Edit/delete actions
- Responsive design

**Employee Interface:**
```typescript
interface Employee {
  id: string;
  employeeNumber: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: 'active' | 'inactive';
  joinDate: string;
  avatar?: string;
}
```

---

## 📅 Leave Components

### LeaveRequestCard

**Purpose:** Display leave request with approval options

**Usage:**
```tsx
import { LeaveRequestCard } from '@/components/leave';

<LeaveRequestCard
  request={{
    id: '1',
    employeeName: 'Sarah Johnson',
    leaveType: 'Annual Leave',
    startDate: '2025-12-25',
    endDate: '2025-12-26',
    days: 2,
    reason: 'Christmas holiday',
    status: 'pending',
    submittedAt: '2025-12-01',
  }}
  onApprove={(id) => console.log('Approve:', id)}
  onReject={(id) => console.log('Reject:', id)}
  showActions={true}
/>
```

**Features:**
- Employee avatar
- Leave type badge
- Status badge
- Date range display
- Days count
- Reason display
- Approve/reject buttons
- Submitted date

**Leave Types with Colors:**
- Annual Leave (blue)
- Sick Leave (red)
- Emergency Leave (yellow)
- Unpaid Leave (gray)

---

## 🕐 Attendance Components

### AttendanceCalendar

**Purpose:** Monthly calendar with attendance records

**Usage:**
```tsx
import { AttendanceCalendar } from '@/components/attendance';

const records = [
  {
    date: '2025-11-18',
    status: 'present',
    clockIn: '08:00',
    clockOut: '17:00',
  },
  {
    date: '2025-11-19',
    status: 'late',
    clockIn: '09:30',
    clockOut: '18:00',
  },
];

<AttendanceCalendar
  records={records}
  month={new Date()}
  onMonthChange={(month) => console.log('Month changed:', month)}
/>
```

**Features:**
- Full month calendar view
- Month navigation (prev/next)
- Today highlighting
- Status indicators
- Clock in/out times
- Color-coded statuses
- Status legend

**Status Types:**
- present (green)
- absent (red)
- late (yellow)
- leave (blue)

---

## 🎨 Design System

### Colors

**Primary:**
- Blue: `bg-blue-600`, `text-blue-600`
- Green: `bg-green-600`, `text-green-600`
- Yellow: `bg-yellow-600`, `text-yellow-600`
- Red: `bg-red-600`, `text-red-600`

**Grays:**
- Dark: `text-gray-900`
- Medium: `text-gray-600`
- Light: `text-gray-400`
- Background: `bg-gray-50`

### Typography

**Headings:**
- h1: `text-2xl font-bold`
- h2: `text-xl font-semibold`
- h3: `text-lg font-semibold`

**Body:**
- Default: `text-sm`
- Small: `text-xs`

### Spacing

- Padding: `p-4`, `px-6 py-4`
- Margin: `mt-4`, `mb-6`
- Gap: `gap-4`, `gap-6`

### Borders & Shadows

- Border: `border border-gray-200`
- Rounded: `rounded-lg` (8px)
- Shadow: `shadow` (small), `shadow-md` (medium)

---

## 🔧 Component Patterns

### Layout Pattern

```tsx
<div className="min-h-screen bg-gray-50">
  <Sidebar />
  <main className="lg:pl-64">
    <Header />
    <div className="px-4 sm:px-6 lg:px-8 py-10">
      {children}
    </div>
  </main>
</div>
```

### Card Pattern

```tsx
<div className="rounded-lg bg-white shadow">
  <div className="border-b border-gray-200 px-6 py-4">
    <h3>Title</h3>
  </div>
  <div className="p-6">
    Content
  </div>
</div>
```

### Table Pattern

```tsx
<div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      {/* headers */}
    </thead>
    <tbody className="divide-y divide-gray-200 bg-white">
      {/* rows */}
    </tbody>
  </table>
</div>
```

---

## 📱 Responsive Design

### Breakpoints

```css
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large */
```

### Mobile-First Approach

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* 1 col mobile, 2 cols tablet, 4 cols desktop */}
</div>
```

---

## ♿ Accessibility

**Best Practices:**
- Use semantic HTML
- Provide `aria-labels` for icons
- Keyboard navigation support
- Focus states on interactive elements
- Alt text for images
- Proper heading hierarchy

**Example:**
```tsx
<button
  aria-label="Close menu"
  className="focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  <X className="h-6 w-6" />
</button>
```

---

## 🚀 Performance

**Optimization Tips:**
- Use `'use client'` sparingly
- Lazy load components when possible
- Memoize expensive calculations
- Optimize images (next/image)
- Code splitting per route

**Example:**
```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
});
```

---

## 🧪 Testing Components

**Unit Testing Example:**
```tsx
import { render, screen } from '@testing-library/react';
import { DashboardStats } from '@/components/dashboard';

test('renders stats correctly', () => {
  const stats = [{ name: 'Users', value: 100 }];
  render(<DashboardStats stats={stats} />);
  expect(screen.getByText('Users')).toBeInTheDocument();
  expect(screen.getByText('100')).toBeInTheDocument();
});
```

---

## 📦 Next Steps

**Remaining Components:**
- [ ] Payroll components
- [ ] Performance review components
- [ ] Settings pages
- [ ] Form components
- [ ] Modal dialogs
- [ ] Toast notifications
- [ ] Loading states
- [ ] Error states

**Enhancements:**
- [ ] Dark mode support
- [ ] Animation library (Framer Motion)
- [ ] Accessibility audit
- [ ] Performance audit
- [ ] Storybook documentation

---

**Maintained by:** Frontend Team
**Last Review:** November 18, 2025
**Next Review:** December 2025
