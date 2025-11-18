# Supabase Realtime Module

This module provides real-time updates for your HRIS application using **Supabase Realtime**.

## Features

- ✅ **Database change subscriptions** (INSERT, UPDATE, DELETE)
- ✅ **React hooks** for easy integration
- ✅ **Presence tracking** for online/offline status
- ✅ **Broadcast messages** for custom events
- ✅ **Automatic cleanup** on component unmount
- ✅ **Connection state management**
- ✅ **Typed payloads** with TypeScript

## Setup

### 1. Enable Realtime in Supabase

Realtime is enabled by default in Supabase, but you need to enable it for specific tables:

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Replication**
3. Enable replication for the tables you want to subscribe to:
   - `attendance_records`
   - `leave_requests`
   - `employees`
   - `payroll_periods`
   - `performance_reviews`
   - `documents`

### 2. Wrap App with RealtimeProvider

```tsx
// app/layout.tsx
import { RealtimeProvider } from '@/lib/realtime';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <RealtimeProvider>
          {children}
        </RealtimeProvider>
      </body>
    </html>
  );
}
```

## Usage

### Basic Table Subscription

```tsx
'use client';

import { useRealtimeTable } from '@/lib/realtime';

function MyComponent() {
  useRealtimeTable(
    'employees',           // Table name
    '*',                   // Event type: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
    (payload) => {
      console.log('Employee changed:', payload);
      // payload.eventType: 'INSERT' | 'UPDATE' | 'DELETE'
      // payload.new: New row data (for INSERT/UPDATE)
      // payload.old: Old row data (for UPDATE/DELETE)
    },
    { column: 'employer_id', value: 'company-123' } // Optional filter
  );

  return <div>Subscribed to employee changes</div>;
}
```

### Attendance Updates

```tsx
'use client';

import { useAttendanceUpdates } from '@/lib/realtime';

function AttendanceTracker({ companyId }: { companyId: string }) {
  const { isConnected } = useAttendanceUpdates(
    companyId,
    (payload) => {
      if (payload.eventType === 'INSERT') {
        console.log('New attendance:', payload.new);
      } else if (payload.eventType === 'UPDATE') {
        console.log('Updated attendance:', payload.new);
      }
    }
  );

  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
}
```

### Leave Request Updates

```tsx
'use client';

import { useLeaveRequestUpdates } from '@/lib/realtime';
import { toast } from 'sonner';

function LeaveNotifications({ companyId }: { companyId: string }) {
  useLeaveRequestUpdates(companyId, (payload) => {
    if (payload.eventType === 'INSERT' && payload.new.status === 'pending') {
      toast.info('New leave request received');
    } else if (payload.eventType === 'UPDATE') {
      const oldStatus = payload.old?.status;
      const newStatus = payload.new.status;

      if (oldStatus === 'pending' && newStatus === 'approved') {
        toast.success('Leave request approved');
      } else if (oldStatus === 'pending' && newStatus === 'rejected') {
        toast.error('Leave request rejected');
      }
    }
  });

  return null; // This component only handles notifications
}
```

### Dashboard with Multiple Subscriptions

```tsx
'use client';

import { useDashboardRealtime } from '@/lib/realtime';

function Dashboard({ companyId }: { companyId: string }) {
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);

  const { isConnected, connections } = useDashboardRealtime(
    companyId,
    {
      onAttendance: (payload) => {
        if (payload.eventType === 'INSERT') {
          setAttendanceCount((prev) => prev + 1);
        }
      },
      onLeave: (payload) => {
        if (payload.eventType === 'INSERT' && payload.new.status === 'pending') {
          setPendingLeaves((prev) => prev + 1);
        }
      },
    }
  );

  return (
    <div>
      <div>Connection: {isConnected ? '🟢 Live' : '⚪ Offline'}</div>
      <div>Attendance: {attendanceCount}</div>
      <div>Pending Leaves: {pendingLeaves}</div>
    </div>
  );
}
```

### Using Presence (Online/Offline Status)

```tsx
'use client';

import { useEffect } from 'react';
import { subscribeToPresence } from '@/lib/realtime';

function OnlineUsers({ channelName }: { channelName: string }) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const channel = subscribeToPresence(
      channelName,
      (key, current, newPresences) => {
        console.log('User joined:', key);
        setOnlineUsers((prev) => [...prev, key]);
      },
      (key, current, leftPresences) => {
        console.log('User left:', key);
        setOnlineUsers((prev) => prev.filter((u) => u !== key));
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, [channelName]);

  return (
    <div>
      <h3>Online Users ({onlineUsers.length})</h3>
      <ul>
        {onlineUsers.map((user) => (
          <li key={user}>{user}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Broadcasting Messages

```tsx
'use client';

import { sendBroadcast, subscribeToBroadcast } from '@/lib/realtime';

// Sender
function NotificationSender() {
  const sendNotification = async () => {
    await sendBroadcast('notifications', 'new-message', {
      title: 'Hello',
      body: 'New message received',
    });
  };

  return <button onClick={sendNotification}>Send Notification</button>;
}

