/**
 * Realtime Provider
 * Context provider for managing realtime connection state
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { unsubscribeAll, getActiveChannelCount } from './client';

interface RealtimeContextValue {
  isEnabled: boolean;
  activeChannels: number;
  setEnabled: (enabled: boolean) => void;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  isEnabled: true,
  activeChannels: 0,
  setEnabled: () => {},
});

interface RealtimeProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
}

/**
 * Realtime Provider Component
 * Wrap your app with this to enable realtime features
 */
export function RealtimeProvider({
  children,
  enabled = true,
}: RealtimeProviderProps) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [activeChannels, setActiveChannels] = useState(0);

  // Update active channel count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveChannels(getActiveChannelCount());
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Cleanup all subscriptions on unmount
  useEffect(() => {
    return () => {
      unsubscribeAll();
    };
  }, []);

  const handleSetEnabled = (enabled: boolean) => {
    setIsEnabled(enabled);
    if (!enabled) {
      // Unsubscribe from all channels when disabled
      unsubscribeAll();
    }
  };

  return (
    <RealtimeContext.Provider
      value={{
        isEnabled,
        activeChannels,
        setEnabled: handleSetEnabled,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

/**
 * Hook to access realtime context
 */
export function useRealtime() {
  const context = useContext(RealtimeContext);

  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }

  return context;
}
