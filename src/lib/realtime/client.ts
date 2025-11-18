/**
 * Supabase Realtime Client
 * Manages realtime subscriptions and channel management
 */

import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Realtime event types
 */
export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

/**
 * Subscription callback type
 */
export type SubscriptionCallback<T = any> = (
  payload: RealtimePostgresChangesPayload<T>
) => void;

/**
 * Active subscriptions registry
 * Keeps track of all active channels for cleanup
 */
const activeChannels = new Map<string, RealtimeChannel>();

/**
 * Subscribe to database table changes
 */
export function subscribeToTable<T = any>(
  table: string,
  event: RealtimeEventType,
  callback: SubscriptionCallback<T>,
  filter?: { column: string; value: string }
): RealtimeChannel {
  const supabase = createClient();

  // Generate unique channel name
  const channelName = `${table}-${event}-${Date.now()}`;

  // Create channel
  const channel = supabase.channel(channelName);

  // Set up postgres changes subscription
  let subscription = channel.on(
    'postgres_changes',
    {
      event,
      schema: 'public',
      table,
      filter: filter ? `${filter.column}=eq.${filter.value}` : undefined,
    },
    callback
  );

  // Subscribe to the channel
  subscription.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log(`[Realtime] Subscribed to ${table} (${event})`);
    } else if (status === 'CHANNEL_ERROR') {
      console.error(`[Realtime] Error subscribing to ${table}`);
    } else if (status === 'TIMED_OUT') {
      console.error(`[Realtime] Timeout subscribing to ${table}`);
    }
  });

  // Store in active channels
  activeChannels.set(channelName, channel);

  return channel;
}

/**
 * Subscribe to presence (user online/offline status)
 */
export function subscribeToPresence(
  channelName: string,
  onJoin?: (key: string, current: any, new_: any) => void,
  onLeave?: (key: string, current: any, left: any) => void
): RealtimeChannel {
  const supabase = createClient();

  const channel = supabase.channel(channelName, {
    config: {
      presence: {
        key: '',
      },
    },
  });

  if (onJoin) {
    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      onJoin(key, null, newPresences);
    });
  }

  if (onLeave) {
    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      onLeave(key, null, leftPresences);
    });
  }

  channel.subscribe();

  activeChannels.set(channelName, channel);

  return channel;
}

/**
 * Subscribe to broadcast messages
 */
export function subscribeToBroadcast(
  channelName: string,
  event: string,
  callback: (payload: any) => void
): RealtimeChannel {
  const supabase = createClient();

  const channel = supabase.channel(channelName);

  channel.on('broadcast', { event }, ({ payload }) => {
    callback(payload);
  });

  channel.subscribe();

  activeChannels.set(channelName, channel);

  return channel;
}

/**
 * Send broadcast message
 */
export async function sendBroadcast(
  channelName: string,
  event: string,
  payload: any
): Promise<void> {
  let channel = activeChannels.get(channelName);

  if (!channel) {
    const supabase = createClient();
    channel = supabase.channel(channelName);
    await channel.subscribe();
    activeChannels.set(channelName, channel);
  }

  await channel.send({
    type: 'broadcast',
    event,
    payload,
  });
}

/**
 * Unsubscribe from a specific channel
 */
export async function unsubscribe(channelName: string): Promise<void> {
  const channel = activeChannels.get(channelName);

  if (channel) {
    await channel.unsubscribe();
    activeChannels.delete(channelName);
    console.log(`[Realtime] Unsubscribed from ${channelName}`);
  }
}

/**
 * Unsubscribe from all active channels
 * Call this on component unmount or app cleanup
 */
export async function unsubscribeAll(): Promise<void> {
  console.log(`[Realtime] Unsubscribing from ${activeChannels.size} channels`);

  const unsubscribePromises = Array.from(activeChannels.values()).map((channel) =>
    channel.unsubscribe()
  );

  await Promise.all(unsubscribePromises);
  activeChannels.clear();

  console.log('[Realtime] All channels unsubscribed');
}

/**
 * Get active channel count
 */
export function getActiveChannelCount(): number {
  return activeChannels.size;
}

/**
 * Get all active channel names
 */
export function getActiveChannelNames(): string[] {
  return Array.from(activeChannels.keys());
}
