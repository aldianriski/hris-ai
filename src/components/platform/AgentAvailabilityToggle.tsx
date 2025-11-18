'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
} from '@heroui/react';
import { Circle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

type AvailabilityStatus = 'online' | 'away' | 'busy' | 'offline';

interface AgentAvailabilityToggleProps {
  onUpdate?: () => void;
}

export function AgentAvailabilityToggle({ onUpdate }: AgentAvailabilityToggleProps) {
  const [status, setStatus] = useState<AvailabilityStatus>('offline');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await fetch('/api/platform/chat/agent-availability');
      if (!response.ok) return;

      const data = await response.json();
      const myAvailability = data.agents?.find((a: any) => a.agent_id === 'current');
      if (myAvailability) {
        setStatus(myAvailability.status);
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    }
  };

  const updateStatus = async (newStatus: AvailabilityStatus) => {
    try {
      setLoading(true);
      const response = await fetch('/api/platform/chat/agent-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          accepts_new_chats: newStatus === 'online',
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      setStatus(newStatus);
      toast.success(`Status updated to ${newStatus}`);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: AvailabilityStatus) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'away':
        return 'warning';
      case 'busy':
        return 'danger';
      case 'offline':
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: AvailabilityStatus) => {
    const colors = {
      online: 'text-green-500',
      away: 'text-yellow-500',
      busy: 'text-red-500',
      offline: 'text-gray-500',
    };

    return <Circle className={`w-3 h-3 fill-current ${colors[status]}`} />;
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="flat"
          color={getStatusColor(status) as any}
          startContent={getStatusIcon(status)}
          endContent={<ChevronDown className="w-4 h-4" />}
          isLoading={loading}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Availability status"
        onAction={(key) => updateStatus(key as AvailabilityStatus)}
      >
        <DropdownItem
          key="online"
          startContent={getStatusIcon('online')}
          description="Available to accept new chats"
        >
          Online
        </DropdownItem>
        <DropdownItem
          key="away"
          startContent={getStatusIcon('away')}
          description="Temporarily unavailable"
        >
          Away
        </DropdownItem>
        <DropdownItem
          key="busy"
          startContent={getStatusIcon('busy')}
          description="In a meeting or busy"
        >
          Busy
        </DropdownItem>
        <DropdownItem
          key="offline"
          startContent={getStatusIcon('offline')}
          description="Not accepting chats"
        >
          Offline
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