// Receiver
function NotificationReceiver() {
  useEffect(() => {
    const channel = subscribeToBroadcast(
      'notifications',
      'new-message',
      (payload) => {
        console.log('Received:', payload);
        toast.info(payload.title);
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return null;
}
```

## Available Hooks

### Core Hooks

- **`useRealtimeTable(table, event, callback, filter?, enabled?)`**
  - Subscribe to any table changes
  - Returns: `{ isConnected: boolean }`

- **`useAttendanceUpdates(companyId, onUpdate, enabled?)`**
  - Subscribe to attendance record changes
  - Filtered by company

- **`useLeaveRequestUpdates(companyId, onUpdate, enabled?)`**
  - Subscribe to leave request changes
  - Filtered by company

- **`useEmployeeUpdates(companyId, onUpdate, enabled?)`**
  - Subscribe to employee changes
  - Filtered by company

- **`usePayrollUpdates(companyId, onUpdate, enabled?)`**
  - Subscribe to payroll period changes
  - Filtered by company

- **`usePerformanceReviewUpdates(companyId, onUpdate, enabled?)`**
  - Subscribe to performance review changes
  - Filtered by company

- **`useDocumentUpdates(companyId, onUpdate, enabled?)`**
  - Subscribe to document changes
  - Filtered by company

- **`useDashboardRealtime(companyId, callbacks, enabled?)`**
  - Combine multiple subscriptions for dashboard
  - Returns: `{ isConnected: boolean, connections: {...} }`

## Event Types

```typescript
type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';
```

- **`INSERT`**: New row inserted
- **`UPDATE`**: Existing row updated
- **`DELETE`**: Row deleted
- **`*`**: All events

## Payload Structure

```typescript
interface RealtimePostgresChangesPayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;     // New row data (INSERT, UPDATE)
  old: T;     // Old row data (UPDATE, DELETE)
  schema: string;
  table: string;
  commit_timestamp: string;
}
```

## Best Practices

1. **Filter subscriptions** - Always filter by company/user to reduce unnecessary updates
2. **Cleanup subscriptions** - Hooks automatically cleanup, but manual subscriptions need `unsubscribe()`
3. **Throttle updates** - Debounce rapid updates to avoid UI jank
4. **Handle errors gracefully** - Connection may drop, implement fallback
5. **Limit subscriptions** - Don't subscribe to too many channels per user
6. **Use enabled flag** - Conditionally enable subscriptions to save resources

## Performance Tips

- **Batch updates**: Use `useState` batching or `useReducer` for multiple state updates
- **Memoize callbacks**: Use `useCallback` for event handlers
- **Debounce/Throttle**: For high-frequency updates (e.g., cursor tracking)
- **Selective rendering**: Only re-render what changed
- **Unsubscribe when hidden**: Disable subscriptions for background tabs

## Debugging

### Check Active Subscriptions

```tsx
import { getActiveChannelCount, getActiveChannelNames } from '@/lib/realtime';

console.log('Active channels:', getActiveChannelCount());
console.log('Channel names:', getActiveChannelNames());
```

### Enable Realtime Logging

Supabase logs all realtime events to the console by default. Look for:
- `[Realtime] Subscribed to ...` - Successful subscription
- `[Realtime] Error subscribing to ...` - Connection error
- `[Realtime] Unsubscribed from ...` - Cleanup successful

## Troubleshooting

### Subscriptions Not Working

1. **Check table replication** is enabled in Supabase
2. **Verify RLS policies** allow realtime for your user
3. **Check filters** are using correct column names
4. **Ensure client is authenticated** (some subscriptions require auth)

### High Memory Usage

1. **Limit active subscriptions** (< 10 per page)
2. **Unsubscribe from unused channels**
3. **Use `enabled` flag** to conditionally subscribe
4. **Check for memory leaks** in callbacks

### Connection Drops

1. **Implement reconnection logic** (Supabase handles this automatically)
2. **Show connection status** to user
3. **Fallback to polling** if realtime unavailable
4. **Check network connectivity**

## Security

- Realtime respects **Row Level Security (RLS)** policies
- Users only receive updates for rows they have access to
- Use `employer_id` filters to ensure data isolation
- Consider rate limiting for broadcast messages

## Cost Considerations

Supabase Realtime pricing:
- **Free tier**: 500 concurrent connections, 2GB bandwidth
- **Pro tier**: 5000 concurrent connections, 250GB bandwidth

**Tips to reduce costs:**
- Unsubscribe when not needed
- Use filters to reduce message volume
- Consider WebSockets pooling for large teams
- Implement connection limits per user

## Example Components

See example components in `/src/components/realtime/`:
- `LiveDashboard.tsx` - Dashboard with multiple subscriptions
- `LiveAttendance.tsx` - Real-time attendance tracking
- `LiveLeaveRequests.tsx` - Live leave request notifications
